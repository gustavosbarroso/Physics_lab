class SimplePendulum {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {
            g: 9.81,
            L: 1.0,

            // Ângulos em RADIANOS
            theta0: 1.0,
            omega0: 0.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.theta = [];
        this.omega = [];

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 1000;

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;
        this.animationSpeed = 1.0;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.pivotX = 300;
        this.pivotY = 180;

        this.pendulumLength = 260;
        this.bobRadius = 18;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // DESENHO INICIAL
        // =====================================================

        this.draw();

        // =====================================================
        // INICIA ANIMAÇÃO
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const theta = state[0];
        const omega = state[1];

        const g = this.params.g;
        const L = this.params.L;

        return [
            omega,
            -(g / L) * Math.sin(theta)
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
            this.params.theta0,
            this.params.omega0
        ];

        this.time = [];
        this.theta = [];
        this.omega = [];

        for (let n = 0; n <= N; n++) {

            const t = a + n * h;

            this.time.push(t);
            this.theta.push(state[0]);
            this.omega.push(state[1]);

            if (n === N) {
                break;
            }

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
                    t + h / 2
                ),
                h
            );

            const k3 = this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(k2, 0.5)
                    ),
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
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;
    }


    // =========================================================
    // PERÍODO
    // =========================================================

    periodSmallAngle() {

        return 2 * Math.PI *
            Math.sqrt(
                this.params.L / this.params.g
            );
    }


    // =========================================================
    // FREQUÊNCIA NATURAL
    // =========================================================

    naturalFrequency() {

        return Math.sqrt(
            this.params.g / this.params.L
        );
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const container =
            document.getElementById("pendulum-controls");

        if (!container) {
            console.error(
                "Elemento #pendulum-controls não encontrado."
            );
            return;
        }

        container.innerHTML = "";

        const title =
            document.createElement("h2");

        title.innerText =
            "Parâmetros do pêndulo";

        container.appendChild(title);

        this.sliders = {};

        const configs = [

            {
                name: "g",
                label: "g (m/s²)",
                min: 1,
                max: 20,
                step: 0.01
            },

            {
                name: "L",
                label: "L (m)",
                min: 0.2,
                max: 5,
                step: 0.01
            },

            {
                name: "theta0",
                label: "θ₀ (rad)",
                min: -Math.PI,
                max: Math.PI,
                step: 0.01
            },

            {
                name: "omega0",
                label: "ω₀ (rad/s)",
                min: -10,
                max: 10,
                step: 0.01
            }
        ];


        configs.forEach(config => {

            const row =
                document.createElement("div");

            row.className =
                "control-row";


            const label =
                document.createElement("label");

            label.className =
                "control-label";

            label.innerText =
                config.label;


            const slider =
                document.createElement("input");

            slider.type = "range";

            slider.min = config.min;
            slider.max = config.max;
            slider.step = config.step;

            slider.value =
                this.params[config.name];

            slider.className =
                "control-slider";


            const value =
                document.createElement("span");

            value.className =
                "control-value";

            value.innerText =
                Number(
                    this.params[config.name]
                ).toFixed(2);


            slider.addEventListener(
                "input",
                () => {

                    const v =
                        Number(slider.value);

                    this.params[config.name] =
                        v;

                    value.innerText =
                        v.toFixed(2);

                    this.solve();

                    this.draw();
                }
            );


            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(value);

            container.appendChild(row);

            this.sliders[config.name] =
                slider;
        });
    }


    // =========================================================
    // DESENHO DO PÊNDULO
    // =========================================================

    drawPendulum(ctx) {

        const index = Math.min(
            Math.floor(this.frame),
            this.theta.length - 1
        );

        const theta =
            this.theta[index] || 0;

        const px = this.pivotX;
        const py = this.pivotY;

        const L =
            this.pendulumLength;

        const bx =
            px + L * Math.sin(theta);

        const by =
            py + L * Math.cos(theta);


        ctx.save();


        // =====================================================
        // TETO
        // =====================================================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            px - 100,
            py
        );

        ctx.lineTo(
            px + 100,
            py
        );

        ctx.stroke();


        // =====================================================
        // HACHURAS
        // =====================================================

        ctx.lineWidth = 2;

        for (
            let x = px - 90;
            x <= px + 90;
            x += 15
        ) {

            ctx.beginPath();

            ctx.moveTo(x, py);

            ctx.lineTo(
                x - 10,
                py + 10
            );

            ctx.stroke();
        }


        // =====================================================
        // EIXO VERTICAL
        // =====================================================

        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;

        ctx.setLineDash([6, 6]);

        ctx.beginPath();

        ctx.moveTo(px, py);

        ctx.lineTo(
            px,
            py + L
        );

        ctx.stroke();

        ctx.setLineDash([]);


        // =====================================================
        // CORDA
        // =====================================================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(px, py);

        ctx.lineTo(bx, by);

        ctx.stroke();


        // =====================================================
        // PIVÔ
        // =====================================================

        ctx.fillStyle = "#333333";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // =====================================================
        // MASSA
        // =====================================================

        ctx.fillStyle = "#1976d2";
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            bx,
            by,
            this.bobRadius,
            0,
            2 * Math.PI
        );

        ctx.fill();

        ctx.stroke();


        // =====================================================
        // COMPRIMENTO
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";

        const midX =
            (px + bx) / 2;

        const midY =
            (py + by) / 2;

        ctx.fillText(
            `L = ${this.params.L.toFixed(2)} m`,
            midX + 12,
            midY
        );


        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p = this.params;

        const index = Math.min(
            Math.floor(this.frame),
            this.theta.length - 1
        );

        const theta =
            this.theta[index] || 0;

        const omega =
            this.omega[index] || 0;

        const t =
            this.time[index] || 0;


        const x = 15;
        const y = 15;

        const width = 280;
        const height = 125;


        ctx.save();


        ctx.fillStyle =
            "rgba(255,255,255,0.94)";

        ctx.strokeStyle =
            "#777777";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            width,
            height,
            7
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = "black";

        ctx.font =
            "bold 12px Arial";

        ctx.fillText(
            "Pêndulo simples",
            x + 10,
            y + 17
        );


        ctx.font =
            "10px Arial";


        ctx.fillText(
            `g = ${p.g.toFixed(2)} m/s²`,
            x + 10,
            y + 38
        );

        ctx.fillText(
            `L = ${p.L.toFixed(2)} m`,
            x + 10,
            y + 54
        );

        ctx.fillText(
            `θ₀ = ${p.theta0.toFixed(2)} rad`,
            x + 10,
            y + 70
        );

        ctx.fillText(
            `ω₀ = ${p.omega0.toFixed(2)} rad/s`,
            x + 10,
            y + 86
        );


        const col2 =
            x + 145;


        ctx.fillText(
            `θ(t) = ${theta.toFixed(2)} rad`,
            col2,
            y + 38
        );

        ctx.fillText(
            `ω(t) = ${omega.toFixed(2)} rad/s`,
            col2,
            y + 54
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            col2,
            y + 70
        );

        ctx.fillText(
            `ωₙ = ${this.naturalFrequency().toFixed(3)} rad/s`,
            col2,
            y + 86
        );

        ctx.fillText(
            `T ≈ ${this.periodSmallAngle().toFixed(3)} s`,
            col2,
            y + 102
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 700;
        const graphY = 70;

        const graphW =
            this.canvas.width -
            graphX -
            40;

        const graphH = 400;


        ctx.save();


        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle = "black";

        ctx.textAlign = "left";

        ctx.fillText(
            "Resposta do pêndulo",
            graphX + 100,
            graphY - 20
        );


        ctx.strokeStyle = "#777";

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );


        const n = Math.min(
            Math.floor(this.frame) + 1,
            this.time.length
        );

        if (n < 2) {

            ctx.restore();

            return;
        }


        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs = 0;

        for (
            let k = 0;
            k < n;
            k++
        ) {

            maxAbs = Math.max(
                maxAbs,
                Math.abs(this.theta[k]),
                Math.abs(this.omega[k])
            );
        }

        if (maxAbs < 0.001)
            maxAbs = 1;

        maxAbs *= 1.15;


        const centerY =
            graphY +
            graphH / 2;


        // =====================================================
        // GRID
        // =====================================================

        const ticks = 6;

        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "right";


        for (
            let k = -ticks;
            k <= ticks;
            k++
        ) {

            const value =
                maxAbs * k / ticks;

            const y =
                centerY -
                (value / maxAbs) *
                (graphH / 2);


            ctx.strokeStyle =
                k === 0
                    ? "#999"
                    : "#eeeeee";

            ctx.beginPath();

            ctx.moveTo(
                graphX,
                y
            );

            ctx.lineTo(
                graphX + graphW,
                y
            );

            ctx.stroke();


            ctx.fillStyle =
                "black";

            ctx.fillText(
                value.toFixed(2),
                graphX - 8,
                y + 4
            );
        }


        // =====================================================
        // EIXO X
        // =====================================================

        const xTicks = 5;

        ctx.textAlign = "center";

        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const t =
                this.tf * k / xTicks;

            const x =
                graphX +
                graphW * k / xTicks;


            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                x,
                graphY + graphH
            );

            ctx.lineTo(
                x,
                graphY + graphH + 5
            );

            ctx.stroke();


            ctx.fillStyle =
                "black";

            ctx.fillText(
                t.toFixed(1),
                x,
                graphY + graphH + 20
            );
        }


        ctx.font =
            "14px Arial";


        ctx.fillText(
            "t [s]",
            graphX + graphW / 2,
            graphY + graphH + 45
        );


        // =====================================================
        // CONVERSÕES
        // =====================================================

        const convertX = t =>
            graphX +
            (t / this.tf) *
            graphW;


        const convertY = value =>
            centerY -
            (value / maxAbs) *
            (graphH / 2);


        // =====================================================
        // THETA
        // =====================================================

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#1976d2";

        ctx.beginPath();

        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(this.time[k]);

            const y =
                convertY(this.theta[k]);

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // OMEGA
        // =====================================================

        ctx.strokeStyle = "#f57c00";

        ctx.beginPath();

        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(this.time[k]);

            const y =
                convertY(this.omega[k]);

            if (k === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "θ(t) [rad]",
            graphX + graphW - 90,
            graphY + 25
        );


        ctx.fillStyle =
            "#f57c00";

        ctx.fillText(
            "ω(t) [rad/s]",
            graphX + graphW - 105,
            graphY + 45
        );


        ctx.restore();
    }


    // =========================================================
    // DRAW
    // =========================================================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle = "white";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.drawPendulum(ctx);
        this.drawHUD(ctx);
        this.drawGraph(ctx);
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


            this.frame +=
                this.animationSpeed;


            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;
            }


            this.draw();


            requestAnimationFrame(loop);
        };


        requestAnimationFrame(loop);
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


        Object.keys(newParams).forEach(key => {

            if (this.sliders[key]) {

                this.sliders[key].value =
                    newParams[key];
            }
        });


        this.solve();
        this.draw();
    }
}
