```html
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Simulação — Circuito RLC</title>

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

        #circuitCanvas {
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
        Simulação — Circuito RLC com Fonte AC
    </h1>


    <!-- ====================================================== -->
    <!-- SIMULAÇÃO -->
    <!-- ====================================================== -->

    <div class="simulation">


        <!-- ================================================== -->
        <!-- CIRCUITO -->
        <!-- ================================================== -->

        <div class="panel">

            <h2>RLC com Fonte AC (cos)</h2>

            <canvas
                id="circuitCanvas"
                width="500"
                height="500">
            </canvas>

        </div>


        <!-- ================================================== -->
        <!-- GRÁFICO -->
        <!-- ================================================== -->

        <div class="panel">

            <h2>Resposta do circuito</h2>

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


        <!-- R -->

        <div class="slider-row">

            <label for="rSlider">
                R (Ω)
            </label>

            <input
                id="rSlider"
                type="range"
                min="0.1"
                max="10"
                step="0.01"
                value="2">

            <span
                id="rValue"
                class="value">
                2.00 Ω
            </span>

        </div>


        <!-- L -->

        <div class="slider-row">

            <label for="lSlider">
                L (H)
            </label>

            <input
                id="lSlider"
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value="1">

            <span
                id="lValue"
                class="value">
                1.00 H
            </span>

        </div>


        <!-- C -->

        <div class="slider-row">

            <label for="cSlider">
                C (F)
            </label>

            <input
                id="cSlider"
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value="1">

            <span
                id="cValue"
                class="value">
                1.00 F
            </span>

        </div>


        <!-- V0 -->

        <div class="slider-row">

            <label for="v0Slider">
                V₀ (V)
            </label>

            <input
                id="v0Slider"
                type="range"
                min="0"
                max="10"
                step="0.01"
                value="5">

            <span
                id="v0Value"
                class="value">
                5.00 V
            </span>

        </div>


        <!-- OMEGA -->

        <div class="slider-row">

            <label for="omegaSlider">
                ω (rad/s)
            </label>

            <input
                id="omegaSlider"
                type="range"
                min="0.1"
                max="10"
                step="0.01"
                value="2">

            <span
                id="omegaValue"
                class="value">
                2.00 rad/s
            </span>

        </div>


        <!-- q0 -->

        <div class="slider-row">

            <label for="q0Slider">
                q₀ (C)
            </label>

            <input
                id="q0Slider"
                type="range"
                min="-20"
                max="20"
                step="0.01"
                value="0">

            <span
                id="q0Value"
                class="value">
                0.00 C
            </span>

        </div>


        <!-- i0 -->

        <div class="slider-row">

            <label for="i0Slider">
                i₀ (A)
            </label>

            <input
                id="i0Slider"
                type="range"
                min="-20"
                max="20"
                step="0.01"
                value="0">

            <span
                id="i0Value"
                class="value">
                0.00 A
            </span>

        </div>

    </div>

</div>


<script>

// ============================================================
// CANVAS
// ============================================================

const circuitCanvas =
    document.getElementById(
        "circuitCanvas"
    );

const circuitCtx =
    circuitCanvas.getContext("2d");


const graphCanvas =
    document.getElementById(
        "graphCanvas"
    );

const graphCtx =
    graphCanvas.getContext("2d");


// ============================================================
// PARÂMETROS
// ============================================================

let R = 2.0;
let L = 1.0;
let C = 1.0;

let q0 = 0.0;
let i0 = 0.0;

let V0 = 5.0;
let drivingOmega = 2.0;


// ============================================================
// SIMULAÇÃO
// ============================================================

const N = 500;

const tStart = 0.0;
const tEnd = 20.0;

let time = [];
let charge = [];
let current = [];


// ============================================================
// CAMINHO DOS ELÉTRONS
// ============================================================

let pathX = [];
let pathY = [];

const numberOfElectrons = 25;

let electronPosition = [];


// ============================================================
// SISTEMA DIFERENCIAL
// ============================================================

function f(q, i, t) {

    const Vt =
        V0 *
        Math.cos(
            drivingOmega * t
        );


    const dqdt =
        i;


    const didt =
        (Vt / L)
        - (R / L) * i
        - (1 / (L * C)) * q;


    return {
        q: dqdt,
        i: didt
    };
}


// ============================================================
// CLASSIFICAÇÃO DO REGIME
// ============================================================

function classifyRegime() {

    const omega0 =
        1 /
        Math.sqrt(
            L * C
        );


    const gamma =
        R /
        (2 * L);


    if (
        Math.abs(
            gamma - omega0
        ) < 1e-3
    ) {

        return "Criticamente amortecido";

    } else if (
        gamma > omega0
    ) {

        return "Superamortecido";

    } else {

        return "Subamortecido";
    }
}


// ============================================================
// RK4
// ============================================================

function RK4() {

    const h =
        (tEnd - tStart) / N;


    time = [];
    charge = [];
    current = [];


    let q = q0;
    let i = i0;


    time.push(tStart);
    charge.push(q);
    current.push(i);


    for (
        let k = 0;
        k < N;
        k++
    ) {

        const t =
            tStart + k * h;


        // ----------------------------------------------------
        // k1
        // ----------------------------------------------------

        const k1 =
            f(
                q,
                i,
                t
            );


        const k1q =
            h * k1.q;

        const k1i =
            h * k1.i;


        // ----------------------------------------------------
        // k2
        // ----------------------------------------------------

        const k2 =
            f(
                q + 0.5 * k1q,
                i + 0.5 * k1i,
                t + 0.5 * h
            );


        const k2q =
            h * k2.q;

        const k2i =
            h * k2.i;


        // ----------------------------------------------------
        // k3
        // ----------------------------------------------------

        const k3 =
            f(
                q + 0.5 * k2q,
                i + 0.5 * k2i,
                t + 0.5 * h
            );


        const k3q =
            h * k3.q;

        const k3i =
            h * k3.i;


        // ----------------------------------------------------
        // k4
        // ----------------------------------------------------

        const k4 =
            f(
                q + k3q,
                i + k3i,
                t + h
            );


        const k4q =
            h * k4.q;

        const k4i =
            h * k4.i;


        // ----------------------------------------------------
        // ATUALIZAÇÃO RK4
        // ----------------------------------------------------

        q +=
            (
                k1q
                + 2 * k2q
                + 2 * k3q
                + k4q
            ) / 6;


        i +=
            (
                k1i
                + 2 * k2i
                + 2 * k3i
                + k4i
            ) / 6;


        time.push(
            t + h
        );

        charge.push(q);
        current.push(i);
    }
}


// ============================================================
// SOLVER
// ============================================================

function solve() {

    RK4();
}


// ============================================================
// CAMINHO DOS ELÉTRONS
// ============================================================

function createElectronPath() {

    pathX = [];
    pathY = [];


    const x0 = 70;
    const x1 = 430;

    const y0 = 110;
    const y1 = 390;


    // --------------------------------------------------------
    // PARTE INFERIOR
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            x0
            + (x1 - x0)
            * i / 99;

        pathX.push(x);
        pathY.push(y0);
    }


    // --------------------------------------------------------
    // LADO DIREITO
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const y =
            y0
            + (y1 - y0)
            * i / 99;

        pathX.push(x1);
        pathY.push(y);
    }


    // --------------------------------------------------------
    // PARTE SUPERIOR
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            x1
            - (x1 - x0)
            * i / 99;

        pathX.push(x);
        pathY.push(y1);
    }


    // --------------------------------------------------------
    // LADO ESQUERDO
    // --------------------------------------------------------

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const y =
            y1
            - (y1 - y0)
            * i / 99;

        pathX.push(x0);
        pathY.push(y);
    }


    // --------------------------------------------------------
    // POSIÇÃO INICIAL DOS ELÉTRONS
    // --------------------------------------------------------

    electronPosition = [];


    for (
        let i = 0;
        i < numberOfElectrons;
        i++
    ) {

        electronPosition.push(
            i /
            numberOfElectrons
            * pathX.length
        );
    }
}


// ============================================================
// DESENHA CIRCUITO
// ============================================================

function drawCircuit(frame) {

    const ctx =
        circuitCtx;


    const width =
        circuitCanvas.width;

    const height =
        circuitCanvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // ========================================================
    // COORDENADAS
    // ========================================================

    const x0 = 70;
    const x1 = 430;

    const y0 = 110;
    const y1 = 390;


    // ========================================================
    // FIOS
    // ========================================================

    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 3;


    // inferior
    ctx.beginPath();

    ctx.moveTo(
        x0,
        y0
    );

    ctx.lineTo(
        x1,
        y0
    );

    ctx.stroke();


    // direita
    ctx.beginPath();

    ctx.moveTo(
        x1,
        y0
    );

    ctx.lineTo(
        x1,
        y1
    );

    ctx.stroke();


    // superior
    ctx.beginPath();

    ctx.moveTo(
        x1,
        y1
    );

    ctx.lineTo(
        x0,
        y1
    );

    ctx.stroke();


    // esquerda
    ctx.beginPath();

    ctx.moveTo(
        x0,
        y1
    );

    ctx.lineTo(
        x0,
        y0
    );

    ctx.stroke();


    // ========================================================
    // RESISTOR
    // ========================================================

    const resistorStart = 180;
    const resistorEnd = 320;

    const resistorPoints = 9;


    ctx.beginPath();


    for (
        let k = 0;
        k < resistorPoints;
        k++
    ) {

        const px =
            resistorStart
            +
            (
                resistorEnd
                - resistorStart
            )
            * k
            / (resistorPoints - 1);


        let py;

        if (k % 2 === 0) {

            py = y0;

        } else {

            py =
                y0 + 20;
        }


        if (k === 0) {

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
        "#222222";

    ctx.lineWidth = 3;

    ctx.stroke();


    // ========================================================
    // CAPACITOR
    // ========================================================

    const capacitorY1 = 210;
    const capacitorY2 = 290;


    ctx.lineWidth = 3;


    // fio acima
    ctx.beginPath();

    ctx.moveTo(
        x1,
        y0
    );

    ctx.lineTo(
        x1,
        capacitorY1
    );

    ctx.stroke();


    // fio abaixo
    ctx.beginPath();

    ctx.moveTo(
        x1,
        capacitorY2
    );

    ctx.lineTo(
        x1,
        y1
    );

    ctx.stroke();


    // placas
    ctx.beginPath();

    ctx.moveTo(
        x1 - 25,
        capacitorY1
    );

    ctx.lineTo(
        x1 + 25,
        capacitorY1
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        x1 - 25,
        capacitorY2
    );

    ctx.lineTo(
        x1 + 25,
        capacitorY2
    );

    ctx.stroke();


    // ========================================================
    // INDUTOR
    // ========================================================

    const inductorStart = 180;
    const inductorEnd = 320;


    ctx.beginPath();


    const coils = 4;


    for (
        let i = 0;
        i <= 120;
        i++
    ) {

        const theta =
            2 *
            Math.PI *
            coils *
            i / 120;


        const px =
            inductorStart
            +
            (
                inductorEnd
                - inductorStart
            )
            *
            i
            / 120;


        const py =
            y1
            +
            20 *
            Math.sin(theta);


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
        "#222222";

    ctx.lineWidth = 3;

    ctx.stroke();


    // ========================================================
    // FONTE AC
    // ========================================================

    const sourceX =
        x0;

    const sourceY =
        (y0 + y1) / 2;


    // círculo
    ctx.beginPath();

    ctx.arc(
        sourceX,
        sourceY,
        38,
        0,
        2 * Math.PI
    );

    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 3;

    ctx.stroke();


    // seno
    ctx.beginPath();


    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const angle =
            -Math.PI
            +
            2 *
            Math.PI *
            i / 100;


        const px =
            sourceX
            +
            28 *
            angle
            / Math.PI;


        const py =
            sourceY
            +
            16 *
            Math.sin(angle);


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


    ctx.stroke();


    // ========================================================
    // LABELS
    // ========================================================

    ctx.font =
        "18px Arial";

    ctx.fillStyle =
        "#111111";


    ctx.fillText(
        "R",
        245,
        90
    );


    ctx.fillText(
        "L",
        245,
        440
    );


    ctx.fillText(
        "C",
        455,
        255
    );


    ctx.fillText(
        "AC",
        25,
        255
    );


    // ========================================================
    // ELÉTRONS
    // ========================================================

    const currentValue =
        current[frame];


    const speed =
        5 *
        currentValue;


    for (
        let i = 0;
        i < numberOfElectrons;
        i++
    ) {

        electronPosition[i] +=
            speed;


        electronPosition[i] =
            (
                electronPosition[i]
                %
                pathX.length
            );


        if (
            electronPosition[i] < 0
        ) {

            electronPosition[i] +=
                pathX.length;
        }


        const index =
            Math.floor(
                electronPosition[i]
            );


        const ex =
            pathX[index];

        const ey =
            pathY[index];


        ctx.beginPath();

        ctx.arc(
            ex,
            ey,
            5,
            0,
            2 * Math.PI
        );


        ctx.fillStyle =
            "#2563eb";

        ctx.fill();
    }


    // ========================================================
    // HUD
    // ========================================================

    drawHUD(frame);
}


// ============================================================
// HUD
// ============================================================

function drawHUD(frame) {

    const ctx =
        circuitCtx;


    const lines = [

        `R = ${R.toFixed(2)} Ω`,
        `L = ${L.toFixed(2)} H`,
        `C = ${C.toFixed(2)} F`,
        "",
        `Regime: ${classifyRegime()}`,
        "",
        `q₀ = ${q0.toFixed(2)} C`,
        `i₀ = ${i0.toFixed(2)} A`,
        "",
        `q = ${charge[frame].toFixed(2)} C`,
        `i = ${current[frame].toFixed(2)} A`,
        "",
        `t = ${time[frame].toFixed(2)} s`

    ];


    ctx.font =
        "14px Arial";


    ctx.fillStyle =
        "#111111";


    let yPosition = 25;


    for (
        const line of lines
    ) {

        ctx.fillText(
            line,
            15,
            yPosition
        );

        yPosition += 19;
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


    let ymin =
        Infinity;

    let ymax =
        -Infinity;


    for (
        let i = 0;
        i <= frame;
        i++
    ) {

        ymin =
            Math.min(
                ymin,
                Math.abs(charge[i])
            );

        ymax =
            Math.max(
                ymax,
                Math.abs(charge[i])
            );


        ymin =
            Math.min(
                ymin,
                Math.abs(current[i])
            );

        ymax =
            Math.max(
                ymax,
                Math.abs(current[i])
            );
    }


    ymin = -ymax;


    if (
        Math.abs(ymax - ymin)
        < 1e-8
    ) {

        ymax += 1;
        ymin -= 1;
    }


    const margin =
        0.2 *
        (ymax - ymin);


    return {
        min: ymin - margin,
        max: ymax + margin
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


    // ========================================================
    // ÁREA
    // ========================================================

    const left = 60;
    const right = width - 30;

    const top = 30;
    const bottom = height - 50;


    // ========================================================
    // LIMITES
    // ========================================================

    const limits =
        getGraphLimits(frame);


    const ymin =
        limits.min;

    const ymax =
        limits.max;


    // ========================================================
    // CONVERSÃO
    // ========================================================

    function screenX(t) {

        return left +
            (
                t / tEnd
            )
            *
            (
                right - left
            );
    }


    function screenY(value) {

        return bottom -
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


    // ========================================================
    // EIXOS
    // ========================================================

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


    // ========================================================
    // q(t)
    // ========================================================

    ctx.beginPath();


    for (
        let i = 0;
        i <= frame;
        i++
    ) {

        const px =
            screenX(time[i]);

        const py =
            screenY(charge[i]);


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
        "#2563eb";

    ctx.lineWidth = 2;

    ctx.stroke();


    // ========================================================
    // i(t)
    // ========================================================

    ctx.beginPath();


    for (
        let i = 0;
        i <= frame;
        i++
    ) {

        const px =
            screenX(time[i]);

        const py =
            screenY(current[i]);


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
        "#dc2626";

    ctx.lineWidth = 2;

    ctx.stroke();


    // ========================================================
    // LABELS
    // ========================================================

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
        "q(t), i(t)",
        5,
        20
    );


    ctx.fillStyle =
        "#2563eb";


    ctx.fillText(
        "q(t) — C",
        width - 130,
        25
    );


    ctx.fillStyle =
        "#dc2626";


    ctx.fillText(
        "i(t) — A",
        width - 130,
        45
    );
}


// ============================================================
// FRAME
// ============================================================

function updateFrame(frame) {

    drawCircuit(frame);

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
        >= 15
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

    resetElectrons();

    frame = 0;

    updateFrame(0);
}


// ============================================================
// RESET DOS ELÉTRONS
// ============================================================

function resetElectrons() {

    electronPosition = [];


    for (
        let i = 0;
        i < numberOfElectrons;
        i++
    ) {

        electronPosition.push(
            i /
            numberOfElectrons
            * pathX.length
        );
    }
}


// ============================================================
// SLIDERS
// ============================================================

const rSlider =
    document.getElementById(
        "rSlider"
    );


const lSlider =
    document.getElementById(
        "lSlider"
    );


const cSlider =
    document.getElementById(
        "cSlider"
    );


const v0Slider =
    document.getElementById(
        "v0Slider"
    );


const omegaSlider =
    document.getElementById(
        "omegaSlider"
    );


const q0Slider =
    document.getElementById(
        "q0Slider"
    );


const i0Slider =
    document.getElementById(
        "i0Slider"
    );


// ============================================================
// R
// ============================================================

rSlider.addEventListener(
    "input",
    function () {

        R =
            parseFloat(
                this.value
            );


        document.getElementById(
            "rValue"
        ).textContent =
            R.toFixed(2)
            + " Ω";


        updateSimulation();
    }
);


// ============================================================
// L
// ============================================================

lSlider.addEventListener(
    "input",
    function () {

        L =
            parseFloat(
                this.value
            );


        document.getElementById(
            "lValue"
        ).textContent =
            L.toFixed(2)
            + " H";


        updateSimulation();
    }
);


// ============================================================
// C
// ============================================================

cSlider.addEventListener(
    "input",
    function () {

        C =
            parseFloat(
                this.value
            );


        document.getElementById(
            "cValue"
        ).textContent =
            C.toFixed(2)
            + " F";


        updateSimulation();
    }
);


// ============================================================
// V0
// ============================================================

v0Slider.addEventListener(
    "input",
    function () {

        V0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "v0Value"
        ).textContent =
            V0.toFixed(2)
            + " V";


        updateSimulation();
    }
);


// ============================================================
// OMEGA
// ============================================================

omegaSlider.addEventListener(
    "input",
    function () {

        drivingOmega =
            parseFloat(
                this.value
            );


        document.getElementById(
            "omegaValue"
        ).textContent =
            drivingOmega.toFixed(2)
            + " rad/s";


        updateSimulation();
    }
);


// ============================================================
// q0
// ============================================================

q0Slider.addEventListener(
    "input",
    function () {

        q0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "q0Value"
        ).textContent =
            q0.toFixed(2)
            + " C";


        updateSimulation();
    }
);


// ============================================================
// i0
// ============================================================

i0Slider.addEventListener(
    "input",
    function () {

        i0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "i0Value"
        ).textContent =
            i0.toFixed(2)
            + " A";


        updateSimulation();
    }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

createElectronPath();

solve();

resetElectrons();

updateFrame(0);

requestAnimationFrame(
    animate
);

</script>

</body>

</html>
```
