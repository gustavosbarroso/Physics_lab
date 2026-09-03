class ProjectileDrag {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            g: 9.81,
            v0: 20.0,
            theta0_deg: 45.0,

            // Coeficiente de arrasto quadrático
            // Fd = k v²
            k: 0.02,

            m: 1.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.timeDrag = [];
        this.xDrag = [];
        this.yDrag = [];
        this.vxDrag = [];
        this.vyDrag = [];

        this.timeIdeal = [];
        this.xIdeal = [];
        this.yIdeal = [];
        this.vxIdeal = [];
        this.vyIdeal = [];

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 400;

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.animationSpeed = 1.0;

        this.running = false;
        this.frame = 0;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.originX = 100;
        this.originY = 470;

        this.worldScale = 8;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // INICIA
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const x = state[0];
        const y = state[1];

        const vx = state[2];
        const vy = state[3];

        const p = this.params;

        const v =
            Math.sqrt(
                vx * vx +
                vy * vy
            );

        const ax =
            -(p.k / p.m) *
            v *
            vx;

        const ay =
            -p.g -
            (p.k / p.m) *
            v *
            vy;

        return [

            vx,
            vy,
            ax,
            ay

        ];
    }


    // =========================================================
    // OPERAÇÕES VETORIAIS
    // =========================================================

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

            a[0] +
            2 * b[0] +
            2 * c[0] +
            d[0],

            a[1] +
            2 * b[1] +
            2 * c[1] +
            d[1],

            a[2] +
            2 * b[2] +
            2 * c[2] +
            d[2],

            a[3] +
            2 * b[3] +
            2 * c[3] +
            d[3]

        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a = this.t0;
        const b = this.tf;
        const N = this.N;

        const h =
            (b - a) / N;

        let state = [

            0,
            0,

            this.initialVx(),
            this.initialVy()

        ];

        this.timeDrag = [];
        this.xDrag = [];
        this.yDrag = [];
        this.vxDrag = [];
        this.vyDrag = [];

        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;

            // =================================================
            // SALVA ESTADO
            // =================================================

            this.timeDrag.push(t);

            this.xDrag.push(
                state[0]
            );

            this.yDrag.push(
                state[1]
            );

            this.vxDrag.push(
                state[2]
            );

            this.vyDrag.push(
                state[3]
            );

            // =================================================
            // TERMINA SE TOCOU O SOLO
            // =================================================

            if (
                n > 0 &&
                state[1] < 0
            ) {

                break;
            }

            if (n === N)
                break;

            // =================================================
            // k1
            // =================================================

            const k1 =
                this.mul(

                    this.f(
                        state,
                        t
                    ),

                    h

                );

            // =================================================
            // k2
            // =================================================

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

            // =================================================
            // k3
            // =================================================

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

            // =================================================
            // k4
            // =================================================

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

            // =================================================
            // ATUALIZA
            // =================================================

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


    // =========================================================
    // VELOCIDADE INICIAL
    // =========================================================

    initialVx() {

        const theta =
            this.params.theta0_deg *
            Math.PI / 180;

        let vx =
            this.params.v0 *
            Math.cos(theta);

        if (
            Math.abs(vx) <
            1e-12
        ) {

            vx = 0;
        }

        return vx;
    }


    initialVy() {

        const theta =
            this.params.theta0_deg *
            Math.PI / 180;

        return this.params.v0 *
            Math.sin(theta);
    }


    // =========================================================
    // SOLUÇÃO IDEAL
    // =========================================================

    solveIdeal() {

        const p =
            this.params;

        const vx0 =
            this.initialVx();

        const vy0 =
            this.initialVy();

        let T;

        if (vy0 > 0) {

            T =
                2 * vy0 / p.g;

        } else {

            T = 5;
        }

        const N = 600;

        this.timeIdeal = [];
        this.xIdeal = [];
        this.yIdeal = [];
        this.vxIdeal = [];
        this.vyIdeal = [];

        for (
            let i = 0;
            i <= N;
            i++
        ) {

            const t =
                T * i / N;

            const x =
                vx0 * t;

            const y =
                vy0 * t -
                0.5 *
                p.g *
                t *
                t;

            const vx =
                vx0;

            const vy =
                vy0 -
                p.g * t;

            if (y < 0)
                break;

            this.timeIdeal.push(t);
            this.xIdeal.push(x);
            this.yIdeal.push(y);
            this.vxIdeal.push(vx);
            this.vyIdeal.push(vy);
        }
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.solveIdeal();

        this.frame = 0;

        this.calculateScale();
    }


    // =========================================================
    // ESCALA
    // =========================================================

    calculateScale() {

        let xmax = 0;
        let ymax = 0;

        for (
            const x of this.xDrag
        ) {

            xmax =
                Math.max(
                    xmax,
                    x
                );
        }

        for (
            const x of this.xIdeal
        ) {

            xmax =
                Math.max(
                    xmax,
                    x
                );
        }

        for (
            const y of this.yDrag
        ) {

            ymax =
                Math.max(
                    ymax,
                    y
                );
        }

        for (
            const y of this.yIdeal
        ) {

            ymax =
                Math.max(
                    ymax,
                    y
                );
        }

        this.xMax =
            Math.max(
                xmax * 1.15,
                1
            );

        this.yMax =
            Math.max(
                ymax * 1.20,
                1
            );

        const graphWidth =
            1080;

        const graphHeight =
            430;

        const scaleX =
            graphWidth /
            this.xMax;

        const scaleY =
            graphHeight /
            this.yMax;

        this.worldScale =
            Math.min(
                scaleX,
                scaleY
            );
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "projectile-controls"
            );

        if (old)
            old.remove();

        const container =
            document.createElement(
                "div"
            );

        container.id =
            "projectile-controls";

        container.style.width =
            "900px";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial";

        // =====================================================
        // TÍTULO
        // =====================================================

        const title =
            document.createElement(
                "h2"
            );

        title.innerText =
            "Parâmetros do lançamento";

        container.appendChild(
            title
        );

        this.sliders = {};

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
                name: "v0",
                label: "v₀ (m/s)",
                min: 0,
                max: 50,
                step: 0.1
            },

            {
                name: "theta0_deg",
                label: "θ₀ (°)",
                min: 0,
                max: 90,
                step: 0.5
            },

            {
                name: "k",
                label: "k (kg/m)",
                min: 0,
                max: 0.1,
                step: 0.001
            },

            {
                name: "m",
                label: "m (kg)",
                min: 0.1,
                max: 5,
                step: 0.1
            }

        ];

        // =====================================================
        // SLIDERS
        // =====================================================

        configs.forEach(
            config => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.style.display =
                    "flex";

                row.style.alignItems =
                    "center";

                row.style.marginBottom =
                    "8px";

                // -------------------------------------------------
                // LABEL
                // -------------------------------------------------

                const label =
                    document.createElement(
                        "label"
                    );

                label.style.width =
                    "110px";

                label.innerText =
                    config.label;

                // -------------------------------------------------
                // SLIDER
                // -------------------------------------------------

                const slider =
                    document.createElement(
                        "input"
                    );

                slider.type =
                    "range";

                slider.min =
                    config.min;

                slider.max =
                    config.max;

                slider.step =
                    config.step;

                slider.value =
                    this.params[
                        config.name
                    ];

                slider.style.flex =
                    "1";

                // -------------------------------------------------
                // VALOR
                // -------------------------------------------------

                const value =
                    document.createElement(
                        "span"
                    );

                value.style.width =
                    "70px";

                value.style.marginLeft =
                    "10px";

                value.innerText =
                    Number(
                        this.params[
                            config.name
                        ]
                    ).toFixed(2);

                // -------------------------------------------------
                // EVENTO
                // -------------------------------------------------

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

                        value.innerText =
                            v.toFixed(2);

                        this.solve();

                        this.draw();
                    }
                );

                row.appendChild(
                    label
                );

                row.appendChild(
                    slider
                );

                row.appendChild(
                    value
                );

                container.appendChild(
                    row
                );

                this.sliders[
                    config.name
                ] = slider;
            }
        );

        this.canvas.parentNode.insertBefore(

            container,

            this.canvas.nextSibling

        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;

        const x = 20;
        const y = 20;

        const width = 330;
        const height = 155;

        ctx.save();

        // =====================================================
        // CAIXA
        // =====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.95)";

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            width,
            height,
            8
        );

        ctx.fill();
        ctx.stroke();

        // =====================================================
        // ÍNDICES
        // =====================================================

        const index =
            Math.min(
                Math.floor(this.frame),
                this.xDrag.length - 1
            );

        const xd =
            this.xDrag[index] || 0;

        const yd =
            this.yDrag[index] || 0;

        const vxd =
            this.vxDrag[index] || 0;

        const vyd =
            this.vyDrag[index] || 0;

        const t =
            this.timeDrag[index] || 0;

        const speed =
            Math.sqrt(
                vxd * vxd +
                vyd * vyd
            );

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "Lançamento com arrasto",
            x + 12,
            y + 20
        );

        // =====================================================
        // COLUNA 1
        // =====================================================

        ctx.font =
            "12px Arial";

        ctx.fillText(
            `g = ${p.g.toFixed(2)} m/s²`,
            x + 12,
            y + 42
        );

        ctx.fillText(
            `v₀ = ${p.v0.toFixed(2)} m/s`,
            x + 12,
            y + 60
        );

        ctx.fillText(
            `θ₀ = ${p.theta0_deg.toFixed(1)}°`,
            x + 12,
            y + 78
        );

        ctx.fillText(
            `k = ${p.k.toFixed(3)} kg/m`,
            x + 12,
            y + 96
        );

        ctx.fillText(
            `m = ${p.m.toFixed(2)} kg`,
            x + 12,
            y + 114
        );

        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 170;

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            col2,
            y + 42
        );

        ctx.fillText(
            `x = ${xd.toFixed(2)} m`,
            col2,
            y + 60
        );

        ctx.fillText(
            `y = ${yd.toFixed(2)} m`,
            col2,
            y + 78
        );

        ctx.fillText(
            `vₓ = ${vxd.toFixed(2)} m/s`,
            col2,
            y + 96
        );

        ctx.fillText(
            `vᵧ = ${vyd.toFixed(2)} m/s`,
            col2,
            y + 114
        );

        ctx.fillText(
            `|v| = ${speed.toFixed(2)} m/s`,
            col2,
            y + 132
        );

        ctx.restore();
    }


    // =========================================================
    // TRAJETÓRIA
    // =========================================================

    drawTrajectory(ctx) {

        const graphX = 50;
        const graphY = 80;

        const graphW =
            610;

        const graphH =
            400;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Trajetória",
            graphX + graphW / 2,
            graphY - 25
        );

        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // =====================================================
        // ESCALA
        // =====================================================

        const convertX =
            value => {

                return graphX +
                    (
                        value /
                        this.xMax
                    ) *
                    graphW;
            };

        const convertY =
            value => {

                return graphY +
                    graphH -
                    (
                        value /
                        this.yMax
                    ) *
                    graphH;
            };

        // =====================================================
        // EIXO X
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.beginPath();

        ctx.moveTo(
            graphX,
            convertY(0)
        );

        ctx.lineTo(
            graphX + graphW,
            convertY(0)
        );

        ctx.stroke();

        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks = 5;

        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";

        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const value =
                this.xMax *
                k /
                xTicks;

            const px =
                convertX(value);

            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                px,
                graphY + graphH - 5
            );

            ctx.lineTo(
                px,
                graphY + graphH + 5
            );

            ctx.stroke();

            ctx.fillText(
                value.toFixed(1),
                px,
                graphY + graphH + 20
            );

            if (k > 0) {

                ctx.strokeStyle =
                    "#eeeeee";

                ctx.beginPath();

                ctx.moveTo(
                    px,
                    graphY
                );

                ctx.lineTo(
                    px,
                    graphY + graphH
                );

                ctx.stroke();
            }
        }

        // =====================================================
        // TICKS Y
        // =====================================================

        const yTicks = 5;

        ctx.textAlign =
            "right";

        for (
            let k = 0;
            k <= yTicks;
            k++
        ) {

            const value =
                this.yMax *
                k /
                yTicks;

            const py =
                convertY(value);

            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                graphX - 5,
                py
            );

            ctx.lineTo(
                graphX + 5,
                py
            );

            ctx.stroke();

            ctx.fillStyle =
                "black";

            ctx.fillText(
                value.toFixed(1),
                graphX - 10,
                py + 4
            );

            if (k > 0) {

                ctx.strokeStyle =
                    "#eeeeee";

                ctx.beginPath();

                ctx.moveTo(
                    graphX,
                    py
                );

                ctx.lineTo(
                    graphX + graphW,
                    py
                );

                ctx.stroke();
            }
        }

        // =====================================================
        // LABEL X
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "x [m]",
            graphX + graphW / 2,
            graphY + graphH + 45
        );

        // =====================================================
        // LABEL Y
        // =====================================================

        ctx.save();

        ctx.translate(
            graphX - 45,
            graphY + graphH / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "y [m]",
            0,
            0
        );

        ctx.restore();

        // =====================================================
        // DADOS
        // =====================================================

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.xDrag.length
            );

        if (n < 2)
            return;

        // =====================================================
        // CLIPPING
        // Tudo que for desenhado depois daqui ficará
        // restrito à área interna do gráfico.
        // =====================================================

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        ctx.clip();

        // =====================================================
        // TRAJETÓRIA COM ARRASTO
        // =====================================================

        ctx.lineWidth = 2;

        ctx.strokeStyle =
            "#d32f2f";

        ctx.setLineDash([]);

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const px =
                convertX(
                    this.xDrag[i]
                );

            const py =
                convertY(
                    this.yDrag[i]
                );

            if (i === 0)

                ctx.moveTo(
                    px,
                    py
                );

            else

                ctx.lineTo(
                    px,
                    py
                );
        }

        ctx.stroke();

        // =====================================================
        // TRAJETÓRIA IDEAL
        // =====================================================

        const ni =
            Math.min(
                Math.floor(
                    this.frame *
                    this.timeIdeal.length /
                    this.timeDrag.length
                ) + 1,

                this.xIdeal.length
            );

        ctx.strokeStyle =
            "#1976d2";

        ctx.setLineDash([
            7,
            5
        ]);

        ctx.beginPath();

        for (
            let i = 0;
            i < ni;
            i++
        ) {

            const px =
                convertX(
                    this.xIdeal[i]
                );

            const py =
                convertY(
                    this.yIdeal[i]
                );

            if (i === 0)

                ctx.moveTo(
                    px,
                    py
                );

            else

                ctx.lineTo(
                    px,
                    py
                );
        }

        ctx.stroke();

        ctx.setLineDash([]);

        // =====================================================
        // FIM DO CLIPPING
        // =====================================================

        ctx.restore();

        // =====================================================
        // PARTÍCULA
        // =====================================================

        const particleIndex =
            Math.min(
                Math.floor(this.frame),
                this.xDrag.length - 1
            );

        const px =
            convertX(
                this.xDrag[
                    particleIndex
                ]
            );

        const py =
            convertY(
                this.yDrag[
                    particleIndex
                ]
            );

        ctx.fillStyle =
            "#d32f2f";

        ctx.strokeStyle =
            "#111";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();
        ctx.stroke();

        // =====================================================
        // BORDA NOVAMENTE POR CIMA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#d32f2f";

        ctx.fillText(
            "Com arrasto",
            graphX + graphW - 120,
            graphY + 25
        );

        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "Sem arrasto",
            graphX + graphW - 120,
            graphY + 45
        );
    }


    // =========================================================
    // GRÁFICO y(t)
    // =========================================================

    drawGraph(ctx) {

        const graphX = 700;
        const graphY = 80;

        const graphW =
            this.canvas.width -
            graphX -
            40;

        const graphH =
            400;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Altura em função do tempo",
            graphX + graphW / 2,
            graphY - 25
        );

        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // =====================================================
        // DADOS
        // =====================================================

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.timeDrag.length
            );

        if (n < 2)
            return;

        // =====================================================
        // ESCALA
        // =====================================================

        const tMax =
            Math.max(
                this.timeDrag[
                    this.timeDrag.length - 1
                ],

                this.timeIdeal[
                    this.timeIdeal.length - 1
                ]
            );

        let ymax = 0;

        for (
            const y of this.yDrag
        ) {

            ymax =
                Math.max(
                    ymax,
                    y
                );
        }

        for (
            const y of this.yIdeal
        ) {

            ymax =
                Math.max(
                    ymax,
                    y
                );
        }

        ymax =
            Math.max(
                ymax * 1.2,
                1
            );

        const convertX =
            t => {

                return graphX +
                    (
                        t /
                        tMax
                    ) *
                    graphW;
            };

        const convertY =
            y => {

                return graphY +
                    graphH -
                    (
                        y /
                        ymax
                    ) *
                    graphH;
            };

        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks = 5;

        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";

        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const value =
                tMax *
                k /
                xTicks;

            const px =
                convertX(value);

            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                px,
                graphY + graphH - 5
            );

            ctx.lineTo(
                px,
                graphY + graphH + 5
            );

            ctx.stroke();

            ctx.fillText(
                value.toFixed(1),
                px,
                graphY + graphH + 20
            );
        }

        // =====================================================
        // TICKS Y
        // =====================================================

        const yTicks = 5;

        ctx.textAlign =
            "right";

        for (
            let k = 0;
            k <= yTicks;
            k++
        ) {

            const value =
                ymax *
                k /
                yTicks;

            const py =
                convertY(value);

            ctx.strokeStyle =
                "#777";

            ctx.beginPath();

            ctx.moveTo(
                graphX - 5,
                py
            );

            ctx.lineTo(
                graphX + 5,
                py
            );

            ctx.stroke();

            ctx.fillStyle =
                "black";

            ctx.fillText(
                value.toFixed(1),
                graphX - 10,
                py + 4
            );

            if (k > 0) {

                ctx.strokeStyle =
                    "#eeeeee";

                ctx.beginPath();

                ctx.moveTo(
                    graphX,
                    py
                );

                ctx.lineTo(
                    graphX + graphW,
                    py
                );

                ctx.stroke();
            }
        }

        // =====================================================
        // LABEL X
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "t [s]",
            graphX + graphW / 2,
            graphY + graphH + 45
        );

        // =====================================================
        // LABEL Y
        // =====================================================

        ctx.save();

        ctx.translate(
            graphX - 45,
            graphY + graphH / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "y [m]",
            0,
            0
        );

        ctx.restore();

        // =====================================================
        // CLIPPING
        // =====================================================

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        ctx.clip();

        // =====================================================
        // y(t) COM ARRASTO
        // =====================================================

        ctx.lineWidth = 2;

        ctx.strokeStyle =
            "#d32f2f";

        ctx.setLineDash([]);

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const px =
                convertX(
                    this.timeDrag[i]
                );

            const py =
                convertY(
                    this.yDrag[i]
                );

            if (i === 0)

                ctx.moveTo(
                    px,
                    py
                );

            else

                ctx.lineTo(
                    px,
                    py
                );
        }

        ctx.stroke();

        // =====================================================
        // y(t) IDEAL
        // =====================================================

        const ni =
            Math.min(
                Math.floor(
                    this.frame *
                    this.timeIdeal.length /
                    this.timeDrag.length
                ) + 1,

                this.timeIdeal.length
            );

        ctx.strokeStyle =
            "#1976d2";

        ctx.setLineDash([
            7,
            5
        ]);

        ctx.beginPath();

        for (
            let i = 0;
            i < ni;
            i++
        ) {

            const px =
                convertX(
                    this.timeIdeal[i]
                );

            const py =
                convertY(
                    this.yIdeal[i]
                );

            if (i === 0)

                ctx.moveTo(
                    px,
                    py
                );

            else

                ctx.lineTo(
                    px,
                    py
                );
        }

        ctx.stroke();

        ctx.setLineDash([]);

        // =====================================================
        // FIM DO CLIPPING
        // =====================================================

        ctx.restore();

        // =====================================================
        // BORDA NOVAMENTE POR CIMA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#d32f2f";

        ctx.fillText(
            "Com arrasto",
            graphX + graphW - 120,
            graphY + 25
        );

        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "Sem arrasto",
            graphX + graphW - 120,
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
        // TRAJETÓRIA
        // =====================================================

        this.drawTrajectory(
            ctx
        );

        // =====================================================
        // GRÁFICO
        // =====================================================

        this.drawGraph(
            ctx
        );

        // =====================================================
        // HUD
        // =====================================================

        this.drawHUD(
            ctx
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

            // =================================================
            // DESENHA
            // =================================================

            this.draw();

            // =================================================
            // AVANÇA
            // =================================================

            this.frame +=
                this.animationSpeed;

            // =================================================
            // REINICIA
            // =================================================

            const maxFrames =
                Math.max(
                    this.timeDrag.length,
                    this.timeIdeal.length
                );

            if (
                this.frame >=
                maxFrames
            ) {

                this.frame = 0;
            }

            requestAnimationFrame(
                loop
            );
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

    atualizarParametros(
        newParams
    ) {

        this.params = {

            ...this.params,
            ...newParams

        };

        Object.keys(
            newParams
        ).forEach(
            key => {

                if (
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];

                    const event =
                        new Event(
                            "input"
                        );

                    this.sliders[key].dispatchEvent(
                        event
                    );
                }
            }
        );

        this.solve();

        this.draw();
    }
}
