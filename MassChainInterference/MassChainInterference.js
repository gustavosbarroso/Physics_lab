class MassChainInterference {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ==========================
        // PARÂMETROS
        // ==========================

        this.params = {

            N: 60,
            m: 1.0,
            k: 10.0,

            c1: 60 * 0.3,
            c2: 60 * 0.7,

            l1: 3,
            l2: 3,

            A1: 1,
            A2: -1,

            ...options
        };


        // ==========================
        // DADOS
        // ==========================

        this.time = [];
        this.x = [];
        this.v = [];

        this.running = false;
        this.frame = 0;


        // ==========================
        // RESOLVE
        // ==========================

        this.solve();
    }


    // ==========================
    // GAUSSIANA
    // ==========================

    gauss(i, centro, largura, amplitude) {

        return amplitude *
            Math.exp(
                -((i - centro) ** 2) /
                (2 * largura ** 2)
            );
    }


    // ==========================
    // CONDIÇÃO INICIAL
    // ==========================

    inicial() {

        const N = this.params.N;

        const x0 = new Array(N).fill(0);
        const v0 = new Array(N).fill(0);


        for (let i = 0; i < N; i++) {

            x0[i] += this.gauss(
                i,
                this.params.c1,
                this.params.l1,
                this.params.A1
            );

            x0[i] += this.gauss(
                i,
                this.params.c2,
                this.params.l2,
                this.params.A2
            );
        }


        return [
            ...x0,
            ...v0
        ];
    }


    // ==========================
    // SISTEMA
    // ==========================

    f(state, t) {

        const N = this.params.N;
        const k = this.params.k;
        const m = this.params.m;


        const x = state.slice(0, N);

        const a = new Array(N).fill(0);


        for (let i = 0; i < N; i++) {

            // Primeira massa
            if (i === 0) {

                a[i] =
                    (k / m) *
                    (x[i + 1] - x[i]);
            }


            // Última massa
            else if (i === N - 1) {

                a[i] =
                    (k / m) *
                    (x[i - 1] - x[i]);
            }


            // Massas internas
            else {

                a[i] =
                    (k / m) *
                    (
                        x[i + 1] +
                        x[i - 1] -
                        2 * x[i]
                    );
            }
        }


        return [
            ...state.slice(N),
            ...a
        ];
    }


    // ==========================
    // OPERAÇÕES VETORIAIS
    // ==========================

    add(a, b) {

        return a.map(
            (value, i) =>
                value + b[i]
        );
    }


    mul(a, scalar) {

        return a.map(
            value =>
                value * scalar
        );
    }


    add4(a, b, c, d) {

        return a.map(
            (value, i) =>
                value +
                2 * b[i] +
                2 * c[i] +
                d[i]
        );
    }


    // ==========================
    // RK4
    // ==========================

    RK4() {

        const a = 0;
        const b = 20;

        const steps = 400;

        const h =
            (b - a) / steps;


        let state =
            this.inicial();


        this.time = [];
        this.x = [];
        this.v = [];


        for (let i = 0; i <= steps; i++) {

            const t =
                a + i * h;


            this.time.push(t);


            const N =
                this.params.N;


            // Posição
            this.x.push(
                state.slice(0, N)
            );


            // Velocidade
            this.v.push(
                state.slice(N)
            );


            if (i === steps)
                break;


            // ======================
            // k1
            // ======================

            const k1 =
                this.mul(
                    this.f(state, t),
                    h
                );


            // ======================
            // k2
            // ======================

            const k2 =
                this.mul(
                    this.f(
                        this.add(
                            state,
                            this.mul(
                                k1,
                                0.5
                            )
                        ),
                        t + h / 2
                    ),
                    h
                );


            // ======================
            // k3
            // ======================

            const k3 =
                this.mul(
                    this.f(
                        this.add(
                            state,
                            this.mul(
                                k2,
                                0.5
                            )
                        ),
                        t + h / 2
                    ),
                    h
                );


            // ======================
            // k4
            // ======================

            const k4 =
                this.mul(
                    this.f(
                        this.add(
                            state,
                            k3
                        ),
                        t + h
                    ),
                    h
                );


            // ======================
            // NOVO ESTADO
            // ======================

            state =
                this.add(
                    state,
                    this.mul(
                        this.add4(
                            k1,
                            k2,
                            k3,
                            k4
                        ),
                        1 / 6
                    )
                );
        }
    }


    // ==========================
    // SOLVER
    // ==========================

    solve() {

        this.RK4();

        this.frame = 0;
    }


    // ==========================
    // DESENHO
    // ==========================

    draw() {

        const ctx =
            this.ctx;

        const canvas =
            this.canvas;


        // ==========================
        // LIMPA CANVAS
        // ==========================

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        const N =
            this.params.N;


        const currentX =
            this.x[this.frame];


        if (!currentX)
            return;


        // ==========================
        // TÍTULO
        // ==========================

        ctx.fillStyle =
            "black";

        ctx.font =
            "18px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "Interferência em cadeia de massas",
            canvas.width / 2,
            25
        );


        // ==========================
        // GEOMETRIA
        // ==========================

        const marginLeft = 40;
        const marginRight = 20;

        const width =
            canvas.width -
            marginLeft -
            marginRight;


        const centerY =
            canvas.height / 2;


        const scaleX =
            width /
            Math.max(
                N - 1,
                1
            );


        // ==========================
        // LINHA DE EQUILÍBRIO
        // ==========================

        ctx.strokeStyle =
            "#cccccc";

        ctx.lineWidth =
            1;


        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            centerY
        );

        ctx.lineTo(
            canvas.width -
            marginRight,
            centerY
        );

        ctx.stroke();


        // ==========================
        // CADEIA
        // ==========================

        ctx.strokeStyle =
            "black";

        ctx.fillStyle =
            "black";

        ctx.lineWidth =
            2;


        ctx.beginPath();


        for (let i = 0; i < N; i++) {

            const px =
                marginLeft +
                i * scaleX;


            const py =
                centerY -
                currentX[i] * 80;


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


        // ==========================
        // MASSAS
        // ==========================

        for (let i = 0; i < N; i++) {

            const px =
                marginLeft +
                i * scaleX;


            const py =
                centerY -
                currentX[i] * 80;


            ctx.beginPath();


            ctx.arc(
                px,
                py,
                4,
                0,
                2 * Math.PI
            );


            ctx.fill();
        }


        // ==========================
        // TEMPO
        // ==========================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "right";


        ctx.fillText(
            `t = ${this.time[this.frame].toFixed(2)} s`,
            canvas.width - 10,
            canvas.height - 10
        );
    }


    // ==========================
    // ANIMAÇÃO
    // ==========================

    iniciar() {

        if (this.running)
            return;


        this.running =
            true;


        const loop = () => {

            if (!this.running)
                return;


            this.draw();


            this.frame++;


            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;
            }


            requestAnimationFrame(
                loop
            );
        };


        loop();
    }


    // ==========================
    // PARAR
    // ==========================

    parar() {

        this.running =
            false;
    }


    // ==========================
    // ATUALIZAR PARÂMETROS
    // ==========================

    atualizarParametros(
        newParams
    ) {

        this.params = {
            ...this.params,
            ...newParams
        };


        this.solve();


        // Redesenha imediatamente
        this.draw();
    }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

const canvas =
    document.getElementById(
        "massChainCanvas"
    );


const massChain =
    new MassChainInterference(
        canvas
    );


massChain.iniciar();
