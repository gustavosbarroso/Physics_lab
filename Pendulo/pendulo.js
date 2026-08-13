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

            // Internamente continua em radianos
            theta0: 0.5,
            omega0: 0.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.theta = [];
        this.omega = [];

        this.running = false;

        // frame pode ser fracionário
        this.frame = 0;

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 1000;

        // =====================================================
        // CONFIGURAÇÃO DA ANIMAÇÃO
        // =====================================================

        this.animationSpeed = 1.2;

        // =====================================================
        // GEOMETRIA DO PÊNDULO
        // =====================================================

        this.pivotX = 300;
        this.pivotY = 130;

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
        // INICIA
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

        /*
         * θ' = ω
         *
         * ω' = -(g/L) sin(θ)
         */

        return [

            omega,

            -
            (
                p.g /
                p.L
            )
            *
            Math.sin(theta)

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

            a[0] +
            2 * b[0] +
            2 * c[0] +
            d[0],

            a[1] +
            2 * b[1] +
            2 * c[1] +
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
    // ESTADO ATUAL
    //
    // Usa interpolação para que o valor mostrado acompanhe
    // suavemente a animação.
    // =========================================================

    getCurrentState() {

        if (this.theta.length === 0) {

            return {

                theta: 0,
                omega: 0,
                time: 0

            };
        }


        const maxIndex =
            this.theta.length - 1;


        const frame =
            Math.min(
                Math.max(this.frame, 0),
                maxIndex
            );


        const i0 =
            Math.floor(frame);


        const i1 =
            Math.min(
                i0 + 1,
                maxIndex
            );


        const fraction =
            frame - i0;


        // =====================================================
        // INTERPOLAÇÃO LINEAR
        // =====================================================

        const theta =
            this.theta[i0] +

            (
                this.theta[i1] -
                this.theta[i0]
            )
            *
            fraction;


        const omega =
            this.omega[i0] +

            (
                this.omega[i1] -
                this.omega[i0]
            )
            *
            fraction;


        const time =
            this.time[i0] +

            (
                this.time[i1] -
                this.time[i0]
            )
            *
            fraction;


        return {

            theta,
            omega,
            time

        };
    }


    // =========================================================
    // PERÍODO
    // =========================================================

    periodSmallAngle() {

        const p =
            this.params;

        return (
            2 *
            Math.PI *
            Math.sqrt(
                p.L / p.g
            )
        );
    }


    // =========================================================
    // FREQUÊNCIA NATURAL
    // =========================================================

    naturalFrequency() {

        const p =
            this.params;

        return Math.sqrt(
            p.g / p.L
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
            document.createElement(
                "div"
            );


        container.id =
            "pendulum-controls";


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
                step: 0.1
            },

            {
                name: "theta0",
                label: "θ₀ (graus)",
                min: -170,
                max: 170,
                step: 1,

                convert: value =>
                    value *
                    Math.PI /
                    180
            },

            {
                name: "omega0",
                label: "ω₀ (rad/s)",
                min: -10,
                max: 10,
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


                let initialValue =
                    this.params[
                        config.name
                    ];


                // Converte rad → graus
                // apenas para mostrar no slider

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
                        initialValue
                    ).toFixed(2);


                // -------------------------------------------------
                // EVENTO
                // -------------------------------------------------

                slider.addEventListener(
                    "input",
                    () => {

                        let v =
                            Number(
                                slider.value
                            );


                        if (config.convert) {

                            v =
                                config.convert(v);
                        }


                        this.params[
                            config.name
                        ] = v;


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
    // DESENHO DO PÊNDULO
    // =========================================================

    drawPendulum(ctx) {

        ctx.save();


        // =====================================================
        // ESTADO ATUAL INTERPOLADO
        // =====================================================

        const state =
            this.getCurrentState();


        const theta =
            state.theta;


        // =====================================================
        // POSIÇÃO DO PIVÔ
        // =====================================================

        const px =
            this.pivotX;


        const py =
            this.pivotY;


        // =====================================================
        // COMPRIMENTO VISUAL
        // =====================================================

        const L =
            this.pendulumLength;


        // =====================================================
        // POSIÇÃO DA MASSA
        // =====================================================

        const bx =
            px +
            L *
            Math.sin(theta);


        const by =
            py +
            L *
            Math.cos(theta);


        // =====================================================
        // TETO
        // =====================================================

        ctx.strokeStyle =
            "black";


        ctx.fillStyle =
            "black";


        ctx.lineWidth =
            4;


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

        ctx.lineWidth =
            2;


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


        // =====================================================
        // CORDA
        // =====================================================

        ctx.lineWidth =
            3;


        ctx.strokeStyle =
            "black";


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


        // =====================================================
        // PIVÔ
        // =====================================================

        ctx.fillStyle =
            "#333";


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

        ctx.fillStyle =
            "#1976d2";


        ctx.strokeStyle =
            "#111";


        ctx.lineWidth =
            2;


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
        // RAIO VERTICAL DE REFERÊNCIA
        // =====================================================

        ctx.strokeStyle =
            "#aaaaaa";


        ctx.lineWidth =
            1;


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


        // =====================================================
        // ARCO DO ÂNGULO
        // =====================================================

        if (
            Math.abs(theta) > 0.01
        ) {

            ctx.strokeStyle =
                "#d32f2f";


            ctx.lineWidth =
                2;


            ctx.beginPath();


            const arcRadius =
                55;


            ctx.arc(

                px,
                py,

                arcRadius,

                Math.PI / 2,

                Math.PI / 2 + theta,

                theta < 0

            );


            ctx.stroke();


            // -------------------------------------------------
            // θ
            // -------------------------------------------------

            ctx.fillStyle =
                "#d32f2f";


            ctx.font =
                "bold 16px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            const labelAngle =
                Math.PI / 2 +
                theta / 2;


            const labelRadius =
                75;


            const tx =
                px +
                labelRadius *
                Math.cos(
                    labelAngle
                );


            const ty =
                py +
                labelRadius *
                Math.sin(
                    labelAngle
                );


            ctx.fillText(
                "θ",
                tx,
                ty
            );
        }


        // =====================================================
        // COMPRIMENTO L
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.font =
            "14px Arial";


        ctx.textAlign =
            "left";


        ctx.textBaseline =
            "middle";


        const midX =
            (
                px +
                bx
            ) / 2;


        const midY =
            (
                py +
                by
            ) / 2;


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


        // =====================================================
        // POSIÇÃO
        // =====================================================

        const x = 20;
        const y = 20;


        const width = 315;
        const height = 150;


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
        // ESTADO ATUAL
        // =====================================================

        const state =
            this.getCurrentState();


        const theta =
            state.theta;


        const omega =
            state.omega;


        const t =
            state.time;


        // =====================================================
        // CONVERSÃO PARA GRAUS
        // =====================================================

        const thetaDegrees =
            theta *
            180 /
            Math.PI;


        const theta0Degrees =
            p.theta0 *
            180 /
            Math.PI;


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
            y + 42

        );


        ctx.fillText(

            `L = ${p.L.toFixed(2)} m`,

            x + 12,
            y + 60

        );


        ctx.fillText(

            `θ₀ = ${theta0Degrees.toFixed(2)}°`,

            x + 12,
            y + 78

        );


        ctx.fillText(

            `ω₀ = ${p.omega0.toFixed(3)} rad/s`,

            x + 12,
            y + 96

        );


        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 165;


        ctx.fillText(

            `θ(t) = ${thetaDegrees.toFixed(2)}°`,

            col2,
            y + 42

        );


        ctx.fillText(

            `ω(t) = ${omega.toFixed(3)} rad/s`,

            col2,
            y + 60

        );


        ctx.fillText(

            `t = ${t.toFixed(2)} s`,

            col2,
            y + 78

        );


        ctx.fillText(

            `ω₀,n = ${this.naturalFrequency().toFixed(3)} rad/s`,

            col2,
            y + 96

        );


        ctx.fillText(

            `T ≈ ${this.periodSmallAngle().toFixed(3)} s`,

            col2,
            y + 114

        );


        ctx.font =
            "bold 11px Arial";


        ctx.fillText(

            "Aproximação de pequeno ângulo",

            x + 12,
            y + 132

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

            graphX + 100,
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

        let maxTheta =
            0;


        let maxOmega =
            0;


        for (
            const value of thetaData
        ) {

            maxTheta =
                Math.max(

                    maxTheta,

                    Math.abs(
                        value *
                        180 /
                        Math.PI
                    )

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


        const maxAbs =
            Math.max(
                maxTheta,
                maxOmega
            );


        let scaleMax =
            maxAbs;


        if (scaleMax < 0.001)
            scaleMax = 1;


        scaleMax *= 1.15;


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
                scaleMax *
                k /
                ticks;


            const y =
                centerY -
                (
                    value /
                    scaleMax
                )
                *
                (
                    graphH / 2
                );


            // -------------------------------------------------
            // TICK
            // -------------------------------------------------

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
            // VALOR
            // -------------------------------------------------

            ctx.fillStyle =
                "black";


            ctx.fillText(

                value.toFixed(0),

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

            "θ(t) [graus] / ω(t) [rad/s]",

            0,
            0

        );


        ctx.restore();


        // =====================================================
        // CONVERSÃO X
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


        // =====================================================
        // CONVERSÃO Y
        // =====================================================

        const convertY =
            value => {

                return centerY -

                    (
                        value /
                        scaleMax
                    )
                    *
                    (
                        graphH / 2
                    );

            };


        // =====================================================
        // θ(t)
        //
        // CONVERTIDO PARA GRAUS
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


            const thetaDegrees =
                this.theta[k] *
                180 /
                Math.PI;


            const y =
                convertY(
                    thetaDegrees
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

            "θ(t) [graus]",

            graphX +
            graphW -
            110,

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


            // =================================================
            // DESENHA
            // =================================================

            this.draw();


            // =================================================
            // AVANÇA TEMPO
            // =================================================

            this.frame +=
                this.animationSpeed;


            // =================================================
            // LOOP
            // =================================================

            if (
                this.frame >=
                this.time.length - 1
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

                    let value =
                        newParams[key];


                    // rad → graus para o slider
                    if (
                        key === "theta0"
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
