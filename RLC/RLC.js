class RLCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            R: 2.0,
            L: 1.0,
            C: 1.0,

            q0: 0.0,
            i0: 0.0,

            V0: 5.0,
            omega: 2.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.q = [];
        this.current = [];

        this.running = false;
        this.frame = 0;

        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 500;

        // =====================================================
        // CONFIGURAÇÃO DA ANIMAÇÃO
        // =====================================================

        this.electronCount = 20;
        this.electronPositions = [];

        // =====================================================
        // GEOMETRIA DO CIRCUITO
        // =====================================================

        this.x0 = 120;
        this.x1 = 620;

        this.y0 = 120;
        this.y1 = 380;

        this.coilStart = 270;
        this.coilEnd = 420;

        this.resStart = 270;
        this.resEnd = 420;

        this.capY1 = 220;
        this.capY2 = 255;

        this.sourceY = 250;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // CAMINHO DOS ELÉTRONS
        // =====================================================

        this.createCircuitPath();

        this.resetElectrons();

        // =====================================================
        // INICIA
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const q = state[0];
        const i = state[1];

        const p = this.params;

        /*
         * Fonte AC:
         *
         * V(t) = V0 cos(ωt)
         */

        const Vt =
            p.V0 *
            Math.cos(
                p.omega * t
            );

        return [

            i,

            (Vt / p.L)
            -
            (p.R / p.L) * i
            -
            (1 / (p.L * p.C)) * q

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

            this.params.q0,
            this.params.i0

        ];

        this.time = [];
        this.q = [];
        this.current = [];


        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;

            this.time.push(t);
            this.q.push(state[0]);
            this.current.push(state[1]);


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
    // CLASSIFICAÇÃO
    // =========================================================

    regime() {

        const p = this.params;

        const omega0 =
            1 /
            Math.sqrt(
                p.L * p.C
            );

        const gamma =
            p.R /
            (2 * p.L);


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
                "rlc-controls"
            );

        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );

        container.id =
            "rlc-controls";

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
            "Parâmetros do circuito";

        container.appendChild(title);


        this.sliders = {};


        const configs = [

            {
                name: "R",
                label: "R (Ω)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                name: "L",
                label: "L (H)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "C",
                label: "C (F)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "V0",
                label: "V₀ (V)",
                min: 0,
                max: 10,
                step: 0.1
            },

            {
                name: "omega",
                label: "ω (rad/s)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                name: "q0",
                label: "q₀ (C)",
                min: -20,
                max: 20,
                step: 0.1
            },

            {
                name: "i0",
                label: "i₀ (A)",
                min: -20,
                max: 20,
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
                    "100px";

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

                slider.value =
                    this.params[
                        config.name
                    ];

                slider.style.flex =
                    "1";


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

                        this.resetElectrons();

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
            }
        );


        this.canvas.parentNode.insertBefore(
            container,
            this.canvas.nextSibling
        );
    }


    // =========================================================
    // CAMINHO DOS ELÉTRONS
    // =========================================================

    createCircuitPath() {

        this.path = [];

        const x0 = this.x0;
        const x1 = this.x1;
        const y0 = this.y0;
        const y1 = this.y1;


        /*
         * Caminho retangular.
         *
         * Isso representa o caminho fechado da corrente.
         */

        // lado esquerdo

        for (
            let y = y0;
            y <= y1;
            y += 3
        ) {

            this.path.push({
                x: x0,
                y: y
            });
        }


        // parte inferior

        for (
            let x = x0;
            x <= x1;
            x += 3
        ) {

            this.path.push({
                x: x,
                y: y1
            });
        }


        // lado direito

        for (
            let y = y1;
            y >= y0;
            y -= 3
        ) {

            this.path.push({
                x: x1,
                y: y
            });
        }


        // parte superior

        for (
            let x = x1;
            x >= x0;
            x -= 3
        ) {

            this.path.push({
                x: x,
                y: y0
            });
        }


        this.pathLength =
            this.path.length;
    }


    resetElectrons() {

        this.electronPositions = [];


        for (
            let k = 0;
            k < this.electronCount;
            k++
        ) {

            this.electronPositions.push(

                k *
                this.pathLength /
                this.electronCount

            );
        }
    }


    // =========================================================
    // DESENHO DO CIRCUITO
    // =========================================================

    drawCircuit(ctx) {

        const x0 = this.x0;
        const x1 = this.x1;

        const y0 = this.y0;
        const y1 = this.y1;


        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";


        // =====================================================
        // FIO ESQUERDO
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x0,
            y1
        );

        ctx.stroke();


        // =====================================================
        // FIO SUPERIOR ATÉ O INDUTOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            this.coilStart,
            y0
        );

        ctx.stroke();


        // =====================================================
        // INDUTOR
        // =====================================================

        const coilStart =
            this.coilStart;

        const coilEnd =
            this.coilEnd;


        ctx.beginPath();


        for (
            let k = 0;
            k <= 100;
            k++
        ) {

            const t =
                k / 100;

            const x =
                coilStart +
                (coilEnd - coilStart) *
                t;

            const y =
                y0 +
                15 *
                Math.sin(
                    4 *
                    Math.PI *
                    t
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
        // FIO APÓS INDUTOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            coilEnd,
            y0
        );

        ctx.lineTo(
            x1,
            y0
        );

        ctx.stroke();


        // =====================================================
        // LETRA L
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "L",
            340,
            y0 - 30
        );


        // =====================================================
        // LADO DIREITO - PARTE SUPERIOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y0
        );

        ctx.lineTo(
            x1,
            this.capY1
        );

        ctx.stroke();


        // =====================================================
        // CAPACITOR
        // =====================================================

        ctx.lineWidth = 4;


        /*
         * Como o fio é vertical,
         * as placas precisam ser horizontais.
         *
         * Portanto as placas são perpendiculares
         * ao fio.
         */

        ctx.beginPath();

        ctx.moveTo(
            x1 - 25,
            this.capY1
        );

        ctx.lineTo(
            x1 + 25,
            this.capY1
        );


        ctx.moveTo(
            x1 - 25,
            this.capY2
        );

        ctx.lineTo(
            x1 + 25,
            this.capY2
        );

        ctx.stroke();


        // =====================================================
        // FIO APÓS CAPACITOR
        // =====================================================

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            x1,
            this.capY2
        );

        ctx.lineTo(
            x1,
            y1
        );

        ctx.stroke();


        // =====================================================
        // LETRA C
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "C",
            x1 + 35,
            245
        );


        // =====================================================
        // FIO INFERIOR ATÉ O RESISTOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            this.resEnd,
            y1
        );

        ctx.stroke();


        // =====================================================
        // RESISTOR
        // =====================================================

        const resStart =
            this.resStart;

        const resEnd =
            this.resEnd;


        ctx.beginPath();


        const points = 8;


        for (
            let k = 0;
            k <= points;
            k++
        ) {

            const t =
                k / points;

            const x =
                resStart +
                (resEnd - resStart) *
                t;

            let y = y1;


            if (
                k !== 0 &&
                k !== points
            ) {

                y =
                    y1 +
                    (
                        k % 2 === 0
                            ? -15
                            : 15
                    );
            }


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
        // FIO DO RESISTOR ATÉ A FONTE
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            resStart,
            y1
        );

        ctx.lineTo(
            x0,
            y1
        );

        ctx.stroke();


        // =====================================================
        // LETRA R
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "R",
            340,
            y1 + 35
        );


        // =====================================================
        // FONTE AC
        // =====================================================

        const sourceX =
            x0;

        const sourceY =
            this.sourceY;

        const radius =
            38;


        /*
         * Apaga somente o trecho vertical
         * onde ficará a fonte.
         */

        ctx.fillStyle =
            "white";

        ctx.fillRect(

            sourceX - 5,

            sourceY -
            radius -
            5,

            10,

            2 * radius + 10
        );


        // =====================================================
        // CÍRCULO DA FONTE
        // =====================================================

        ctx.strokeStyle =
            "black";

        ctx.lineWidth = 3;


        ctx.beginPath();

        ctx.arc(

            sourceX,
            sourceY,
            radius,
            0,
            2 * Math.PI

        );

        ctx.stroke();


        // =====================================================
        // SENO DA FONTE
        // =====================================================

        ctx.beginPath();


        for (
            let k = 0;
            k <= 60;
            k++
        ) {

            const t =
                k / 60;


            const x =
                sourceX -
                25 +
                50 * t;


            const y =
                sourceY +
                12 *
                Math.sin(
                    2 *
                    Math.PI *
                    t
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
        // LETRA AC
        // =====================================================

        ctx.font =
            "bold 16px Arial";

        ctx.fillText(
            "AC",
            sourceX - 58,
            sourceY + 5
        );
    }


    // =========================================================
    // ELÉTRONS
    // =========================================================

    drawElectrons(ctx) {

        ctx.fillStyle =
            "#168aad";


        for (
            let k = 0;
            k < this.electronPositions.length;
            k++
        ) {

            let index =
                Math.floor(
                    this.electronPositions[k]
                );


            index =
                (
                    index %
                    this.pathLength +
                    this.pathLength
                ) %
                this.pathLength;


            const point =
                this.path[index];


            ctx.beginPath();

            ctx.arc(

                point.x,
                point.y,
                4,
                0,
                2 * Math.PI

            );

            ctx.fill();
        }
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;


        /*
         * Box menor e afastado do circuito.
         */

        const x = 20;
        const y = 20;

        const width = 215;
        const height = 175;


        ctx.fillStyle =
            "rgba(255,255,255,0.94)";

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


        ctx.fillStyle =
            "black";

        ctx.font =
            "12px Arial";


        const index =
            Math.min(

                this.frame,

                this.q.length - 1

            );


        const q =
            this.q[index] || 0;

        const i =
            this.current[index] || 0;

        const t =
            this.time[index] || 0;


        const text = [

            `R = ${p.R.toFixed(2)} Ω`,

            `L = ${p.L.toFixed(2)} H`,

            `C = ${p.C.toFixed(2)} F`,

            ``,

            `Regime: ${this.regime()}`,

            ``,

            `q₀ = ${p.q0.toFixed(2)} C`,

            `i₀ = ${p.i0.toFixed(2)} A`,

            ``,

            `q(t) = ${q.toFixed(3)} C`,

            `i(t) = ${i.toFixed(3)} A`,

            `t = ${t.toFixed(2)} s`

        ];


        text.forEach(
            (line, k) => {

                ctx.fillText(

                    line,

                    x + 12,

                    y + 20 +
                    k * 13

                );
            }
        );
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX = 760;
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


        ctx.fillText(

            "Resposta do circuito",

            graphX + 120,
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


        const qData =
            this.q.slice(
                0,
                n
            );

        const iData =
            this.current.slice(
                0,
                n
            );


        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs = 0;


        for (const value of qData) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(value)
                );
        }


        for (const value of iData) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(value)
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


            // marca

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


            // grade

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


            // número

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
        // LABEL X
        // =====================================================

        ctx.font =
            "14px Arial";


        ctx.fillText(

            "t [s]",

            graphX +
            graphW / 2 -
            15,

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


        ctx.fillText(

            "q(t) [C] / i(t) [A]",

            -70,
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
        // q(t)
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
                    this.q[k]
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
        // i(t)
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
                    this.current[k]
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


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(

            "q(t) [C]",

            graphX +
            graphW -
            90,

            graphY + 25

        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(

            "i(t) [A]",

            graphX +
            graphW -
            90,

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


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        // fundo

        ctx.fillStyle =
            "white";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        // circuito

        this.drawCircuit(ctx);


        // elétrons

        this.drawElectrons(ctx);


        // informações

        this.drawHUD(ctx);


        // gráfico

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


            this.draw();


            // =================================================
            // VELOCIDADE DOS ELÉTRONS
            // =================================================

            const index =
                Math.min(

                    this.frame,

                    this.current.length - 1

                );


            const current =
                this.current[index] || 0;


            const speed =
                0.5 +
                Math.abs(current) * 2;


            const direction =
                Math.sign(
                    current || 1
                );


            for (
                let k = 0;
                k <
                this.electronPositions.length;
                k++
            ) {

                this.electronPositions[k] +=
                    speed *
                    direction;


                if (
                    this.electronPositions[k]
                    >= this.pathLength
                ) {

                    this.electronPositions[k] -=
                        this.pathLength;
                }


                if (
                    this.electronPositions[k] < 0
                ) {

                    this.electronPositions[k] +=
                        this.pathLength;
                }
            }


            // =================================================
            // AVANÇA TEMPO
            // =================================================

            this.frame++;


            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;

                this.resetElectrons();
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

        this.resetElectrons();

        this.draw();
    }
}
