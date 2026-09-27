class SuperposicaoOndas {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            A1: 10,
            A2: 10,

            lambda1: 2,
            lambda2: 2,

            f1: 1,
            f2: 1,

            phi1: 0,
            phi2: Math.PI / 2,

            ...options
        };


        // =====================================================
        // CONFIGURAÇÃO ESPACIAL
        // =====================================================

        this.xMin = 0;
        this.xMax = 10;

        this.N = 1000;


        // =====================================================
        // CONFIGURAÇÃO TEMPORAL
        // =====================================================

        this.t = 0;

        this.dt = 0.02;


        // =====================================================
        // DADOS DAS ONDAS
        // =====================================================

        this.x = [];

        this.y1 = [];
        this.y2 = [];
        this.yResultante = [];


        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;

        this.animationSpeed = 1.0;

        this.frame = 0;


        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();


        // =====================================================
        // SOLUÇÃO INICIAL
        // =====================================================

        this.solve();


        // =====================================================
        // INICIA
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // GERADOR DE ONDA
    // =========================================================

    onda(
        A,
        comprimento_onda,
        f,
        x,
        t,
        phi
    ) {

        return A *
            Math.sin(

                (
                    2 * Math.PI /
                    comprimento_onda
                ) *
                x

                -

                (
                    2 * Math.PI *
                    f
                ) *
                t

                +

                phi

            );
    }


    // =========================================================
    // CALCULA AS ONDAS
    // =========================================================

    solve() {

        const p =
            this.params;


        // =====================================================
        // EIXO X
        // =====================================================

        this.x = [];

        for (
            let i = 0;
            i < this.N;
            i++
        ) {

            const x =
                this.xMin +

                (
                    this.xMax -
                    this.xMin
                ) *

                i /
                (this.N - 1);


            this.x.push(x);
        }


        // =====================================================
        // CALCULA ONDAS
        // =====================================================

        this.y1 = [];
        this.y2 = [];
        this.yResultante = [];


        for (
            let i = 0;
            i < this.N;
            i++
        ) {

            const x =
                this.x[i];


            const y1 =
                this.onda(

                    p.A1,
                    p.lambda1,
                    p.f1,
                    x,
                    this.t,
                    p.phi1

                );


            const y2 =
                this.onda(

                    p.A2,
                    p.lambda2,
                    p.f2,
                    x,
                    this.t,
                    p.phi2

                );


            this.y1.push(y1);

            this.y2.push(y2);

            this.yResultante.push(
                y1 + y2
            );
        }
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "ondas-controls"
            );


        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "ondas-controls";


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
            "Parâmetros das ondas";


        container.appendChild(
            title
        );


        this.sliders = {};


        // =====================================================
        // CONFIGURAÇÕES
        // =====================================================

        const configs = [

            {
                name: "A1",
                label: "A₁ (m)",
                min: -10,
                max: 10,
                step: 0.1
            },

            {
                name: "lambda1",
                label: "λ₁ (m)",
                min: 0.5,
                max: 5,
                step: 0.1
            },

            {
                name: "f1",
                label: "f₁ (Hz)",
                min: 0,
                max: 5,
                step: 0.1
            },

            {
                name: "phi1",
                label: "φ₁ (rad)",
                min: -Math.PI,
                max: Math.PI,
                step: 0.01
            },

            {
                name: "A2",
                label: "A₂ (m)",
                min: -10,
                max: 10,
                step: 0.1
            },

            {
                name: "lambda2",
                label: "λ₂ (m)",
                min: 0.5,
                max: 5,
                step: 0.1
            },

            {
                name: "f2",
                label: "f₂ (Hz)",
                min: 0,
                max: 5,
                step: 0.1
            },

            {
                name: "phi2",
                label: "φ₂ (rad)",
                min: -Math.PI,
                max: Math.PI,
                step: 0.01
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
    // DESENHA UM GRÁFICO
    // =========================================================

    drawGraph(
        ctx,
        graphX,
        graphY,
        graphW,
        graphH,
        data,
        title,
        yLabel
    ) {

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "bold 16px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(

            title,

            graphX +
            graphW / 2,

            graphY - 15

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
        // LINHAS DE GRADE
        // =====================================================

        ctx.strokeStyle =
            "#eeeeee";


        ctx.lineWidth =
            1;


        const horizontalTicks =
            6;


        for (
            let i = 0;
            i <= horizontalTicks;
            i++
        ) {

            const y =
                graphY +
                graphH *
                i /
                horizontalTicks;


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


        const verticalTicks =
            5;


        for (
            let i = 0;
            i <= verticalTicks;
            i++
        ) {

            const x =
                graphX +
                graphW *
                i /
                verticalTicks;


            ctx.beginPath();


            ctx.moveTo(
                x,
                graphY
            );


            ctx.lineTo(
                x,
                graphY + graphH
            );


            ctx.stroke();
        }


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
        // ESCALA VERTICAL
        // =====================================================

        let maxAbs =
            1;


        for (
            const value of data
        ) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(value)
                );
        }


        maxAbs *= 1.15;


        // =====================================================
        // TICKS Y
        // =====================================================

        ctx.font =
            "11px Arial";


        ctx.fillStyle =
            "black";


        ctx.textAlign =
            "right";


        for (
            let i = -5;
            i <= 5;
            i++
        ) {

            const value =
                maxAbs *
                i /
                5;


            const y =
                centerY -

                (
                    value /
                    maxAbs
                ) *

                graphH / 2;


            ctx.fillText(

                value.toFixed(1),

                graphX - 8,
                y + 4

            );
        }


        // =====================================================
        // TICKS X
        // =====================================================

        ctx.textAlign =
            "center";


        for (
            let i = 0;
            i <= verticalTicks;
            i++
        ) {

            const x =
                graphX +
                graphW *
                i /
                verticalTicks;


            const value =
                this.xMin +

                (
                    this.xMax -
                    this.xMin
                ) *

                i /
                verticalTicks;


            ctx.fillText(

                value.toFixed(1),

                x,
                graphY +
                graphH +
                17

            );
        }


        // =====================================================
        // CURVA
        // =====================================================

        const convertX =
            x => {

                return graphX +

                    (
                        x -
                        this.xMin
                    ) /

                    (
                        this.xMax -
                        this.xMin
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

                    graphH / 2;
            };


        ctx.strokeStyle =
            "#1976d2";


        ctx.lineWidth =
            2;


        ctx.beginPath();


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const px =
                convertX(
                    this.x[i]
                );


            const py =
                convertY(
                    data[i]
                );


            if (i === 0) {

                ctx.moveTo(
                    px,
                    py
                );

            }

            else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }


        ctx.stroke();


        // =====================================================
        // LABEL X
        // =====================================================

        ctx.font =
            "13px Arial";


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "black";


        ctx.fillText(

            "x [m]",

            graphX +
            graphW / 2,

            graphY +
            graphH +
            40

        );


        // =====================================================
        // LABEL Y
        // =====================================================

        ctx.save();


        ctx.translate(

            graphX - 45,

            graphY +
            graphH / 2

        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.fillText(

            yLabel,

            0,
            0

        );


        ctx.restore();
    }


    // =========================================================
    // SÍMBOLO ENTRE GRÁFICOS
    // =========================================================

    drawSymbol(
        ctx,
        symbol,
        x,
        y
    ) {

        ctx.fillStyle =
            "black";


        ctx.font =
            "bold 35px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(

            symbol,

            x,
            y

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

        const width = 250;
        const height = 110;


        ctx.save();


        // =====================================================
        // CAIXA
        // =====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.95)";


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
            8

        );


        ctx.fill();
        ctx.stroke();


        // =====================================================
        // TEXTO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.textAlign =
            "left";


        ctx.font =
            "bold 14px Arial";


        ctx.fillText(

            "Superposição de ondas",

            x + 12,
            y + 20

        );


        ctx.font =
            "12px Arial";


        ctx.fillText(

            `t = ${this.t.toFixed(2)} s`,

            x + 12,
            y + 43

        );


        ctx.fillText(

            `A₁ = ${p.A1.toFixed(2)} m`,

            x + 12,
            y + 61

        );


        ctx.fillText(

            `A₂ = ${p.A2.toFixed(2)} m`,

            x + 12,
            y + 79

        );


        ctx.fillText(

            `y = y₁ + y₂`,

            x + 130,
            y + 43

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
        // CONFIGURAÇÃO DOS GRÁFICOS
        // =====================================================

        const graphY =
            100;


        const graphH =
            350;


        const graphW =
            250;


        const graph1X =
            50;


        const graph2X =
            380;


        const graph3X =
            710;


        // =====================================================
        // GRÁFICO 1
        // =====================================================

        this.drawGraph(

            ctx,

            graph1X,
            graphY,
            graphW,
            graphH,

            this.y1,

            "y₁(x,t)",

            "y₁ [m]"

        );


        // =====================================================
        // SINAL +
        // =====================================================

        this.drawSymbol(

            ctx,

            "+",

            graph1X +
            graphW +
            40,

            graphY +
            graphH / 2

        );


        // =====================================================
        // GRÁFICO 2
        // =====================================================

        this.drawGraph(

            ctx,

            graph2X,
            graphY,
            graphW,
            graphH,

            this.y2,

            "y₂(x,t)",

            "y₂ [m]"

        );


        // =====================================================
        // SINAL =
        // =====================================================

        this.drawSymbol(

            ctx,

            "=",

            graph2X +
            graphW +
            40,

            graphY +
            graphH / 2

        );


        // =====================================================
        // GRÁFICO RESULTANTE
        // =====================================================

        this.drawGraph(

            ctx,

            graph3X,
            graphY,
            graphW,
            graphH,

            this.yResultante,

            "y₁(x,t) + y₂(x,t)",

            "y₁ + y₂ [m]"

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
            // ATUALIZA TEMPO
            // =================================================

            this.t +=
                this.dt *
                this.animationSpeed;


            // =================================================
            // CALCULA NOVAS ONDAS
            // =================================================

            this.solve();


            // =================================================
            // DESENHA
            // =================================================

            this.draw();


            // =================================================
            // LOOP
            // =================================================

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
