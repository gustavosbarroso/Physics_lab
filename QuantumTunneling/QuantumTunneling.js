// ============================================================
// TUNELAMENTO QUÂNTICO
// Diferenças Finitas
// Crank-Nicolson + Algoritmo de Thomas
// ============================================================

class QuantumTunneling {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ====================================================
        // PARÂMETROS
        // ====================================================

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


        // ====================================================
        // MALHA
        // ====================================================

        const p = this.params;

        this.dx =
            (p.x_max - p.x_min) / p.N;

        // Pontos internos
        this.M = p.N - 1;

        this.x = new Float64Array(this.M);

        for (let i = 0; i < this.M; i++) {

            this.x[i] =
                p.x_min + (i + 1) * this.dx;
        }


        // ====================================================
        // ESTADO
        // ====================================================

        this.psiRe = new Float64Array(this.M);
        this.psiIm = new Float64Array(this.M);

        this.V = new Float64Array(this.M);


        // ====================================================
        // MATRIZ CRANK-NICOLSON
        // ====================================================

        this.A_lower = new Float64Array(this.M - 1);
        this.A_diag_re = new Float64Array(this.M);
        this.A_diag_im = new Float64Array(this.M);
        this.A_upper = new Float64Array(this.M - 1);

        this.B_lower = new Float64Array(this.M - 1);
        this.B_diag_re = new Float64Array(this.M);
        this.B_diag_im = new Float64Array(this.M);
        this.B_upper = new Float64Array(this.M - 1);


        // ====================================================
        // COEFICIENTES PRÉ-CALCULADOS PARA THOMAS
        // ====================================================

        this.cPrimeRe = new Float64Array(this.M - 1);
        this.cPrimeIm = new Float64Array(this.M - 1);

        this.denomRe = new Float64Array(this.M);
        this.denomIm = new Float64Array(this.M);


        // ====================================================
        // PROBABILIDADES
        // ====================================================

        this.P_esquerda = 0;
        this.P_barreira = 0;
        this.P_direita = 0;
        this.P_total = 0;

        this.time = 0;


        // ====================================================
        // ANIMAÇÃO
        // ====================================================

        this.running = false;
        this.frame = 0;
        this.animationId = null;


        // ====================================================
        // CONSTRUIR SISTEMA
        // ====================================================

        this.solve();

