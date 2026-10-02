class CoupledOscillators {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {
            m: 1.0,
            k: 2.0,
            kc: 1.0,

            x1_0: 1.0,
            x2_0: -1.0,

            v1_0: 0.0,
            v2_0: 0.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.x1 = [];
        this.v1 = [];
        this.x2 = [];
        this.v2 = [];
        this.energy = [];

        this.running = false;
        this.frame = 0;

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 400;

        this.animationSpeed = 1;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.systemLeft = 80;
        this.systemRight = 520;
        this.systemCenterY = 310;

        this.wallTop = 190;
        this.wallBottom = 430;

        this.massBase1 = 210;
        this.massBase2 = 390;

        this.visualScale = 70;

        this.massRadius = 18;

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

        const x1 = state[0];
        const v1 = state[1];

        const x2 = state[2];
        const v2 = state[3];

        const p = this.params;

        const a1 =
            (
                -p.k * x1 +
                p.kc * (x2 - x1)
            ) / p.m;

        const a2 =
            (
                -p.k * x2 +
                p.kc * (x1 - x2)
            ) / p.m;

        return [
            v1,
            a1,
            v2,
            a2
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


    mul(a, scalar) {

        return [
            a[0] * scalar,
            a[1] * scalar,
            a[2] * scalar,
            a[3] * scalar
        ];
    }


    add4(a, b, c, d) {

        return [
            a[0] + 2 * b[0] + 2 * c[0] + d[0],

            a[1] + 2 * b[1] + 2 * c[1] + d[1],

            a[2] + 2 * b[2] + 2 * c[2] + d[2],

            a[3] + 2 * b[3] + 2 * c[3] + d[3]
        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const h =
            (this.tf - this.t0) / this.N;

        let state = [

            this.params.x1_0,
            this.params.v1_0,

            this.params.x2_0,
            this.params.v2_0

        ];

        this.time = [];
        this.x1 = [];
        this.v1 = [];
        this.x2 = [];
        this.v2 = [];
        this.energy = [];


        for (
            let n = 0;
            n <= this.N;
            n++
        ) {

            const t =
                this.t0 + n * h;


            // =================================================
            // SALVA ESTADO
            // =================================================

            this.time.push(t);

            this.x1.push(
                state[0]
            );

            this.v1.push(
                state[1]
            );

            this.x2.push(
                state[2]
            );

            this.v2.push(
                state[3]
            );


            if (n === this.N)
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

                        t + 0.5 * h

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

                        t + 0.5 * h

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
            // ATUALIZA ESTADO
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

        this.calculateEnergy();
    }


    // =========================================================
    // ENERGIA
    // =========================================================

    calculateEnergy() {

        const p =
            this.params;

        this.energy = [];


        for (
            let i = 0;
            i < this.time.length;
            i++
        ) {

            const Ec =
                0.5 *
                p.m *
                (
                    this.v1[i] ** 2 +
                    this.v2[i] ** 2
                );


            const Ep =
                0.5 *
                p.k *
                (
                    this.x1[i] ** 2 +
                    this.x2[i] ** 2
                )
                +
                0.5 *
                p.kc *
                (
                    this.x2[i] -
                    this.x1[i]
                ) ** 2;


            this.energy.push(
                Ec + Ep
            );
        }
    }


    // =========================================================
    // IDENTIFICAÇÃO DO MODO
    // =========================================================

    identifyMode() {

        const x1 =
            this.params.x1_0;

        const x2 =
            this.params.x2_0;


        if (
            Math.abs(
                x1 - x2
            ) < 1e-2
        ) {

            return "Modo simétrico";

        }


        else if (
            Math.abs(
                x1 + x2
            ) < 1e-2
        ) {

            return "Modo antissimétrico";

        }


        else {

            return "Batimento";
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
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "coupled-controls"
            );


        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "coupled-controls";


        container.style.width =
            "900px";


        container.style.margin =
            "20px auto";


        container.style.fontFamily =
            "Arial, sans-serif";


        // =====================================================
        // TÍTULO
        // =====================================================

        const title =
            document.createElement(
                "h2"
            );


        title.innerText =
            "Parâmetros dos osciladores";


        container.appendChild(
            title
        );


        this.sliders = {};


        // =====================================================
        // CONFIGURAÇÕES
        // =====================================================

        const configs = [

            {
                name: "m",
                label: "m (kg)",
                min: 0.5,
                max: 5.0,
                step: 0.1
            },

            {
                name: "k",
                label: "k (N/m)",
                min: 0.5,
                max: 10.0,
                step: 0.1
            },

            {
                name: "kc",
                label: "kc (N/m)",
                min: 0.1,
                max: 10.0,
                step: 0.1
            },

            {
                name: "x1_0",
                label: "x₁₀ (m)",
                min: -2.0,
                max: 2.0,
                step: 0.1
            },

            {
                name: "x2_0",
                label: "x₂₀ (m)",
                min: -2.0,
                max: 2.0,
                step: 0.1
            }

        ];


        // =====================================================
        // CRIA SLIDERS
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
                    "100px";


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
                ] =
                    slider;

            }
        );


        // =====================================================
        // INSERE DEPOIS DO CANVAS
        // =====================================================

        this.canvas.parentNode.insertBefore(

            container,

            this.canvas.nextSibling

        );
    }


    // =========================================================
    // DESENHO DE MOLA
    // =========================================================

    drawSpring(
        ctx,
        xa,
        xb,
        y,
        amplitude = 9,
        coils = 12
    ) {

        const length =
            xb - xa;


        if (
            Math.abs(length) < 8
        )
            return;


        const direction =
            length >= 0
                ? 1
                : -1;


        const start =
            xa +
            direction * 8;


        const end =
            xb -
            direction * 8;


        const segments =
            coils * 2;


        ctx.beginPath();


        ctx.moveTo(
            xa,
            y
        );


        ctx.lineTo(
            start,
            y
        );


        for (
            let j = 1;
            j <= segments;
            j++
        ) {

            const u =
                j / segments;


            const x =
                start +
                (end - start) * u;


            const yy =
                y +
                (
                    j % 2 === 1
                        ? amplitude
                        : -amplitude
                );


            ctx.lineTo(
                x,
                yy
            );
        }


        ctx.lineTo(
            xb,
            y
        );


        ctx.stroke();
    }


    // =========================================================
    // SISTEMA FÍSICO
    // =========================================================

    drawSystem(ctx) {

        const y =
            this.systemCenterY;


        const X1 =
            this.massBase1 +
            this.x1[this.frame] *
            this.visualScale;


        const X2 =
            this.massBase2 +
            this.x2[this.frame] *
            this.visualScale;


        ctx.save();


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
            "Osciladores Acoplados",
            300,
            45
        );


        // =====================================================
        // LINHA DE REFERÊNCIA
        // =====================================================

        ctx.strokeStyle =
            "#cccccc";


        ctx.lineWidth = 1;


        ctx.beginPath();


        ctx.moveTo(
            this.systemLeft,
            y
        );


        ctx.lineTo(
            this.systemRight,
            y
        );


        ctx.stroke();


        // =====================================================
        // PAREDE ESQUERDA
        // =====================================================

        ctx.strokeStyle =
            "black";


        ctx.lineWidth = 4;


        ctx.beginPath();


        ctx.moveTo(
            this.systemLeft,
            this.wallTop
        );


        ctx.lineTo(
            this.systemLeft,
            this.wallBottom
        );


        ctx.stroke();


        // Hachuras

        ctx.lineWidth = 2;


        for (
            let yy = this.wallTop;
            yy <= this.wallBottom;
            yy += 15
        ) {

            ctx.beginPath();


            ctx.moveTo(
                this.systemLeft,
                yy
            );


            ctx.lineTo(
                this.systemLeft - 12,
                yy + 12
            );


            ctx.stroke();
        }


        // =====================================================
        // PAREDE DIREITA
        // =====================================================

        ctx.lineWidth = 4;


        ctx.beginPath();


        ctx.moveTo(
            this.systemRight,
            this.wallTop
        );


        ctx.lineTo(
            this.systemRight,
            this.wallBottom
        );


        ctx.stroke();


        ctx.lineWidth = 2;


        for (
            let yy = this.wallTop;
            yy <= this.wallBottom;
            yy += 15
        ) {

            ctx.beginPath();


            ctx.moveTo(
                this.systemRight,
                yy
            );


            ctx.lineTo(
                this.systemRight + 12,
                yy + 12
            );


            ctx.stroke();
        }


        // =====================================================
        // MOLAS
        // =====================================================

        ctx.strokeStyle =
            "#2e7d32";


        ctx.lineWidth = 2;


        this.drawSpring(
            ctx,
            this.systemLeft,
            X1,
            y
        );


        this.drawSpring(
            ctx,
            X1,
            X2,
            y
        );


        this.drawSpring(
            ctx,
            X2,
            this.systemRight,
            y
        );


        // =====================================================
        // POSIÇÕES DE EQUILÍBRIO
        // =====================================================

        ctx.strokeStyle =
            "#999999";


        ctx.lineWidth = 1;


        ctx.setLineDash([
            5,
            5
        ]);


        ctx.beginPath();


        ctx.moveTo(
            this.massBase1,
            y - 55
        );


        ctx.lineTo(
            this.massBase1,
            y + 55
        );


        ctx.stroke();


        ctx.beginPath();


        ctx.moveTo(
            this.massBase2,
            y - 55
        );


        ctx.lineTo(
            this.massBase2,
            y + 55
        );


        ctx.stroke();


        ctx.setLineDash([]);


        // =====================================================
        // MASSA 1
        // =====================================================

        ctx.fillStyle =
            "#d32f2f";


        ctx.strokeStyle =
            "#111111";


        ctx.lineWidth = 2;


        ctx.beginPath();


        ctx.arc(
            X1,
            y,
            this.massRadius,
            0,
            2 * Math.PI
        );


        ctx.fill();


        ctx.stroke();


        // =====================================================
        // MASSA 2
        // =====================================================

        ctx.fillStyle =
            "#1976d2";


        ctx.beginPath();


        ctx.arc(
            X2,
            y,
            this.massRadius,
            0,
            2 * Math.PI
        );


        ctx.fill();


        ctx.stroke();


        // =====================================================
        // LABELS
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "14px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "m₁",
            X1,
            y - 32
        );


        ctx.fillText(
            "m₂",
            X2,
            y - 32
        );


        ctx.font =
            "12px Arial";


        ctx.fillText(
            "x₁",
            X1,
            y + 42
        );


        ctx.fillText(
            "x₂",
            X2,
            y + 42
        );


        // =====================================================
        // VALORES
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(
            `${this.x1[this.frame].toFixed(3)} m`,
            X1,
            y + 60
        );


        ctx.fillText(
            `${this.x2[this.frame].toFixed(3)} m`,
            X2,
            y + 60
        );


        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;


        const i =
            Math.min(
                this.frame,
                this.time.length - 1
            );


        const x1 =
            this.x1[i] || 0;


        const x2 =
            this.x2[i] || 0;


        const v1 =
            this.v1[i] || 0;


        const v2 =
            this.v2[i] || 0;


        const E =
            this.energy[i] || 0;


        const t =
            this.time[i] || 0;


        const mode =
            this.identifyMode();


        const x = 20;
        const y = 65;
        const width = 315;
        const height = 190;


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
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "bold 14px Arial";


        ctx.textAlign =
            "left";


        ctx.fillText(
            "Osciladores Acoplados",
            x + 12,
            y + 21
        );


        // =====================================================
        // PARÂMETROS
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(
            `m = ${p.m.toFixed(2)} kg`,
            x + 12,
            y + 44
        );


        ctx.fillText(
            `k = ${p.k.toFixed(2)} N/m`,
            x + 12,
            y + 62
        );


        ctx.fillText(
            `kc = ${p.kc.toFixed(2)} N/m`,
            x + 12,
            y + 80
        );


        ctx.fillText(
            `x₁₀ = ${p.x1_0.toFixed(3)} m`,
            x + 12,
            y + 98
        );


        ctx.fillText(
            `x₂₀ = ${p.x2_0.toFixed(3)} m`,
            x + 12,
            y + 116
        );


        // =====================================================
        // ESTADO
        // =====================================================

        const col2 =
            x + 165;


        ctx.fillText(
            `x₁ = ${x1.toFixed(3)} m`,
            col2,
            y + 44
        );


        ctx.fillText(
            `x₂ = ${x2.toFixed(3)} m`,
            col2,
            y + 62
        );


        ctx.fillText(
            `v₁ = ${v1.toFixed(3)} m/s`,
            col2,
            y + 80
        );


        ctx.fillText(
            `v₂ = ${v2.toFixed(3)} m/s`,
            col2,
            y + 98
        );


        ctx.fillText(
            `E = ${E.toFixed(3)} J`,
            col2,
            y + 116
        );


        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            col2,
            y + 134
        );


        ctx.fillText(
            mode,
            x + 12,
            y + 158
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 665;
        const graphY = 85;

        const graphW =
            this.canvas.width -
            graphX -
            35;

        const graphH = 390;


        const n =
            Math.min(
                this.frame + 1,
                this.time.length
            );


        ctx.save();


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "bold 18px Arial";


        ctx.textAlign =
            "left";


        ctx.fillText(
            "Posições ao longo do tempo",
            graphX + 55,
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


        if (n < 2) {

            ctx.restore();

            return;
        }


        // =====================================================
        // ESCALA Y
        // =====================================================

        let ymin =
            Infinity;


        let ymax =
            -Infinity;


        for (
            let i = 0;
            i < n;
            i++
        ) {

            ymin =
                Math.min(
                    ymin,
                    this.x1[i],
                    this.x2[i]
                );


            ymax =
                Math.max(
                    ymax,
                    this.x1[i],
                    this.x2[i]
                );
        }


        if (
            Math.abs(
                ymax - ymin
            ) < 1e-8
        ) {

            ymax += 1;
            ymin -= 1;
        }


        const margin =
            0.20 *
            (
                ymax - ymin
            );


        ymin -= margin;
        ymax += margin;


        // =====================================================
        // CONVERSÃO
        // =====================================================

        const convertX =
            t => {

                return graphX +

                    (
                        t /
                        this.tf
                    )
                    *
                    graphW;
            };


        const convertY =
            value => {

                return graphY +
                    graphH -
                    (
                        (
                            value -
                            ymin
                        )
                        /
                        (
                            ymax -
                            ymin
                        )
                    )
                    *
                    graphH;
            };


        // =====================================================
        // GRID / TICKS Y
        // =====================================================

        ctx.font =
            "11px Arial";


        ctx.textAlign =
            "right";


        const yTicks = 6;


        for (
            let k = 0;
            k <= yTicks;
            k++
        ) {

            const value =
                ymin +
                (
                    ymax -
                    ymin
                )
                *
                k /
                yTicks;


            const y =
                convertY(
                    value
                );


            ctx.strokeStyle =
                "#eeeeee";


            ctx.lineWidth = 1;


            ctx.beginPath();


            ctx.moveTo(
                graphX,
                y
            );


            ctx.lineTo(
                graphX +
                graphW,
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
        // EIXO x = 0
        // =====================================================

        if (
            ymin <= 0 &&
            ymax >= 0
        ) {

            const y0 =
                convertY(0);


            ctx.strokeStyle =
                "#999999";


            ctx.beginPath();


            ctx.moveTo(
                graphX,
                y0
            );


            ctx.lineTo(
                graphX +
                graphW,
                y0
            );


            ctx.stroke();
        }


        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks = 5;


        ctx.textAlign =
            "center";


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
                convertX(
                    time
                );


            ctx.strokeStyle =
                "#777777";


            ctx.beginPath();


            ctx.moveTo(
                x,
                graphY +
                graphH -
                5
            );


            ctx.lineTo(
                x,
                graphY +
                graphH +
                5
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
        // LABEL X
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
        // LABEL Y
        // =====================================================

        ctx.save();


        ctx.translate(
            graphX - 55,
            graphY +
            graphH / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.fillText(
            "x [m]",
            0,
            0
        );


        ctx.restore();


        // =====================================================
        // x₁(t)
        // =====================================================

        ctx.lineWidth = 2;


        ctx.strokeStyle =
            "#d32f2f";


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
                    this.x1[i]
                );


            if (i === 0)

                ctx.moveTo(
                    x,
                    y
                );

            else

                ctx.lineTo(
                    x,
                    y
                );
        }


        ctx.stroke();


        // =====================================================
        // x₂(t)
        // =====================================================

        ctx.strokeStyle =
            "#1976d2";


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
                    this.x2[i]
                );


            if (i === 0)

                ctx.moveTo(
                    x,
                    y
                );

            else

                ctx.lineTo(
                    x,
                    y
                );
        }


        ctx.stroke();


        // =====================================================
        // PONTOS ATUAIS
        // =====================================================

        const currentX =
            convertX(
                this.time[n - 1]
            );


        const currentY1 =
            convertY(
                this.x1[n - 1]
            );


        const currentY2 =
            convertY(
                this.x2[n - 1]
            );


        ctx.fillStyle =
            "#d32f2f";


        ctx.beginPath();


        ctx.arc(
            currentX,
            currentY1,
            4,
            0,
            2 * Math.PI
        );


        ctx.fill();


        ctx.fillStyle =
            "#1976d2";


        ctx.beginPath();


        ctx.arc(
            currentX,
            currentY2,
            4,
            0,
            2 * Math.PI
        );


        ctx.fill();


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
            "x₁(t) [m]",
            graphX +
            graphW -
            105,
            graphY + 25
        );


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(
            "x₂(t) [m]",
            graphX +
            graphW -
            105,
            graphY + 45
        );


        ctx.restore();
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


        this.drawSystem(
            ctx
        );


        this.drawHUD(
            ctx
        );


        this.drawGraph(
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


            this.draw();


            this.frame +=
                this.animationSpeed;


            if (
                this.frame >=
                this.time.length
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

                }

            }
        );


        this.solve();


        this.draw();
    }
}
