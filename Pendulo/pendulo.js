class SimplePendulum {

    constructor(canvas, options = {}) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");


        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            g: 9.81,

            L: 1.0,

            m: 1.0,

            b: 0.5,

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
        // GEOMETRIA
        // =====================================================

        this.pivotX = 260;

        this.pivotY = 150;


        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();


        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();


        // =====================================================
        // PRIMEIRO DESENHO
        // =====================================================

        this.draw();


        // =====================================================
        // INICIA
        // =====================================================

        this.iniciar();

    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const theta =
            state[0];

        const omega =
            state[1];


        const p =
            this.params;


        /*
         * Equação:
         *
         * θ' = ω
         *
         * ω' =
         *
         * -(g/L) sin(θ)
         * -(b/m) ω
         */

        return [

            omega,

            -
            (p.g / p.L)
            *
            Math.sin(theta)

            -
            (p.b / p.m)
            *
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

        const a =
            this.t0;

        const b =
            this.tf;

        const N =
            this.N;


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


            // =================================================
            // SALVA ESTADO
            // =================================================

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

        const p =
            this.params;


        const omega0 =
            Math.sqrt(
                p.g / p.L
            );


        const gamma =
            p.b /
            (2 * p.m);


        const delta =
            gamma * gamma
            -
            omega0 * omega0;


        // =====================================================
        // SEM AMORTECIMENTO
        // =====================================================

        if (
            Math.abs(p.b)
            <
            1e-6
        ) {

            return "Sem amortecimento";

        }


        // =====================================================
        // CRÍTICO
        // =====================================================

        if (
            Math.abs(delta)
            <
            1e-3
        ) {

            return "Criticamente amortecido";

        }


        // =====================================================
        // SUPERAMORTECIDO
        // =====================================================

        if (
            delta > 0
        ) {

            return "Superamortecido";

        }


        // =====================================================
        // SUBAMORTECIDO
        // =====================================================

        return "Subamortecido";

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

                step: 0.01
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

                max: 50,

                step: 0.1
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


        // =====================================================
        // CRIAÇÃO
        // =====================================================

        configs.forEach(
            config => {


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "control-row";


                // =================================================
                // LABEL
                // =================================================

                const label =
                    document.createElement(
                        "label"
                    );


                label.className =
                    "control-label";


                label.innerText =
                    config.label;


                // =================================================
                // SLIDER
                // =================================================

                const slider =
                    document.createElement(
                        "input"
                    );


                slider.type =
                    "range";


                slider.className =
                    "control-slider";


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


                // =================================================
                // VALOR
                // =================================================

                const value =
                    document.createElement(
                        "span"
                    );


                value.className =
                    "control-value";


                value.innerText =
                    Number(
                        this.params[
                            config.name
                        ]
                    ).toFixed(2);


                // =================================================
                // EVENTO
                // =================================================

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


                        // Resolve novamente

                        this.solve();


                        // Desenha novamente

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

    }


    // =========================================================
    // DESENHO DO PÊNDULO
    // =========================================================

    drawPendulum(ctx) {

        const L =
            this.params.L;


        const index =
            Math.min(

                this.frame,

                this.theta.length - 1

            );


        const theta =
            this.theta[index] || 0;


        // =====================================================
        // ÁREA
        // =====================================================

        const areaX = 30;

        const areaY = 40;

        const areaW = 450;

        const areaH = 540;


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

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(

            "Pêndulo simples",

            areaX +
            areaW / 2,

            areaY + 30

        );


        // =====================================================
        // ESCALA VISUAL
        // =====================================================

        const maxVisualLength =
            330;


        const scale =
            maxVisualLength /
            Math.max(
                L,
                0.1
            );


        const visualLength =
            L * scale;


        // =====================================================
        // POSIÇÃO DA MASSA
        // =====================================================

        const x =
            this.pivotX +

            visualLength *
            Math.sin(theta);


        const y =
            this.pivotY +

            visualLength *
            Math.cos(theta);


        // =====================================================
        // LINHA DE REFERÊNCIA
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

            this.pivotX,

            this.pivotY

        );


        ctx.lineTo(

            this.pivotX,

            this.pivotY +
            visualLength

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

            this.pivotX - 45,

            this.pivotY

        );


        ctx.lineTo(

            this.pivotX + 45,

            this.pivotY

        );


        ctx.stroke();


        // =====================================================
        // PONTO DE SUSPENSÃO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.beginPath();


        ctx.arc(

            this.pivotX,

            this.pivotY,

            6,

            0,

            2 * Math.PI

        );


        ctx.fill();


        // =====================================================
        // HASTE
        // =====================================================

        ctx.strokeStyle =
            "#333";

        ctx.lineWidth = 3;


        ctx.beginPath();


        ctx.moveTo(

            this.pivotX,

            this.pivotY

        );


        ctx.lineTo(

            x,

            y

        );


        ctx.stroke();


        // =====================================================
        // MASSA
        // =====================================================

        ctx.fillStyle =
            "#168aad";


        ctx.beginPath();


        ctx.arc(

            x,

            y,

            18,

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

            x,

            y

        );


        // =====================================================
        // ÂNGULO
        // =====================================================

        if (
            Math.abs(theta)
            >
            0.02
        ) {


            const radius =
                65;


            ctx.strokeStyle =
                "#f57c00";

            ctx.lineWidth = 2;


            const startAngle =
                Math.PI / 2;


            const endAngle =
                Math.PI / 2 +
                theta;


            ctx.beginPath();


            ctx.arc(

                this.pivotX,

                this.pivotY,

                radius,

                startAngle,

                endAngle,

                theta < 0

            );


            ctx.stroke();


            // =================================================
            // TEXTO θ
            // =================================================

            const midAngle =
                Math.PI / 2 +
                theta / 2;


            const textRadius =
                radius + 18;


            const tx =
                this.pivotX +

                textRadius *
                Math.cos(
                    midAngle
                );


            const ty =
                this.pivotY +

                textRadius *
                Math.sin(
                    midAngle
                );


            ctx.fillStyle =
                "#f57c00";


            ctx.font =
                "bold 15px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(

                "θ",

                tx,

                ty

            );

        }


        // =====================================================
        // COMPRIMENTO
        // =====================================================

        ctx.fillStyle =
            "#333";


        ctx.font =
            "14px Arial";


        ctx.textAlign =
            "left";


        ctx.textBaseline =
            "middle";


        const labelX =
            this.pivotX + 15;


        const labelY =
            this.pivotY +
            visualLength / 2;


        ctx.fillText(

            `L = ${L.toFixed(2)} m`,

            labelX,

            labelY

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

        const x = 510;

        const y = 25;

        const width = 430;

        const height = 180;


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
            "bold 15px Arial";


        ctx.textAlign =
            "left";


        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(

            "Informações do pêndulo",

            x + 12,

            y + 22

        );


        // =====================================================
        // COLUNA 1
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(

            `L = ${p.L.toFixed(2)} m`,

            x + 12,

            y + 48

        );


        ctx.fillText(

            `g = ${p.g.toFixed(2)} m/s²`,

            x + 12,

            y + 66

        );


        ctx.fillText(

            `m = ${p.m.toFixed(2)} kg`,

            x + 12,

            y + 84

        );


        ctx.fillText(

            `b = ${p.b.toFixed(2)} kg/s`,

            x + 12,

            y + 102

        );


        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 215;


        ctx.fillText(

            `θ₀ = ${p.theta0.toFixed(2)} rad`,

            col2,

            y + 48

        );


        ctx.fillText(

            `ω₀ = ${p.omega0.toFixed(2)} rad/s`,

            col2,

            y + 66

        );


        // =====================================================
        // REGIME
        // =====================================================

        ctx.font =
            "bold 11px Arial";


        ctx.fillText(

            `Regime: ${this.regime()}`,

            col2,

            y + 88

        );


        // =====================================================
        // ESTADO
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(

            `θ(t) = ${theta.toFixed(3)} rad`,

            col2,

            y + 112

        );


        ctx.fillText(

            `ω(t) = ${omega.toFixed(3)} rad/s`,

            col2,

            y + 130

        );


        ctx.fillText(

            `t = ${t.toFixed(2)} s`,

            col2,

            y + 148

        );

    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 510;

        const graphY = 240;

        const graphW = 600;

        const graphH = 260;


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

            "Evolução temporal",

            graphX +
            graphW / 2,

            graphY - 15

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

        let maxTheta = 0;

        let maxOmega = 0;


        for (
            const value of thetaData
        ) {

            maxTheta =
                Math.max(

                    maxTheta,

                    Math.abs(value)

                );

        }


        for (
            const value of omegaData
        ) {

            maxOmega =
                Math.max(

                    maxOmega,

                    Math.abs(value)

                );

        }


        if (
            maxTheta < 0.001
        )
            maxTheta = 1;


        if (
            maxOmega < 0.001
        )
            maxOmega = 1;


        maxTheta *= 1.15;

        maxOmega *= 1.15;


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
        // CONVERSÃO X
        // =====================================================

        const convertX =
            t => {

                return (

                    graphX +

                    (
                        t /
                        this.tf
                    )
                    *
                    graphW

                );

            };


        // =====================================================
        // CONVERSÃO θ
        // =====================================================

        const convertYTheta =
            value => {

                return (

                    centerY -

                    (
                        value /
                        maxTheta
                    )
                    *
                    (
                        graphH / 2
                    )

                );

            };


        // =====================================================
        // CONVERSÃO ω
        // =====================================================

        const convertYOmega =
            value => {

                return (

                    centerY -

                    (
                        value /
                        maxOmega
                    )
                    *
                    (
                        graphH / 2
                    )

                );

            };


        // =====================================================
        // GRADE
        // =====================================================

        ctx.strokeStyle =
            "#eeeeee";


        for (
            let k = 1;
            k < 5;
            k++
        ) {

            const y =
                graphY +
                graphH *
                k /
                5;


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


        // =====================================================
        // θ(t)
        // =====================================================

        ctx.strokeStyle =
            "#1976d2";

        ctx.lineWidth = 2;


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
                convertYTheta(
                    this.theta[k]
                );


            if (k === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

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
                convertYOmega(
                    this.omega[k]
                );


            if (k === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }


        ctx.stroke();


        // =====================================================
        // EIXO X
        // =====================================================

        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";


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

                centerY - 4

            );


            ctx.lineTo(

                x,

                centerY + 4

            );


            ctx.stroke();


            ctx.fillStyle =
                "black";


            ctx.fillText(

                time.toFixed(1),

                x,

                graphY +
                graphH +
                18

            );

        }


        // =====================================================
        // LABEL X
        // =====================================================

        ctx.font =
            "13px Arial";


        ctx.fillText(

            "t [s]",

            graphX +
            graphW / 2,

            graphY +
            graphH +
            38

        );


        // =====================================================
        // LABEL Y
        // =====================================================

        ctx.save();


        ctx.translate(

            graphX - 35,

            graphY +
            graphH / 2

        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "black";


        ctx.fillText(

            "θ(t) [rad] / ω(t) [rad/s]",

            0,

            0

        );


        ctx.restore();


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.textAlign =
            "left";

        ctx.font =
            "13px Arial";


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(

            "θ(t) [rad]",

            graphX + 15,

            graphY + 22

        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(

            "ω(t) [rad/s]",

            graphX + 15,

            graphY + 42

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


                // Desenha

                this.draw();


                // Avança

                this.frame++;


                // Reinicia

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


        // =====================================================
        // ATUALIZA SLIDERS
        // =====================================================

        Object.keys(
            newParams
        ).forEach(
            key => {


                if (
                    this.sliders &&
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];

                }

            }
        );


        // =====================================================
        // RESOLVE
        // =====================================================

        this.solve();


        // =====================================================
        // REDESENHA
        // =====================================================

        this.draw();

    }

}
