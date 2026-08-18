class MassChainInterference {

    constructor(canvasChain, canvasPlot, options = {}) {

        this.canvasChain = canvasChain;
        this.canvasPlot = canvasPlot;

        this.ctxChain = canvasChain.getContext("2d");
        this.ctxPlot = canvasPlot.getContext("2d");

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

        let N = this.params.N;

        let x0 = new Array(N).fill(0);
        let v0 = new Array(N).fill(0);


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

        let N = this.params.N;
        let k = this.params.k;
        let m = this.params.m;


        let x = state.slice(0, N);


        let a = new Array(N).fill(0);


        for (let i = 0; i < N; i++) {

            if (i === 0) {

                a[i] =
                    (k / m) *
                    (x[i + 1] - x[i]);

            }

            else if (i === N - 1) {

                a[i] =
                    (k / m) *
                    (x[i - 1] - x[i]);

            }

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
            (value, i) => value + b[i]
        );
    }


    mul(a, scalar) {

        return a.map(
            value => value * scalar
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

        let a = 0;
        let b = 20;
        let steps = 400;

        let h = (b - a) / steps;


        let state = this.inicial();


        this.time = [];
        this.x = [];
        this.v = [];


        for (let i = 0; i <= steps; i++) {

            let t = a + i * h;


            this.time.push(t);


            let N = this.params.N;


            this.x.push(
                state.slice(0, N)
            );


            this.v.push(
                state.slice(N)
            );


            if (i === steps)
                break;


            let k1 = this.mul(
                this.f(state, t),
                h
            );


            let k2 = this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(k1, 0.5)
                    ),
                    t + h / 2
                ),
                h
            );


            let k3 = this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(k2, 0.5)
                    ),
                    t + h / 2
                ),
                h
            );


            let k4 = this.mul(
                this.f(
                    this.add(state, k3),
                    t + h
                ),
                h
            );


            state = this.add(
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
    // DESENHO DA CADEIA
    // ==========================

    drawChain() {

        let ctx = this.ctxChain;

        let canvas = this.canvasChain;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        let N = this.params.N;


        // ==========================
        // TÍTULO
        // ==========================

        ctx.fillStyle = "black";
        ctx.font = "18px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Interferência em cadeia de massas",
            canvas.width / 2,
            25
        );


        // ==========================
        // EIXOS
        // ==========================

        let marginLeft = 40;
        let marginRight = 20;

        let width =
            canvas.width -
            marginLeft -
            marginRight;


        let centerY =
            canvas.height / 2;


        let scaleX =
            width / Math.max(N - 1, 1);


        // ==========================
        // LINHA DE EQUILÍBRIO
        // ==========================

        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            centerY
        );

        ctx.lineTo(
            canvas.width - marginRight,
            centerY
        );

        ctx.stroke();


        // ==========================
        // POSIÇÕES ATUAIS
        // ==========================

        let currentX =
            this.x[this.frame];


        if (!currentX)
            return;


        // ==========================
        // LINHA DA CADEIA
        // ==========================

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;


        ctx.beginPath();


        for (let i = 0; i < N; i++) {

            let px =
                marginLeft +
                i * scaleX;

            let py =
                centerY -
                currentX[i] * 80;


            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }


        ctx.stroke();


        // ==========================
        // MASSAS INDIVIDUAIS
        // ==========================

        for (let i = 0; i < N; i++) {

            let px =
                marginLeft +
                i * scaleX;

            let py =
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

        ctx.font = "13px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            `t = ${this.time[this.frame].toFixed(2)} s`,
            canvas.width - 10,
            canvas.height - 10
        );
    }


    // ==========================
    // DESENHO DO GRÁFICO
    // ==========================

    drawPlot() {

        let ctx = this.ctxPlot;

        let canvas = this.canvasPlot;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        let marginLeft = 55;
        let marginBottom = 40;
        let marginTop = 35;
        let marginRight = 20;


        let width =
            canvas.width -
            marginLeft -
            marginRight;


        let height =
            canvas.height -
            marginTop -
            marginBottom;


        // ==========================
        // TÍTULO
        // ==========================

        ctx.fillStyle = "black";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "xᵢ(t) — massa central",
            canvas.width / 2,
            22
        );


        // ==========================
        // EIXOS
        // ==========================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            marginTop
        );

        ctx.lineTo(
            marginLeft,
            canvas.height - marginBottom
        );

        ctx.lineTo(
            canvas.width - marginRight,
            canvas.height - marginBottom
        );

        ctx.stroke();


        // ==========================
        // MASSA CENTRAL
        // ==========================

        let central =
            Math.floor(this.params.N / 2);


        let values =
            this.x.map(
                row => row[central]
            );


        if (values.length === 0)
            return;


        // ==========================
        // ESCALA Y
        // ==========================

        let maxAbs =
            Math.max(
                0.1,
                ...values.map(v => Math.abs(v))
            );


        maxAbs *= 1.1;


        // ==========================
        // CURVA
        // ==========================

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;


        ctx.beginPath();


        let lastFrame =
            Math.min(
                this.frame,
                this.time.length - 1
            );


        for (let i = 0; i <= lastFrame; i++) {

            let px =
                marginLeft +
                (
                    this.time[i] /
                    this.time[this.time.length - 1]
                ) *
                width;


            let py =
                marginTop +
                height / 2 -
                (
                    values[i] /
                    maxAbs
                ) *
                (height / 2);


            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }


        ctx.stroke();


        // ==========================
        // LINHA CENTRAL y = 0
        // ==========================

        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(
            marginLeft,
            marginTop + height / 2
        );

        ctx.lineTo(
            canvas.width - marginRight,
            marginTop + height / 2
        );

        ctx.stroke();


        // ==========================
        // LABEL EIXO X
        // ==========================

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "t (s)",
            canvas.width / 2,
            canvas.height - 10
        );


        // ==========================
        // LABEL EIXO Y
        // ==========================

        ctx.save();

        ctx.translate(
            15,
            canvas.height / 2
        );

        ctx.rotate(-Math.PI / 2);

        ctx.fillText(
            "x (m)",
            0,
            0
        );

        ctx.restore();
    }


    // ==========================
    // ANIMAÇÃO
    // ==========================

    draw() {

        this.drawChain();
        this.drawPlot();
    }


    iniciar() {

        if (this.running)
            return;


        this.running = true;


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


            requestAnimationFrame(loop);
        };


        loop();
    }


    parar() {

        this.running = false;
    }


    // ==========================
    // ATUALIZAR PARÂMETROS
    // ==========================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };


        this.solve();
    }
}
