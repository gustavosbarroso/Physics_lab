class KapitzaPendulum {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            g: 9.81,
            L: 0.5,
            A: 0.3,
            w_drive: 10.0,
            theta0: 0.3,
            omega0: 0.0,

            ...options
        };

        this.time = [];
        this.theta = [];
        this.omega = [];
        this.yPivot = [];

        this.running = false;
        this.frame = 0;

        this.solve();
    }


    // ==========================
    // SISTEMA DIFERENCIAL
    // ==========================

    f(state, t) {

        const theta = state[0];
        const omega = state[1];

        const p = this.params;

        const ydd =
            -p.A *
            p.w_drive ** 2 *
            Math.cos(p.w_drive * t);

        const domega =
            -((p.g + ydd) / p.L) *
            Math.sin(theta);

        return [
            omega,
            domega
        ];
    }


    // ==========================
    // OPERAÇÕES VETORIAIS
    // ==========================

    add(a, b) {

        return [
            a[0] + b[0],
            a[1] + b[1]
        ];
    }


    mul(a, x) {

        return [
            a[0] * x,
            a[1] * x
        ];
    }


    add4(a, b, c, d) {

        return [
            a[0] + 2*b[0] + 2*c[0] + d[0],
            a[1] + 2*b[1] + 2*c[1] + d[1]
        ];
    }


    // ==========================
    // RK4
    // ==========================

    RK4() {

        const a = 0;
        const b = 20;
        const N = 1000;

        const h = (b - a) / N;

        let state = [
            this.params.theta0,
            this.params.omega0
        ];

        this.time = [];
        this.theta = [];
        this.omega = [];
        this.yPivot = [];

        for (let n = 0; n <= N; n++) {

            const t = a + n * h;

            this.time.push(t);
            this.theta.push(state[0]);
            this.omega.push(state[1]);

            this.yPivot.push(
                this.params.A *
                Math.cos(this.params.w_drive * t)
            );

            if (n === N)
                break;


            const k1 = this.mul(
                this.f(state, t),
                h
            );


            const k2 = this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(k1, 0.5)
                    ),
                    t + h/2
                ),
                h
            );


            const k3 = this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(k2, 0.5)
                    ),
                    t + h/2
                ),
                h
            );


            const k4 = this.mul(
                this.f(
                    this.add(state, k3),
                    t + h
                ),
                h
            );


            state = this.add(
                state,
                this.mul(
                    this.add4(k1, k2, k3, k4),
                    1/6
                )
            );
        }
    }


    // ==========================
    // SOLVER
    // ==========================

    solve() {

        this.RK4();
    }


    // ==========================
    // ESCALA
    // ==========================

    updateAxis() {

        const p = this.params;

        const R = p.L + Math.abs(p.A);
        const margin = 1.1;

        this.xMin = -margin * R;
        this.xMax = margin * R;
        this.yMin = -margin * R;
        this.yMax = margin * R;
    }


    // ==========================
    // VISUALIZAÇÃO
    // ==========================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        const width = this.canvas.width;
        const height = this.canvas.height;

        this.updateAxis();


        // Conversão física -> pixels

        const scale =
            Math.min(
                width / (this.xMax - this.xMin),
                height / (this.yMax - this.yMin)
            );

        const toX = x =>
            width / 2 + x * scale;

        const toY = y =>
            height / 2 - y * scale;


        // ==========================
        // PIVÔ
        // ==========================

        const t = this.time[this.frame];

        const yp =
            this.params.A *
            Math.cos(
                this.params.w_drive * t
            );

        const xp = 0;


        // ==========================
        // MASSA
        // ==========================

        const theta =
            this.theta[this.frame];

        const L = this.params.L;

        const xm =
            xp + L * Math.sin(theta);

        const ym =
            yp - L * Math.cos(theta);


        // ==========================
        // HASTE
        // ==========================

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            toX(xp),
            toY(yp)
        );

        ctx.lineTo(
            toX(xm),
            toY(ym)
        );

        ctx.stroke();


        // ==========================
        // PIVÔ
        // ==========================

        ctx.fillStyle = "red";

        ctx.beginPath();

        ctx.arc(
            toX(xp),
            toY(yp),
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ==========================
        // MASSA
        // ==========================

        ctx.fillStyle = "black";

        ctx.beginPath();

        ctx.arc(
            toX(xm),
            toY(ym),
            12,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ==========================
        // TEXTO
        // ==========================

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            20,
            25
        );

        ctx.fillText(
            `θ = ${theta.toFixed(3)} rad`,
            20,
            45
        );

        ctx.fillText(
            `ω = ${this.omega[this.frame].toFixed(3)} rad/s`,
            20,
            65
        );
    }


    // ==========================
    // ANIMAÇÃO
    // ==========================

    iniciar() {

        this.running = true;

        const loop = () => {

            if (!this.running)
                return;

            this.draw();

            this.frame++;

            if (this.frame >= this.time.length)
                this.frame = 0;

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

        this.frame = 0;

        this.solve();

        this.draw();
    }
}
