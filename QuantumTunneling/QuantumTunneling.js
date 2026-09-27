// ============================================================
// TUNELAMENTO QUÂNTICO
// Diferenças Finitas + Crank-Nicolson
// Método de Thomas para sistema tridiagonal complexo
//
// T = coeficiente de transmissão da barreira retangular
// ============================================================

class QuantumTunneling {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ----------------------------------------------------
        // Parâmetros
        // ----------------------------------------------------

        this.params = {

            h_bar: 1.0,
            m: 1.0,

            x_min: -6.5,
            x_max: 6.5,

            N: 500,

            V0: 20.0,
            a: 0.5,

            x0: -2.5,
            sigma: 0.4,
            k0: 5.0,

            dt: 0.002,
            passos_por_frame: 5,

            ...options
        };

        // ----------------------------------------------------
        // Estado da simulação
        // ----------------------------------------------------

        this.running = false;

        this.frame = 0;
        this.time = 0;

        // ----------------------------------------------------
        // Malha espacial
        // ----------------------------------------------------

        this.dx =
            (
                this.params.x_max -
                this.params.x_min
            ) / this.params.N;

        this.x = [];

        for (
            let i = 1;
            i < this.params.N;
            i++
        ) {

            this.x.push(
                this.params.x_min +
                i * this.dx
            );
        }

        this.M = this.x.length;

        // ----------------------------------------------------
        // Função de onda
        // ----------------------------------------------------

        this.psiRe = [];
        this.psiIm = [];

        // ----------------------------------------------------
        // Potencial
        // ----------------------------------------------------

        this.V = [];

        // ----------------------------------------------------
        // Sistema de Thomas
        // ----------------------------------------------------

        this.diagRe = [];
        this.diagIm = [];

        this.cPrimeRe = [];
        this.cPrimeIm = [];

        this.foraRe = 0;
        this.foraIm = 0;

        // ----------------------------------------------------
        // Coeficientes físicos
        // ----------------------------------------------------

        this.energia = 0;
        this.kappa = 0;

        this.R = 0;
        this.T = 0;

        // ----------------------------------------------------
        // Inicialização
        // ----------------------------------------------------

