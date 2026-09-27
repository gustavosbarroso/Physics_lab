// ============================================================
// TUNELAMENTO QUÂNTICO
// Crank-Nicolson + Algoritmo de Thomas
// ============================================================

class QuantumTunneling {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ----------------------------------------------------
        // PARÂMETROS
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

        this.defaultParams = {
            ...this.params
        };

        // ----------------------------------------------------
        // ESTADO
        // ----------------------------------------------------

        this.running = false;

        this.frame = 0;
        this.time = 0;

        this.animationId = null;

        // ----------------------------------------------------
        // GRID
        // ----------------------------------------------------

        this.x = [];
        this.x_int = [];

        this.dx = 0;
        this.M = 0;

        // ----------------------------------------------------
        // FUNÇÃO DE ONDA
        // Parte real e imaginária
        // ----------------------------------------------------

        this.psiRe = [];
        this.psiIm = [];

        // ----------------------------------------------------
        // POTENCIAL
        // ----------------------------------------------------

        this.V = [];

        // ----------------------------------------------------
        // MATRIZES TRIDIAGONAIS
        //
        // A psi(n+1) = B psi(n)
        //
        // A = I + i dt/(2hbar) H
        // B = I - i dt/(2hbar) H
        // ----------------------------------------------------

        this.A_lower_re = [];
        this.A_lower_im = [];

        this.A_diag_re = [];
        this.A_diag_im = [];

        this.A_upper_re = [];
        this.A_upper_im = [];

        this.B_lower_re = [];
        this.B_lower_im = [];

        this.B_diag_re = [];
        this.B_diag_im = [];

        this.B_upper_re = [];
        this.B_upper_im = [];

        // ----------------------------------------------------
        // COEFICIENTES DO THOMAS
        // ----------------------------------------------------

        this.cPrimeRe = [];
        this.cPrimeIm = [];

        this.denRe = [];
        this.denIm = [];

        // ----------------------------------------------------
        // INICIALIZAÇÃO
        // ----------------------------------------------------

        this.criarGrid();

        this.solve();

