class RCCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            R: 2.0,
            C: 1.0,
            q0: 0.0,
            V0: 1.0,

            ...options
        };

        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.q = [];
        this.current = [];

        // =====================================================
        // ELÉTRONS
        // =====================================================

        this.numElectrons = 40;
        this.electronPos = [];

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.frame = 0;
        this.running = false;

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // ELÉTRONS
        // =====================================================

        this.resetElectrons();
    }


    // =========================================================
    // SISTEMA RC COM FONTE CONTÍNUA
    // =========================================================

    f(state, t) {

        const q = state[0];

        const R = this.params.R;
        const C = this.params.C;
        const V0 = this.params.V0;

        /*
         * Pela lei das malhas:
         *
         * V0 - R i - q/C = 0
         *
         * Como i = dq/dt:
         *
         * dq/dt = (V0 - q/C) / R
         */

        const dqdt =
            (V0 - q / C) / R;

        return [dqdt];
    }


    // =========================================================
    // OPERAÇÕES VETORIAIS
    // =========================================================

    add(a, b) {

        return [
            a[0] + b[0]
        ];
    }


    mul(a, x) {

        return [
            a[0] * x
        ];
    }


    add4(a, b, c, d) {

        return [
            a[0] +
            2 * b[0] +
            2 * c[0] +
            d[0]
        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a = 0;
        const b = 10;
        const N = 500;

        const h =
            (b - a) / N;

        let state = [
            this.params.q0
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

            this.q.push(
                state[0]
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


        // =====================================================
        // CORRENTE
        // =====================================================

        const R = this.params.R;
        const C = this.params.C;
        const V0 = this.params.V0;


        this.current =
            this.q.map(

                q =>
                    (V0 - q / C) / R
            );
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;
    }


    // =========================================================
    // ELÉTRONS
    // =========================================================

    resetElectrons() {

        this.electronPos = [];


        for (
            let i = 0;
            i < this.numElectrons;
            i++
        ) {

            this.electronPos.push(
                i / this.numElectrons
            );
        }
    }


    // =========================================================
    // CAMINHO DOS ELÉTRONS
    // =========================================================

    loopPath(s) {

        const x0 = 70;
        const x1 = 380;

        const y0 = 120;
        const y1 = 320;


        if (s < 0.25) {

            return [

                x0 +
                (x1 - x0) *
                (s / 0.25),

                y0

            ];
        }


        else if (s < 0.5) {

            return [

                x1,

                y0 +
                (y1 - y0) *
                ((s - 0.25) / 0.25)

            ];
        }


        else if (s < 0.75) {

            return [

                x1 -
                (x1 - x0) *
                ((s - 0.5) / 0.25),

                y1

            ];
        }


        else {

            return [

                x0,

                y1 -
                (y1 - y0) *
                ((s - 0.75) / 0.25)

            ];
        }
    }


    // =========================================================
    // CIRCUITO
    // =========================================================

    drawCircuit() {

        const ctx = this.ctx;

        const x0 = 70;
        const x1 = 380;

        const y0 = 120;
        const y1 = 320;


        ctx.save();


        ctx.strokeStyle =
            "black";

        ctx.fillStyle =
            "black";

        ctx.lineWidth = 2;


        // =====================================================
        // FIOS
        // =====================================================

        ctx.beginPath();

        // Fio superior
        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x1,
            y0
        );

        // Fio direito - parte superior
        ctx.moveTo(
            x1,
            y0
        );

        ctx.lineTo(
            x1,
            205
        );

        // Fio direito - parte inferior
        ctx.moveTo(
            x1,
            245
        );

        ctx.lineTo(
            x1,
            y1
        );

        // Fio inferior
        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x0,
            y1
        );

        // Fio esquerdo - parte inferior
        ctx.moveTo(
            x0,
            y1
        );

        ctx.lineTo(
            x0,
            245
        );

        // Fio esquerdo - parte superior
        ctx.moveTo(
            x0,
            195
        );

        ctx.lineTo(
            x0,
            y0
        );

        ctx.stroke();


        // =====================================================
        // RESISTOR
        // =====================================================

        ctx.beginPath();

        const xr = [

            170,
            195,
            220,
            245,
            270,
            295,
            320

        ];


        for (
            let i = 0;
            i < xr.length;
            i++
        ) {

            const y =
                y0 +
                (
                    i % 2
                        ? 12
                        : -12
                );


            if (i === 0)

                ctx.moveTo(
                    xr[i],
                    y
                );

            else

                ctx.lineTo(
                    xr[i],
                    y
                );
        }


        ctx.stroke();


        ctx.font =
            "16px Arial";


        ctx.fillText(
            "R",
            245,
            90
        );


        // =====================================================
        // CAPACITOR
        // =====================================================

        ctx.lineWidth = 4;


        ctx.beginPath();


        ctx.moveTo(
            x1 - 25,
            205
        );

        ctx.lineTo(
            x1 + 25,
            205
        );


        ctx.moveTo(
            x1 - 25,
            245
        );

        ctx.lineTo(
            x1 + 25,
            245
        );


        ctx.stroke();


        ctx.font =
            "16px Arial";


        ctx.fillText(
            "C",
            x1 + 35,
            230
        );


        // =====================================================
        // FONTE DC V0
        // =====================================================

        ctx.lineWidth = 2;

        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";

        // Corpo circular da fonte
        ctx.beginPath();

        ctx.arc(
            x0,
            220,
            25,
            0,
            2 * Math.PI
        );

        ctx.fill();
        ctx.stroke();


        // Terminal positivo
        ctx.beginPath();

        ctx.moveTo(
            x0 - 10,
            211
        );

        ctx.lineTo(
            x0 + 10,
            211
        );

        ctx.moveTo(
            x0,
            201
        );

        ctx.lineTo(
            x0,
            221
        );

        ctx.stroke();


        // Terminal negativo
        ctx.beginPath();

        ctx.moveTo(
            x0 - 10,
            229
        );

        ctx.lineTo(
            x0 + 10,
            229
        );

        ctx.stroke();


        ctx.font =
            "16px Arial";

        ctx.fillStyle =
            "black";

        ctx.fillText(
            "V₀",
            x0 - 15,
            275
        );


        // =====================================================
        // ELÉTRONS
        // =====================================================

        ctx.fillStyle =
            "red";


        for (
            const s of this.electronPos
        ) {

            const [
                x,
                y
            ] =
                this.loopPath(s);


            ctx.beginPath();


            ctx.arc(

                x,
                y,
                3,
                0,
                2 * Math.PI

            );


            ctx.fill();
        }


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "18px Arial";


        ctx.fillText(
            "Circuito RC com fonte contínua",
            100,
            45
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph() {

        const ctx = this.ctx;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        const graphX = 500;
        const graphY = 70;

        const graphW = 350;
        const graphH = 280;


        ctx.save();


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

            "Carga e corrente (RC)",

            graphX + 65,
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


        if (n < 2) {

            ctx.restore();

            return;
        }


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
        // ESCALA VERTICAL
        // =====================================================

        let maxAbs = 0;


        for (
            const value of qData
        ) {

            maxAbs =
                Math.max(

                    maxAbs,

                    Math.abs(value)

                );
        }


        for (
            const value of iData
        ) {

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

        ctx.lineWidth = 1;


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
        // TICKS E NÚMEROS DO EIXO Y
        // =====================================================

        const yTicks = 6;


        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "right";

        ctx.fillStyle =
            "black";


        for (
            let k = -yTicks;
            k <= yTicks;
            k++
        ) {

            const value =
                maxAbs *
                k /
                yTicks;


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


            ctx.fillStyle =
                "black";


            ctx.fillText(

                value.toFixed(2),

                graphX - 10,
                y + 4

            );
        }


        // =====================================================
        // TICKS E NÚMEROS DO EIXO X
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
                10 *
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
                graphY + graphH - 5
            );

            ctx.lineTo(
                x,
                graphY + graphH + 5
            );

            ctx.stroke();


            if (k !== 0) {

                ctx.strokeStyle =
                    "#eeeeee";


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
            "14px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(

            "t [s]",

            graphX +
            graphW / 2,

            graphY +
            graphH +
            55

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

            "q(t) [C] / i(t) [A]",

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
                        t / 10
                    ) *
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

        ctx.textAlign =
            "left";


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(

            "q(t) [C]",

            graphX +
            graphW -
            80,

            graphY + 25

        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(

            "i(t) [A]",

            graphX +
            graphW -
            80,

            graphY + 45

        );


        ctx.restore();
    }


    // =========================================================
    // INFORMAÇÕES
    // =========================================================

    drawInfo() {

        const ctx = this.ctx;


        const frame =
            Math.min(

                this.frame,

                this.q.length - 1

            );


        ctx.save();


        ctx.fillStyle =
            "black";

        ctx.font =
            "14px Arial";


        ctx.fillText(

            `R = ${this.params.R.toFixed(2)} Ω`,

            40,
            390

        );


        ctx.fillText(

            `C = ${this.params.C.toFixed(2)} F`,

            180,
            390

        );


        ctx.fillText(

            `V₀ = ${this.params.V0.toFixed(2)} V`,

            320,
            390

        );


        ctx.fillText(

            `q = ${this.q[frame].toFixed(3)} C`,

            470,
            390

        );


        ctx.fillText(

            `i = ${this.current[frame].toFixed(3)} A`,

            620,
            390

        );


        ctx.fillText(

            `t = ${this.time[frame].toFixed(2)} s`,

            760,
            390

        );


        ctx.restore();
    }


    // =========================================================
    // DESENHO
    // =========================================================

    draw() {

        this.ctx.clearRect(

            0,
            0,
            this.canvas.width,
            this.canvas.height

        );


        this.drawCircuit();

        this.drawGraph();

        this.drawInfo();
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
            // REINICIA
            // =================================================

            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;

                this.resetElectrons();
            }


            // =================================================
            // VELOCIDADE DOS ELÉTRONS
            // =================================================

            const i =
                this.current[this.frame] || 0;


            /*
             * O sinal da corrente determina
             * o sentido do movimento.
             */

            const speed =
                0.02 * i;


            for (
                let j = 0;
                j < this.electronPos.length;
                j++
            ) {

                this.electronPos[j] =

                    (
                        this.electronPos[j] +
                        speed
                    ) % 1;


                if (
                    this.electronPos[j] < 0
                ) {

                    this.electronPos[j] += 1;
                }
            }


            // =================================================
            // DESENHA
            // =================================================

            this.draw();


            // =================================================
            // AVANÇA
            // =================================================

            this.frame++;


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


        this.solve();

        this.frame = 0;

        this.resetElectrons();

        this.draw();
    }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

const canvas =
    document.getElementById(
        "canvas"
    );


const circuito =
    new RCCircuit(

        canvas,

        {

            R: 2.0,
            C: 1.0,
            q0: 0.0,
            V0: 1.0

        }

    );


// ============================================================
// SLIDERS
// ============================================================

const sliderR =
    document.getElementById(
        "sliderR"
    );


const sliderC =
    document.getElementById(
        "sliderC"
    );


const sliderQ0 =
    document.getElementById(
        "sliderQ0"
    );


const sliderV0 =
    document.getElementById(
        "sliderV0"
    );


const valueR =
    document.getElementById(
        "valueR"
    );


const valueC =
    document.getElementById(
        "valueC"
    );


const valueQ0 =
    document.getElementById(
        "valueQ0"
    );


const valueV0 =
    document.getElementById(
        "valueV0"
    );


// ============================================================
// RESISTÊNCIA
// ============================================================

sliderR.addEventListener(

    "input",

    () => {

        const value =
            parseFloat(
                sliderR.value
            );


        circuito.atualizarParametros({

            R: value

        });


        valueR.textContent =
            value.toFixed(1);
    }
);


// ============================================================
// CAPACITÂNCIA
// ============================================================

sliderC.addEventListener(

    "input",

    () => {

        const value =
            parseFloat(
                sliderC.value
            );


        circuito.atualizarParametros({

            C: value

        });


        valueC.textContent =
            value.toFixed(1);
    }
);


// ============================================================
// CARGA INICIAL
// ============================================================

sliderQ0.addEventListener(

    "input",

    () => {

        const value =
            parseFloat(
                sliderQ0.value
            );


        circuito.atualizarParametros({

            q0: value

        });


        valueQ0.textContent =
            value.toFixed(1);
    }
);


// ============================================================
// FONTE V0
// ============================================================

sliderV0.addEventListener(

    "input",

    () => {

        const value =
            parseFloat(
                sliderV0.value
            );


        circuito.atualizarParametros({

            V0: value

        });


        valueV0.textContent =
            value.toFixed(1);
    }
);


// ============================================================
// INICIA
// ============================================================

circuito.iniciar();
