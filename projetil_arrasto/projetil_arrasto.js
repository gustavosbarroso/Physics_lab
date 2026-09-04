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
            y0: 10.0,
            k: 0.02,
            m: 1.0,
            ...options
        };

        // =====================================================
        // ARRAYS
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
        // INTEGRAÇÃO
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
        // GRÁFICO
        // =====================================================

        this.graphX = 70;
        this.graphY = 80;
        this.graphW = this.canvas.width - 120;
        this.graphH = 400;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // EQUAÇÕES DO MOVIMENTO COM ARRASTO
    // =========================================================

    f(state, t) {

        const vx = state[2];
        const vy = state[3];

        const p = this.params;

        const v = Math.sqrt(vx * vx + vy * vy);

        const ax = -(p.k / p.m) * v * vx;

        const ay =
            -p.g -
            (p.k / p.m) * v * vy;

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
    // VELOCIDADES INICIAIS
    // =========================================================

    initialVx() {

        const theta =
            this.params.theta0_deg *
            Math.PI / 180;

        let vx =
            this.params.v0 *
            Math.cos(theta);

        if (Math.abs(vx) < 1e-12) {

            vx = 0;
        }

        return vx;
    }


    initialVy() {

        const theta =
            this.params.theta0_deg *
            Math.PI / 180;

        return (
            this.params.v0 *
            Math.sin(theta)
        );
    }


    // =========================================================
    // RK4 COM ARRASTO
    // =========================================================

    RK4() {

        const a = this.t0;
        const b = this.tf;
        const N = this.N;

        const h =
            (b - a) / N;

        // Estado inicial:
        //
        // x = 0
        // y = y0
        // vx = v0 cos(theta)
        // vy = v0 sin(theta)

        let state = [
            0,
            this.params.y0,
            this.initialVx(),
            this.initialVy()
        ];

        this.timeDrag = [];
        this.xDrag = [];
        this.yDrag = [];
        this.vxDrag = [];
        this.vyDrag = [];

        for (let n = 0; n <= N; n++) {

            const t =
                a + n * h;

            // -------------------------------------------------
            // Guarda o estado atual
            // -------------------------------------------------

            this.timeDrag.push(t);
            this.xDrag.push(state[0]);
            this.yDrag.push(Math.max(0, state[1]));
            this.vxDrag.push(state[2]);
            this.vyDrag.push(state[3]);

            // -------------------------------------------------
            // Não integra depois do impacto
            // -------------------------------------------------

            if (state[1] <= 0) {

                break;
            }

            if (n === N) {

                break;
            }

            // -------------------------------------------------
            // RK4
            // -------------------------------------------------

            const k1 =
                this.mul(
                    this.f(state, t),
                    h
                );

            const state2 =
                this.add(
                    state,
                    this.mul(k1, 0.5)
                );

            const k2 =
                this.mul(
                    this.f(
                        state2,
                        t + h / 2
                    ),
                    h
                );

            const state3 =
                this.add(
                    state,
                    this.mul(k2, 0.5)
                );

            const k3 =
                this.mul(
                    this.f(
                        state3,
                        t + h / 2
                    ),
                    h
                );

            const state4 =
                this.add(
                    state,
                    k3
                );

            const k4 =
                this.mul(
                    this.f(
                        state4,
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
                        1 / 6
                    )
                );

            // -------------------------------------------------
            // Interpolação simples do impacto
            //
            // Se o próximo passo passou do solo,
            // colocamos o último ponto exatamente em y = 0.
            // -------------------------------------------------

            if (state[1] < 0) {

                const previousY =
                    this.yDrag[
                        this.yDrag.length - 1
                    ];

                const currentY =
                    state[1];

                const alpha =
                    previousY /
                    (previousY - currentY);

                const previousT =
                    this.timeDrag[
                        this.timeDrag.length - 1
                    ];

                const impactTime =
                    previousT +
                    alpha * h;

                const impactX =
                    this.xDrag[
                        this.xDrag.length - 1
                    ] +
                    alpha *
                    (state[0] -
                        this.xDrag[
                            this.xDrag.length - 1
                        ]);

                const impactVx =
                    this.vxDrag[
                        this.vxDrag.length - 1
                    ] +
                    alpha *
                    (state[2] -
                        this.vxDrag[
                            this.vxDrag.length - 1
                        ]);

                const impactVy =
                    this.vyDrag[
                        this.vyDrag.length - 1
                    ] +
                    alpha *
                    (state[3] -
                        this.vyDrag[
                            this.vyDrag.length - 1
                        ]);

                // Substitui o último estado pelo impacto
                // exato no solo.

                this.timeDrag.push(
                    impactTime
                );

                this.xDrag.push(
                    impactX
                );

                this.yDrag.push(0);

                this.vxDrag.push(
                    impactVx
                );

                this.vyDrag.push(
                    impactVy
                );

                break;
            }
        }
    }


    // =========================================================
    // SOLUÇÃO IDEAL — SEM ARRASTO
    // =========================================================

    solveIdeal() {

        const p = this.params;

        const vx0 =
            this.initialVx();

        const vy0 =
            this.initialVy();

        // -----------------------------------------------------
        // Equação:
        //
        // y(t) = y0 + vy0*t - g*t²/2
        //
        // Encontramos o instante em que y = 0.
        // -----------------------------------------------------

        const discriminant =
            vy0 * vy0 +
            2 * p.g * p.y0;

        let T =
            (
                vy0 +
                Math.sqrt(discriminant)
            ) / p.g;

        if (!Number.isFinite(T) || T <= 0) {

            T = 5;
        }

        const N = 600;

        this.timeIdeal = [];
        this.xIdeal = [];
        this.yIdeal = [];
        this.vxIdeal = [];
        this.vyIdeal = [];

        for (let i = 0; i <= N; i++) {

            const t =
                T * i / N;

            const x =
                vx0 * t;

            const y =
                p.y0 +
                vy0 * t -
                0.5 * p.g * t * t;

            const vx =
                vx0;

            const vy =
                vy0 -
                p.g * t;

            this.timeIdeal.push(t);
            this.xIdeal.push(x);
            this.yIdeal.push(
                Math.max(0, y)
            );

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
    // ESCALA DO GRÁFICO
    // =========================================================

    calculateScale() {

        let xmax = 0;
        let ymax = 0;

        for (const x of this.xDrag) {

            xmax =
                Math.max(xmax, x);
        }

        for (const x of this.xIdeal) {

            xmax =
                Math.max(xmax, x);
        }

        for (const y of this.yDrag) {

            ymax =
                Math.max(ymax, y);
        }

        for (const y of this.yIdeal) {

            ymax =
                Math.max(ymax, y);
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
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "projectile-controls"
            );

        if (old) {

            old.remove();
        }

        const container =
            document.createElement("div");

        container.id =
            "projectile-controls";

        container.style.width =
            "900px";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial";


        const title =
            document.createElement("h2");

        title.innerText =
            "Parâmetros do lançamento";

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
                name: "y0",
                label: "y₀ (m)",
                min: 0.1,
                max: 50,
                step: 0.1
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


        configs.forEach(config => {

            const row =
                document.createElement("div");

            row.style.display =
                "flex";

            row.style.alignItems =
                "center";

            row.style.marginBottom =
                "8px";


            const label =
                document.createElement("label");

            label.style.width =
                "110px";

            label.innerText =
                config.label;


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
                this.params[
                    config.name
                ];

            slider.style.flex =
                "1";


            const value =
                document.createElement("span");

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


            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(value);

            container.appendChild(row);


            this.sliders[
                config.name
            ] = slider;
        });


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

        const width = 350;
        const height = 175;


        ctx.save();


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
            `y₀ = ${p.y0.toFixed(2)} m`,
            x + 12,
            y + 96
        );

        ctx.fillText(
            `k = ${p.k.toFixed(3)} kg/m`,
            x + 12,
            y + 114
        );

        ctx.fillText(
            `m = ${p.m.toFixed(2)} kg`,
            x + 12,
            y + 132
        );


        const col2 =
            x + 185;


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
    // GRÁFICO DA TRAJETÓRIA
    // =========================================================

    drawTrajectory(ctx) {

        const graphX =
            this.graphX;

        const graphY =
            this.graphY;

        const graphW =
            this.graphW;

        const graphH =
            this.graphH;


        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Trajetória do projétil",
            graphX + graphW / 2,
            graphY - 25
        );


        // -----------------------------------------------------
        // CONVERSÃO DE COORDENADAS
        // -----------------------------------------------------

        const convertX =
            value =>
                graphX +
                (value / this.xMax) *
                graphW;


        const convertY =
            value =>
                graphY +
                graphH -
                (value / this.yMax) *
                graphH;


        // -----------------------------------------------------
        // GRADE
        // -----------------------------------------------------

        const xTicks = 6;
        const yTicks = 5;


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


            if (k > 0) {

                ctx.strokeStyle =
                    "#eeeeee";

                ctx.lineWidth = 1;

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


            ctx.fillStyle =
                "black";

            ctx.fillText(
                value.toFixed(1),
                px,
                graphY + graphH + 20
            );
        }


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


            if (k > 0) {

                ctx.strokeStyle =
                    "#eeeeee";

                ctx.lineWidth = 1;

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
        }


        // -----------------------------------------------------
        // EIXO X
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

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


        // -----------------------------------------------------
        // QUANTIDADE DE PONTOS ANIMADOS
        // -----------------------------------------------------

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.xDrag.length
            );


        if (n < 1) {

            return;
        }


        const ni =
            Math.min(
                Math.floor(
                    this.frame *
                    this.timeIdeal.length /
                    this.timeDrag.length
                ) + 1,

                this.xIdeal.length
            );


        // -----------------------------------------------------
        // CLIPPING
        // -----------------------------------------------------

        const clipMargin = 2;


        ctx.save();

        ctx.beginPath();

        ctx.rect(
            graphX + clipMargin,
            graphY + clipMargin,
            graphW - 2 * clipMargin,
            graphH - 2 * clipMargin
        );

        ctx.clip();


        // -----------------------------------------------------
        // TRAJETÓRIA COM ARRASTO
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#d32f2f";

        ctx.lineWidth = 2;

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


        // -----------------------------------------------------
        // TRAJETÓRIA IDEAL
        // -----------------------------------------------------

        if (ni > 0) {

            ctx.strokeStyle =
                "#1976d2";

            ctx.lineWidth = 2;

            ctx.setLineDash(
                [7, 5]
            );

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

            ctx.setLineDash([]);
        }


        ctx.restore();


        // -----------------------------------------------------
        // PARTÍCULA
        // -----------------------------------------------------

        const particleIndex =
            Math.min(
                Math.floor(this.frame),
                this.xDrag.length - 1
            );


        const particleX =
            convertX(
                this.xDrag[
                    particleIndex
                ]
            );

        const particleY =
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
            particleX,
            particleY,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();

        ctx.stroke();


        // -----------------------------------------------------
        // BORDA DO GRÁFICO
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );


        // -----------------------------------------------------
        // LEGENDA
        // -----------------------------------------------------

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";


        ctx.fillStyle =
            "#d32f2f";

        ctx.fillText(
            "Com arrasto",
            graphX + graphW - 125,
            graphY + 25
        );


        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "Sem arrasto",
            graphX + graphW - 125,
            graphY + 45
        );


        // -----------------------------------------------------
        // EIXO X
        // -----------------------------------------------------

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            "black";

        ctx.fillText(
            "x [m]",
            graphX + graphW / 2,
            graphY + graphH + 45
        );


        // -----------------------------------------------------
        // EIXO Y
        // -----------------------------------------------------

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
    }


    // =========================================================
    // DESENHO
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

        const w =
            this.canvas.width;

        const h =
            this.canvas.height;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        this.drawTrajectory(ctx);

        this.drawHUD(ctx);
    }


    // =========================================================
    // INICIAR
    // =========================================================

    iniciar() {

        if (this.running) {

            return;
        }

        this.running = true;


        const loop = () => {

            if (!this.running) {

                return;
            }


            this.draw();


            this.frame +=
                this.animationSpeed;


            const maxFrames =
                Math.max(
                    this.timeDrag.length,
                    this.timeIdeal.length
                );


            if (
                this.frame >= maxFrames
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

                    const event =
                        new Event("input");

                    this.sliders[key]
                        .dispatchEvent(event);
                }
            });


        this.solve();

        this.draw();
    }
}
