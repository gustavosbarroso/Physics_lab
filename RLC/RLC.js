class RLCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // TAMANHO DA ÁREA
        // =====================================================

        this.canvas.width = 1200;
        this.canvas.height = 760;

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

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;

        // =====================================================
        // SOLUÇÃO INICIAL
        // =====================================================

        this.solve();

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================

    f(state, t) {

        const q = state[0];
        const i = state[1];

        const p = this.params;

        // Fonte AC
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

            a[0]
            + 2 * b[0]
            + 2 * c[0]
            + d[0],

            a[1]
            + 2 * b[1]
            + 2 * c[1]
            + d[1]

        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a = 0;
        const b = 20;
        const N = 800;

        const h = (b - a) / N;

        let state = [

            this.params.q0,
            this.params.i0

        ];

        this.time = [];
        this.q = [];
        this.current = [];

        for (let n = 0; n <= N; n++) {

            const t = a + n * h;

            this.time.push(t);
            this.q.push(state[0]);
            this.current.push(state[1]);

            if (n === N)
                break;


            // k1

            const k1 = this.mul(
                this.f(state, t),
                h
            );


            // k2

            const state2 =
                this.add(
                    state,
                    this.mul(k1, 0.5)
                );

            const k2 = this.mul(
                this.f(
                    state2,
                    t + h / 2
                ),
                h
            );


            // k3

            const state3 =
                this.add(
                    state,
                    this.mul(k2, 0.5)
                );

            const k3 = this.mul(
                this.f(
                    state3,
                    t + h / 2
                ),
                h
            );


            // k4

            const state4 =
                this.add(
                    state,
                    k3
                );

            const k4 = this.mul(
                this.f(
                    state4,
                    t + h
                ),
                h
            );


            // atualização

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

        if (gamma > omega0) {

            return "Superamortecido";
        }

        return "Subamortecido";
    }


    // =========================================================
    // CRIAÇÃO DOS CONTROLES
    // =========================================================

    createControls() {

        // Container

        this.controls =
            document.createElement("div");

        this.controls.style.width =
            "1100px";

        this.controls.style.margin =
            "10px auto";

        this.controls.style.fontFamily =
            "Arial";


        // título

        const title =
            document.createElement("h3");

        title.innerText =
            "Parâmetros do circuito";

        title.style.margin =
            "5px 0 15px 0";

        this.controls.appendChild(title);


        // sliders

        this.sliderR =
            this.createSlider(
                "R (Ω)",
                0.1,
                10,
                0.1,
                this.params.R
            );

        this.sliderL =
            this.createSlider(
                "L (H)",
                0.1,
                5,
                0.1,
                this.params.L
            );

        this.sliderC =
            this.createSlider(
                "C (F)",
                0.1,
                5,
                0.1,
                this.params.C
            );

        this.sliderV0 =
            this.createSlider(
                "V₀ (V)",
                0,
                10,
                0.1,
                this.params.V0
            );

        this.sliderOmega =
            this.createSlider(
                "ω (rad/s)",
                0.1,
                10,
                0.1,
                this.params.omega
            );

        this.sliderQ0 =
            this.createSlider(
                "q₀ (C)",
                -10,
                10,
                0.1,
                this.params.q0
            );

        this.sliderI0 =
            this.createSlider(
                "i₀ (A)",
                -10,
                10,
                0.1,
                this.params.i0
            );


        // adicionar ao documento

        this.controlsContainer =
            document.createElement("div");

        this.controlsContainer.appendChild(
            this.sliderR.container
        );

        this.controlsContainer.appendChild(
            this.sliderL.container
        );

        this.controlsContainer.appendChild(
            this.sliderC.container
        );

        this.controlsContainer.appendChild(
            this.sliderV0.container
        );

        this.controlsContainer.appendChild(
            this.sliderOmega.container
        );

        this.controlsContainer.appendChild(
            this.sliderQ0.container
        );

        this.controlsContainer.appendChild(
            this.sliderI0.container
        );


        this.controls.appendChild(
            this.controlsContainer
        );


        this.canvas.parentNode.insertBefore(
            this.controls,
            this.canvas.nextSibling
        );
    }


    // =========================================================
    // CRIA UM SLIDER
    // =========================================================

    createSlider(
        labelText,
        min,
        max,
        step,
        initial
    ) {

        const container =
            document.createElement("div");

        container.style.display =
            "flex";

        container.style.alignItems =
            "center";

        container.style.margin =
            "7px 0";


        // label

        const label =
            document.createElement("span");

        label.innerText =
            labelText;

        label.style.width =
            "100px";


        // slider

        const slider =
            document.createElement("input");

        slider.type =
            "range";

        slider.min =
            min;

        slider.max =
            max;

        slider.step =
            step;

        slider.value =
            initial;

        slider.style.flex =
            "1";


        // valor

        const value =
            document.createElement("span");

        value.innerText =
            Number(initial).toFixed(2);

        value.style.width =
            "70px";

        value.style.textAlign =
            "right";


        // evento

        slider.addEventListener(
            "input",
            () => {

                value.innerText =
                    Number(
                        slider.value
                    ).toFixed(2);

                this.updateParameters();
            }
        );


        container.appendChild(label);
        container.appendChild(slider);
        container.appendChild(value);


        return {

            container: container,
            slider: slider
        };
    }


    // =========================================================
    // ATUALIZA PARÂMETROS
    // =========================================================

    updateParameters() {

        this.params.R =
            Number(
                this.sliderR.slider.value
            );

        this.params.L =
            Number(
                this.sliderL.slider.value
            );

        this.params.C =
            Number(
                this.sliderC.slider.value
            );

        this.params.V0 =
            Number(
                this.sliderV0.slider.value
            );

        this.params.omega =
            Number(
                this.sliderOmega.slider.value
            );

        this.params.q0 =
            Number(
                this.sliderQ0.slider.value
            );

        this.params.i0 =
            Number(
                this.sliderI0.slider.value
            );


        this.solve();

        this.frame = 0;
    }


    // =========================================================
    // DESENHO DO CIRCUITO
    // =========================================================

    drawCircuit() {

        const ctx = this.ctx;

        // posições

        const xLeft = 180;
        const xRight = 560;

        const yTop = 150;
        const yBottom = 420;

        const sourceY =
            (yTop + yBottom) / 2;


        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";


        // =====================================================
        // FIOS
        // =====================================================

        ctx.beginPath();

        // superior antes do indutor
        ctx.moveTo(xLeft, yTop);
        ctx.lineTo(285, yTop);

        // superior depois do indutor
        ctx.moveTo(435, yTop);
        ctx.lineTo(xRight, yTop);

        // lado direito superior
        ctx.moveTo(xRight, yTop);
        ctx.lineTo(xRight, 240);

        // lado direito inferior
        ctx.moveTo(xRight, 330);
        ctx.lineTo(xRight, yBottom);

        // inferior depois do resistor
        ctx.moveTo(xRight, yBottom);
        ctx.lineTo(435, yBottom);

        // inferior antes do resistor
        ctx.moveTo(285, yBottom);
        ctx.lineTo(xLeft, yBottom);

        // lado esquerdo superior
        ctx.moveTo(xLeft, yTop);
        ctx.lineTo(xLeft, sourceY - 45);

        // lado esquerdo inferior
        ctx.moveTo(xLeft, sourceY + 45);
        ctx.lineTo(xLeft, yBottom);

        ctx.stroke();


        // =====================================================
        // INDUTOR
        // =====================================================

        const xL0 = 285;
        const xL1 = 435;

        const amplitude = 18;
        const coils = 6;

        ctx.beginPath();

        for (let j = 0; j <= 120; j++) {

            const u = j / 120;

            const x =
                xL0 +
                (xL1 - xL0) * u;

            const y =
                yTop +
                amplitude *
                Math.sin(
                    u *
                    coils *
                    2 *
                    Math.PI
                );

            if (j === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "L",
            355,
            yTop - 25
        );


        // =====================================================
        // CAPACITOR
        // =====================================================

        const capY1 = 240;
        const capY2 = 330;

        // fios até placas

        ctx.beginPath();

        ctx.moveTo(
            xRight,
            yTop
        );

        ctx.lineTo(
            xRight,
            capY1
        );


        // placas

        ctx.moveTo(
            xRight - 28,
            capY1
        );

        ctx.lineTo(
            xRight + 28,
            capY1
        );


        ctx.moveTo(
            xRight - 28,
            capY2
        );

        ctx.lineTo(
            xRight + 28,
            capY2
        );


        // fio depois do capacitor

        ctx.moveTo(
            xRight,
            capY2
        );

        ctx.lineTo(
            xRight,
            yBottom
        );

        ctx.stroke();


        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "C",
            xRight + 40,
            290
        );


        // =====================================================
        // RESISTOR
        // =====================================================

        const xR0 = 285;
        const xR1 = 435;

        const resistorPoints = 8;
        const resistorAmplitude = 15;

        ctx.beginPath();

        for (
            let j = 0;
            j <= resistorPoints;
            j++
        ) {

            const u =
                j /
                resistorPoints;

            const x =
                xR0 +
                (xR1 - xR0) * u;

            let y =
                yBottom;

            if (
                j > 0 &&
                j < resistorPoints
            ) {

                y =
                    yBottom +
                    (
                        j % 2 === 0
                            ? -resistorAmplitude
                            : resistorAmplitude
                    );
            }

            if (j === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "R",
            355,
            yBottom + 38
        );


        // =====================================================
        // FONTE AC
        // =====================================================

        const radius = 43;

        ctx.beginPath();

        ctx.arc(
            xLeft,
            sourceY,
            radius,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // seno

        ctx.beginPath();

        for (let j = 0; j <= 100; j++) {

            const u =
                j / 100;

            const x =
                xLeft -
                27 +
                54 * u;

            const y =
                sourceY -
                13 *
                Math.sin(
                    2 *
                    Math.PI *
                    u
                );

            if (j === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        ctx.font =
            "bold 16px Arial";

        ctx.fillText(
            "AC",
            xLeft - 15,
            sourceY + 72
        );


        // =====================================================
        // TENSÃO INSTANTÂNEA
        // =====================================================

        const index =
            Math.min(
                this.frame,
                this.time.length - 1
            );

        const t =
            this.time[index] || 0;

        const Vt =
            this.params.V0 *
            Math.cos(
                this.params.omega * t
            );

        ctx.font =
            "15px Arial";

        ctx.fillText(
            `V(t) = ${Vt.toFixed(2)} V`,
            xLeft - 50,
            sourceY + 100
        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD() {

        const ctx = this.ctx;

        const p = this.params;

        const index =
            Math.min(
                this.frame,
                this.time.length - 1
            );

        const t =
            this.time[index] || 0;

        const q =
            this.q[index] || 0;

        const i =
            this.current[index] || 0;


        ctx.fillStyle = "white";

        ctx.strokeStyle = "#888";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            30,
            30,
            300,
            210,
            10
        );

        ctx.fill();

        ctx.stroke();


        ctx.fillStyle = "black";

        ctx.font =
            "15px Arial";


        ctx.fillText(
            `R = ${p.R.toFixed(2)} Ω`,
            50,
            60
        );

        ctx.fillText(
            `L = ${p.L.toFixed(2)} H`,
            50,
            83
        );

        ctx.fillText(
            `C = ${p.C.toFixed(2)} F`,
            50,
            106
        );

        ctx.fillText(
            `V₀ = ${p.V0.toFixed(2)} V`,
            50,
            129
        );

        ctx.fillText(
            `ω = ${p.omega.toFixed(2)} rad/s`,
            50,
            152
        );


        ctx.font =
            "bold 15px Arial";

        ctx.fillText(
            `Regime: ${this.regime()}`,
            50,
            182
        );


        ctx.font =
            "15px Arial";

        ctx.fillText(
            `q₀ = ${p.q0.toFixed(2)} C`,
            50,
            210
        );

        ctx.fillText(
            `i₀ = ${p.i0.toFixed(2)} A`,
            180,
            210
        );

        ctx.fillText(
            `q(t) = ${q.toFixed(2)} C`,
            50,
            235
        );

        ctx.fillText(
            `i(t) = ${i.toFixed(2)} A`,
            180,
            235
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            50,
            260
        );
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph() {

        const ctx = this.ctx;

        const x0 = 650;
        const y0 = 80;

        const width = 500;
        const height = 330;


        // borda

        ctx.strokeStyle =
            "#888";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            x0,
            y0,
            width,
            height
        );


        // título

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "Resposta do circuito",
            x0 + 140,
            y0 - 20
        );


        // =====================================================
        // LIMITES
        // =====================================================

        const index =
            Math.min(
                this.frame,
                this.time.length - 1
            );

        if (index < 1)
            return;


        let maxValue = 1;

        for (
            let j = 0;
            j <= index;
            j++
        ) {

            maxValue =
                Math.max(
                    maxValue,
                    Math.abs(
                        this.q[j]
                    ),
                    Math.abs(
                        this.current[j]
                    )
                );
        }

        maxValue *= 1.2;


        // =====================================================
        // EIXOS
        // =====================================================

        const centerY =
            y0 +
            height / 2;


        ctx.strokeStyle =
            "#cccccc";

        ctx.beginPath();

        ctx.moveTo(
            x0,
            centerY
        );

        ctx.lineTo(
            x0 + width,
            centerY
        );

        ctx.stroke();


        // =====================================================
        // Q
        // =====================================================

        ctx.strokeStyle =
            "#1976d2";

        ctx.lineWidth = 2;

        ctx.beginPath();


        for (
            let j = 0;
            j <= index;
            j++
        ) {

            const x =
                x0 +
                (
                    this.time[j] /
                    20
                ) *
                width;

            const y =
                centerY -
                (
                    this.q[j] /
                    maxValue
                ) *
                height / 2;

            if (j === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // CORRENTE
        // =====================================================

        ctx.strokeStyle =
            "#f57c00";

        ctx.lineWidth = 2;

        ctx.beginPath();


        for (
            let j = 0;
            j <= index;
            j++
        ) {

            const x =
                x0 +
                (
                    this.time[j] /
                    20
                ) *
                width;

            const y =
                centerY -
                (
                    this.current[j] /
                    maxValue
                ) *
                height / 2;

            if (j === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "q(t)",
            x0 + width - 70,
            y0 + 25
        );

        ctx.fillStyle =
            "#f57c00";

        ctx.fillText(
            "i(t)",
            x0 + width - 70,
            y0 + 45
        );


        // =====================================================
        // EIXO X
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.fillText(
            "t [s]",
            x0 + width / 2 - 15,
            y0 + height + 30
        );


        // =====================================================
        // EIXO Y
        // =====================================================

        ctx.save();

        ctx.translate(
            x0 - 35,
            y0 + height / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "q(t) [C] / i(t) [A]",
            0,
            0
        );

        ctx.restore();
    }


    // =========================================================
    // ELÉTRONS
    // =========================================================

    drawElectrons() {

        const ctx = this.ctx;

        const xLeft = 180;
        const xRight = 560;

        const yTop = 150;
        const yBottom = 420;


        const path = [];


        // esquerda descendo

        for (
            let y = yTop;
            y <= yBottom;
            y += 5
        ) {

            path.push({
                x: xLeft,
                y: y
            });
        }


        // inferior

        for (
            let x = xLeft;
            x <= xRight;
            x += 5
        ) {

            path.push({
                x: x,
                y: yBottom
            });
        }


        // direita subindo

        for (
            let y = yBottom;
            y >= yTop;
            y -= 5
        ) {

            path.push({
                x: xRight,
                y: y
            });
        }


        // superior

        for (
            let x = xRight;
            x >= xLeft;
            x -= 5
        ) {

            path.push({
                x: x,
                y: yTop
            });
        }


        const N =
            path.length;


        const electrons =
            15;


        // corrente atual

        const index =
            Math.min(
                this.frame,
                this.current.length - 1
            );

        const current =
            this.current[index] || 0;


        // velocidade

        const speed =
            Math.sign(current) *
            Math.min(
                Math.abs(current) * 3,
                5
            );


        for (
            let k = 0;
            k < electrons;
            k++
        ) {

            let position =
                (
                    this.frame *
                    speed +
                    k *
                    N /
                    electrons
                ) % N;


            if (position < 0)
                position += N;


            const p =
                path[
                    Math.floor(position)
                ];


            ctx.fillStyle =
                "#2196f3";


            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                4,
                0,
                2 * Math.PI
            );

            ctx.fill();
        }
    }


    // =========================================================
    // DESENHO COMPLETO
    // =========================================================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // fundo

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // título

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 28px Arial";

        ctx.fillText(
            "Circuito RLC",
            500,
            40
        );


        // circuito

        this.drawCircuit();


        // elétrons

        this.drawElectrons();


        // HUD

        this.drawHUD();


        // gráfico

        this.drawGraph();
    }


    // =========================================================
    // INICIAR
    // =========================================================

    iniciar() {

        if (this.running)
            return;

        this.running = true;


        const loop = () => {

            if (!this.running)
                return;


            this.draw();


            this.frame++;


            if (
                this.frame >=
                this.time.length
            ) {

                this.frame = 0;
            }


            requestAnimationFrame(loop);
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
    // ATUALIZAR PARÂMETROS EXTERNAMENTE
    // =========================================================

    atualizarParametros(newParams) {

        this.params = {

            ...this.params,
            ...newParams
        };


        // atualizar sliders

        if (newParams.R !== undefined)
            this.sliderR.slider.value =
                newParams.R;

        if (newParams.L !== undefined)
            this.sliderL.slider.value =
                newParams.L;

        if (newParams.C !== undefined)
            this.sliderC.slider.value =
                newParams.C;

        if (newParams.V0 !== undefined)
            this.sliderV0.slider.value =
                newParams.V0;

        if (newParams.omega !== undefined)
            this.sliderOmega.slider.value =
                newParams.omega;

        if (newParams.q0 !== undefined)
            this.sliderQ0.slider.value =
                newParams.q0;

        if (newParams.i0 !== undefined)
            this.sliderI0.slider.value =
                newParams.i0;


        this.solve();
    }
}
