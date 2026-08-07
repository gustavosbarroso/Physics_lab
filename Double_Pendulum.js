```html
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Simulação — Pêndulo Duplo</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f4f4;
        }

        .container {
            width: 1250px;
            max-width: 95%;
            margin: 20px auto;
        }

        .title {
            text-align: center;
            margin-bottom: 20px;
        }

        .simulation {
            display: grid;
            grid-template-columns: 1fr 1.4fr;
            gap: 20px;
        }

        .panel {
            background: white;
            border-radius: 10px;
            padding: 15px;

            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.1);
        }

        canvas {
            width: 100%;
            display: block;
        }

        #pendulumCanvas {
            height: 500px;
        }

        #graphCanvas {
            height: 450px;
        }

        .controls {
            margin-top: 20px;

            background: white;
            border-radius: 10px;
            padding: 20px;

            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .slider-row {
            display: flex;
            align-items: center;

            gap: 15px;

            margin: 12px 0;
        }

        .slider-row label {
            width: 120px;
            font-weight: bold;
        }

        .slider-row input {
            flex: 1;
        }

        .value {
            width: 110px;
            text-align: right;
        }

        @media (max-width: 900px) {

            .simulation {
                grid-template-columns: 1fr;
            }

        }

    </style>

</head>

<body>

<div class="container">

    <h1 class="title">
        Simulação — Pêndulo Duplo
    </h1>


    <!-- ====================================================== -->
    <!-- SIMULAÇÃO -->
    <!-- ====================================================== -->

    <div class="simulation">


        <!-- ================================================== -->
        <!-- PÊNDULO -->
        <!-- ================================================== -->

        <div class="panel">

            <h2>Pêndulo Duplo</h2>

            <canvas
                id="pendulumCanvas"
                width="500"
                height="500">
            </canvas>

        </div>


        <!-- ================================================== -->
        <!-- GRÁFICO -->
        <!-- ================================================== -->

        <div class="panel">

            <h2>Evolução temporal</h2>

            <canvas
                id="graphCanvas"
                width="700"
                height="450">
            </canvas>

        </div>

    </div>


    <!-- ====================================================== -->
    <!-- CONTROLES -->
    <!-- ====================================================== -->

    <div class="controls">

        <h2>Parâmetros</h2>


        <!-- g -->

        <div class="slider-row">

            <label for="gSlider">
                g (m/s²)
            </label>

            <input
                id="gSlider"
                type="range"
                min="1"
                max="20"
                step="0.01"
                value="9.81"
            >

            <span
                id="gValue"
                class="value">
                9.81 m/s²
            </span>

        </div>


        <!-- L1 -->

        <div class="slider-row">

            <label for="l1Slider">
                L₁ (m)
            </label>

            <input
                id="l1Slider"
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                value="1"
            >

            <span
                id="l1Value"
                class="value">
                1.00 m
            </span>

        </div>


        <!-- L2 -->

        <div class="slider-row">

            <label for="l2Slider">
                L₂ (m)
            </label>

            <input
                id="l2Slider"
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                value="1"
            >

            <span
                id="l2Value"
                class="value">
                1.00 m
            </span>

        </div>


        <!-- m1 -->

        <div class="slider-row">

            <label for="m1Slider">
                m₁ (kg)
            </label>

            <input
                id="m1Slider"
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value="1"
            >

            <span
                id="m1Value"
                class="value">
                1.00 kg
            </span>

        </div>


        <!-- m2 -->

        <div class="slider-row">

            <label for="m2Slider">
                m₂ (kg)
            </label>

            <input
                id="m2Slider"
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value="1"
            >

            <span
                id="m2Value"
                class="value">
                1.00 kg
            </span>

        </div>


        <!-- theta1 -->

        <div class="slider-row">

            <label for="theta1Slider">
                θ₁₀ (rad)
            </label>

            <input
                id="theta1Slider"
                type="range"
                min="-3.14159265"
                max="3.14159265"
                step="0.01"
                value="1"
            >

            <span
                id="theta1Value"
                class="value">
                1.00 rad
            </span>

        </div>


        <!-- theta2 -->

        <div class="slider-row">

            <label for="theta2Slider">
                θ₂₀ (rad)
            </label>

            <input
                id="theta2Slider"
                type="range"
                min="-3.14159265"
                max="3.14159265"
                step="0.01"
                value="1"
            >

            <span
                id="theta2Value"
                class="value">
                1.00 rad
            </span>

        </div>

    </div>

</div>


<script>

// ============================================================
// CANVAS
// ============================================================

const pendulumCanvas =
    document.getElementById(
        "pendulumCanvas"
    );

const pendulumCtx =
    pendulumCanvas.getContext("2d");


const graphCanvas =
    document.getElementById(
        "graphCanvas"
    );

const graphCtx =
    graphCanvas.getContext("2d");


// ============================================================
// PARÂMETROS
// ============================================================

let g = 9.81;

let L1 = 1.0;
let L2 = 1.0;

let m1 = 1.0;
let m2 = 1.0;

let theta1_0 = 1.0;
let theta2_0 = 1.0;


// ============================================================
// SIMULAÇÃO
// ============================================================

const N = 300;

const tStart = 0.0;
const tEnd = 10.0;

let time = [];

let theta1 = [];
let omega1 = [];

let theta2 = [];
let omega2 = [];


// ============================================================
// POSIÇÕES
// ============================================================

let x1 = [];
let y1 = [];

let x2 = [];
let y2 = [];


// ============================================================
// SISTEMA DIFERENCIAL
// ============================================================

function f(
    theta1,
    omega1,
    theta2,
    omega2
) {

    // --------------------------------------------------------
    // Diferença angular
    // --------------------------------------------------------

    const delta =
        theta2 - theta1;


    // --------------------------------------------------------
    // Denominador da primeira equação
    // --------------------------------------------------------

    const den1 =
        (m1 + m2) * L1
        -
        m2 *
        L1 *
        Math.pow(
            Math.cos(delta),
            2
        );


    // --------------------------------------------------------
    // Aceleração angular 1
    // --------------------------------------------------------

    const a1 =
        (
            m2 *
            L1 *
            Math.pow(omega1, 2) *
            Math.sin(delta) *
            Math.cos(delta)

            +

            m2 *
            g *
            Math.sin(theta2) *
            Math.cos(delta)

            +

            m2 *
            L2 *
            Math.pow(omega2, 2) *
            Math.sin(delta)

            -

            (m1 + m2) *
            g *
            Math.sin(theta1)

        )
        /
        den1;


    // --------------------------------------------------------
    // Denominador da segunda equação
    // --------------------------------------------------------

    const den2 =
        (L2 / L1) *
        den1;


    // --------------------------------------------------------
    // Aceleração angular 2
    // --------------------------------------------------------

    const a2 =
        (
            -m2 *
            L2 *
            Math.pow(omega2, 2) *
            Math.sin(delta) *
            Math.cos(delta)

            +

            (m1 + m2) *
            g *
            Math.sin(theta1) *
            Math.cos(delta)

            -

            (m1 + m2) *
            L1 *
            Math.pow(omega1, 2) *
            Math.sin(delta)

            -

            (m1 + m2) *
            g *
            Math.sin(theta2)

        )
        /
        den2;


    // --------------------------------------------------------
    // Sistema
    // --------------------------------------------------------

    return {

        theta1: omega1,
        omega1: a1,

        theta2: omega2,
        omega2: a2

    };
}


// ============================================================
// RK4
// ============================================================

function RK4() {

    const h =
        (tEnd - tStart) / N;


    time = [];

    theta1 = [];
    omega1 = [];

    theta2 = [];
    omega2 = [];


    let th1 = theta1_0;
    let om1 = 0;

    let th2 = theta2_0;
    let om2 = 0;


    time.push(tStart);

    theta1.push(th1);
    omega1.push(om1);

    theta2.push(th2);
    omega2.push(om2);


    for (
        let k = 0;
        k < N;
        k++
    ) {

        const t =
            tStart + k * h;


        // ====================================================
        // k1
        // ====================================================

        const k1 =
            f(
                th1,
                om1,
                th2,
                om2
            );


        const k1th1 =
            h * k1.theta1;

        const k1om1 =
            h * k1.omega1;

        const k1th2 =
            h * k1.theta2;

        const k1om2 =
            h * k1.omega2;


        // ====================================================
        // k2
        // ====================================================

        const k2 =
            f(
                th1 + 0.5 * k1th1,
                om1 + 0.5 * k1om1,

                th2 + 0.5 * k1th2,
                om2 + 0.5 * k1om2
            );


        const k2th1 =
            h * k2.theta1;

        const k2om1 =
            h * k2.omega1;

        const k2th2 =
            h * k2.theta2;

        const k2om2 =
            h * k2.omega2;


        // ====================================================
        // k3
        // ====================================================

        const k3 =
            f(
                th1 + 0.5 * k2th1,
                om1 + 0.5 * k2om1,

                th2 + 0.5 * k2th2,
                om2 + 0.5 * k2om2
            );


        const k3th1 =
            h * k3.theta1;

        const k3om1 =
            h * k3.omega1;

        const k3th2 =
            h * k3.theta2;

        const k3om2 =
            h * k3.omega2;


        // ====================================================
        // k4
        // ====================================================

        const k4 =
            f(
                th1 + k3th1,
                om1 + k3om1,

                th2 + k3th2,
                om2 + k3om2
            );


        const k4th1 =
            h * k4.theta1;

        const k4om1 =
            h * k4.omega1;

        const k4th2 =
            h * k4.theta2;

        const k4om2 =
            h * k4.omega2;


        // ====================================================
        // ATUALIZAÇÃO
        // ====================================================

        th1 +=
            (
                k1th1
                + 2 * k2th1
                + 2 * k3th1
                + k4th1
            ) / 6;


        om1 +=
            (
                k1om1
                + 2 * k2om1
                + 2 * k3om1
                + k4om1
            ) / 6;


        th2 +=
            (
                k1th2
                + 2 * k2th2
                + 2 * k3th2
                + k4th2
            ) / 6;


        om2 +=
            (
                k1om2
                + 2 * k2om2
                + 2 * k3om2
                + k4om2
            ) / 6;


        // ====================================================
        // SALVA
        // ====================================================

        time.push(
            t + h
        );

        theta1.push(th1);
        omega1.push(om1);

        theta2.push(th2);
        omega2.push(om2);
    }
}


// ============================================================
// SOLVER
// ============================================================

function solve() {

    RK4();


    // --------------------------------------------------------
    // Coordenadas da primeira massa
    // --------------------------------------------------------

    x1 = [];
    y1 = [];

    x2 = [];
    y2 = [];


    for (
        let i = 0;
        i <= N;
        i++
    ) {

        const px1 =
            L1 *
            Math.sin(theta1[i]);


        const py1 =
            -L1 *
            Math.cos(theta1[i]);


        const px2 =
            px1
            +
            L2 *
            Math.sin(theta2[i]);


        const py2 =
            py1
            -
            L2 *
            Math.cos(theta2[i]);


        x1.push(px1);
        y1.push(py1);

        x2.push(px2);
        y2.push(py2);
    }
}


// ============================================================
// ESCALA DO PÊNDULO
// ============================================================

function getPendulumScale() {

    const maxLength =
        L1 + L2;


    const margin =
        1.1;


    const limit =
        margin * maxLength;


    return {
        min: -limit,
        max: limit
    };
}


// ============================================================
// DESENHA PÊNDULO
// ============================================================

function drawPendulum(frame) {

    const ctx =
        pendulumCtx;


    const width =
        pendulumCanvas.width;

    const height =
        pendulumCanvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // --------------------------------------------------------
    // ESCALA
    // --------------------------------------------------------

    const scaleData =
        getPendulumScale();


    const range =
        scaleData.max
        -
        scaleData.min;


    const scale =
        Math.min(
            width / range,
            height / range
        )
        * 0.85;


    // --------------------------------------------------------
    // ORIGEM
    // --------------------------------------------------------

    const originX =
        width / 2;


    const originY =
        height / 2;


    // --------------------------------------------------------
    // POSIÇÕES
    // --------------------------------------------------------

    const px1 =
        originX
        +
        x1[frame] * scale;


    const py1 =
        originY
        -
        y1[frame] * scale;


    const px2 =
        originX
        +
        x2[frame] * scale;


    const py2 =
        originY
        -
        y2[frame] * scale;


    // --------------------------------------------------------
    // LINHA VERTICAL DE REFERÊNCIA
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        originX,
        originY
    );

    ctx.lineTo(
        originX,
        originY
        +
        (L1 + L2)
        * scale
    );


    ctx.strokeStyle =
        "#cccccc";

    ctx.lineWidth = 1;

    ctx.stroke();


    // --------------------------------------------------------
    // PRIMEIRA HASTE
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        originX,
        originY
    );

    ctx.lineTo(
        px1,
        py1
    );


    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 4;

    ctx.stroke();


    // --------------------------------------------------------
    // SEGUNDA HASTE
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        px1,
        py1
    );

    ctx.lineTo(
        px2,
        py2
    );


    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 4;

    ctx.stroke();


    // --------------------------------------------------------
    // PONTO DE SUSPENSÃO
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.arc(
        originX,
        originY,
        8,
        0,
        2 * Math.PI
    );


    ctx.fillStyle =
        "#222222";

    ctx.fill();


    // --------------------------------------------------------
    // MASSA 1
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.arc(
        px1,
        py1,
        15,
        0,
        2 * Math.PI
    );


    ctx.fillStyle =
        "#2563eb";

    ctx.fill();


    // --------------------------------------------------------
    // MASSA 2
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.arc(
        px2,
        py2,
        18,
        0,
        2 * Math.PI
    );


    ctx.fillStyle =
        "#dc2626";

    ctx.fill();


    // --------------------------------------------------------
    // HUD
    // --------------------------------------------------------

    drawHUD(frame);
}


// ============================================================
// HUD
// ============================================================

function drawHUD(frame) {

    const ctx =
        pendulumCtx;


    const lines = [

        `m₁ = ${m1.toFixed(2)} kg`,
        `m₂ = ${m2.toFixed(2)} kg`,
        `L₁ = ${L1.toFixed(2)} m`,
        `L₂ = ${L2.toFixed(2)} m`,
        `g = ${g.toFixed(2)} m/s²`,
        "",
        `θ₁ = ${theta1[frame].toFixed(2)} rad`,
        `ω₁ = ${omega1[frame].toFixed(2)} rad/s`,
        "",
        `θ₂ = ${theta2[frame].toFixed(2)} rad`,
        `ω₂ = ${omega2[frame].toFixed(2)} rad/s`,
        "",
        `t = ${time[frame].toFixed(2)} s`

    ];


    ctx.font =
        "14px Arial";


    ctx.fillStyle =
        "#111111";


    let yPosition = 25;


    for (
        const text of lines
    ) {

        ctx.fillText(
            text,
            15,
            yPosition
        );

        yPosition += 18;
    }
}


// ============================================================
// LIMITES DO GRÁFICO
// ============================================================

function getGraphLimits(frame) {

    if (frame < 5) {

        return {
            min: -1,
            max: 1
        };
    }


    let dataMin =
        Infinity;

    let dataMax =
        -Infinity;


    for (
        let i = 0;
        i <= frame;
        i++
    ) {

        dataMin =
            Math.min(
                dataMin,
                theta1[i],
                theta2[i],
                omega1[i],
                omega2[i]
            );


        dataMax =
            Math.max(
                dataMax,
                theta1[i],
                theta2[i],
                omega1[i],
                omega2[i]
            );
    }


    if (
        Math.abs(
            dataMax - dataMin
        )
        < 1e-6
    ) {

        dataMin -= 1;
        dataMax += 1;
    }


    const margin =
        0.2 *
        (
            dataMax - dataMin
        );


    return {

        min:
            dataMin - margin,

        max:
            dataMax + margin
    };
}


// ============================================================
// GRÁFICO
// ============================================================

function drawGraph(frame) {

    const ctx =
        graphCtx;


    const width =
        graphCanvas.width;

    const height =
        graphCanvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // --------------------------------------------------------
    // ÁREA
    // --------------------------------------------------------

    const left = 60;
    const right = width - 30;

    const top = 30;
    const bottom = height - 50;


    // --------------------------------------------------------
    // LIMITES
    // --------------------------------------------------------

    const limits =
        getGraphLimits(frame);


    const ymin =
        limits.min;

    const ymax =
        limits.max;


    // --------------------------------------------------------
    // CONVERSÃO
    // --------------------------------------------------------

    function screenX(t) {

        return left
            +
            (
                t / tEnd
            )
            *
            (
                right - left
            );
    }


    function screenY(value) {

        return bottom
            -
            (
                (value - ymin)
                /
                (ymax - ymin)
            )
            *
            (
                bottom - top
            );
    }


    // --------------------------------------------------------
    // EIXOS
    // --------------------------------------------------------

    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 1;


    ctx.beginPath();

    ctx.moveTo(
        left,
        bottom
    );

    ctx.lineTo(
        right,
        bottom
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        left,
        top
    );

    ctx.lineTo(
        left,
        bottom
    );

    ctx.stroke();


    // --------------------------------------------------------
    // FUNÇÃO PARA DESENHAR CURVA
    // --------------------------------------------------------

    function drawCurve(
        data,
        lineColor
    ) {

        ctx.beginPath();


        for (
            let i = 0;
            i <= frame;
            i++
        ) {

            const px =
                screenX(
                    time[i]
                );


            const py =
                screenY(
                    data[i]
                );


            if (i === 0) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }


        ctx.strokeStyle =
            lineColor;

        ctx.lineWidth = 2;

        ctx.stroke();
    }


    // --------------------------------------------------------
    // QUATRO CURVAS
    // --------------------------------------------------------

    drawCurve(
        theta1,
        "#2563eb"
    );


    drawCurve(
        omega1,
        "#60a5fa"
    );


    drawCurve(
        theta2,
        "#dc2626"
    );


    drawCurve(
        omega2,
        "#f87171"
    );


    // --------------------------------------------------------
    // LABELS
    // --------------------------------------------------------

    ctx.font =
        "13px Arial";


    ctx.fillStyle =
        "#111111";


    ctx.fillText(
        "t [s]",
        width / 2,
        height - 10
    );


    ctx.fillText(
        "θ(t), ω(t)",
        5,
        20
    );


    // --------------------------------------------------------
    // LEGENDA
    // --------------------------------------------------------

    ctx.fillStyle =
        "#2563eb";

    ctx.fillText(
        "θ₁(t)",
        width - 170,
        25
    );


    ctx.fillStyle =
        "#60a5fa";

    ctx.fillText(
        "ω₁(t)",
        width - 115,
        25
    );


    ctx.fillStyle =
        "#dc2626";

    ctx.fillText(
        "θ₂(t)",
        width - 170,
        45
    );


    ctx.fillStyle =
        "#f87171";

    ctx.fillText(
        "ω₂(t)",
        width - 115,
        45
    );
}


// ============================================================
// FRAME
// ============================================================

function updateFrame(frame) {

    drawPendulum(frame);

    drawGraph(frame);
}


// ============================================================
// ANIMAÇÃO
// ============================================================

let frame = 0;

let lastTime = 0;


function animate(timestamp) {

    if (
        timestamp - lastTime
        >= 20
    ) {

        lastTime =
            timestamp;


        if (
            frame >= time.length
        ) {

            frame = 0;
        }


        updateFrame(frame);

        frame++;
    }


    requestAnimationFrame(
        animate
    );
}


// ============================================================
// ATUALIZA SIMULAÇÃO
// ============================================================

function updateSimulation() {

    solve();

    frame = 0;

    updateFrame(0);
}


// ============================================================
// SLIDERS
// ============================================================

const gSlider =
    document.getElementById(
        "gSlider"
    );


const l1Slider =
    document.getElementById(
        "l1Slider"
    );


const l2Slider =
    document.getElementById(
        "l2Slider"
    );


const m1Slider =
    document.getElementById(
        "m1Slider"
    );


const m2Slider =
    document.getElementById(
        "m2Slider"
    );


const theta1Slider =
    document.getElementById(
        "theta1Slider"
    );


const theta2Slider =
    document.getElementById(
        "theta2Slider"
    );


// ============================================================
// g
// ============================================================

gSlider.addEventListener(
    "input",
    function () {

        g =
            parseFloat(
                this.value
            );


        document.getElementById(
            "gValue"
        ).textContent =
            g.toFixed(2)
            + " m/s²";


        updateSimulation();
    }
);


// ============================================================
// L1
// ============================================================

l1Slider.addEventListener(
    "input",
    function () {

        L1 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "l1Value"
        ).textContent =
            L1.toFixed(2)
            + " m";


        updateSimulation();
    }
);


// ============================================================
// L2
// ============================================================

l2Slider.addEventListener(
    "input",
    function () {

        L2 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "l2Value"
        ).textContent =
            L2.toFixed(2)
            + " m";


        updateSimulation();
    }
);


// ============================================================
// m1
// ============================================================

m1Slider.addEventListener(
    "input",
    function () {

        m1 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "m1Value"
        ).textContent =
            m1.toFixed(2)
            + " kg";


        updateSimulation();
    }
);


// ============================================================
// m2
// ============================================================

m2Slider.addEventListener(
    "input",
    function () {

        m2 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "m2Value"
        ).textContent =
            m2.toFixed(2)
            + " kg";


        updateSimulation();
    }
);


// ============================================================
// THETA1
// ============================================================

theta1Slider.addEventListener(
    "input",
    function () {

        theta1_0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "theta1Value"
        ).textContent =
            theta1_0.toFixed(2)
            + " rad";


        updateSimulation();
    }
);


// ============================================================
// THETA2
// ============================================================

theta2Slider.addEventListener(
    "input",
    function () {

        theta2_0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "theta2Value"
        ).textContent =
            theta2_0.toFixed(2)
            + " rad";


        updateSimulation();
    }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

solve();

updateFrame(0);

requestAnimationFrame(
    animate
);

</script>

</body>

</html>
```
