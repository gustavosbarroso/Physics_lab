
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

            // Internamente sempre em radianos
            theta0: 0.5 * Math.PI / 180,
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

        this.animationSpeed = 1.0;

        // =====================================================
        // GEOMETRIA DO PÊNDULO
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
         * Pêndulo simples:
         *
         * θ' = ω
         *
         * ω' = -(g/L) sin(θ)
         */

        return [

            omega,

            -(
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
                label: "θ₀ (rad)",

                // Slider diretamente em radianos
                min: -Math.PI,
                max: Math.PI,
                step: 0.01
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

                // =================================================
                // LABEL
                // =================================================

                const label =
                    document.createElement(
                        "label"
                    );

                label.style.width =
                    "100px";

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

                slider.min =
                    config.min;

                slider.max =
                    config.max;

                slider.step =
                    config.step;

                // Valor interno já está em radianos
                const initialValue =
                    this.params[
                        config.name
                    ];

                slider.value =
                    initialValue;

                slider.style.flex =
                    "1";

                // =================================================
                // VALOR
                // =================================================

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

                // =================================================
                // EVENTO
                // =================================================

                slider.addEventListener(
                    "input",
                    () => {

                        // Slider já está em radianos
                        const v =
                            Number(
                                slider.value
                            );

                        this.params[
                            config.name
                        ] = v;

                        // Atualiza valor mostrado
                        value.innerText =
                            v.toFixed(2);

                        // Recalcula
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
        // FRAME DA SOLUÇÃO NUMÉRICA
        // =====================================================

        const index =
            Math.min(

                Math.floor(this.frame),

                this.theta.length - 1

            );

        // =====================================================
        // ÂNGULO DA SOLUÇÃO NUMÉRICA
        // =====================================================

        const theta =
            this.theta[index] || 0;

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
        // HACHURAS DO SUPORTE
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

        const x = 15;
        const y = 15;

        const width = 275;
        const height = 125;

        ctx.save();

        // =====================================================
        // CAIXA
        // =====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.94)";

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
        // ÍNDICE
        // =====================================================

        const index =
            Math.min(

                Math.floor(this.frame),

                this.theta.length - 1

            );

        // =====================================================
        // THETA DA SOLUÇÃO NUMÉRICA
        // =====================================================

        const theta =
            this.theta[index] || 0;

        const omega =
            this.omega[index] || 0;

        const t =
            this.time[index] || 0;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "alphabetic";

        ctx.fillText(

            "Pêndulo simples",

            x + 10,
            y + 17

        );

        // =====================================================
        // TEXTO
        // =====================================================

        ctx.font =
            "10px Arial";

        // =====================================================
        // COLUNA 1
        // =====================================================

        ctx.fillText(

            `g = ${p.g.toFixed(2)} m/s²`,

            x + 10,
            y + 38

        );

        ctx.fillText(

            `L = ${p.L.toFixed(2)} m`,

            x + 10,
            y + 54

        );

        ctx.fillText(

            `θ₀ = ${p.theta0.toFixed(2)} rad`,

            x + 10,
            y + 70

        );

        ctx.fillText(

            `ω₀ = ${p.omega0.toFixed(2)} rad/s`,

            x + 10,
            y + 86

        );

        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 140;

        ctx.fillText(

            `θ(t) = ${theta.toFixed(2)} rad`,

            col2,
            y + 38

        );

        ctx.fillText(

            `ω(t) = ${omega.toFixed(2)} rad/s`,

            col2,
            y + 54

        );

        ctx.fillText(

            `t = ${t.toFixed(2)} s`,

            col2,
            y + 70

        );

        ctx.fillText(

            `ω₀,n = ${this.naturalFrequency().toFixed(3)} rad/s`,

            col2,
            y + 86

        );

        ctx.fillText(

            `T ≈ ${this.periodSmallAngle().toFixed(3)} s`,

            col2,
            y + 102

        );

        // =====================================================
        // OBSERVAÇÃO
        // =====================================================

        ctx.font =
            "bold 9px Arial";

        ctx.fillText(

            "Aproximação de pequeno ângulo",

            x + 10,
            y + 112

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

        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs =
            0;

        for (
            let k = 0;
            k < n;
            k++
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(
                        this.theta[k]
                    ),

                    Math.abs(
                        this.omega[k]
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
                )
                *
                (
                    graphH / 2
                );

            // =================================================
            // TICK
            // =================================================

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

            // =================================================
            // GRID
            // =================================================

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

            // =================================================
            // VALOR EM RADIANOS
            // =================================================

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

            "θ(t) [rad] / ω(t) [rad/s]",

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
                        maxAbs
                    )
                    *
                    (
                        graphH / 2
                    );

            };

        // =====================================================
        // θ(t)
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
                    this.theta[k]
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
            // AVANÇA PRIMEIRO
            // =================================================

            this.frame +=
                this.animationSpeed;

            // =================================================
            // LOOP
            // =================================================

            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;

            }

            // =================================================
            // DESENHA
            // =================================================

            this.draw();

            requestAnimationFrame(
                loop
            );
        };

        // Primeiro desenho
        this.draw();

        requestAnimationFrame(
            loop
        );
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
                    this.sliders[key]
                ) {

                    // Todos os sliders usam diretamente
                    // as unidades internas do sistema.
                    this.sliders[key].value =
                        newParams[key];

                }

            }
        );

        // =====================================================
        // RECALCULA
        // =====================================================

        this.solve();

        this.draw();
    }
}
```


