// ============================================================
// TUNELAMENTO QUÂNTICO
// Diferenças Finitas + Crank-Nicolson
// Método de Thomas para sistema tridiagonal complexo
// ============================================================

class QuantumTunneling {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ========================================================
        // Parâmetros
        // ========================================================

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

        // ========================================================
        // Estado
        // ========================================================

        this.running = false;

        this.frame = 0;
        this.time = 0;

        // ========================================================
        // Malha espacial
        // ========================================================

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

        // ========================================================
        // Função de onda
        // ========================================================

        this.psiRe = [];
        this.psiIm = [];

        // ========================================================
        // Potencial
        // ========================================================

        this.V = [];

        // ========================================================
        // Coeficientes do método de Thomas
        // ========================================================

        this.diagRe = [];
        this.diagIm = [];

        this.cPrimeRe = [];
        this.cPrimeIm = [];

        this.foraRe = 0;
        this.foraIm = 0;

        // ========================================================
        // Coeficientes de reflexão e transmissão
        // ========================================================

        this.R_final = null;
        this.T_final = null;

        // ========================================================
        // Inicialização
        // ========================================================

        this.solve();
    }


    // ============================================================
    // Multiplicação de complexos
    // ============================================================

    multiplicarComplexo(ar, ai, br, bi) {

        return {
            re: ar * br - ai * bi,
            im: ar * bi + ai * br
        };
    }


    // ============================================================
    // Divisão de complexos
    // ============================================================

    dividirComplexo(ar, ai, br, bi) {

        const denominador =
            br * br + bi * bi;

        return {
            re:
                (ar * br + ai * bi) /
                denominador,

            im:
                (ai * br - ar * bi) /
                denominador
        };
    }


    // ============================================================
    // Cria pacote de onda
    // ============================================================

    criarPacote() {

        const p = this.params;

        this.psiRe =
            new Array(this.M);

        this.psiIm =
            new Array(this.M);

        let norma = 0;

        // --------------------------------------------------------
        // Pacote:
        //
        // psi(x,0) =
        // exp[-(x-x0)^2/(4 sigma^2)]
        // exp(i k0 x)
        // --------------------------------------------------------

        for (let i = 0; i < this.M; i++) {

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
                    this.psiRe[i] +

                    this.psiIm[i] *
                    this.psiIm[i]
                ) *
                this.dx;
        }

        // --------------------------------------------------------
        // Normalização
        // --------------------------------------------------------

        norma =
            Math.sqrt(norma);

        for (let i = 0; i < this.M; i++) {

            this.psiRe[i] /=
                norma;

            this.psiIm[i] /=
                norma;
        }
    }


    // ============================================================
    // Cria potencial
    // ============================================================

    criarPotencial() {

        const p = this.params;

        this.V =
            new Array(this.M);

        for (let i = 0; i < this.M; i++) {

            const x =
                this.x[i];

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


    // ============================================================
    // Prepara matriz A do Crank-Nicolson
    //
    // A = I + i dt/(2hbar) H
    // ============================================================

    prepararThomas() {

        const p = this.params;

        const hbar = p.h_bar;
        const m = p.m;
        const dx = this.dx;
        const dt = p.dt;

        // --------------------------------------------------------
        // Hamiltoniana
        // --------------------------------------------------------

        const foraH =
            -hbar * hbar /
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

        // --------------------------------------------------------
        // Diagonal
        // --------------------------------------------------------

        this.diagRe =
            new Array(this.M);

        this.diagIm =
            new Array(this.M);

        for (let i = 0; i < this.M; i++) {

            const diagonalH =
                hbar * hbar /
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

        // --------------------------------------------------------
        // Fora da diagonal
        //
        // A = I + i fator H
        // --------------------------------------------------------

        this.foraRe = 0;

        this.foraIm =
            fator *
            foraH;

        // --------------------------------------------------------
        // Thomas
        // --------------------------------------------------------

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

        for (let i = 1; i < this.M; i++) {

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


    // ============================================================
    // Calcula B psi
    //
    // B = I - i dt/(2hbar) H
    // ============================================================

    calcularRHS() {

        const p = this.params;

        const hbar = p.h_bar;
        const m = p.m;
        const dx = this.dx;
        const dt = p.dt;

        const fator =
            dt /
            (
                2 *
                hbar
            );

        const foraH =
            -hbar * hbar /
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

        for (let i = 0; i < this.M; i++) {

            const diagonalH =
                hbar * hbar /
                (
                    m *
                    dx *
                    dx
                )
                +
                this.V[i];

            // ----------------------------------------------------
            // Diagonal de B
            // ----------------------------------------------------

            const diagBRe = 1.0;

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

            // ----------------------------------------------------
            // Vizinho esquerdo
            // ----------------------------------------------------

            if (i > 0) {

                const foraBRe = 0;

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

            // ----------------------------------------------------
            // Vizinho direito
            // ----------------------------------------------------

            if (
                i <
                this.M - 1
            ) {

                const foraBRe = 0;

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


    // ============================================================
    // Resolve A psi = RHS
    // Thomas complexo
    // ============================================================

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

        // --------------------------------------------------------
        // Forward sweep
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // Back substitution
        // --------------------------------------------------------

        novoRe[this.M - 1] =
            yRe[this.M - 1];

        novoIm[this.M - 1] =
            yIm[this.M - 1];

        for (
            let i = this.M - 2;
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


    // ============================================================
    // Um passo de Crank-Nicolson
    // ============================================================

    passoCrankNicolson() {

        const rhs =
            this.calcularRHS();

        this.resolverThomas(
            rhs.re,
            rhs.im
        );

        this.time +=
            this.params.dt;

        // Verifica se já chegou a hora de calcular R/T
        this.atualizarRT();
    }


    // ============================================================
    // Evolução
    // ============================================================

    evoluir() {

        for (
            let i = 0;
            i < this.params.passos_por_frame;
            i++
        ) {

            // Se R/T já foram calculados,
            // não continua evoluindo.
            if (
                this.R_final !== null &&
                this.T_final !== null
            ) {
                break;
            }

            this.passoCrankNicolson();
        }
    }


    // ============================================================
    // Probabilidades nas regiões
    // ============================================================

    calcularProbabilidades() {

        let P_esquerda = 0;
        let P_barreira = 0;
        let P_direita = 0;

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

            if (x < 0) {

                P_esquerda +=
                    prob *
                    this.dx;

            } else if (
                x >= 0 &&
                x <= this.params.a
            ) {

                P_barreira +=
                    prob *
                    this.dx;

            } else {

                P_direita +=
                    prob *
                    this.dx;
            }
        }

        const P_total =
            P_esquerda +
            P_barreira +
            P_direita;

        return {

            esquerda:
                P_esquerda,

            barreira:
                P_barreira,

            direita:
                P_direita,

            total:
                P_total
        };
    }


    // ============================================================
    // Calcula R e T
    //
    // Para um pacote normalizado:
    //
    // R = probabilidade final à esquerda
    // T = probabilidade final à direita
    //
    // A medição ocorre depois que o pacote se separou.
    // ============================================================

    atualizarRT() {

        // Já calculou?
        if (
            this.R_final !== null &&
            this.T_final !== null
        ) {

            return;
        }

        const p =
            this.params;

        // --------------------------------------------------------
        // Velocidade de grupo
        //
        // v = hbar*k0/m
        // --------------------------------------------------------

        const velocidade =
            Math.abs(
                p.h_bar *
                p.k0 /
                p.m
            );

        // --------------------------------------------------------
        // Tempo para chegar à barreira
        // --------------------------------------------------------

        const distancia =
            Math.abs(
                0 -
                p.x0
            );

        const tChegada =
            distancia /
            velocidade;

        // --------------------------------------------------------
        // Tempo adicional para separação
        //
        // Aproximadamente 2 unidades espaciais.
        // --------------------------------------------------------

        const distanciaSeparacao =
            2.0;

        const tempoSeparacao =
            distanciaSeparacao /
            velocidade;

        // --------------------------------------------------------
        // Momento da medição
        // --------------------------------------------------------

        const tempoMedicao =
            tChegada +
            tempoSeparacao;

        // --------------------------------------------------------
        // Ainda não chegou?
        // --------------------------------------------------------

        if (
            this.time <
            tempoMedicao
        ) {

            return;
        }

        // --------------------------------------------------------
        // Calcula probabilidades
        // --------------------------------------------------------

        const P =
            this.calcularProbabilidades();

        // --------------------------------------------------------
        // Proteção numérica
        // --------------------------------------------------------

        if (
            P.total <= 0
        ) {

            return;
        }

        // --------------------------------------------------------
        // Coeficientes
        // --------------------------------------------------------

        this.R_final =
            P.esquerda /
            P.total;

        this.T_final =
            P.direita /
            P.total;

        // --------------------------------------------------------
        // Para a animação
        // --------------------------------------------------------

        this.parar();
    }


    // ============================================================
    // Reset
    // ============================================================

    resetar() {

        this.parar();

        this.time = 0;
        this.frame = 0;

        this.R_final = null;
        this.T_final = null;

        this.criarPacote();

        this.criarPotencial();

        this.prepararThomas();

        this.draw();
    }


    // ============================================================
    // Atualizar parâmetros
    // ============================================================

    atualizarParametros(
        newParams
    ) {

        this.parar();

        this.params = {
            ...this.params,
            ...newParams
        };

        // --------------------------------------------------------
        // Recalcula dx
        // --------------------------------------------------------

        this.dx =
            (
                this.params.x_max -
                this.params.x_min
            ) /
            this.params.N;

        // --------------------------------------------------------
        // Recria malha
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // Reinicia
        // --------------------------------------------------------

        this.resetar();
    }


    // ============================================================
    // Desenho
    // ============================================================

    draw() {

        const ctx =
            this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        // --------------------------------------------------------
        // Limpa canvas
        // --------------------------------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        // --------------------------------------------------------
        // Margens
        // --------------------------------------------------------

        const margemEsq = 65;
        const margemDir = 35;
        const margemTopo = 45;
        const margemBaixo = 55;

        const plotWidth =
            width -
            margemEsq -
            margemDir;

        const plotHeight =
            height -
            margemTopo -
            margemBaixo;

        // --------------------------------------------------------
        // Escalas
        // --------------------------------------------------------

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

        const mapX = x => {

            return margemEsq +
                (
                    x - xMin
                ) /
                (
                    xMax - xMin
                ) *
                plotWidth;
        };

        const mapProbY = y => {

            return margemTopo +
                plotHeight -
                (
                    y /
                    probMax
                ) *
                plotHeight;
        };

        const mapVY = V => {

            return margemTopo +
                plotHeight -
                (
                    V /
                    Vmax
                ) *
                plotHeight;
        };

        // ========================================================
        // Eixos
        // ========================================================

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth = 1;

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

        // ========================================================
        // Eixo x
        // ========================================================

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

        // ========================================================
        // Barreira
        // ========================================================

        const bx1 =
            mapX(0);

        const bx2 =
            mapX(this.params.a);

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

        // ========================================================
        // Potencial
        // ========================================================

        ctx.strokeStyle =
            "#d62728";

        ctx.lineWidth = 3;

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

            if (i === 0) {

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

        // ========================================================
        // |Psi|²
        // ========================================================

        ctx.strokeStyle =
            "#1565c0";

        ctx.lineWidth = 2;

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

            if (i === 0) {

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

        // ========================================================
        // Título
        // ========================================================

        ctx.fillStyle =
            "#111";

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "Tunelamento Quântico",
            margemEsq,
            25
        );

        // ========================================================
        // Legenda |Psi|²
        // ========================================================

        ctx.fillStyle =
            "#1565c0";

        ctx.font =
            "14px Arial";

        ctx.fillText(
            "|Ψ(x,t)|²",
            margemEsq + 5,
            margemTopo + 15
        );

        // ========================================================
        // Legenda V(x)
        // ========================================================

        ctx.fillStyle =
            "#d62728";

        ctx.fillText(
            "V(x)",
            width - 80,
            margemTopo + 15
        );

        // ========================================================
        // Tempo
        // ========================================================

        ctx.fillStyle =
            "#111";

        ctx.font =
            "14px Arial";

        ctx.fillText(
            `t = ${this.time.toFixed(3)} u.t.`,
            margemEsq + 15,
            margemTopo + 35
        );

        // ========================================================
        // Caixa R e T
        // ========================================================

        const caixaX =
            width - 215;

        const caixaY =
            margemTopo + 55;

        const caixaW = 185;
        const caixaH = 120;

        ctx.fillStyle =
            "rgba(255,255,255,0.92)";

        ctx.fillRect(
            caixaX,
            caixaY,
            caixaW,
            caixaH
        );

        ctx.strokeStyle =
            "#555";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            caixaX,
            caixaY,
            caixaW,
            caixaH
        );

        // --------------------------------------------------------
        // Título da caixa
        // --------------------------------------------------------

        ctx.fillStyle =
            "#111";

        ctx.font =
            "bold 15px Arial";

        ctx.fillText(
            "Coeficientes",
            caixaX + 12,
            caixaY + 23
        );

        ctx.font =
            "14px Arial";

        // --------------------------------------------------------
        // Antes do cálculo
        // --------------------------------------------------------

        if (
            this.R_final === null ||
            this.T_final === null
        ) {

            ctx.fillStyle =
                "#555";

            ctx.fillText(
                "R = calculando...",
                caixaX + 12,
                caixaY + 52
            );

            ctx.fillText(
                "T = calculando...",
                caixaX + 12,
                caixaY + 77
            );

            ctx.fillText(
                "Aguardando separação",
                caixaX + 12,
                caixaY + 102
            );
        }

        // --------------------------------------------------------
        // Depois do cálculo
        // --------------------------------------------------------

        else {

            ctx.fillStyle =
                "#1565c0";

            ctx.fillText(
                `R = ${(100 * this.R_final).toFixed(2)}%`,
                caixaX + 12,
                caixaY + 52
            );

            ctx.fillText(
                `T = ${(100 * this.T_final).toFixed(2)}%`,
                caixaX + 12,
                caixaY + 77
            );

            ctx.fillText(
                `R + T = ${(100 * (this.R_final + this.T_final)).toFixed(2)}%`,
                caixaX + 12,
                caixaY + 102
            );
        }

        // ========================================================
        // Parâmetros
        // ========================================================

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


    // ============================================================
    // Iniciar
    // ============================================================

    iniciar() {

        if (this.running) {
            return;
        }

        this.running = true;

        const loop = () => {

            if (!this.running) {
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


    // ============================================================
    // Parar
    // ============================================================

    parar() {

        this.running = false;
    }


    // ============================================================
    // Pause / Play
    // ============================================================

    alternar() {

        if (this.running) {

            this.parar();

        } else {

            this.iniciar();
        }
    }


    // ============================================================
    // Solve
    // ============================================================

    solve() {

        this.time = 0;
        this.frame = 0;

        this.R_final = null;
        this.T_final = null;

        this.criarPacote();

        this.criarPotencial();

        this.prepararThomas();

        this.draw();
    }
}
