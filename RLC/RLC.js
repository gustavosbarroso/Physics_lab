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
            m: 1.0,
            b: 0.20,

            theta0: 0.8,
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
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;


        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 10;
        this.N = 500;


        // =====================================================
        // GEOMETRIA DO DESENHO
        // =====================================================

        this.pivotX = 300;
        this.pivotY = 150;

        this.pendulumScale = 250;


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

        const p = this.params;

        return [

            omega,

            -
            (p.g / p.L) *
            Math.sin(theta)

            -
            (p.b / p.m) *
            omega

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

            a[0]
            +
            2 * b[0]
            +
            2 * c[0]
            +
            d[0],

            a[1]
            +
            2 * b[1]
            +
            2 * c[1]
            +
            d[1]

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

            this.params.theta0,
            this.params.omega0

        ];


        this.time = [];
        this.theta = [];
        this.omega = [];


        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;


            this.time.push(t);

            this.theta.push(
                state[0]
            );

            this.omega.push(
                state[1]
            );


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
            // NOVO ESTADO
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
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;
    }


    // =========================================================
    // CLASSIFICAÇÃO DO REGIME
    // =========================================================

    regime() {

        const p = this.params;


        const omega0 =
            Math.sqrt(
                p.g / p.L
            );


        const gamma =
            p.b /
            (2 * p.m);


        if (
            Math.abs(p.b) < 1e-8
        ) {

            return "Sem amortecimento";
        }


        if (
            Math.abs(
                gamma - omega0
            ) < 1e-3
        ) {

            return "Criticamente amortecido";
        }


        if (
            gamma > omega0
        ) {

            return "Superamortecido";
        }


        return "Subamortecido";
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "pendulo-controls"
            );


        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "pendulo-controls";


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
            "Parâmetros do pêndulo";


        container.appendChild(
            title
        );


        this.sliders = {};


        // =====================================================
        // CONFIGURAÇÃO DOS SLIDERS
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
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "m",
                label: "m (kg)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                name: "b",
                label: "b (kg/s)",
                min: 0,
                max: 10,
                step: 0.01
            },

            {
                name: "theta0",
                label: "θ₀ (rad)",
                min: -3.14,
                max: 3.14,
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


        // =====================================================
        // CRIAÇÃO DOS CONTROLES
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
        // COLOCA CONTROLES ABAIXO DO CANVAS
        // =====================================================

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

                this.frame,

                this.theta.length - 1

            );


        const theta =
            this.theta[index] || 0;


        // =====================================================
        // ÁREA DO PÊNDULO
        // =====================================================

        const areaX = 20;
        const areaY = 60;

        const areaW = 650;
        const areaH = 520;


        ctx.strokeStyle =
            "#777";


        ctx.lineWidth = 1;


        ctx.strokeRect(

            areaX,
            areaY,
            areaW,
            areaH

        );


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

            "Pêndulo simples",

            areaX +
            areaW / 2,

            areaY + 30

        );


        // =====================================================
        // POSIÇÃO DO PONTO DE SUSPENSÃO
        // =====================================================

        const pivotX =
            areaX +
            areaW / 2;


        const pivotY =
            areaY +
            100;


        // =====================================================
        // COMPRIMENTO VISUAL
        // =====================================================

        const maxLength =
            Math.min(

                320,

                areaH - 170

            );


        const L =
            this.params.L;


        const visualLength =
            maxLength *
            (
                L /
                Math.max(
                    L,
                    5
                )
            )
            +
            80;


        // =====================================================
        // POSIÇÃO DA MASSA
        // =====================================================

        const massX =
            pivotX +
            visualLength *
            Math.sin(theta);


        const massY =
            pivotY +
            visualLength *
            Math.cos(theta);


        // =====================================================
        // REFERÊNCIA VERTICAL
        // =====================================================

        ctx.strokeStyle =
            "#dddddd";


        ctx.lineWidth = 1;


        ctx.setLineDash([
            5,
            5
        ]);


        ctx.beginPath();


        ctx.moveTo(
            pivotX,
            pivotY
        );


        ctx.lineTo(

            pivotX,

            pivotY +
            visualLength +
            30

        );


        ctx.stroke();


        ctx.setLineDash([]);


        // =====================================================
        // SUPORTE
        // =====================================================

        ctx.strokeStyle =
            "black";


        ctx.lineWidth = 5;


        ctx.beginPath();


        ctx.moveTo(

            pivotX - 60,
            pivotY - 25

        );


        ctx.lineTo(

            pivotX + 60,
            pivotY - 25

        );


        ctx.stroke();


        // =====================================================
        // TRIÂNGULO DO SUPORTE
        // =====================================================

        ctx.lineWidth = 2;


        ctx.beginPath();


        ctx.moveTo(
            pivotX - 15,
            pivotY - 25
        );


        ctx.lineTo(
            pivotX,
            pivotY
        );


        ctx.lineTo(
            pivotX + 15,
            pivotY - 25
        );


        ctx.stroke();


        // =====================================================
        // PONTO DE SUSPENSÃO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.beginPath();


        ctx.arc(

            pivotX,
            pivotY,
            6,
            0,
            2 * Math.PI

        );


        ctx.fill();


        // =====================================================
        // HASTE / FIO
        // =====================================================

        ctx.strokeStyle =
            "#333";


        ctx.lineWidth = 3;


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


        // =====================================================
        // MASSA
        // =====================================================

        ctx.fillStyle =
            "#168aad";


        ctx.beginPath();


        ctx.arc(

            massX,
            massY,
            20,
            0,
            2 * Math.PI

        );


        ctx.fill();


        ctx.strokeStyle =
            "#0b4f6c";


        ctx.lineWidth = 2;


        ctx.stroke();


        // =====================================================
        // LETRA m
        // =====================================================

        ctx.fillStyle =
            "white";


        ctx.font =
            "bold 13px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(

            "m",

            massX,
            massY

        );


        // =====================================================
        // ARCO DO ÂNGULO
        // =====================================================

        if (
            Math.abs(theta) > 0.02
        ) {

            const radius = 60;


            ctx.strokeStyle =
                "#f57c00";


            ctx.lineWidth = 2;


            ctx.beginPath();


            /*
             * No canvas:
             *
             * 0 rad aponta para a direita.
             *
             * A posição vertical para baixo
             * corresponde a π/2.
             */

            const startAngle =
                Math.PI / 2;


            const endAngle =
                Math.PI / 2 +
                theta;


            ctx.arc(

                pivotX,
                pivotY,
                radius,

                startAngle,
                endAngle,

                theta < 0

            );


            ctx.stroke();


            // =================================================
            // LETRA θ
            // =================================================

            const midAngle =
                Math.PI / 2 +
                theta / 2;


            const textRadius =
                radius + 20;


            const textX =
                pivotX +
                textRadius *
                Math.cos(midAngle);


            const textY =
                pivotY +
                textRadius *
                Math.sin(midAngle);


            ctx.fillStyle =
                "#f57c00";


            ctx.font =
                "bold 15px Arial";


            ctx.fillText(

                "θ",

                textX,
                textY

            );
        }


        // =====================================================
        // COMPRIMENTO L
        // =====================================================

        const midX =
            (
                pivotX +
                massX
            ) / 2;


        const midY =
            (
                pivotY +
                massY
            ) / 2;


        ctx.fillStyle =
            "black";


        ctx.font =
            "13px Arial";


        ctx.textAlign =
            "left";


        ctx.fillText(

            `L = ${L.toFixed(2)} m`,

            midX + 10,
            midY

        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;


        const index =
            Math.min(

                this.frame,

                this.theta.length - 1

            );


        const theta =
            this.theta[index] || 0;


        const omega =
            this.omega[index] || 0;


        const t =
            this.time[index] || 0;


        // =====================================================
        // POSIÇÃO
        // =====================================================

        const x = 700;
        const y = 60;

        const width = 330;
        const height = 185;


        // =====================================================
        // CAIXA
        // =====================================================

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


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "bold 14px Arial";


        ctx.textAlign =
            "left";


        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(

            "Pêndulo simples",

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
            y + 45

        );


        ctx.fillText(

            `L = ${p.L.toFixed(2)} m`,

            x + 12,
            y + 63

        );


        ctx.fillText(

            `m = ${p.m.toFixed(2)} kg`,

            x + 12,
            y + 81

        );


        ctx.fillText(

            `b = ${p.b.toFixed(2)} kg/s`,

            x + 12,
            y + 99

        );


        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 165;


        ctx.fillText(

            `θ₀ = ${p.theta0.toFixed(2)} rad`,

            col2,
            y + 45

        );


        ctx.fillText(

            `ω₀ = ${p.omega0.toFixed(2)} rad/s`,

            col2,
            y + 63

        );


        // =====================================================
        // REGIME
        // =====================================================

        ctx.font =
            "bold 11px Arial";


        ctx.fillText(

            `Regime: ${this.regime()}`,

            col2,
            y + 83

        );


        // =====================================================
        // ESTADO
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(

            `θ(t) = ${theta.toFixed(3)} rad`,

            col2,
            y + 108

        );


        ctx.fillText(

            `ω(t) = ${omega.toFixed(3)} rad/s`,

            col2,
            y + 126

        );


        ctx.fillText(

            `t = ${t.toFixed(2)} s`,

            col2,
            y + 144

        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 700;
        const graphY = 280;

        const graphW =
            this.canvas.width -
            graphX -
            40;

        const graphH = 300;


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

            graphX + 90,
            graphY - 20

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

                this.frame + 1,
                this.time.length

            );


        if (n < 2)
            return;


        const thetaData =
            this.theta.slice(
                0,
                n
            );


        const omegaData =
            this.omega.slice(
                0,
                n
            );


        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs = 0;


        for (
            const value of thetaData
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(value)

                );
        }


        for (
            const value of omegaData
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(value)

                );
        }


        if (
            maxAbs < 0.001
        )
            maxAbs = 1;


        maxAbs *= 1.15;


        // =====================================================
        // CENTRO
        // =====================================================

        const centerY =
            graphY +
            graphH / 2;


        // =====================================================
        // EIXO ZERO
        // =====================================================

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

        const ticks = 6;


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
                "#777";


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


            if (
                k !== 0
            ) {

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


            ctx.fillStyle =
                "black";


            ctx.fillText(

                value.toFixed(2),

                graphX - 50,
                y + 4

            );
        }


        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks = 5;


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
        // EIXO X
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
        // EIXO Y
        // =====================================================

        ctx.save();


        ctx.translate(

            graphX - 70,

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
        // θ(t)
        // =====================================================

        ctx.lineWidth = 2;


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
                    this.theta[k]
                );


            if (
                k === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }
        }


        ctx.stroke();


        // =====================================================
        // ω(t)
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
                    this.omega[k]
                );


            if (
                k === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }
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
            100,

            graphY + 25

        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(

            "ω(t) [rad/s]",

            graphX +
            graphW -
            110,

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

        if (
            this.running
        )
            return;


        this.running =
            true;


        const loop =
            () => {

                if (
                    !this.running
                )
                    return;


                this.draw();


                // =================================================
                // AVANÇA TEMPO
                // =================================================

                this.frame++;


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

                    this.sliders[key].value =
                        newParams[key];

                }

            }
        );


        this.solve();


        this.draw();
    }
}