        this.draw();
    }


    // ========================================================
    // GRID
    // ========================================================

    criarGrid() {

        const p = this.params;

        this.dx = (p.x_max - p.x_min) / p.N;

        this.x = [];

        for (let i = 0; i <= p.N; i++) {
            this.x.push(p.x_min + i * this.dx);
        }

        // pontos internos
        this.x_int = this.x.slice(1, -1);

        this.M = this.x_int.length;
    }


    // ========================================================
    // PACOTE DE ONDA
    // ========================================================

    criarPacote() {

        const p = this.params;

        this.psiRe = new Array(this.M);
        this.psiIm = new Array(this.M);

        let norma = 0;

        // ----------------------------------------------------
        // ψ = exp[-(x-x0)^2/(4σ²)] exp(i k0 x)
        // ----------------------------------------------------

        for (let i = 0; i < this.M; i++) {

            const x = this.x_int[i];

            const envelope =
                Math.exp(
                    -Math.pow(x - p.x0, 2) /
                    (4 * Math.pow(p.sigma, 2))
                );

            const fase = p.k0 * x;

            this.psiRe[i] =
                envelope * Math.cos(fase);

            this.psiIm[i] =
                envelope * Math.sin(fase);

            norma +=
                (
                    this.psiRe[i] * this.psiRe[i] +
                    this.psiIm[i] * this.psiIm[i]
                ) * this.dx;
        }

        norma = Math.sqrt(norma);

        // normalização
        for (let i = 0; i < this.M; i++) {

            this.psiRe[i] /= norma;
            this.psiIm[i] /= norma;
        }
    }


    // ========================================================
    // POTENCIAL
    // ========================================================

    criarPotencial() {

        const p = this.params;

        this.V = new Array(this.M);

        for (let i = 0; i < this.M; i++) {

            const x = this.x_int[i];

            if (x > 0 && x < p.a) {
                this.V[i] = p.V0;
            }
            else {
                this.V[i] = 0;
            }
        }
    }


    // ========================================================
    // MATRIZES A E B
    // ========================================================

    criarEvolucao() {

        const p = this.params;

        const hbar = p.h_bar;
        const m = p.m;
        const dt = p.dt;

        // Hamiltoniana:

        // diagonal =
        // hbar²/(m dx²) + V

        // fora =
        // -hbar²/(2m dx²)

        const diagonalKinetica =
            hbar * hbar /
            (m * this.dx * this.dx);

        const foraDiagonal =
            -hbar * hbar /
            (2 * m * this.dx * this.dx);

        const fator =
            dt / (2 * hbar);

        // ----------------------------------------------------
        // arrays
        // ----------------------------------------------------

        this.A_lower_re = new Array(this.M - 1);
        this.A_lower_im = new Array(this.M - 1);

        this.A_diag_re = new Array(this.M);
        this.A_diag_im = new Array(this.M);

        this.A_upper_re = new Array(this.M - 1);
        this.A_upper_im = new Array(this.M - 1);


        this.B_lower_re = new Array(this.M - 1);
        this.B_lower_im = new Array(this.M - 1);

        this.B_diag_re = new Array(this.M);
        this.B_diag_im = new Array(this.M);

        this.B_upper_re = new Array(this.M - 1);
        this.B_upper_im = new Array(this.M - 1);


        // ----------------------------------------------------
        // A = I + i dt/(2hbar) H
        //
        // B = I - i dt/(2hbar) H
        // ----------------------------------------------------

        for (let i = 0; i < this.M; i++) {

            const Hdiag =
                diagonalKinetica + this.V[i];

            // diagonal A
            this.A_diag_re[i] = 1.0;
            this.A_diag_im[i] =
                fator * Hdiag;

            // diagonal B
            this.B_diag_re[i] = 1.0;
            this.B_diag_im[i] =
                -fator * Hdiag;
        }


        for (let i = 0; i < this.M - 1; i++) {

            // A
            this.A_lower_re[i] = 0;
            this.A_lower_im[i] =
                fator * foraDiagonal;

            this.A_upper_re[i] = 0;
            this.A_upper_im[i] =
                fator * foraDiagonal;

            // B
            this.B_lower_re[i] = 0;
            this.B_lower_im[i] =
                -fator * foraDiagonal;

            this.B_upper_re[i] = 0;
            this.B_upper_im[i] =
                -fator * foraDiagonal;
        }


        // preparar Thomas
        this.prepararThomas();
    }


    // ========================================================
    // DIVISÃO COMPLEXA
    //
    // (a+ib)/(c+id)
    // ========================================================

    dividirComplexo(ar, ai, br, bi) {

        const denominador =
            br * br + bi * bi;

        return [
            (ar * br + ai * bi) / denominador,
            (ai * br - ar * bi) / denominador
        ];
    }


    // ========================================================
    // MULTIPLICAÇÃO COMPLEXA
    // ========================================================

    multiplicarComplexo(ar, ai, br, bi) {

        return [
            ar * br - ai * bi,
            ar * bi + ai * br
        ];
    }


    // ========================================================
    // THOMAS - PRÉ-CÁLCULO
    // ========================================================

    prepararThomas() {

        const M = this.M;

        this.cPrimeRe = new Array(M - 1);
        this.cPrimeIm = new Array(M - 1);

        this.denRe = new Array(M);
        this.denIm = new Array(M);

        // ----------------------------------------------------
        // primeiro elemento
        // ----------------------------------------------------

        this.denRe[0] =
            this.A_diag_re[0];

        this.denIm[0] =
            this.A_diag_im[0];

        let cp =
            this.dividirComplexo(
                this.A_upper_re[0],
                this.A_upper_im[0],
                this.denRe[0],
                this.denIm[0]
            );

        this.cPrimeRe[0] = cp[0];
        this.cPrimeIm[0] = cp[1];


        // ----------------------------------------------------
        // restante
        // ----------------------------------------------------

        for (let i = 1; i < M; i++) {

            const produto =
                this.multiplicarComplexo(
                    this.A_lower_re[i - 1],
                    this.A_lower_im[i - 1],
                    this.cPrimeRe[i - 1],
                    this.cPrimeIm[i - 1]
                );

            this.denRe[i] =
                this.A_diag_re[i] - produto[0];

            this.denIm[i] =
                this.A_diag_im[i] - produto[1];

            if (i < M - 1) {

                const cp_i =
                    this.dividirComplexo(
                        this.A_upper_re[i],
                        this.A_upper_im[i],
                        this.denRe[i],
                        this.denIm[i]
                    );

                this.cPrimeRe[i] = cp_i[0];
                this.cPrimeIm[i] = cp_i[1];
            }
        }
    }


    // ========================================================
    // CALCULAR B ψ
    // ========================================================

    calcularRHS() {

        const M = this.M;

        const rhsRe = new Array(M);
        const rhsIm = new Array(M);

        for (let i = 0; i < M; i++) {

            // diagonal
            let valor =
                this.multiplicarComplexo(
                    this.B_diag_re[i],
                    this.B_diag_im[i],
                    this.psiRe[i],
                    this.psiIm[i]
                );

            let re = valor[0];
            let im = valor[1];


            // inferior
            if (i > 0) {

                valor =
                    this.multiplicarComplexo(
                        this.B_lower_re[i - 1],
                        this.B_lower_im[i - 1],
                        this.psiRe[i - 1],
                        this.psiIm[i - 1]
                    );

                re += valor[0];
                im += valor[1];
            }


            // superior
            if (i < M - 1) {

                valor =
                    this.multiplicarComplexo(
                        this.B_upper_re[i],
                        this.B_upper_im[i],
                        this.psiRe[i + 1],
                        this.psiIm[i + 1]
                    );

                re += valor[0];
                im += valor[1];
            }

            rhsRe[i] = re;
            rhsIm[i] = im;
        }

        return [rhsRe, rhsIm];
    }


    // ========================================================
    // ALGORITMO DE THOMAS
    // ========================================================

    resolverThomas(rhsRe, rhsIm) {

        const M = this.M;

        const dPrimeRe = new Array(M);
        const dPrimeIm = new Array(M);

        const solRe = new Array(M);
        const solIm = new Array(M);


        // ----------------------------------------------------
        // forward sweep
        // ----------------------------------------------------

        let primeiro =
            this.dividirComplexo(
                rhsRe[0],
                rhsIm[0],
                this.denRe[0],
                this.denIm[0]
            );

        dPrimeRe[0] = primeiro[0];
        dPrimeIm[0] = primeiro[1];


        for (let i = 1; i < M; i++) {

            const produto =
                this.multiplicarComplexo(
                    this.A_lower_re[i - 1],
                    this.A_lower_im[i - 1],
                    dPrimeRe[i - 1],
                    dPrimeIm[i - 1]
                );

            const numeradorRe =
                rhsRe[i] - produto[0];

            const numeradorIm =
                rhsIm[i] - produto[1];


            const resultado =
                this.dividirComplexo(
                    numeradorRe,
                    numeradorIm,
                    this.denRe[i],
                    this.denIm[i]
                );

            dPrimeRe[i] = resultado[0];
            dPrimeIm[i] = resultado[1];
        }


        // ----------------------------------------------------
        // back substitution
        // ----------------------------------------------------

        solRe[M - 1] =
            dPrimeRe[M - 1];

        solIm[M - 1] =
            dPrimeIm[M - 1];


        for (let i = M - 2; i >= 0; i--) {

            const produto =
                this.multiplicarComplexo(
                    this.cPrimeRe[i],
                    this.cPrimeIm[i],
                    solRe[i + 1],
                    solIm[i + 1]
                );

            solRe[i] =
                dPrimeRe[i] - produto[0];

            solIm[i] =
                dPrimeIm[i] - produto[1];
        }


        return [solRe, solIm];
    }


    // ========================================================
    // UM PASSO DE CRANK-NICOLSON
    // ========================================================

    passoCrankNicolson() {

        const rhs =
            this.calcularRHS();

        const resultado =
            this.resolverThomas(
                rhs[0],
                rhs[1]
            );

        this.psiRe = resultado[0];
        this.psiIm = resultado[1];

        this.time += this.params.dt;
    }


    // ========================================================
    // VÁRIOS PASSOS
    // ========================================================

    evoluir() {

        for (
            let i = 0;
            i < this.params.passos_por_frame;
            i++
        ) {
            this.passoCrankNicolson();
        }
    }


    // ========================================================
    // PROBABILIDADES
    // ========================================================

    calcularProbabilidades() {

        const p = this.params;

        let P_esquerda = 0;
        let P_barreira = 0;
        let P_direita = 0;

        for (let i = 0; i < this.M; i++) {

            const prob =
                this.psiRe[i] * this.psiRe[i] +
                this.psiIm[i] * this.psiIm[i];

            const x = this.x_int[i];

            if (x < 0) {

                P_esquerda += prob * this.dx;

            }
            else if (x >= 0 && x <= p.a) {

                P_barreira += prob * this.dx;

            }
            else if (x > p.a) {

                P_direita += prob * this.dx;
            }
        }

        return {
            esquerda: P_esquerda,
            barreira: P_barreira,
            direita: P_direita,
            total:
                P_esquerda +
                P_barreira +
                P_direita
        };
    }


    // ========================================================
    // SOLVE
    // ========================================================

    solve() {

        this.criarGrid();

        this.criarPotencial();

        this.criarPacote();

        this.criarEvolucao();

        this.time = 0;
        this.frame = 0;
    }


    // ========================================================
    // DESENHO
    // ========================================================

    draw() {

        const ctx = this.ctx;
        const canvas = this.canvas;

        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);


        // ====================================================
        // ÁREA DO GRÁFICO
        // ====================================================

        const left = 70;
        const right = 70;
        const top = 45;
        const bottom = 70;

        const graphW =
            W - left - right;

        const graphH =
            H - top - bottom;


        // ====================================================
        // LIMITES
        // ====================================================

        const xMin = this.params.x_min;
        const xMax = this.params.x_max;

        // Escala da probabilidade
        const probMax = 4.0;

        // Escala independente do potencial
        const VMax =
            Math.max(
                45,
                this.params.V0 * 1.15
            );


        // ====================================================
        // CONVERSÃO X
        // ====================================================

        const px = x => {

            return left +
                (x - xMin) /
                (xMax - xMin) *
                graphW;
        };


        // ====================================================
        // CONVERSÃO Y - PROBABILIDADE
        // ====================================================

        const pyProb = prob => {

            return top +
                graphH -
                (prob / probMax) *
                graphH;
        };


        // ====================================================
        // CONVERSÃO Y - POTENCIAL
        // ====================================================

        const pyV = V => {

            return top +
                graphH -
                (V / VMax) *
                graphH;
        };


        // ====================================================
        // FUNDO
        // ====================================================

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            left,
            top,
            graphW,
            graphH
        );


        // ====================================================
        // GRADE
        // ====================================================

        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 8; i++) {

            const x =
                left +
                i * graphW / 8;

            ctx.beginPath();

            ctx.moveTo(x, top);
            ctx.lineTo(x, top + graphH);

            ctx.stroke();
        }


        for (let i = 0; i <= 4; i++) {

            const y =
                top +
                i * graphH / 4;

            ctx.beginPath();

            ctx.moveTo(left, y);
            ctx.lineTo(left + graphW, y);

            ctx.stroke();
        }


        // ====================================================
        // BARREIRA
        // ====================================================

        const x1 = px(0);
        const x2 = px(this.params.a);

        const yBarrier =
            pyV(this.params.V0);

        ctx.fillStyle =
            "rgba(200, 80, 80, 0.20)";

        ctx.fillRect(
            x1,
            yBarrier,
            x2 - x1,
            top + graphH - yBarrier
        );


        // ====================================================
        // LINHA DO POTENCIAL
        // ====================================================

        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#cc3333";

        for (let i = 0; i < this.M; i++) {

            const x =
                px(this.x_int[i]);

            const y =
                pyV(this.V[i]);

            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();


        // ====================================================
        // PROBABILIDADE
        // ====================================================

        ctx.beginPath();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#0066cc";

        for (let i = 0; i < this.M; i++) {

            const prob =
                this.psiRe[i] *
                this.psiRe[i] +

                this.psiIm[i] *
                this.psiIm[i];

            const x =
                px(this.x_int[i]);

            const y =
                pyProb(prob);

            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();


        // ====================================================
        // EIXOS
        // ====================================================

        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 1.5;

        ctx.beginPath();

        ctx.moveTo(left, top);
        ctx.lineTo(left, top + graphH);
        ctx.lineTo(left + graphW, top + graphH);

        ctx.stroke();


        // ====================================================
        // TICKS X
        // ====================================================

        ctx.fillStyle = "#222222";

        ctx.font = "13px Arial";
        ctx.textAlign = "center";

        for (let i = 0; i <= 8; i++) {

            const value =
                xMin +
                i * (xMax - xMin) / 8;

            const x =
                px(value);

            ctx.fillText(
                value.toFixed(1),
                x,
                top + graphH + 20
            );
        }


        // ====================================================
        // EIXO X
        // ====================================================

        ctx.font = "16px Arial";

        ctx.fillText(
            "x",
            left + graphW / 2,
            H - 20
        );


        // ====================================================
        // EIXO Y PROBABILIDADE
        // ====================================================

        ctx.save();

        ctx.translate(20, top + graphH / 2);

        ctx.rotate(-Math.PI / 2);

        ctx.textAlign = "center";

        ctx.fillText(
            "|Ψ(x,t)|²",
            0,
            0
        );

        ctx.restore();


        // ====================================================
        // EIXO Y POTENCIAL
        // ====================================================

        ctx.save();

        ctx.translate(
            W - 20,
            top + graphH / 2
        );

        ctx.rotate(Math.PI / 2);

        ctx.textAlign = "center";

        ctx.fillText(
            "V(x)",
            0,
            0
        );

        ctx.restore();


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.font = "bold 20px Arial";

        ctx.textAlign = "center";

        ctx.fillStyle = "#222222";

        ctx.fillText(
            "Tunelamento Quântico",
            W / 2,
            25
        );


        // ====================================================
        // INFORMAÇÕES
        // ====================================================

        const P =
            this.calcularProbabilidades();

        ctx.textAlign = "left";

        ctx.font = "14px Arial";

        ctx.fillStyle = "#222222";

        const infoX = left + 10;
        const infoY = top + 20;

        ctx.fillText(
            `t = ${this.time.toFixed(3)} u.t.`,
            infoX,
            infoY
        );

        ctx.fillText(
            `Esquerda: ${(100 * P.esquerda).toFixed(1)}%`,
            infoX,
            infoY + 20
        );

        ctx.fillText(
            `Tunelamento: ${(100 * P.direita).toFixed(1)}%`,
            infoX,
            infoY + 40
        );

        ctx.fillText(
            `Na barreira: ${(100 * P.barreira).toFixed(1)}%`,
            infoX,
            infoY + 60
        );

        ctx.fillText(
            `Total: ${(100 * P.total).toFixed(1)}%`,
            infoX,
            infoY + 80
        );


        // ====================================================
        // LEGENDA
        // ====================================================

        const legendX =
            left + graphW - 180;

        const legendY =
            top + 20;

        ctx.lineWidth = 3;

        // probabilidade

        ctx.strokeStyle = "#0066cc";

        ctx.beginPath();

        ctx.moveTo(
            legendX,
            legendY
        );

        ctx.lineTo(
            legendX + 30,
            legendY
        );

        ctx.stroke();

        ctx.fillStyle = "#222222";

        ctx.font = "13px Arial";

        ctx.fillText(
            "|Ψ|²",
            legendX + 40,
            legendY + 5
        );


        // potencial

        ctx.strokeStyle = "#cc3333";

        ctx.beginPath();

        ctx.moveTo(
            legendX,
            legendY + 25
        );

        ctx.lineTo(
            legendX + 30,
            legendY + 25
        );

        ctx.stroke();

        ctx.fillStyle = "#222222";

        ctx.fillText(
            "V(x)",
            legendX + 40,
            legendY + 30
        );
    }


    // ========================================================
    // ANIMAÇÃO
    // ========================================================

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

            this.animationId =
                requestAnimationFrame(loop);
        };

        loop();
    }


    // ========================================================
    // PAUSAR
    // ========================================================

    parar() {

        this.running = false;

        if (this.animationId !== null) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;
        }
    }


    // ========================================================
    // PLAY / PAUSE
    // ========================================================

    alternar() {

        if (this.running) {

            this.parar();

        } else {

            this.iniciar();
        }
    }


    // ========================================================
    // RESET
    // ========================================================

    resetar() {

        this.parar();

        this.params = {
            ...this.defaultParams
        };

        this.solve();

        this.draw();
    }


    // ========================================================
    // ATUALIZAR PARÂMETROS
    // ========================================================

    atualizarParametros(newParams) {

        const estavaRodando =
            this.running;

        this.parar();

        this.params = {
            ...this.params,
            ...newParams
        };

        this.solve();

        this.draw();

        if (estavaRodando) {
            this.iniciar();
        }
    }
}
