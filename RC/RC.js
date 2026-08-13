class RCCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            R: 2.0,
            C: 1.0,
            q0: 1.0,
            ...options
        };

        this.time = [];
        this.q = [];
        this.current = [];

        this.numElectrons = 40;
        this.electronPos = [];

        this.frame = 0;
        this.running = false;

        this.solve();
        this.resetElectrons();
    }


    // ==========================
    // SISTEMA RC
    // ==========================

    f(state, t) {

        const q = state[0];

        const R = this.params.R;
        const C = this.params.C;

        const dqdt = -(1 / (R * C)) * q;

        return [dqdt];
    }


    // ==========================
    // RK4
    // ==========================

    RK4() {

        const a = 0;
        const b = 10;
        const N = 500;

        const h = (b - a) / N;

        let state = [this.params.q0];

        this.time = [];
        this.q = [];
        this.current = [];

        for (let n = 0; n <= N; n++) {

            const t = a + n * h;

            this.time.push(t);
            this.q.push(state[0]);

            if (n === N)
                break;

            const k1 = this.mul(
                this.f(state, t),
                h
            );

            const k2 = this.mul(
                this.f(
                    this.add(state, this.mul(k1, 0.5)),
                    t + h / 2
                ),
                h
            );

            const k3 = this.mul(
                this.f(
                    this.add(state, this.mul(k2, 0.5)),
                    t + h / 2
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
                    1 / 6
                )
            );
        }

        const R = this.params.R;
        const C = this.params.C;

        this.current = this.q.map(
            q => -(1 / (R * C)) * q
        );
    }


    add(a, b) {

        return [
            a[0] + b[0]
        ];
    }


    mul(a, x) {

        return [
            a[0] * x
        ];
    }


    add4(a, b, c, d) {

        return [
            a[0] +
            2 * b[0] +
            2 * c[0] +
            d[0]
        ];
    }


    solve() {

        this.RK4();
    }


    // ==========================
    // ELÉTRONS
    // ==========================

    resetElectrons() {

        this.electronPos = [];

        for (let i = 0; i < this.numElectrons; i++) {

            this.electronPos.push(
                i / this.numElectrons
            );
        }
    }


    loopPath(s) {

        const x0 = 70;
        const x1 = 380;

        const y0 = 120;
        const y1 = 320;

        if (s < 0.25) {

            return [
                x0 + (x1 - x0) * (s / 0.25),
                y0
            ];

        } else if (s < 0.5) {

            return [
                x1,
                y0 + (y1 - y0) * ((s - 0.25) / 0.25)
            ];

        } else if (s < 0.75) {

            return [
                x1 - (x1 - x0) * ((s - 0.5) / 0.25),
                y1
            ];

        } else {

            return [
                x0,
                y1 - (y1 - y0) * ((s - 0.75) / 0.25)
            ];
        }
    }


    // ==========================
    // CIRCUITO
    // ==========================

    drawCircuit() {

        const ctx = this.ctx;

        const x0 = 70;
        const x1 = 380;

        const y0 = 120;
        const y1 = 320;

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.lineWidth = 2;


        // fios

        ctx.beginPath();

        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x0, y1);
        ctx.closePath();

        ctx.stroke();


        // resistor

        ctx.beginPath();

        const xr = [
            170, 195, 220, 245,
            270, 295, 320
        ];

        for (let i = 0; i < xr.length; i++) {

            const y =
                y0 + (i % 2 ? 12 : -12);

            if (i === 0)
                ctx.moveTo(xr[i], y);
            else
                ctx.lineTo(xr[i], y);
        }

        ctx.stroke();

        ctx.font = "16px Arial";
        ctx.fillText("R", 245, 90);


        // capacitor

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(x1 - 25, 205);
        ctx.lineTo(x1 + 25, 205);

        ctx.moveTo(x1 - 25, 245);
        ctx.lineTo(x1 + 25, 245);

        ctx.stroke();

        ctx.font = "16px Arial";
        ctx.fillText("C", x1 + 35, 230);


        // elétrons

        ctx.fillStyle = "red";

        for (const s of this.electronPos) {

            const [x, y] = this.loopPath(s);

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                2 * Math.PI
            );

            ctx.fill();
        }


        ctx.fillStyle = "black";

        ctx.font = "18px Arial";

        ctx.fillText(
            "Circuito RC com elétrons",
            120,
            45
        );
    }


    // ==========================
    // GRÁFICO
    // ==========================

    drawGraph() {

        const ctx = this.ctx;

        const x0 = 500;
        const y0 = 70;

        const width = 350;
        const height = 280;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;


        // eixos

        ctx.beginPath();

        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y0 + height);
        ctx.lineTo(x0 + width, y0 + height);

        ctx.stroke();


        ctx.fillStyle = "black";
        ctx.font = "18px Arial";

        ctx.fillText(
            "Carga e corrente (RC)",
            x0 + 70,
            y0 - 20
        );


        ctx.font = "13px Arial";

        ctx.fillText(
            "t (s)",
            x0 + width - 20,
            y0 + height + 25
        );


        if (this.frame < 1)
            return;


        const frame = Math.min(
            this.frame,
            this.time.length - 1
        );


        const values = [
            ...this.q,
            ...this.current
        ];

        let ymin = Math.min(...values);
        let ymax = Math.max(...values);

        if (Math.abs(ymax - ymin) < 1e-10) {

            ymin -= 1;
            ymax += 1;
        }

        const margin = 0.2 * (ymax - ymin);

        ymin -= margin;
        ymax += margin;


        // q(t)

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (let i = 0; i <= frame; i++) {

            const px =
                x0 +
                (this.time[i] / 10) * width;

            const py =
                y0 +
                height -
                ((this.q[i] - ymin) /
                (ymax - ymin)) * height;

            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }

        ctx.stroke();


        // i(t)

        ctx.strokeStyle = "red";

        ctx.beginPath();

        for (let i = 0; i <= frame; i++) {

            const px =
                x0 +
                (this.time[i] / 10) * width;

            const py =
                y0 +
                height -
                ((this.current[i] - ymin) /
                (ymax - ymin)) * height;

            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }

        ctx.stroke();


        ctx.fillStyle = "blue";
        ctx.fillText("q(t)", x0 + width - 50, y0 + 20);

        ctx.fillStyle = "red";
        ctx.fillText("i(t)", x0 + width - 50, y0 + 40);
    }


    // ==========================
    // INFORMAÇÕES
    // ==========================

    drawInfo() {

        const ctx = this.ctx;

        const frame = Math.min(
            this.frame,
            this.q.length - 1
        );

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";

        ctx.fillText(
            `R = ${this.params.R.toFixed(2)} Ω`,
            40,
            390
        );

        ctx.fillText(
            `C = ${this.params.C.toFixed(2)} F`,
            180,
            390
        );

        ctx.fillText(
            `q = ${this.q[frame].toFixed(3)} C`,
            320,
            390
        );

        ctx.fillText(
            `i = ${this.current[frame].toFixed(3)} A`,
            470,
            390
        );

        ctx.fillText(
            `t = ${this.time[frame].toFixed(2)} s`,
            630,
            390
        );
    }


    // ==========================
    // DESENHO
    // ==========================

    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawCircuit();
        this.drawGraph();
        this.drawInfo();
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

            if (this.frame >= this.time.length)
                this.frame = 0;


            const i =
                this.current[this.frame];

            const speed = 0.02 * i;


            for (let j = 0; j < this.electronPos.length; j++) {

                this.electronPos[j] =
                    (this.electronPos[j] + speed) % 1;

                if (this.electronPos[j] < 0)
                    this.electronPos[j] += 1;
            }


            this.draw();

            this.frame++;

            requestAnimationFrame(loop);
        };

        loop();
    }


    parar() {

        this.running = false;
    }


    // ==========================
    // PARÂMETROS
    // ==========================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };

        this.solve();

        this.frame = 0;

        this.resetElectrons();

        this.draw();
    }
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

const canvas = document.getElementById("canvas");

const circuito = new RCCircuit(canvas, {
    R: 2.0,
    C: 1.0,
    q0: 1.0
});


// sliders

const sliderR = document.getElementById("sliderR");
const sliderC = document.getElementById("sliderC");
const sliderQ0 = document.getElementById("sliderQ0");

const valueR = document.getElementById("valueR");
const valueC = document.getElementById("valueC");
const valueQ0 = document.getElementById("valueQ0");


sliderR.addEventListener("input", () => {

    const value = parseFloat(sliderR.value);

    circuito.atualizarParametros({
        R: value
    });

    valueR.textContent = value.toFixed(1);
});


sliderC.addEventListener("input", () => {

    const value = parseFloat(sliderC.value);

    circuito.atualizarParametros({
        C: value
    });

    valueC.textContent = value.toFixed(1);
});


sliderQ0.addEventListener("input", () => {

    const value = parseFloat(sliderQ0.value);

    circuito.atualizarParametros({
        q0: value
    });

    valueQ0.textContent = value.toFixed(1);
});


circuito.iniciar();
