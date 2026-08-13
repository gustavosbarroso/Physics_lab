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

            // =================================================
            // ÂNGULOS SEMPRE EM RADIANOS
            // =================================================

            theta0: 0.008726646259971648,
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
        this.animationId = null;

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

        // -----------------------------------------------------
        // Pêndulo simples
        //
        // dθ/dt = ω
        //
        // dω/dt = -(g/L) sin(θ)
        //
        // θ em radianos
        // ω em rad/s
        // -----------------------------------------------------

        return [

            omega,

            -(g / L) * Math.sin(theta)

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

        // -----------------------------------------------------
        // Estado inicial
        // -----------------------------------------------------

        let state = [

            this.params.theta0,
            this.params.omega0

        ];

        this.time = [];
        this.theta = [];
        this.omega = [];

        // -----------------------------------------------------
        // Integração
        // -----------------------------------------------------

        for (let i = 0; i <= N; i++) {

            const t = a + i * h;

            // -------------------------------------------------
            // Salva estado
            // -------------------------------------------------

            this.time.push(t);
            this.theta.push(state[0]);
            this.omega.push(state[1]);

            if (i === N)
                break;

            // -------------------------------------------------
            // k1
            // -------------------------------------------------

            const k1 = this.f(state, t);

            // -------------------------------------------------
            // Estado para k2
            // -------------------------------------------------

            const state2 = [

                state[0] + 0.5 * h * k1[0],
                state[1] + 0.5 * h * k1[1]

            ];

            const k2 = this.f(
                state2,
                t + 0.5 * h
            );

            // -------------------------------------------------
            // Estado para k3
            // -------------------------------------------------

            const state3 = [

                state[0] + 0.5 * h * k2[0],
                state[1] + 0.5 * h * k2[1]

            ];

            const k3 = this.f(
                state3,
                t + 0.5 * h
            );

            // -------------------------------------------------
            // Estado para k4
            // -------------------------------------------------

            const state4 = [

                state[0] + h * k3[0],
                state[1] + h * k3[1]

            ];

            const k4 = this.f(
                state4,
                t + h
            );

            // -------------------------------------------------
            // RK4
            // -------------------------------------------------

            state[0] +=
                (h / 6) *
                (
                    k1[0] +
                    2 * k2[0] +
                    2 * k3[0] +
                    k4[0]
                );

            state[1] +=
                (h / 6) *
                (
                    k1[1] +
                    2 * k2[1] +
                    2 * k3[1] +
                    k4[1]
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
    // PERÍODO DE PEQUENO ÂNGULO
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

        const old =
            document.getElementById(
                "pendulum-controls"
            );

        if (old)
            old.remove();

        const container =
            document.createElement("div");

        container.id =
            "pendulum-controls";

        container.style.width =
            "900px";

        container.style.maxWidth =
            "90%";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial, sans-serif";

        // =====================================================
        // TÍTULO
        // =====================================================

        const title =
            document.createElement("h2");

        title.innerText =
            "Parâmetros do pêndulo";

        container.appendChild(title);

        this.sliders = {};
        this.values = {};

        // =====================================================
        // CONFIGURAÇÕES
        // =====================================================

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
                step: 0.001
            },

            {
                name: "omega0",
                label: "ω₀ (rad/s)",
                min: -10,
                max: 10,
                step: 0.01
            }

        ];

        // =====================================================
        // SLIDERS
        // =====================================================

        configs.forEach(config => {

            const row =
                document.createElement("div");

            row.style.display =
                "flex";

            row.style.alignItems =
                "center";

            row.style.marginBottom =
                "10px";

            // -------------------------------------------------
            // LABEL
            // -------------------------------------------------

            const label =
                document.createElement("label");

            label.style.width =
                "100px";

            label.innerText =
                config.label;

            // -------------------------------------------------
            // SLIDER
            // -------------------------------------------------

            const slider =
                document.createElement("input");

            slider.type =
                "range";

            slider.min =
                config.min;

            slider.max =
                config.max;

            slider.step =
                config.step;

            slider.value =
                this.params[config.name];

            slider.style.flex =
                "1";

            // -------------------------------------------------
            // VALOR
            // -------------------------------------------------

            const value =
                document.createElement("span");

            value.style.width =
                "90px";

            value.style.marginLeft =
                "10px";

            value.style.textAlign =
                "right";

            value.innerText =
                Number(
                    this.params[config.name]
                ).toFixed(3);

            // -------------------------------------------------
            // EVENTO
            // -------------------------------------------------

            slider.addEventListener(
                "input",
                () => {

                    const v =
                        Number(slider.value);

                    this.params[config.name] =
                        v;

                    value.innerText =
                        v.toFixed(3);

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

            this.values[config.name] =
                value;
        });

        // =====================================================
        // INSERE DEPOIS DO CANVAS
        // =====================================================

        if (this.canvas.parentNode) {

            this.canvas.parentNode.insertBefore(

                container,

                this.canvas.nextSibling

            );
        }
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
            this.theta[index] ?? 0;

        const px =
            this.pivotX;

        const py =
            this.pivotY;

        const L =
            this.pendulumLength;

        // =====================================================
        // POSIÇÃO DA MASSA
        // =====================================================

        const bx =
            px +
            L * Math.sin(theta);

        const by =
            py +
            L * Math.cos(theta);

        ctx.save();

        // =====================================================
        // TETO
        // =====================================================

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
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
        // LINHA VERTICAL DE REFERÊNCIA
        // =====================================================

        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;

        ctx.setLineDash([
            6,
            6
        ]);

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

        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;

        const index =
            Math.min(

                Math.floor(this.frame),

                this.theta.length - 1

            );

        const theta =
            this.theta[index] ?? 0;

        const omega =
            this.omega[index] ?? 0;

        const t =
            this.time[index] ?? 0;

        const x = 15;
        const y = 15;

        const width = 290;
        const height = 130;

        ctx.save();

        // =====================================================
        // CAIXA
        // =====================================================

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

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";

        ctx.fillText(

            "Pêndulo simples",

            x + 10,
            y + 17

        );

        // =====================================================
        // PARÂMETROS
        // =====================================================

        ctx.font =
            "10px Arial";

        ctx.fillText(

            `g = ${p.g.toFixed(3)} m/s²`,

            x + 10,
            y + 38

        );

        ctx.fillText(

            `L = ${p.L.toFixed(3)} m`,

            x + 10,
            y + 54

        );

        ctx.fillText(

            `θ₀ = ${p.theta0.toFixed(3)} rad`,

            x + 10,
            y + 70

        );

        ctx.fillText(

            `ω₀ = ${p.omega0.toFixed(3)} rad/s`,

            x + 10,
            y + 86

        );

        // =====================================================
        // RESULTADOS
        // =====================================================

        const col2 =
            x + 145;

        ctx.fillText(

            `θ(t) = ${theta.toFixed(3)} rad`,

            col2,
            y + 38

        );

        ctx.fillText(

            `ω(t) = ${omega.toFixed(3)} rad/s`,

            col2,
            y + 54

        );

        ctx.fillText(

            `t = ${t.toFixed(3)} s`,

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

        ctx.font =
            "bold 9px Arial";

        ctx.fillText(

            "Aproximação de pequeno ângulo",

            x + 10,
            y + 113

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

        if (graphW <= 0)
            return;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "left";

        ctx.fillText(

            "Resposta do pêndulo",

            graphX + 100,
            graphY - 20

        );

        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle = "#777777";
        ctx.lineWidth = 1;

        ctx.strokeRect(

            graphX,
            graphY,
            graphW,
            graphH

        );

        // =====================================================
        // DADOS DISPONÍVEIS
        // =====================================================

        const n =
            Math.min(

                Math.floor(this.frame) + 1,

                this.time.length

            );

        if (n < 2)
            return;

        // =====================================================
        // ESCALA VERTICAL
        // =====================================================

        let maxAbs = 0;

        for (
            let i = 0;
            i < n;
            i++
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(
                        this.theta[i]
                    ),

                    Math.abs(
                        this.omega[i]
                    )

                );
        }

        if (
            !Number.isFinite(maxAbs) ||
            maxAbs < 0.001
        ) {

            maxAbs = 1;

        }

        maxAbs *= 1.15;

        // =====================================================
        // EIXO ZERO
        // =====================================================

        const centerY =
            graphY +
            graphH / 2;

        ctx.strokeStyle = "#999999";

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

        // =====================================================
        // TICKS Y
        // =====================================================

        const ticks = 6;

        ctx.font = "11px Arial";
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

            // -------------------------------------------------
            // GRID
            // -------------------------------------------------

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

            // -------------------------------------------------
            // TICK
            // -------------------------------------------------

            ctx.strokeStyle =
                "#777777";

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

            // -------------------------------------------------
            // VALOR
            // -------------------------------------------------

            ctx.fillStyle = "black";

            ctx.fillText(

                value.toFixed(2),

                graphX - 8,
                y + 4

            );
        }

        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks = 5;

        ctx.textAlign = "center";

        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const time =
                this.tf *
                k /
                xTicks;

            const x =
                graphX +
                graphW *
                k /
                xTicks;

            ctx.strokeStyle =
                "#777777";

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

                time.toFixed(1),

                x,
                graphY +
                graphH +
                20

            );
        }

        // =====================================================
        // EIXO X
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.fillText(

            "t [s]",

            graphX +
            graphW / 2,

            graphY +
            graphH +
            45

        );

        // =====================================================
        // EIXO Y
        // =====================================================

        ctx.save();

        ctx.translate(

            graphX - 60,

            graphY +
            graphH / 2

        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.textAlign =
            "center";

        ctx.fillText(

            "θ(t) [rad] / ω(t) [rad/s]",

            0,
            0

        );

        ctx.restore();

        // =====================================================
        // CONVERSÕES
        // =====================================================

        const convertX =
            t => {

                return (

                    graphX +

                    (
                        t /
                        this.tf
                    ) *
                    graphW

                );
            };

        const convertY =
            value => {

                return (

                    centerY -

                    (
                        value /
                        maxAbs
                    ) *
                    (
                        graphH / 2
                    )

                );
            };

        // =====================================================
        // θ(t)
        // =====================================================

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

        // =====================================================
        // ω(t)
        // =====================================================

        ctx.strokeStyle =
            "#f57c00";

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

            graphX +
            graphW -
            90,

            graphY + 25

        );

        ctx.fillStyle =
            "#f57c00";

        ctx.fillText(

            "ω(t) [rad/s]",

            graphX +
            graphW -
            105,

            graphY + 45

        );
    }


    // =========================================================
    // DRAW
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

        const w =
            this.canvas.width;

        const h =
            this.canvas.height;

        // =====================================================
        // LIMPA
        // =====================================================

        ctx.clearRect(
            0,
            0,
            w,
            h
        );

        // =====================================================
        // FUNDO
        // =====================================================

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // =====================================================
        // PÊNDULO
        // =====================================================

        this.drawPendulum(ctx);

        // =====================================================
        // HUD
        // =====================================================

        this.drawHUD(ctx);

        // =====================================================
        // GRÁFICO
        // =====================================================

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

            // -------------------------------------------------
            // AVANÇA
            // -------------------------------------------------

            this.frame +=
                this.animationSpeed;

            // -------------------------------------------------
            // LOOP
            // -------------------------------------------------

            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;
            }

            // -------------------------------------------------
            // DESENHA
            // -------------------------------------------------

            this.draw();

            this.animationId =
                requestAnimationFrame(loop);
        };

        this.draw();

        this.animationId =
            requestAnimationFrame(loop);
    }


    // =========================================================
    // PARAR
    // =========================================================

    parar() {

        this.running = false;

        if (this.animationId !== null) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;
        }
    }


    // =========================================================
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros(newParams) {

        this.params = {

            ...this.params,

            ...newParams

        };

        // =====================================================
        // ATUALIZA SLIDERS
        // =====================================================

        Object.keys(newParams).forEach(key => {

            if (this.sliders[key]) {

                this.sliders[key].value =
                    newParams[key];
            }

            if (this.values[key]) {

                this.values[key].innerText =
                    Number(
                        newParams[key]
                    ).toFixed(3);
            }
        });

        // =====================================================
        // RECALCULA
        // =====================================================

        this.solve();

        this.draw();
    }
}
