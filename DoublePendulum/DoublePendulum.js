class DoublePendulum {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            L1: 1.0,
            L2: 1.0,

            m1: 1.0,
            m2: 1.0,

            g: 9.81,

            // Internamente sempre em radianos
            theta10: Math.PI / 3,
            theta20: Math.PI / 6,

            omega10: 0.0,
            omega20: 0.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];

        this.theta1 = [];
        this.omega1 = [];

        this.theta2 = [];
        this.omega2 = [];

        this.running = false;
        this.frame = 0;

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 2000;

        // =====================================================
        // CONFIGURAÇÃO DA ANIMAÇÃO
        // =====================================================

        this.animationSpeed = 1;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.pivotX = 330;
        this.pivotY = 100;

        this.scale = 170;

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

        const theta1 = state[0];
        const omega1 = state[1];

        const theta2 = state[2];
        const omega2 = state[3];

        const p = this.params;

        const L1 = p.L1;
        const L2 = p.L2;

        const m1 = p.m1;
        const m2 = p.m2;

        const g = p.g;

        const delta =
            theta1 - theta2;


        const denominator1 =
            L1 *
            (
                2 * m1 +
                m2 -
                m2 *
                Math.cos(
                    2 * delta
                )
            );


        const acceleration1 =

            (
                -g *
                (
                    2 * m1 +
                    m2
                ) *
                Math.sin(theta1)

                -

                m2 *
                g *
                Math.sin(
                    theta1 -
                    2 * theta2
                )

                -

                2 *
                Math.sin(delta) *
                m2 *
                (
                    omega2 *
                    omega2 *
                    L2

                    +

                    omega1 *
                    omega1 *
                    L1 *
                    Math.cos(delta)
                )
            )

            /

            denominator1;


        const denominator2 =
            L2 *
            (
                2 * m1 +
                m2 -
                m2 *
                Math.cos(
                    2 * delta
                )
            );


        const acceleration2 =

            (
                2 *
                Math.sin(delta)

                *

                (
                    omega1 *
                    omega1 *
                    L1 *
                    (
                        m1 +
                        m2
                    )

                    +

                    g *
                    (
                        m1 +
                        m2
                    ) *
                    Math.cos(theta1)

                    +

                    omega2 *
                    omega2 *
                    L2 *
                    m2 *
                    Math.cos(delta)
                )
            )

            /

            denominator2;


        return [

            omega1,
            acceleration1,

            omega2,
            acceleration2

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

            this.params.theta10,
            this.params.omega10,

            this.params.theta20,
            this.params.omega20

        ];


        this.time = [];

        this.theta1 = [];
        this.omega1 = [];

        this.theta2 = [];
        this.omega2 = [];


        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;


            this.time.push(t);

            this.theta1.push(
                state[0]
            );

            this.omega1.push(
                state[1]
            );

            this.theta2.push(
                state[2]
            );

            this.omega2.push(
                state[3]
            );


            if (n === N)
                break;


            const k1 =
                this.mul(

                    this.f(
                        state,
                        t
                    ),

                    h

                );


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
                "double-pendulum-controls"
            );


        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "double-pendulum-controls";


        container.style.width =
            "900px";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial";


        const title =
            document.createElement(
                "h2"
            );


        title.innerText =
            "Parâmetros do pêndulo duplo";


        container.appendChild(
            title
        );


        this.sliders = {};


        const configs = [

            {
                name: "L1",
                label: "L₁ (m)",
                min: 0.2,
                max: 3,
                step: 0.1
            },

            {
                name: "L2",
                label: "L₂ (m)",
                min: 0.2,
                max: 3,
                step: 0.1
            },

            {
                name: "m1",
                label: "m₁ (kg)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "m2",
                label: "m₂ (kg)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "g",
                label: "g (m/s²)",
                min: 1,
                max: 20,
                step: 0.01
            },

            {
                name: "theta10",
                label: "θ₁₀ (graus)",
                min: -170,
                max: 170,
                step: 1,

                // graus -> radianos
                convert: v =>
                    v * Math.PI / 180
            },

            {
                name: "theta20",
                label: "θ₂₀ (graus)",
                min: -170,
                max: 170,
                step: 1,

                // graus -> radianos
                convert: v =>
                    v * Math.PI / 180
            },

            {
                name: "omega10",
                label: "ω₁₀ (rad/s)",
                min: -10,
                max: 10,
                step: 0.1
            },

            {
                name: "omega20",
                label: "ω₂₀ (rad/s)",
                min: -10,
                max: 10,
                step: 0.1

            }

        ];


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


                const label =
                    document.createElement(
                        "label"
                    );


                label.style.width =
                    "110px";


                label.innerText =
                    config.label;


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


                let initialValue =
                    this.params[
                        config.name
                    ];


                // Radianos -> graus
                // somente para os sliders angulares

                if (config.convert) {

                    initialValue =
                        initialValue *
                        180 /
                        Math.PI;

                }


                slider.value =
                    initialValue;


                slider.style.flex =
                    "1";


                const value =
                    document.createElement(
                        "span"
                    );


                value.style.width =
                    "80px";

                value.style.marginLeft =
                    "10px";


                value.innerText =
                    Number(
                        initialValue
                    ).toFixed(2);


                slider.addEventListener(
                    "input",
                    () => {

                        let v =
                            Number(
                                slider.value
                            );


                        // graus -> radianos
                        if (config.convert) {

                            v =
                                config.convert(v);

                        }


                        this.params[
                            config.name
                        ] = v;


                        // Mostra o valor do slider
                        value.innerText =
                            Number(
                                slider.value
                            ).toFixed(2);


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
    // DESENHO DO PÊNDULO
    // =========================================================

    drawPendulum(ctx) {

        const index =
            Math.min(

                Math.floor(this.frame),

                this.theta1.length - 1

            );


        // =====================================================
        // USA DIRETAMENTE A SOLUÇÃO NUMÉRICA
        // =====================================================

        const theta1 =
            this.theta1[index] || 0;


        const theta2 =
            this.theta2[index] || 0;


        const p =
            this.params;


        // =====================================================
        // POSIÇÕES
        // =====================================================

        const x0 =
            this.pivotX;


        const y0 =
            this.pivotY;


        const x1 =
            x0 +
            this.scale *
            p.L1 *
            Math.sin(theta1);


        const y1 =
            y0 +
            this.scale *
            p.L1 *
            Math.cos(theta1);


        const x2 =
            x1 +
            this.scale *
            p.L2 *
            Math.sin(theta2);


        const y2 =
            y1 +
            this.scale *
            p.L2 *
            Math.cos(theta2);


        // =====================================================
        // ÁREA DE DESENHO
        // =====================================================

        ctx.save();


        // =====================================================
        // PONTO DE SUSPENSÃO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.beginPath();

        ctx.arc(
            x0,
            y0,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // =====================================================
        // PRIMEIRA HASTE
        // =====================================================

        ctx.strokeStyle =
            "#333";

        ctx.lineWidth =
            5;


        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x1,
            y1
        );

        ctx.stroke();


        // =====================================================
        // SEGUNDA HASTE
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.stroke();


        // =====================================================
        // MASSA 1
        // =====================================================

        ctx.fillStyle =
            "#1976d2";


        ctx.beginPath();

        ctx.arc(
            x1,
            y1,
            18,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // =====================================================
        // MASSA 2
        // =====================================================

        ctx.fillStyle =
            "#f57c00";


        ctx.beginPath();

        ctx.arc(
            x2,
            y2,
            20,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // =====================================================
        // CENTRO DA MASSA 1
        // =====================================================

        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "m₁",
            x1,
            y1
        );


        // =====================================================
        // CENTRO DA MASSA 2
        // =====================================================

        ctx.fillText(
            "m₂",
            x2,
            y2
        );


        /*
         * ====================================================
         * INDICADOR VISUAL DE θ REMOVIDO
         *
         * O arco angular e o texto θ₁ foram removidos.
         *
         * Os valores continuam disponíveis:
         * - no HUD;
         * - no gráfico;
         * - nas arrays theta1/theta2;
         * - na solução RK4.
         *
         * ====================================================
         */


        ctx.restore();
    }


    // =========================================================
    // TRAJETÓRIA
    // =========================================================

    drawTrajectory(ctx) {

        const index =
            Math.min(

                Math.floor(this.frame),
                this.theta1.length - 1

            );


        if (index < 1)
            return;


        const p =
            this.params;


        ctx.save();


        ctx.lineWidth =
            1;

        ctx.strokeStyle =
            "#dddddd";


        ctx.beginPath();


        const start =
            Math.max(
                0,
                index - 300
            );


        for (
            let k = start;
            k <= index;
            k++
        ) {

            const theta1 =
                this.theta1[k];


            const theta2 =
                this.theta2[k];


            const x1 =
                this.pivotX +
                this.scale *
                p.L1 *
                Math.sin(theta1);


            const y1 =
                this.pivotY +
                this.scale *
                p.L1 *
                Math.cos(theta1);


            const x2 =
                x1 +
                this.scale *
                p.L2 *
                Math.sin(theta2);


            const y2 =
                y1 +
                this.scale *
                p.L2 *
                Math.cos(theta2);


            if (k === start)

                ctx.moveTo(
                    x2,
                    y2
                );

            else

                ctx.lineTo(
                    x2,
                    y2
                );
        }


        ctx.stroke();


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
                this.theta1.length - 1

            );


        const theta1 =
            this.theta1[index] || 0;


        const omega1 =
            this.omega1[index] || 0;


        const theta2 =
            this.theta2[index] || 0;


        const omega2 =
            this.omega2[index] || 0;


        const t =
            this.time[index] || 0;


        // =====================================================
        // HUD MENOR
        // =====================================================

        const x = 15;
        const y = 15;

        const width = 240;
        const height = 125;


        ctx.save();


        // =====================================================
        // CAIXA
        // =====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.92)";

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;


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

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 11px Arial";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(

            "Pêndulo duplo",

            x + 9,
            y + 16

        );


        // =====================================================
        // TEXTO
        // =====================================================

        ctx.font =
            "9px Arial";


        // =====================================================
        // COLUNA 1
        // =====================================================

        ctx.fillText(
            `L₁ = ${p.L1.toFixed(2)} m`,
            x + 9,
            y + 36
        );


        ctx.fillText(
            `m₁ = ${p.m1.toFixed(2)} kg`,
            x + 9,
            y + 51
        );


        ctx.fillText(
            `θ₁ = ${(theta1 * 180 / Math.PI).toFixed(1)}°`,
            x + 9,
            y + 66
        );


        ctx.fillText(
            `ω₁ = ${omega1.toFixed(2)} rad/s`,
            x + 9,
            y + 81
        );


        ctx.fillText(
            `θ₂ = ${(theta2 * 180 / Math.PI).toFixed(1)}°`,
            x + 9,
            y + 96
        );


        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 125;


        ctx.fillText(
            `L₂ = ${p.L2.toFixed(2)} m`,
            col2,
            y + 36
        );


        ctx.fillText(
            `m₂ = ${p.m2.toFixed(2)} kg`,
            col2,
            y + 51
        );


        ctx.fillText(
            `ω₂ = ${omega2.toFixed(2)} rad/s`,
            col2,
            y + 66
        );


        ctx.fillText(
            `g = ${p.g.toFixed(2)} m/s²`,
            col2,
            y + 81
        );


        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            col2,
            y + 96
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX =
            700;


        const graphY =
            70;


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
            "left";


        ctx.fillText(

            "Resposta do pêndulo",

            graphX + 80,

            graphY - 20

        );


        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;


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
                this.time.length

            );


        if (n < 2)
            return;


        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs = 0;


        for (
            let k = 0;
            k < n;
            k++
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(
                        this.theta1[k]
                    ),

                    Math.abs(
                        this.theta2[k]
                    )

                );
        }


        if (maxAbs < 0.001)
            maxAbs = 1;


        maxAbs *= 1.15;


        // =====================================================
        // EIXO ZERO
        // =====================================================

        const centerY =
            graphY +
            graphH / 2;


        ctx.strokeStyle =
            "#999";


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

        const ticks =
            6;


        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";


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


            ctx.strokeStyle =
                "#eeeeee";


            if (k !== 0) {

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


            ctx.fillStyle =
                "black";


            ctx.fillText(

                (
                    value *
                    180 /
                    Math.PI
                ).toFixed(0),

                graphX - 35,
                y + 4

            );
        }


        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks =
            5;


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

                time.toFixed(1),

                x - 10,

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

        ctx.textAlign =
            "center";


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

            "θ [graus]",

            0,
            0

        );


        ctx.restore();


        // =====================================================
        // CONVERSÃO
        // =====================================================

        const convertX =
            t => {

                return graphX +

                    (
                        t /
                        this.tf
                    ) *

                    graphW;
            };


        const convertY =
            value => {

                return centerY -

                    (
                        value /
                        maxAbs
                    ) *

                    (
                        graphH / 2
                    );
            };


        // =====================================================
        // θ₁
        // =====================================================

        ctx.lineWidth =
            2;

        ctx.strokeStyle =
            "#1976d2";


        ctx.beginPath();


        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(
                    this.time[k]
                );


            const y =
                convertY(
                    this.theta1[k]
                );


            if (k === 0)

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
        // θ₂
        // =====================================================

        ctx.strokeStyle =
            "#f57c00";


        ctx.beginPath();


        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(
                    this.time[k]
                );


            const y =
                convertY(
                    this.theta2[k]
                );


            if (k === 0)

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
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(

            "θ₁(t)",

            graphX +
            graphW -
            70,

            graphY + 25

        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(

            "θ₂(t)",

            graphX +
            graphW -
            70,

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
        // PÊNDULO
        // =====================================================

        this.drawPendulum(
            ctx
        );


        // =====================================================
        // HUD
        // =====================================================

        this.drawHUD(
            ctx
        );


        // =====================================================
        // GRÁFICO
        // =====================================================

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


            // =================================================
            // AVANÇA TEMPO
            // =================================================

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

        this.running =
            false;
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

                    let value =
                        newParams[key];


                    // Backend mantém radianos.
                    // Slider mostra graus.

                    if (
                        key === "theta10" ||
                        key === "theta20"
                    ) {

                        value =
                            value *
                            180 /
                            Math.PI;
                    }


                    this.sliders[key].value =
                        value;
                }
            }
        );


        this.solve();

        this.draw();
    }
}