        this.draw();
    }


    // ============================================================
    // FUNÇÃO DE ONDA INICIAL
    // ============================================================

    criarPacote() {

        const p = this.params;

        let norma = 0;

        // --------------------------------------------
        // Primeiro calcula o pacote
        // --------------------------------------------

        for (let i = 0; i < this.M; i++) {

            const x = this.x[i];

            const envelope =
                Math.exp(
                    -Math.pow(x - p.x0, 2)
                    /
                    (4 * Math.pow(p.sigma, 2))
                );

            const fase =
                p.k0 * x;

            this.psiRe[i] =
                envelope * Math.cos(fase);

            this.psiIm[i] =
                envelope * Math.sin(fase);

            norma +=
                (
                    this.psiRe[i] ** 2
                    +
                    this.psiIm[i] ** 2
                );
        }


        // --------------------------------------------
        // Normalização
        // --------------------------------------------

        norma =
            Math.sqrt(
                norma * this.dx
            );


        for (let i = 0; i < this.M; i++) {

            this.psiRe[i] /= norma;
            this.psiIm[i] /= norma;
        }
    }


    // ============================================================
    // POTENCIAL
    // ============================================================

    criarPotencial() {

        const p = this.params;

        for (let i = 0; i < this.M; i++) {

            const x = this.x[i];

            if (x > 0 && x < p.a) {

                this.V[i] = p.V0;

            } else {

                this.V[i] = 0;
            }
        }
    }


    // ============================================================
    // CRANK-NICOLSON
    // ============================================================

    criarEvolucao() {

        const p = this.params;

        const h = this.dx;

        const hbar = p.h_bar;
        const m = p.m;
        const dt = p.dt;


        // --------------------------------------------------------
        // Hamiltoniana:
        //
        // H_diag =
        // hbar²/(m dx²) + V
        //
        // H_off =
        // -hbar²/(2m dx²)
        // --------------------------------------------------------

        const H_off =
            -hbar ** 2
            /
            (2 * m * h ** 2);


        const H_kin_diag =
            hbar ** 2
            /
            (m * h ** 2);


        // --------------------------------------------------------
        // fator = i dt / (2 hbar)
        // --------------------------------------------------------

        const fator =
            dt / (2 * hbar);


        // ========================================================
        // MATRIZ A
        //
        // A = I + i dt/(2hbar) H
        // ========================================================


        // Fora da diagonal

        for (let i = 0; i < this.M - 1; i++) {

            // i * fator * H_off

            const imag =
                fator * H_off;

            this.A_lower[i] = 0;
            this.A_upper[i] = 0;

            // Número puramente imaginário
            // armazenamos apenas o valor imaginário

            this.A_lower[i] = imag;
            this.A_upper[i] = imag;
        }


        // Diagonal

        for (let i = 0; i < this.M; i++) {

            const H_diag =
                H_kin_diag + this.V[i];

            this.A_diag_re[i] = 1.0;

            this.A_diag_im[i] =
                fator * H_diag;
        }


        // ========================================================
        // MATRIZ B
        //
        // B = I - i dt/(2hbar) H
        // ========================================================

        for (let i = 0; i < this.M - 1; i++) {

            const imag =
                -fator * H_off;

            this.B_lower[i] = imag;
            this.B_upper[i] = imag;
        }


        for (let i = 0; i < this.M; i++) {

            const H_diag =
                H_kin_diag + this.V[i];

            this.B_diag_re[i] = 1.0;

            this.B_diag_im[i] =
                -fator * H_diag;
        }


        // ========================================================
        // PRÉ-FATORAÇÃO DE A
        //
        // Como A não muda enquanto os parâmetros não mudarem,
        // podemos calcular os coeficientes de Thomas uma vez.
        // ========================================================

        this.prepararThomas();
    }


    // ============================================================
    // OPERAÇÃO COMPLEXA
    // ============================================================

    complexoMultiplicar(
        ar,
        ai,
        br,
        bi
    ) {

        return {

            re:
                ar * br - ai * bi,

            im:
                ar * bi + ai * br
        };
    }


    // ============================================================
    // PRÉ-CÁLCULO DO ALGORITMO DE THOMAS
    // ============================================================

    prepararThomas() {

        const n = this.M;


        // --------------------------------------------------------
        // Primeira linha
        // --------------------------------------------------------

        let denRe =
            this.A_diag_re[0];

        let denIm =
            this.A_diag_im[0];

        this.denomRe[0] = denRe;
        this.denomIm[0] = denIm;


        // cPrime[0] = c[0] / denom[0]

        {

            const cRe =
                this.A_upper[0];

            const cIm = 0;

            const divisor =
                denRe ** 2 +
                denIm ** 2;

            this.cPrimeRe[0] =
                (
                    cRe * denRe +
                    cIm * denIm
                )
                /
                divisor;

            this.cPrimeIm[0] =
                (
                    cIm * denRe -
                    cRe * denIm
                )
                /
                divisor;
        }


        // --------------------------------------------------------
        // Demais linhas
        // --------------------------------------------------------

        for (let i = 1; i < n - 1; i++) {

            // a[i-1] * cPrime[i-1]

            const aRe =
                this.A_lower[i - 1];

            const aIm = 0;

            const cpRe =
                this.cPrimeRe[i - 1];

            const cpIm =
                this.cPrimeIm[i - 1];

            const produtoRe =
                aRe * cpRe -
                aIm * cpIm;

            const produtoIm =
                aRe * cpIm +
                aIm * cpRe;


            // denom = b - a*cPrime

            denRe =
                this.A_diag_re[i]
                -
                produtoRe;

            denIm =
                this.A_diag_im[i]
                -
                produtoIm;


            this.denomRe[i] = denRe;
            this.denomIm[i] = denIm;


            // cPrime

            const cRe =
                this.A_upper[i];

            const divisor =
                denRe ** 2 +
                denIm ** 2;

            this.cPrimeRe[i] =
                cRe * denRe
                /
                divisor;

            this.cPrimeIm[i] =
                -cRe * denIm
                /
                divisor;
        }


        // Último denominador

        const i = n - 1;

        const aRe =
            this.A_lower[i - 1];

        const cpRe =
            this.cPrimeRe[i - 1];

        const cpIm =
            this.cPrimeIm[i - 1];

        const produtoRe =
            aRe * cpRe;

        const produtoIm =
            aRe * cpIm;


        this.denomRe[i] =
            this.A_diag_re[i]
            -
            produtoRe;

        this.denomIm[i] =
            this.A_diag_im[i]
            -
            produtoIm;
    }


    // ============================================================
    // MULTIPLICAÇÃO B * PSI
    // ============================================================

    multiplicarB() {

        const n = this.M;

        const dRe =
            new Float64Array(n);

        const dIm =
            new Float64Array(n);


        for (let i = 0; i < n; i++) {

            // Diagonal

            let re =
                this.B_diag_re[i] *
                this.psiRe[i]
                -
                this.B_diag_im[i] *
                this.psiIm[i];

            let im =
                this.B_diag_re[i] *
                this.psiIm[i]
                +
                this.B_diag_im[i] *
                this.psiRe[i];


            // Inferior

            if (i > 0) {

                const ar =
                    this.B_lower[i - 1];

                re +=
                    -ar *
                    this.psiIm[i - 1];

                im +=
                    ar *
                    this.psiRe[i - 1];
            }


            // Superior

            if (i < n - 1) {

                const ar =
                    this.B_upper[i];

                re +=
                    -ar *
                    this.psiIm[i + 1];

                im +=
                    ar *
                    this.psiRe[i + 1];
            }


            dRe[i] = re;
            dIm[i] = im;
        }


        return {
            re: dRe,
            im: dIm
        };
    }


    // ============================================================
    // ALGORITMO DE THOMAS COMPLEXO
    // ============================================================

    resolverThomas(dRe, dIm) {

        const n = this.M;

        const dPrimeRe =
            new Float64Array(n);

        const dPrimeIm =
            new Float64Array(n);

        const resultadoRe =
            new Float64Array(n);

        const resultadoIm =
            new Float64Array(n);


        // ========================================================
        // FORWARD SWEEP
        // ========================================================

        // Primeira linha

        {

            const denRe =
                this.denomRe[0];

            const denIm =
                this.denomIm[0];

            const divisor =
                denRe ** 2 +
                denIm ** 2;

            dPrimeRe[0] =
                (
                    dRe[0] * denRe
                    +
                    dIm[0] * denIm
                )
                /
                divisor;

            dPrimeIm[0] =
                (
                    dIm[0] * denRe
                    -
                    dRe[0] * denIm
                )
                /
                divisor;
        }


        // Demais linhas

        for (let i = 1; i < n; i++) {

            // a * dPrime anterior

            const a =
                this.A_lower[i - 1];

            const prodRe =
                a *
                dPrimeRe[i - 1];

            const prodIm =
                a *
                dPrimeIm[i - 1];


            const numRe =
                dRe[i]
                -
                prodRe;

            const numIm =
                dIm[i]
                -
                prodIm;


            const denRe =
                this.denomRe[i];

            const denIm =
                this.denomIm[i];

            const divisor =
                denRe ** 2 +
                denIm ** 2;


            dPrimeRe[i] =
                (
                    numRe * denRe
                    +
                    numIm * denIm
                )
                /
                divisor;

            dPrimeIm[i] =
                (
                    numIm * denRe
                    -
                    numRe * denIm
                )
                /
                divisor;
        }


        // ========================================================
        // BACK SUBSTITUTION
        // ========================================================

        resultadoRe[n - 1] =
            dPrimeRe[n - 1];

        resultadoIm[n - 1] =
            dPrimeIm[n - 1];


        for (let i = n - 2; i >= 0; i--) {

            const cRe =
                this.cPrimeRe[i];

            const cIm =
                this.cPrimeIm[i];


            const prodRe =
                cRe *
                resultadoRe[i + 1]
                -
                cIm *
                resultadoIm[i + 1];

            const prodIm =
                cRe *
                resultadoIm[i + 1]
                +
                cIm *
                resultadoRe[i + 1];


            resultadoRe[i] =
                dPrimeRe[i]
                -
                prodRe;

            resultadoIm[i] =
                dPrimeIm[i]
                -
                prodIm;
        }


        return {
            re: resultadoRe,
            im: resultadoIm
        };
    }


    // ============================================================
    // UM PASSO DE CRANK-NICOLSON
    // ============================================================

    passoCrankNicolson() {

        const rhs =
            this.multiplicarB();


        const novoPsi =
            this.resolverThomas(
                rhs.re,
                rhs.im
            );


        this.psiRe =
            novoPsi.re;

        this.psiIm =
            novoPsi.im;


        this.time +=
            this.params.dt;
    }


    // ============================================================
    // SOLVER
    // ============================================================

    solve() {

        this.criarPotencial();

        this.criarEvolucao();

        this.criarPacote();

        this.time = 0;
        this.frame = 0;
    }


    // ============================================================
    // PROBABILIDADES
    // ============================================================

    calcularProbabilidades() {

        const p =
            this.params;

        let esquerda = 0;
        let barreira = 0;
        let direita = 0;


        for (let i = 0; i < this.M; i++) {

            const prob =
                this.psiRe[i] ** 2
                +
                this.psiIm[i] ** 2;


            if (this.x[i] < 0) {

                esquerda += prob;

            } else if (
                this.x[i] >= 0 &&
                this.x[i] <= p.a
            ) {

                barreira += prob;

            } else if (
                this.x[i] > p.a
            ) {

                direita += prob;
            }
        }


        this.P_esquerda =
            esquerda * this.dx;

        this.P_barreira =
            barreira * this.dx;

        this.P_direita =
            direita * this.dx;

        this.P_total =
            this.P_esquerda
            +
            this.P_barreira
            +
            this.P_direita;
    }


    // ============================================================
    // ESCALA
    // ============================================================

    updateAxis() {

        this.xMin =
            this.params.x_min;

        this.xMax =
            this.params.x_max;

        this.yMin = 0;

        this.yMax = 4;
    }


    // ============================================================
    // VISUALIZAÇÃO
    // ============================================================

    draw() {

        const ctx = this.ctx;

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


        this.updateAxis();


        // ========================================================
        // MARGENS
        // ========================================================

        const marginLeft = 60;
        const marginRight = 30;
        const marginTop = 30;
        const marginBottom = 55;


        const graphWidth =
            width
            - marginLeft
            - marginRight;

        const graphHeight =
            height
            - marginTop
            - marginBottom;


        // ========================================================
        // CONVERSÃO FÍSICA → PIXELS
        // ========================================================

        const toX = x => {

            return marginLeft
                +
                (
                    (x - this.xMin)
                    /
                    (this.xMax - this.xMin)
                )
                * graphWidth;
        };


        const toY = y => {

            return marginTop
                +
                graphHeight
                -
                (
                    y / this.yMax
                )
                * graphHeight;
        };


        // ========================================================
        // EIXOS
        // ========================================================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            toY(0)
        );

        ctx.lineTo(
            width - marginRight,
            toY(0)
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            marginTop
        );

        ctx.lineTo(
            marginLeft,
            toY(0)
        );

        ctx.stroke();


        // ========================================================
        // BARREIRA
        // ========================================================

        const p = this.params;


        if (p.V0 <= this.yMax) {

            ctx.fillStyle =
                "rgba(180, 180, 180, 0.35)";

            ctx.fillRect(
                toX(0),
                toY(p.V0),
                toX(p.a) - toX(0),
                toY(0) - toY(p.V0)
            );
        }


        // ========================================================
        // POTENCIAL
        // ========================================================

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.beginPath();


        let primeiro = true;


        for (let i = 0; i < this.M; i++) {

            const x =
                this.x[i];

            const V =
                this.V[i];

            const y =
                Math.min(
                    V,
                    this.yMax
                );


            if (primeiro) {

                ctx.moveTo(
                    toX(x),
                    toY(y)
                );

                primeiro = false;

            } else {

                ctx.lineTo(
                    toX(x),
                    toY(y)
                );
            }
        }

        ctx.stroke();


        // ========================================================
        // PROBABILIDADE |Ψ|²
        // ========================================================

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;


        ctx.beginPath();


        for (let i = 0; i < this.M; i++) {

            const prob =
                this.psiRe[i] ** 2
                +
                this.psiIm[i] ** 2;


            const x =
                toX(this.x[i]);

            const y =
                toY(prob);


            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();


        // ========================================================
        // LINHA x = 0
        // ========================================================

        ctx.strokeStyle =
            "rgba(0,0,0,0.35)";

        ctx.setLineDash([5, 5]);

        ctx.beginPath();

        ctx.moveTo(
            toX(0),
            marginTop
        );

        ctx.lineTo(
            toX(0),
            toY(0)
        );

        ctx.stroke();


        // x = a

        ctx.beginPath();

        ctx.moveTo(
            toX(p.a),
            marginTop
        );

        ctx.lineTo(
            toX(p.a),
            toY(0)
        );

        ctx.stroke();

        ctx.setLineDash([]);


        // ========================================================
        // TEXTO
        // ========================================================

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";


        ctx.fillText(
            `t = ${this.time.toFixed(3)} u.t.`,
            20,
            25
        );


        ctx.fillText(
            `Esquerda: ${(100 * this.P_esquerda).toFixed(1)}%`,
            20,
            45
        );


        ctx.fillText(
            `Tunelamento: ${(100 * this.P_direita).toFixed(1)}%`,
            20,
            65
        );


        ctx.fillText(
            `Barreira: ${(100 * this.P_barreira).toFixed(1)}%`,
            20,
            85
        );


        ctx.fillText(
            `Total: ${(100 * this.P_total).toFixed(1)}%`,
            20,
            105
        );


        // ========================================================
        // LEGENDA
        // ========================================================

        ctx.fillStyle = "blue";

        ctx.fillRect(
            width - 190,
            25,
            20,
            3
        );

        ctx.fillStyle = "black";

        ctx.fillText(
            "|Ψ(x,t)|²",
            width - 160,
            30
        );


        ctx.fillStyle = "red";

        ctx.fillRect(
            width - 190,
            48,
            20,
            3
        );

        ctx.fillStyle = "black";

        ctx.fillText(
            "V(x)",
            width - 160,
            53
        );


        // ========================================================
        // EIXO X
        // ========================================================

        ctx.fillStyle = "black";
        ctx.font = "13px Arial";


        ctx.fillText(
            "x",
            width - marginRight + 5,
            toY(0) + 5
        );


        // ========================================================
        // MARCAÇÕES X
        // ========================================================

        const marcas = [-6, -4, -2, 0, 2, 4, 6];


        for (const valor of marcas) {

            const px =
                toX(valor);

            ctx.beginPath();

            ctx.moveTo(
                px,
                toY(0)
            );

            ctx.lineTo(
                px,
                toY(0) + 5
            );

            ctx.stroke();


            ctx.fillText(
                valor.toString(),
                px - 8,
                toY(0) + 20
            );
        }
    }


    // ============================================================
    // ANIMAÇÃO
    // ============================================================

    iniciar() {

        if (this.running)
            return;


        this.running = true;


        const loop = () => {

            if (!this.running)
                return;


            // --------------------------------------------
            // Vários passos por frame
            // --------------------------------------------

            for (
                let i = 0;
                i < this.params.passos_por_frame;
                i++
            ) {

                this.passoCrankNicolson();
            }


            this.calcularProbabilidades();

            this.frame++;

            this.draw();


            this.animationId =
                requestAnimationFrame(loop);
        };


        loop();
    }


    // ============================================================
    // PARAR
    // ============================================================

    parar() {

        this.running = false;

        if (this.animationId !== null) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;
        }
    }


    // ============================================================
    // RESETAR ANIMAÇÃO
    // ============================================================

    resetar() {

        this.parar();

        this.solve();

        this.calcularProbabilidades();

        this.draw();
    }


    // ============================================================
    // ATUALIZAR PARÂMETROS
    // ============================================================

    atualizarParametros(newParams) {

        const estavaRodando =
            this.running;


        this.parar();


        this.params = {

            ...this.params,
            ...newParams
        };


        this.solve();

        this.calcularProbabilidades();

        this.draw();


        if (estavaRodando) {

            this.iniciar();
        }
    }
}
