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

            // Tudo em RADIANOS
            theta0: 1.0,
            omega0: 0.0,

            ...options
        };

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 10;
        this.N = 1000;

        // =====================================================
        // DADOS
        // =====================================================

        this.time = [];
        this.theta = [];
        this.omega = [];

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.frame = 0;
        this.running = false;
        this.animationSpeed = 1;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.pivotX = 300;
        this.pivotY = 220;

        this.visualLength = 220;
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
    // RK4
    // =========================================================

    RK4() {

        const h =
            (this.tf - this.t0) / this.N;

        let state = [

            this.params.theta0,
            this.params.omega0

        ];

        this.time = [];
        this.theta = [];
        this.omega = [];

        for (
            let i = 0;
            i <= this.N;
            i++
        ) {

            const t =
                this.t0 + i * h;

            // -------------------------------------------------
            // SALVA ESTADO
            // -------------------------------------------------

            this.time.push(t);
            this.theta.push(state[0]);
            this.omega.push(state[1]);

            if (i === this.N)
                break;

            // -------------------------------------------------
            // k1
            // -------------------------------------------------

            const k1 =
                this.f(state, t);

            // -------------------------------------------------
            // k2
            // -------------------------------------------------

            const state2 = [

                state[0] +
                0.5 * h * k1[0],

                state[1] +
                0.5 * h * k1[1]

            ];

            const k2 =
                this.f(
                    state2,
                    t + h / 2
                );

            // -------------------------------------------------
            // k3
            // -------------------------------------------------

            const state3 = [

                state[0] +
                0.5 * h * k2[0],

                state[1] +
                0.5 * h * k2[1]

            ];

            const k3 =
                this.f(
                    state3,
                    t + h / 2
                );

            // -------------------------------------------------
            // k4
            // -------------------------------------------------

            const state4 = [

                state[0] +
                h * k3[0],

                state[1] +
                h * k3[1]

            ];

            const k4 =
                this.f(
                    state4,
                    t + h
                );

            // -------------------------------------------------
            // ATUALIZAÇÃO
            // -------------------------------------------------

            state[0] +=
                h *
                (
                    k1[0] +
                    2 * k2[0] +
                    2 * k3[0] +
                    k4[0]
                ) / 6;

            state[1] +=
                h *
                (
                    k1[1] +
                    2 * k2[1] +
                    2 * k3[1] +
                    k4[1]
                ) / 6;
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

        return (

            2 *
            Math.PI *
            Math.sqrt(
                this.params.L /
                this.params.g
            )

        );
    }


    // =========================================================
    // FREQUÊNCIA NATURAL
    // =========================================================

    naturalFrequency() {

        return Math.sqrt(

            this.params.g /
            this.params.L

        );
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const container =
            document.getElementById(
                "pendulum-controls"
            );

        if (!container)
            return;

        container.innerHTML = "";

        const title =
            document.createElement("h2");

        title.textContent =
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

            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.marginBottom = "10px";

            const label =
                document.createElement("label");

            label.textContent =
                config.label;

            label.style.width =
                "110px";

            const slider =
                document.createElement("input");

            slider.type = "range";
            slider.min = config.min;
            slider.max = config.max;
            slider.step = config.step;
            slider.value =
                this.params[config.name];

            slider.style.flex = "1";

            const value =
                document.createElement("span");

            value.style.width = "80px";
            value.style.marginLeft = "10px";

            value.textContent =
                Number(
                    this.params[config.name]
                ).toFixed(2);

            slider.addEventListener(
                "input",
                () => {

                    const v =
                        Number(
                            slider.value
                        );

                    this.params[
                        config.name
                    ] = v;

                    value.textContent =
                        v.toFixed(2);

                    this.solve();

                    this.draw();
                }
            );

            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(value);

            container.appendChild(row);

            this.sliders[
                config.name
            ] = slider;
        });
    }


    // =========================================================
    // DESENHO DO PÊNDULO
    // =========================================================

    drawPendulum(ctx) {

        const index =
            Math.min(
                Math.floor(this.frame),
                this.theta.length - 1
            );

        const theta =
            this.theta[index] || 0;

        const px =
            this.pivotX;

        const py =
            this.pivotY;

        const L =
            this.visualLength;

        // -----------------------------------------------------
        // POSIÇÃO DA MASSA
        // -----------------------------------------------------

        const bx =
            px +
            L *
            Math.sin(theta);

        const by =
            py +
            L *
            Math.cos(theta);

        // -----------------------------------------------------
        // TETO
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // HACHURAS
        // -----------------------------------------------------

        ctx.lineWidth = 2;

        for (
            let x = px - 90;
            x <= px + 90;
            x += 15
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                py
            );

            ctx.lineTo(
                x - 10,
                py + 10
            );

            ctx.stroke();
        }

        // -----------------------------------------------------
        // VERTICAL DE REFERÊNCIA
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#aaaaaa";

        ctx.lineWidth = 1;

        ctx.setLineDash([
            6,
            6
        ]);

        ctx.beginPath();

        ctx.moveTo(
            px,
            py
        );

        ctx.lineTo(
            px,
            py + L
        );

        ctx.stroke();

        ctx.setLineDash([]);

        // -----------------------------------------------------
        // CORDA
        // -----------------------------------------------------

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            px,
            py
        );

        ctx.lineTo(
            bx,
            by
        );

        ctx.stroke();

        // -----------------------------------------------------
        // PIVÔ
        // -----------------------------------------------------

        ctx.fillStyle =
            "#333333";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();

        // -----------------------------------------------------
        // MASSA
        // -----------------------------------------------------

        ctx.fillStyle =
            "#1976d2";

        ctx.strokeStyle =
            "#111111";

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

        // -----------------------------------------------------
        // COMPRIMENTO
        // -----------------------------------------------------

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const midX =
            (px + bx) / 2;

        const midY =
            (py + by) / 2;

        ctx.fillText(

            `L = ${this.params.L.toFixed(2)} m`,

            midX + 12,
            midY

        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const index =
            Math.min(
                Math.floor(this.frame),
                this.theta.length - 1
            );

        const theta =
            this.theta[index] || 0;

        const omega =
            this.omega[index] || 0;

        const t =
            this.time[index] || 0;

        const p =
            this.params;

        const x = 15;
        const y = 15;

        const width = 300;
        const height = 145;

        // -----------------------------------------------------
        // CAIXA
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        ctx.fillStyle = "black";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            "Pêndulo simples",
            x + 10,
            y + 18
        );

        // -----------------------------------------------------
        // PARÂMETROS
        // -----------------------------------------------------

        ctx.font = "11px Arial";

        ctx.fillText(
            `g = ${p.g.toFixed(2)} m/s²`,
            x + 10,
            y + 40
        );

        ctx.fillText(
            `L = ${p.L.toFixed(2)} m`,
            x + 10,
            y + 57
        );

        ctx.fillText(
            `θ₀ = ${p.theta0.toFixed(2)} rad`,
            x + 10,
            y + 74
        );

        ctx.fillText(
            `ω₀ = ${p.omega0.toFixed(2)} rad/s`,
            x + 10,
            y + 91
        );

        // -----------------------------------------------------
        // ESTADO
        // -----------------------------------------------------

        const col2 =
            x + 155;

        ctx.fillText(
            `θ(t) = ${theta.toFixed(2)} rad`,
            col2,
            y + 40
        );

        ctx.fillText(
            `ω(t) = ${omega.toFixed(2)} rad/s`,
            col2,
            y + 57
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            col2,
            y + 74
        );

        ctx.fillText(
            `ωₙ = ${this.naturalFrequency().toFixed(3)} rad/s`,
            col2,
            y + 91
        );

        ctx.fillText(
            `T ≈ ${this.periodSmallAngle().toFixed(3)} s`,
            col2,
            y + 108
        );

        ctx.font =
            "bold 9px Arial";

        ctx.fillText(
            "Aproximação de pequeno ângulo para T",
            x + 10,
            y + 127
        );
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 650;
        const graphY = 70;

        const graphW =
            this.canvas.width -
            graphX -
            40;

        const graphH = 400;

        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        ctx.fillStyle = "black";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            "Evolução temporal",
            graphX + 100,
            graphY - 20
        );

        // -----------------------------------------------------
        // BORDA
        // -----------------------------------------------------

        ctx.strokeStyle = "#777";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // -----------------------------------------------------
        // DADOS
        // -----------------------------------------------------

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.time.length
            );

        if (n < 2)
            return;

        // -----------------------------------------------------
        // ESCALA
        // -----------------------------------------------------

        let maxAbs = 0;

        for (
            let i = 0;
            i < n;
            i++
        ) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(this.theta[i]),
                    Math.abs(this.omega[i])
                );
        }

        if (maxAbs < 0.001)
            maxAbs = 1;

        maxAbs *= 1.15;

        const centerY =
            graphY +
            graphH / 2;

        // -----------------------------------------------------
        // EIXO ZERO
        // -----------------------------------------------------

        ctx.strokeStyle = "#999";

        ctx.beginPath();

        ctx.moveTo(
            graphX,
            centerY
        );

        ctx.lineTo(
            graphX + graphW,
            centerY
        );

        ctx.stroke();

        // -----------------------------------------------------
        // GRID / EIXO Y
        // -----------------------------------------------------

        const ticks = 6;

        ctx.font = "11px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "right";

        for (
            let k = -ticks;
            k <= ticks;
            k++
        ) {

            const value =
                maxAbs *
                k /
                ticks;

            const y =
                centerY -
                (
                    value /
                    maxAbs
                ) *
                (
                    graphH / 2
                );

            if (k !== 0) {

                ctx.strokeStyle =
                    "#eeeeee";

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
            }

            ctx.strokeStyle = "#777";

            ctx.beginPath();

            ctx.moveTo(
                graphX - 5,
                y
            );

            ctx.lineTo(
                graphX + 5,
                y
            );

            ctx.stroke();

            ctx.fillStyle = "black";

            ctx.fillText(
                value.toFixed(2),
                graphX - 8,
                y + 4
            );
        }

        // -----------------------------------------------------
        // EIXO X
        // -----------------------------------------------------

        ctx.textAlign = "center";

        const xTicks = 5;

        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const t =
                this.tf *
                k /
                xTicks;

            const x =
                graphX +
                graphW *
                k /
                xTicks;

            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                x,
                centerY - 5
            );

            ctx.lineTo(
                x,
                centerY + 5
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

        // -----------------------------------------------------
        // LABEL X
        // -----------------------------------------------------

        ctx.font = "14px Arial";

        ctx.fillText(
            "t [s]",
            graphX + graphW / 2,
            graphY + graphH + 45
        );

        // -----------------------------------------------------
        // LABEL Y
        // -----------------------------------------------------

        ctx.save();

        ctx.translate(
            graphX - 60,
            graphY + graphH / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "θ(t) [rad] / ω(t) [rad/s]",
            0,
            0
        );

        ctx.restore();

        // -----------------------------------------------------
        // CONVERSÕES
        // -----------------------------------------------------

        const convertX =
            t =>
                graphX +
                (
                    t /
                    this.tf
                ) *
                graphW;

        const convertY =
            value =>
                centerY -
                (
                    value /
                    maxAbs
                ) *
                (
                    graphH / 2
                );

        // -----------------------------------------------------
        // THETA
        // -----------------------------------------------------

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#1976d2";

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const x =
                convertX(
                    this.time[i]
                );

            const y =
                convertY(
                    this.theta[i]
                );

            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();

        // -----------------------------------------------------
        // OMEGA
        // -----------------------------------------------------

        ctx.strokeStyle = "#f57c00";

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const x =
                convertX(
                    this.time[i]
                );

            const y =
                convertY(
                    this.omega[i]
                );

            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();

        // -----------------------------------------------------
        // LEGENDA
        // -----------------------------------------------------

        ctx.font = "13px Arial";
        ctx.textAlign = "left";

        ctx.fillStyle = "#1976d2";

        ctx.fillText(
            "θ(t) [rad]",
            graphX + graphW - 100,
            graphY + 25
        );

        ctx.fillStyle = "#f57c00";

        ctx.fillText(
            "ω(t) [rad/s]",
            graphX + graphW - 110,
            graphY + 45
        );
    }


    // =========================================================
    // DESENHO GERAL
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

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

        Object.keys(newParams)
            .forEach(key => {

                if (this.sliders[key]) {

                    this.sliders[key].value =
                        newParams[key];

                }
            });

        this.solve();

        this.draw();
    }
}


// =============================================================
// DISPONIBILIZA A CLASSE
// =============================================================
//
// Isso garante que o HTML consiga fazer:
//
// new SimplePendulum(canvas, {...})
//
// =============================================================

window.SimplePendulum =
    SimplePendulum;
