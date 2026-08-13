class InvertedPendulum {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            g: 9.81,
            m: 1.0,
            M: 2.0,
            l: 1.0,
            A: 0.0,
            w: 2.0,
            theta0: 0.05,

            ...options
        };

        this.time = [];
        this.theta = [];
        this.omega = [];
        this.x = [];
        this.v = [];

        this.xb = [];
        this.yb = [];
        this.xp = [];
        this.yp = [];

        this.running = false;
        this.frame = 0;

        this.solve();
    }


    // ==========================
    // SISTEMA DINÂMICO
    // ==========================

    f(state, t) {

        let theta = state[0];
        let omega = state[1];
        let xpos = state[2];
        let vel = state[3];

        let p = this.params;

        let g = p.g;
        let m = p.m;
        let M = p.M;
        let l = p.l;
        let A = p.A;
        let w = p.w;

        let F = A * Math.cos(w * t);

        /*
         * Sistema:
         *
         * [ l              -cos(theta) ] [ theta'' ] =
         * [ g sin(theta)                ]
         *
         * [ -m l cos(theta)  M + m     ] [ x''     ] =
         * [ F - m l omega² sin(theta)   ]
         */

        let a11 = l;
        let a12 = -Math.cos(theta);

        let a21 = -m * l * Math.cos(theta);
        let a22 = M + m;

        let b1 = g * Math.sin(theta);
        let b2 = F - m * l * omega * omega * Math.sin(theta);

        // Determinante da matriz 2x2
        let det = a11 * a22 - a12 * a21;

        // Solução explícita do sistema linear
        let theta_acc =
            (b1 * a22 - a12 * b2) / det;

        let x_acc =
            (a11 * b2 - b1 * a21) / det;

        return [
            omega,
            theta_acc,
            vel,
            x_acc
        ];
    }


    // ==========================
    // OPERAÇÕES VETORIAIS
    // ==========================

    add(a, b) {

        return [
            a[0] + b[0],
            a[1] + b[1],
            a[2] + b[2],
            a[3] + b[3]
        ];
    }


    mul(a, x) {

        return [
            a[0] * x,
            a[1] * x,
            a[2] * x,
            a[3] * x
        ];
    }


    add4(a, b, c, d) {

        return [
            a[0] + 2*b[0] + 2*c[0] + d[0],
            a[1] + 2*b[1] + 2*c[1] + d[1],
            a[2] + 2*b[2] + 2*c[2] + d[2],
            a[3] + 2*b[3] + 2*c[3] + d[3]
        ];
    }


    // ==========================
    // RK4
    // ==========================

    RK4() {

        let a = 0;
        let b = 10;
        let N = 1500;

        let h = (b - a) / N;

        let state = [
            this.params.theta0,
            0,
            0,
            0
        ];

        this.time = [];
        this.theta = [];
        this.omega = [];
        this.x = [];
        this.v = [];

        for (let i = 0; i <= N; i++) {

            let t = a + i * h;

            this.time.push(t);
            this.theta.push(state[0]);
            this.omega.push(state[1]);
            this.x.push(state[2]);
            this.v.push(state[3]);

            if (i === N)
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
                    this.add4(k1, k2, k3, k4),
                    1 / 6
                )
            );
        }


        // Posições geométricas

        let l = this.params.l;

        this.xb = [...this.x];
        this.yb = this.x.map(() => 0);

        this.xp = this.xb.map(
            (xb, i) =>
                xb + l * Math.sin(this.theta[i])
        );

        this.yp = this.yb.map(
            (yb, i) =>
                yb + 0.3 + l * Math.cos(this.theta[i])
        );
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

        let ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        let w = this.canvas.width;
        let h = this.canvas.height;

        let i = this.frame;

        if (this.time.length === 0)
            return;


        // ==========================
        // ESCALA
        // ==========================

        let scale = 100;

        let centerX = w / 2;
        let groundY = h * 0.72;

        let cartWidth = 60;
        let cartHeight = 30;

        let xCart =
            centerX + this.xb[i] * scale;


        // ==========================
        // CHÃO
        // ==========================

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY);

        ctx.stroke();


        // ==========================
        // CARRINHO
        // ==========================

        ctx.fillStyle = "black";

        ctx.fillRect(
            xCart - cartWidth / 2,
            groundY - cartHeight,
            cartWidth,
            cartHeight
        );


        // ==========================
        // RODAS
        // ==========================

        ctx.fillStyle = "gray";

        ctx.beginPath();

        ctx.arc(
            xCart - 20,
            groundY + 8,
            10,
            0,
            2 * Math.PI
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            xCart + 20,
            groundY + 8,
            10,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ==========================
        // PÊNDULO
        // ==========================

        let pivotX = xCart;

        let pivotY =
            groundY - cartHeight;


        let l = this.params.l;

        let theta = this.theta[i];


        let massX =
            pivotX +
            l * Math.sin(theta) * scale;


        let massY =
            pivotY -
            l * Math.cos(theta) * scale;


        // haste

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            pivotX,
            pivotY
        );

        ctx.lineTo(
            massX,
            massY
        );

        ctx.stroke();


        // massa

        ctx.fillStyle = "blue";

        ctx.beginPath();

        ctx.arc(
            massX,
            massY,
            10,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ==========================
        // INFORMAÇÕES
        // ==========================

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";

        ctx.fillText(
            `t = ${this.time[i].toFixed(2)} s`,
            20,
            25
        );

        ctx.fillText(
            `θ = ${this.theta[i].toFixed(3)} rad`,
            20,
            45
        );

        ctx.fillText(
            `x = ${this.x[i].toFixed(3)} m`,
            20,
            65
        );
    }


    // ==========================
    // ANIMAÇÃO
    // ==========================

    iniciar() {

        if (this.running)
            return;

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
    // ATUALIZAÇÃO
    // ==========================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };


        this.solve();
    }
}