        this.solve();
    }


    // ========================================================
    // OPERAÇÕES COM NÚMEROS COMPLEXOS
    // ========================================================

    multiplicarComplexo(ar, ai, br, bi) {

        return {

            re:
                ar * br -
                ai * bi,

            im:
                ar * bi +
                ai * br
        };
    }


    dividirComplexo(ar, ai, br, bi) {

        const denominador =
            br * br +
            bi * bi;

        return {

            re:
                (
                    ar * br +
                    ai * bi
                ) /
                denominador,

            im:
                (
                    ai * br -
                    ar * bi
                ) /
                denominador
        };
    }


    // ========================================================
    // PACOTE DE ONDA
    // ========================================================

    criarPacote() {

        const p = this.params;

        this.psiRe =
            new Array(this.M);

        this.psiIm =
            new Array(this.M);

        let norma = 0;

        // ----------------------------------------------------
        // Criação do pacote
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const x = this.x[i];

            const envelope =
                Math.exp(
                    -Math.pow(
                        x - p.x0,
                        2
                    ) /
                    (
                        4 *
                        Math.pow(
                            p.sigma,
                            2
                        )
                    )
                );

            const fase =
                p.k0 * x;

            this.psiRe[i] =
                envelope *
                Math.cos(fase);

            this.psiIm[i] =
                envelope *
                Math.sin(fase);

            norma +=
                (
                    this.psiRe[i] *
                    this.psiRe[i]
                    +
                    this.psiIm[i] *
                    this.psiIm[i]
                ) *
                this.dx;
        }

        // ----------------------------------------------------
        // Normalização
        // ----------------------------------------------------

        norma =
            Math.sqrt(norma);

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            this.psiRe[i] /=
                norma;

            this.psiIm[i] /=
                norma;
        }
    }


    // ========================================================
    // POTENCIAL
    // ========================================================

    criarPotencial() {

        const p = this.params;

        this.V =
            new Array(this.M);

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const x = this.x[i];

            if (
                x > 0 &&
                x < p.a
            ) {

                this.V[i] =
                    p.V0;

            } else {

                this.V[i] =
                    0;
            }
        }
    }


    // ========================================================
    // COEFICIENTE DE TRANSMISSÃO
    //
    // Energia:
    //
    //       E = hbar² k₀² / 2m
    //
    // Para E < V₀:
    //
    //       κ = sqrt(2m(V₀-E)) / hbar
    //
    //       T =
    //       1 /
    //       [1 + V₀² sinh²(κa)/(4E(V₀-E))]
    //
    // ========================================================

    calcularCoeficientes() {

        const p = this.params;

        const hbar =
            p.h_bar;

        const m =
            p.m;

        const V0 =
            p.V0;

        const a =
            p.a;

        const k0 =
            p.k0;

        // ----------------------------------------------------
        // Energia da onda incidente
        // ----------------------------------------------------

        const E =
            (
                hbar *
                hbar *
                k0 *
                k0
            ) /
            (
                2 * m
            );

        this.energia =
            E;

        // ----------------------------------------------------
        // Caso E < V0
        // Regime de tunelamento
        // ----------------------------------------------------

        if (
            E < V0
        ) {

            const kappa =
                Math.sqrt(
                    2 *
                    m *
                    (V0 - E)
                ) /
                hbar;

            this.kappa =
                kappa;

            const sinhTerm =
                Math.sinh(
                    kappa * a
                );

            const numerador =
                V0 *
                V0 *
                sinhTerm *
                sinhTerm;

            const denominador =
                4 *
                E *
                (V0 - E);

            this.T =
                1 /
                (
                    1 +
                    numerador /
                    denominador
                );

            this.R =
                1 -
                this.T;
        }

        // ----------------------------------------------------
        // Caso E > V0
        // Acima da barreira
        // ----------------------------------------------------

        else if (
            E > V0
        ) {

            this.kappa =
                0;

            const k2 =
                Math.sqrt(
                    2 *
                    m *
                    (E - V0)
                ) /
                hbar;

            const sinTerm =
                Math.sin(
                    k2 * a
                );

            const numerador =
                V0 *
                V0 *
                sinTerm *
                sinTerm;

            const denominador =
                4 *
                E *
                (E - V0);

            this.T =
                1 /
                (
                    1 +
                    numerador /
                    denominador
                );

            this.R =
                1 -
                this.T;
        }

        // ----------------------------------------------------
        // Caso E = V0
        // ----------------------------------------------------

        else {

            this.kappa =
                0;

            this.T =
                1 /
                (
                    1 +
                    (
                        m *
                        V0 *
                        a *
                        a
                    ) /
                    (
                        2 *
                        hbar *
                        hbar
                    )
                );

            this.R =
                1 -
                this.T;
        }

        return {

            E: this.energia,

            kappa: this.kappa,

            R: this.R,

            T: this.T
        };
    }


    // ========================================================
    // PREPARAÇÃO DO MÉTODO DE THOMAS
    // ========================================================

    prepararThomas() {

        const p =
            this.params;

        const hbar =
            p.h_bar;

        const m =
            p.m;

        const dx =
            this.dx;

        const dt =
            p.dt;

        // ----------------------------------------------------
        // Elemento fora da diagonal do Hamiltoniano
        // ----------------------------------------------------

        const foraH =
            -hbar *
            hbar /
            (
                2 *
                m *
                dx *
                dx
            );

        const fator =
            dt /
            (
                2 *
                hbar
            );

        this.diagRe =
            new Array(this.M);

        this.diagIm =
            new Array(this.M);

        // ----------------------------------------------------
        // Diagonal de A
        //
        // A = I + i dt H / (2hbar)
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const diagonalH =
                hbar *
                hbar /
                (
                    m *
                    dx *
                    dx
                )
                +
                this.V[i];

            this.diagRe[i] =
                1.0;

            this.diagIm[i] =
                fator *
                diagonalH;
        }

        // ----------------------------------------------------
        // Fora da diagonal de A
        // ----------------------------------------------------

        this.foraRe =
            0;

        this.foraIm =
            fator *
            foraH;

        // ----------------------------------------------------
        // Coeficientes modificados
        // ----------------------------------------------------

        this.cPrimeRe =
            new Array(this.M);

        this.cPrimeIm =
            new Array(this.M);

        let resultado =
            this.dividirComplexo(
                this.foraRe,
                this.foraIm,
                this.diagRe[0],
                this.diagIm[0]
            );

        this.cPrimeRe[0] =
            resultado.re;

        this.cPrimeIm[0] =
            resultado.im;

        for (
            let i = 1;
            i < this.M;
            i++
        ) {

            const produto =
                this.multiplicarComplexo(
                    this.foraRe,
                    this.foraIm,
                    this.cPrimeRe[i - 1],
                    this.cPrimeIm[i - 1]
                );

            const denomRe =
                this.diagRe[i] -
                produto.re;

            const denomIm =
                this.diagIm[i] -
                produto.im;

            resultado =
                this.dividirComplexo(
                    this.foraRe,
                    this.foraIm,
                    denomRe,
                    denomIm
                );

            this.cPrimeRe[i] =
                resultado.re;

            this.cPrimeIm[i] =
                resultado.im;
        }
    }


    // ========================================================
    // LADO DIREITO DO SISTEMA
    // ========================================================

    calcularRHS() {

        const p =
            this.params;

        const hbar =
            p.h_bar;

        const m =
            p.m;

        const dx =
            this.dx;

        const dt =
            p.dt;

        const fator =
            dt /
            (
                2 *
                hbar
            );

        const foraH =
            -hbar *
            hbar /
            (
                2 *
                m *
                dx *
                dx
            );

        const rhsRe =
            new Array(this.M);

        const rhsIm =
            new Array(this.M);

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const diagonalH =
                hbar *
                hbar /
                (
                    m *
                    dx *
                    dx
                )
                +
                this.V[i];

            // ------------------------------------------------
            // Diagonal de B
            //
            // B = I - i dt H / (2hbar)
            // ------------------------------------------------

            const diagBRe =
                1.0;

            const diagBIm =
                -fator *
                diagonalH;

            const diagonal =
                this.multiplicarComplexo(
                    diagBRe,
                    diagBIm,
                    this.psiRe[i],
                    this.psiIm[i]
                );

            let somaRe =
                diagonal.re;

            let somaIm =
                diagonal.im;

            // ------------------------------------------------
            // Vizinho esquerdo
            // ------------------------------------------------

            if (
                i > 0
            ) {

                const foraBRe =
                    0;

                const foraBIm =
                    -fator *
                    foraH;

                const esquerda =
                    this.multiplicarComplexo(
                        foraBRe,
                        foraBIm,
                        this.psiRe[i - 1],
                        this.psiIm[i - 1]
                    );

                somaRe +=
                    esquerda.re;

                somaIm +=
                    esquerda.im;
            }

            // ------------------------------------------------
            // Vizinho direito
            // ------------------------------------------------

            if (
                i <
                this.M - 1
            ) {

                const foraBRe =
                    0;

                const foraBIm =
                    -fator *
                    foraH;

                const direita =
                    this.multiplicarComplexo(
                        foraBRe,
                        foraBIm,
                        this.psiRe[i + 1],
                        this.psiIm[i + 1]
                    );

                somaRe +=
                    direita.re;

                somaIm +=
                    direita.im;
            }

            rhsRe[i] =
                somaRe;

            rhsIm[i] =
                somaIm;
        }

        return {

            re: rhsRe,

            im: rhsIm
        };
    }


    // ========================================================
    // RESOLVER THOMAS
    // ========================================================

    resolverThomas(
        rhsRe,
        rhsIm
    ) {

        const yRe =
            new Array(this.M);

        const yIm =
            new Array(this.M);

        const novoRe =
            new Array(this.M);

        const novoIm =
            new Array(this.M);

        // ----------------------------------------------------
        // Primeiro elemento
        // ----------------------------------------------------

        let resultado =
            this.dividirComplexo(
                rhsRe[0],
                rhsIm[0],
                this.diagRe[0],
                this.diagIm[0]
            );

        yRe[0] =
            resultado.re;

        yIm[0] =
            resultado.im;

        // ----------------------------------------------------
        // Eliminação para frente
        // ----------------------------------------------------

        for (
            let i = 1;
            i < this.M;
            i++
        ) {

            const produto =
                this.multiplicarComplexo(
                    this.foraRe,
                    this.foraIm,
                    this.cPrimeRe[i - 1],
                    this.cPrimeIm[i - 1]
                );

            const denomRe =
                this.diagRe[i] -
                produto.re;

            const denomIm =
                this.diagIm[i] -
                produto.im;

            const produtoAnterior =
                this.multiplicarComplexo(
                    this.foraRe,
                    this.foraIm,
                    yRe[i - 1],
                    yIm[i - 1]
                );

            const numeradorRe =
                rhsRe[i] -
                produtoAnterior.re;

            const numeradorIm =
                rhsIm[i] -
                produtoAnterior.im;

            resultado =
                this.dividirComplexo(
                    numeradorRe,
                    numeradorIm,
                    denomRe,
                    denomIm
                );

            yRe[i] =
                resultado.re;

            yIm[i] =
                resultado.im;
        }

        // ----------------------------------------------------
        // Substituição regressiva
        // ----------------------------------------------------

        novoRe[this.M - 1] =
            yRe[this.M - 1];

        novoIm[this.M - 1] =
            yIm[this.M - 1];

        for (
            let i =
                this.M - 2;

            i >= 0;

            i--
        ) {

            const produto =
                this.multiplicarComplexo(
                    this.cPrimeRe[i],
                    this.cPrimeIm[i],
                    novoRe[i + 1],
                    novoIm[i + 1]
                );

            novoRe[i] =
                yRe[i] -
                produto.re;

            novoIm[i] =
                yIm[i] -
                produto.im;
        }

        this.psiRe =
            novoRe;

        this.psiIm =
            novoIm;
    }


    // ========================================================
    // UM PASSO DE CRANK-NICOLSON
    // ========================================================

    passoCrankNicolson() {

        const rhs =
            this.calcularRHS();

        this.resolverThomas(
            rhs.re,
            rhs.im
        );

        this.time +=
            this.params.dt;
    }


    // ========================================================
    // EVOLUÇÃO
    // ========================================================

    evoluir() {

        for (
            let i = 0;
            i <
            this.params.passos_por_frame;
            i++
        ) {

            this.passoCrankNicolson();
        }
    }


    // ========================================================
    // RESET
    // ========================================================

    resetar() {

        this.parar();

        this.time =
            0;

        this.frame =
            0;

        this.criarPacote();

        this.criarPotencial();

        this.prepararThomas();

        this.calcularCoeficientes();

        this.draw();
    }


    // ========================================================
    // ATUALIZAR PARÂMETROS
    // ========================================================

    atualizarParametros(
        newParams
    ) {

        this.parar();

        this.params = {

            ...this.params,

            ...newParams
        };

        // ----------------------------------------------------
        // Recalcular dx
        // ----------------------------------------------------

        this.dx =
            (
                this.params.x_max -
                this.params.x_min
            ) /
            this.params.N;

        // ----------------------------------------------------
        // Recriar malha
        // ----------------------------------------------------

        this.x = [];

        for (
            let i = 1;
            i < this.params.N;
            i++
        ) {

            this.x.push(
                this.params.x_min +
                i * this.dx
            );
        }

        this.M =
            this.x.length;

        this.resetar();
    }


    // ========================================================
    // DESENHO
    // ========================================================

    draw() {

        const ctx =
            this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        // ----------------------------------------------------
        // Margens
        // ----------------------------------------------------

        const margemEsq =
            65;

        const margemDir =
            35;

        const margemTopo =
            45;

        const margemBaixo =
            55;

        const plotWidth =
            width -
            margemEsq -
            margemDir;

        const plotHeight =
            height -
            margemTopo -
            margemBaixo;

        // ----------------------------------------------------
        // Escalas
        // ----------------------------------------------------

        const xMin =
            this.params.x_min;

        const xMax =
            this.params.x_max;

        const probMax =
            4.0;

        const Vmax =
            Math.max(
                45,
                this.params.V0 *
                1.15
            );

        const mapX =
            x => {

                return (
                    margemEsq +
                    (
                        x - xMin
                    ) /
                    (
                        xMax - xMin
                    ) *
                    plotWidth
                );
            };

        const mapProbY =
            y => {

                return (
                    margemTopo +
                    plotHeight -
                    (
                        y /
                        probMax
                    ) *
                    plotHeight
                );
            };

        const mapVY =
            V => {

                return (
                    margemTopo +
                    plotHeight -
                    (
                        V /
                        Vmax
                    ) *
                    plotHeight
                );
            };

        // ----------------------------------------------------
        // Eixos
        // ----------------------------------------------------

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            1;

        ctx.beginPath();

        ctx.moveTo(
            margemEsq,
            margemTopo
        );

        ctx.lineTo(
            margemEsq,
            margemTopo +
            plotHeight
        );

        ctx.lineTo(
            margemEsq +
            plotWidth,
            margemTopo +
            plotHeight
        );

        ctx.stroke();

        // ----------------------------------------------------
        // Marcações do eixo x
        // ----------------------------------------------------

        ctx.fillStyle =
            "#222";

        ctx.font =
            "14px Arial";

        for (
            let x = -6;
            x <= 6;
            x += 2
        ) {

            const px =
                mapX(x);

            ctx.beginPath();

            ctx.moveTo(
                px,
                margemTopo +
                plotHeight
            );

            ctx.lineTo(
                px,
                margemTopo +
                plotHeight +
                5
            );

            ctx.stroke();

            ctx.fillText(
                x.toString(),
                px - 8,
                margemTopo +
                plotHeight +
                22
            );
        }

        // ----------------------------------------------------
        // Barreira
        // ----------------------------------------------------

        const bx1 =
            mapX(0);

        const bx2 =
            mapX(
                this.params.a
            );

        const by =
            mapVY(
                this.params.V0
            );

        const base =
            margemTopo +
            plotHeight;

        ctx.fillStyle =
            "rgba(220, 60, 60, 0.18)";

        ctx.fillRect(
            bx1,
            by,
            bx2 - bx1,
            base - by
        );

        // ----------------------------------------------------
        // Potencial
        // ----------------------------------------------------

        ctx.strokeStyle =
            "#d62728";

        ctx.lineWidth =
            3;

        ctx.beginPath();

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const x =
                this.x[i];

            const px =
                mapX(x);

            const py =
                mapVY(
                    this.V[i]
                );

            if (
                i === 0
            ) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }

        ctx.stroke();

        // ----------------------------------------------------
        // Densidade de probabilidade
        // ----------------------------------------------------

        ctx.strokeStyle =
            "#1565c0";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        for (
            let i = 0;
            i < this.M;
            i++
        ) {

            const x =
                this.x[i];

            const prob =
                this.psiRe[i] *
                this.psiRe[i]
                +
                this.psiIm[i] *
                this.psiIm[i];

            const px =
                mapX(x);

            const py =
                mapProbY(
                    prob
                );

            if (
                i === 0
            ) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }

        ctx.stroke();

        // ----------------------------------------------------
        // Título
        // ----------------------------------------------------

        ctx.fillStyle =
            "#111";

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "Tunelamento Quântico",
            margemEsq,
            25
        );

        // ----------------------------------------------------
        // Legenda
        // ----------------------------------------------------

        ctx.fillStyle =
            "#1565c0";

        ctx.font =
            "14px Arial";

        ctx.fillText(
            "|Ψ(x,t)|²",
            margemEsq + 5,
            margemTopo + 15
        );

        ctx.fillStyle =
            "#d62728";

        ctx.fillText(
            "V(x)",
            width - 80,
            margemTopo + 15
        );

        // ----------------------------------------------------
        // Tempo
        // ----------------------------------------------------

        ctx.fillStyle =
            "#111";

        ctx.font =
            "14px Arial";

        ctx.fillText(
            `t = ${this.time.toFixed(3)} u.t.`,
            margemEsq + 15,
            margemTopo + 35
        );

        // ====================================================
        // CAIXA DE INFORMAÇÕES
        // ====================================================

        const caixaX =
            width - 265;

        const caixaY =
            margemTopo + 55;

        const caixaW =
            235;

        const caixaH =
            180;

        ctx.fillStyle =
            "rgba(255,255,255,0.94)";

        ctx.fillRect(
            caixaX,
            caixaY,
            caixaW,
            caixaH
        );

        ctx.strokeStyle =
            "#555";

        ctx.lineWidth =
            1;

        ctx.strokeRect(
            caixaX,
            caixaY,
            caixaW,
            caixaH
        );

        // ----------------------------------------------------
        // Cabeçalho
        // ----------------------------------------------------

        ctx.fillStyle =
            "#111";

        ctx.font =
            "bold 15px Arial";

        ctx.fillText(
            "Barreira retangular",
            caixaX + 12,
            caixaY + 23
        );

        ctx.font =
            "14px Arial";

        // ----------------------------------------------------
        // Energia
        // ----------------------------------------------------

        ctx.fillText(
            `E = ${this.energia.toFixed(3)}`,
            caixaX + 12,
            caixaY + 50
        );

        ctx.fillText(
            `V₀ = ${this.params.V0.toFixed(3)}`,
            caixaX + 12,
            caixaY + 73
        );

        ctx.fillText(
            `a = ${this.params.a.toFixed(3)}`,
            caixaX + 12,
            caixaY + 96
        );

        // ----------------------------------------------------
        // Regime
        // ----------------------------------------------------

        if (
            this.energia <
            this.params.V0
        ) {

            ctx.fillStyle =
                "#8b0000";

            ctx.fillText(
                "E < V₀  →  Tunelamento",
                caixaX + 12,
                caixaY + 119
            );

        } else {

            ctx.fillStyle =
                "#555";

            ctx.fillText(
                "E ≥ V₀  →  Acima da barreira",
                caixaX + 12,
                caixaY + 119
            );
        }

        // ----------------------------------------------------
        // Coeficientes
        // ----------------------------------------------------

        ctx.fillStyle =
            "#1565c0";

        ctx.font =
            "bold 14px Arial";

        ctx.fillText(
            `R = ${(100 * this.R).toFixed(3)}%`,
            caixaX + 12,
            caixaY + 144
        );

        ctx.fillText(
            `T = ${(100 * this.T).toFixed(3)}%`,
            caixaX + 12,
            caixaY + 166
        );

        // ----------------------------------------------------
        // Parâmetros inferiores
        // ----------------------------------------------------

        ctx.fillStyle =
            "#111";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            `V₀ = ${this.params.V0.toFixed(1)}`,
            margemEsq,
            height - 28
        );

        ctx.fillText(
            `a = ${this.params.a.toFixed(2)}`,
            margemEsq + 85,
            height - 28
        );

        ctx.fillText(
            `k₀ = ${this.params.k0.toFixed(1)}`,
            margemEsq + 155,
            height - 28
        );
    }


    // ========================================================
    // INICIAR
    // ========================================================

    iniciar() {

        if (
            this.running
        ) {

            return;
        }

        this.running =
            true;

        const loop =
            () => {

                if (
                    !this.running
                ) {

                    return;
                }

                this.evoluir();

                this.draw();

                this.frame++;

                requestAnimationFrame(
                    loop
                );
            };

        loop();
    }


    // ========================================================
    // PARAR
    // ========================================================

    parar() {

        this.running =
            false;
    }


    // ========================================================
    // PAUSE / PLAY
    // ========================================================

    alternar() {

        if (
            this.running
        ) {

            this.parar();

        } else {

            this.iniciar();
        }
    }


    // ========================================================
    // SOLVE
    // ========================================================

    solve() {

        this.time =
            0;

        this.frame =
            0;

        this.criarPacote();

        this.criarPotencial();

        this.prepararThomas();

        // Calcula T e R analiticamente
        this.calcularCoeficientes();

        this.draw();
    }
}
