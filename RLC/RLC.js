class RLCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            R: 2.0,
            L: 1.0,
            C: 1.0,

            q0: 0.0,
            i0: 0.0,

            V0: 5.0,
            omega: 2.0,

            ...options
        };

        // ==========================
        // SOLUÇÃO NUMÉRICA
        // ==========================

        this.time = [];
        this.q = [];
        this.current = [];

        this.N = 500;
        this.t0 = 0;
        this.tf = 20;

        // ==========================
        // ANIMAÇÃO
        // ==========================

        this.running = false;
        this.frame = 0;

        // ==========================
        // CIRCUITO
        // ==========================

        this.circuit = {
            x0: 130,
            x1: 630,
            y0: 180,
            y1: 430
        };

        this.electronCount = 24;
        this.electronPositions = [];

        // ==========================
        // SOLVER
        // ==========================

        this.solve();

        // ==========================
        // CONTROLES
        // ==========================

        this.createControls();

        // ==========================
        // PRIMEIRO DESENHO
        // ==========================

        this.draw();

        // ==========================
        // ANIMAÇÃO
        // ==========================

        this.iniciar();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const q = state[0];
        const i = state[1];

        const p = this.params;

        const Vt =
            p.V0 *
            Math.cos(p.omega * t);

        return [
            i,

            (Vt / p.L)
            -
            (p.R / p.L) * i
            -
            (1 / (p.L * p.C)) * q
        ];
    }


    // =========================================================
    // OPERAÇÕES VETORIAIS
    // =========================================================

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


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a = this.t0;
        const b = this.tf;
        const N = this.N;

        const h = (b - a) / N;

        let state = [
            this.params.q0,
            this.params.i0
        ];

        this.time = [];
        this.q = [];
        this.current = [];

        for (let n = 0; n <= N; n++) {

            const t = a + n*h;

            this.time.push(t);
            this.q.push(state[0]);
            this.current.push(state[1]);

            if (n === N)
                break;

            const k1 =
                this.mul(
                    this.f(state, t),
                    h
                );

            const k2 =
                this.mul(
                    this.f(
                        this.add(
                            state,
                            this.mul(k1, 0.5)
                        ),
                        t + h/2
                    ),
                    h
                );

            const k3 =
                this.mul(
                    this.f(
                        this.add(
                            state,
                            this.mul(k2, 0.5)
                        ),
                        t + h/2
                    ),
                    h
                );

            const k4 =
                this.mul(
                    this.f(
                        this.add(state, k3),
                        t + h
                    ),
                    h
                );

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
                        1/6
                    )
                );
        }
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;

        this.resetElectrons();
    }


    // =========================================================
    // CLASSIFICAÇÃO DO REGIME
    // =========================================================

    regime() {

        const R = this.params.R;
        const L = this.params.L;
        const C = this.params.C;

        const omega0 =
            1 / Math.sqrt(L * C);

        const gamma =
            R / (2 * L);

        if (Math.abs(gamma - omega0) < 1e-3)
            return "Criticamente amortecido";

        if (gamma > omega0)
            return "Superamortecido";

        return "Subamortecido";
    }


    // =========================================================
    // CONTROLES HTML
    // =========================================================

    createControls() {

        const container =
            document.getElementById("controls");

        if (!container)
            return;

        container.innerHTML = "";

        this.sliders = {};

        const configs = [

            {
                key: "R",
                label: "R (Ω)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                key: "L",
                label: "L (H)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                key: "C",
                label: "C (F)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                key: "V0",
                label: "V₀ (V)",
                min: 0,
                max: 10,
                step: 0.1
            },

            {
                key: "omega",
                label: "ω (rad/s)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                key: "q0",
                label: "q₀ (C)",
                min: -20,
                max: 20,
                step: 0.1
            },

            {
                key: "i0",
                label: "i₀ (A)",
                min: -20,
                max: 20,
                step: 0.1
            }
        ];


        configs.forEach(config => {

            const row =
                document.createElement("div");

            row.className = "slider-row";


            const label =
                document.createElement("span");

            label.className = "slider-label";

            label.textContent =
                config.label;


            const slider =
                document.createElement("input");

            slider.type = "range";

            slider.min = config.min;
            slider.max = config.max;
            slider.step = config.step;

            slider.value =
                this.params[config.key];

            slider.className =
                "rlc-slider";


            const value =
                document.createElement("span");

            value.className =
                "slider-value";

            value.textContent =
                Number(
                    this.params[config.key]
                ).toFixed(2);


            slider.addEventListener(
                "input",
                () => {

                    this.params[config.key] =
                        Number(slider.value);

                    value.textContent =
                        Number(slider.value)
                        .toFixed(2);

                    this.solve();

                }
            );


            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(value);

            container.appendChild(row);


            this.sliders[config.key] =
                slider;
        });
    }


    // =========================================================
    // GEOMETRIA DO CIRCUITO
    // =========================================================

    getCircuitPath() {

        const c = this.circuit;

        const points = [];

        // ramo esquerdo
        for (let y = c.y0; y <= c.y1; y += 3)
            points.push([c.x0, y]);

        // ramo inferior
        for (
            let x = c.x0;
            x <= c.x1;
            x += 3
        )
            points.push([x, c.y1]);

        // ramo direito
        for (
            let y = c.y1;
            y >= c.y0;
            y -= 3
        )
            points.push([c.x1, y]);

        // ramo superior
        for (
            let x = c.x1;
            x >= c.x0;
            x -= 3
        )
            points.push([x, c.y0]);

        return points;
    }


    resetElectrons() {

        const path =
            this.getCircuitPath();

        this.electronPositions = [];

        for (
            let k = 0;
            k < this.electronCount;
            k++
        ) {

            this.electronPositions.push(
                k * path.length /
                this.electronCount
            );
        }
    }


    // =========================================================
    // DESENHO
    // =========================================================

    draw() {

        const ctx = this.ctx;

        const W = this.canvas.width;
        const H = this.canvas.height;

        ctx.clearRect(
            0,
            0,
            W,
            H
        );

        // fundo
        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        this.drawCircuit();

        this.drawGraph();

        this.drawHUD();

        this.drawElectrons();
    }


    // =========================================================
    // CIRCUITO
    // =========================================================

    drawCircuit() {

        const ctx = this.ctx;
        const c = this.circuit;

        ctx.save();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#111";

        // --------------------------
        // FIOS
        // --------------------------

        ctx.beginPath();

        // esquerda
        ctx.moveTo(
            c.x0,
            c.y0
        );

        ctx.lineTo(
            c.x0,
            c.y1
        );

        // inferior
        ctx.lineTo(
            c.x1,
            c.y1
        );

        // direita
        ctx.lineTo(
            c.x1,
            c.y0
        );

        ctx.stroke();


        // --------------------------
        // INDUTOR
        // --------------------------

        const xL0 = 300;
        const xL1 = 460;

        // apagar trecho do fio
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.moveTo(
            xL0,
            c.y0
        );

        ctx.lineTo(
            xL1,
            c.y0
        );

        ctx.stroke();


        ctx.strokeStyle = "#111";
        ctx.lineWidth = 3;

        ctx.beginPath();

        const coils = 6;

        const amplitude = 18;

        const points = 120;

        for (
            let k = 0;
            k <= points;
            k++
        ) {

            const u =
                k / points;

            const x =
                xL0 +
                (xL1 - xL0) * u;

            const y =
                c.y0 +
                amplitude *
                Math.sin(
                    u *
                    coils *
                    2 *
                    Math.PI
                );

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle =
            "#111";

        ctx.textAlign = "center";

        ctx.fillText(
            "L",
            (xL0 + xL1) / 2,
            c.y0 - 30
        );


        // --------------------------
        // RESISTOR
        // --------------------------

        const xR0 = 300;
        const xR1 = 460;

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.moveTo(
            xR0,
            c.y1
        );

        ctx.lineTo(
            xR1,
            c.y1
        );

        ctx.stroke();


        ctx.strokeStyle = "#111";
        ctx.lineWidth = 3;

        ctx.beginPath();

        const resistorPoints = 8;

        for (
            let k = 0;
            k <= resistorPoints;
            k++
        ) {

            const u =
                k / resistorPoints;

            const x =
                xR0 +
                (xR1 - xR0) * u;

            let y = c.y1;

            if (
                k !== 0 &&
                k !== resistorPoints
            ) {

                y +=
                    (k % 2 === 0)
                    ? -16
                    : 16;
            }

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.fillText(
            "R",
            (xR0 + xR1) / 2,
            c.y1 + 38
        );


        // --------------------------
        // CAPACITOR
        // --------------------------

        const yc0 = 285;
        const yc1 = 345;

        // apagar fio
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 9;

        ctx.beginPath();

        ctx.moveTo(
            c.x1,
            yc0
        );

        ctx.lineTo(
            c.x1,
            yc1
        );

        ctx.stroke();


        // placas horizontais
        // perpendiculares ao fio vertical

        ctx.strokeStyle = "#111";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            c.x1 - 25,
            yc0
        );

        ctx.lineTo(
            c.x1 + 25,
            yc0
        );

        ctx.moveTo(
            c.x1 - 25,
            yc1
        );

        ctx.lineTo(
            c.x1 + 25,
            yc1
        );

        ctx.stroke();


        ctx.font =
            "bold 18px Arial";

        ctx.textAlign = "left";

        ctx.fillText(
            "C",
            c.x1 + 35,
            (yc0 + yc1) / 2 + 6
        );


        // --------------------------
        // FONTE AC
        // --------------------------

        const xc = c.x0;
        const yc = (c.y0 + c.y1) / 2;

        // apagar trecho
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 9;

        ctx.beginPath();

        ctx.moveTo(
            xc,
            yc - 40
        );

        ctx.lineTo(
            xc,
            yc + 40
        );

        ctx.stroke();


        // círculo
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            xc,
            yc,
            35,
            0,
            2*Math.PI
        );

        ctx.stroke();


        // seno
        ctx.beginPath();

        for (
            let k = 0;
            k <= 80;
            k++
        ) {

            const u =
                k / 80;

            const x =
                xc - 25 +
                50*u;

            const y =
                yc +
                14 *
                Math.sin(
                    u * 2*Math.PI
                );

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.textAlign = "center";

        ctx.font =
            "bold 16px Arial";

        ctx.fillText(
            "AC",
            xc,
            yc + 60
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph() {

        const ctx = this.ctx;

        const x0 = 720;
        const y0 = 100;

        const width = 470;
        const height = 300;

        // --------------------------
        // fundo
        // --------------------------

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            x0,
            y0,
            width,
            height
        );


        ctx.strokeStyle = "#222";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            x0,
            y0,
            width,
            height
        );


        // --------------------------
        // título
        // --------------------------

        ctx.fillStyle = "#111";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Resposta do circuito",
            x0 + width/2,
            y0 - 15
        );


        if (this.time.length < 2)
            return;


        const frame =
            Math.min(
                this.frame,
                this.time.length - 1
            );


        let maxValue = 1;

        for (
            let k = 0;
            k <= frame;
            k++
        ) {

            maxValue =
                Math.max(
                    maxValue,
                    Math.abs(this.q[k]),
                    Math.abs(this.current[k])
                );
        }


        const mapX = t =>
            x0 +
            (t / this.tf) *
            width;


        const mapY = value =>
            y0 +
            height/2 -
            (value / maxValue) *
            height *
            0.42;


        // eixo x
        ctx.strokeStyle = "#aaa";

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0 + height/2
        );

        ctx.lineTo(
            x0 + width,
            y0 + height/2
        );

        ctx.stroke();


        // q(t)
        ctx.strokeStyle = "#1565c0";
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (
            let k = 0;
            k <= frame;
            k++
        ) {

            const x =
                mapX(this.time[k]);

            const y =
                mapY(this.q[k]);

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // i(t)
        ctx.strokeStyle = "#e65100";

        ctx.beginPath();

        for (
            let k = 0;
            k <= frame;
            k++
        ) {

            const x =
                mapX(this.time[k]);

            const y =
                mapY(this.current[k]);

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // legenda

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#1565c0";

        ctx.fillText(
            "q(t)",
            x0 + width - 80,
            y0 + 25
        );

        ctx.fillStyle =
            "#e65100";

        ctx.fillText(
            "i(t)",
            x0 + width - 80,
            y0 + 45
        );


        // eixos

        ctx.fillStyle = "#333";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            "0",
            x0 - 15,
            y0 + height/2 + 4
        );

        ctx.fillText(
            "t [s]",
            x0 + width/2,
            y0 + height + 25
        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD() {

        const ctx = this.ctx;

        const x = 25;
        const y = 90;

        ctx.fillStyle =
            "rgba(255,255,255,0.92)";

        ctx.strokeStyle =
            "#333";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            260,
            275,
            8
        );

        ctx.fill();
        ctx.stroke();


        const frame =
            Math.min(
                this.frame,
                this.q.length - 1
            );


        const q =
            this.q[frame] ?? 0;

        const i =
            this.current[frame] ?? 0;

        const t =
            this.time[frame] ?? 0;


        ctx.fillStyle =
            "#111";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "left";


        const p = this.params;

        const lines = [

            `R = ${p.R.toFixed(2)} Ω`,

            `L = ${p.L.toFixed(2)} H`,

            `C = ${p.C.toFixed(2)} F`,

            "",

            `Regime: ${this.regime()}`,

            "",

            `q₀ = ${p.q0.toFixed(2)} C`,

            `i₀ = ${p.i0.toFixed(2)} A`,

            "",

            `q = ${q.toFixed(2)} C`,

            `i = ${i.toFixed(2)} A`,

            `t = ${t.toFixed(2)} s`
        ];


        lines.forEach(
            (text, k) => {

                ctx.fillText(
                    text,
                    x + 15,
                    y + 25 + k*20
                );
            }
        );
    }


    // =========================================================
    // ELÉTRONS
    // =========================================================

    drawElectrons() {

        const ctx = this.ctx;

        const path =
            this.getCircuitPath();

        if (!path.length)
            return;


        const frame =
            Math.min(
                this.frame,
                this.current.length - 1
            );


        const current =
            this.current[frame] ?? 0;


        // velocidade visual
        const speed =
            current * 2.0;


        this.electronPositions =
            this.electronPositions.map(
                position => {

                    return (
                        position + speed
                    ) % path.length;
                }
            );


        ctx.fillStyle =
            "#1565c0";


        this.electronPositions.forEach(
            position => {

                let p =
                    Math.floor(position);

                if (p < 0)
                    p += path.length;

                const point =
                    path[p];

                ctx.beginPath();

                ctx.arc(
                    point[0],
                    point[1],
                    4,
                    0,
                    2*Math.PI
                );

                ctx.fill();
            }
        );
    }


    // =========================================================
    // ANIMAÇÃO
    // =========================================================

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

                this.resetElectrons();
            }

            requestAnimationFrame(loop);
        };

        loop();
    }


    // =========================================================
    // PARAR
    // =========================================================

    parar() {

        this.running = false;
    }


    // =========================================================
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };

        this.solve();
    }
}
