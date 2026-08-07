```html
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Simulação — Pêndulo Amortecido</title>

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
            width: 130px;
            font-weight: bold;
        }

        .slider-row input {
            flex: 1;
        }

        .value {
            width: 120px;
            text-align: right;
        }

        .regime {
            margin-top: 15px;
            padding: 12px;

            background: #f1f1f1;
            border-radius: 8px;

            font-weight: bold;
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
        Simulação — Pêndulo Amortecido
    </h1>


    <!-- ====================================================== -->
    <!-- SIMULAÇÃO -->
    <!-- ====================================================== -->

    <div class="simulation">


        <!-- ================================================== -->
        <!-- PÊNDULO -->
        <!-- ================================================== -->

        <div class="panel">

            <h2>Pêndulo amortecido</h2>

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


        <!-- L -->

        <div class="slider-row">

            <label for="lSlider">
                L (m)
            </label>

            <input
                id="lSlider"
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value="0.10"
            >

            <span
                id="lValue"
                class="value">
                0.10 m
            </span>

        </div>


        <!-- m -->

        <div class="slider-row">

            <label for="mSlider">
                m (kg)
            </label>

            <input
                id="mSlider"
                type="range"
                min="0.1"
                max="10"
                step="0.01"
                value="1"
            >

            <span
                id="mValue"
                class="value">
                1.00 kg
            </span>

        </div>


        <!-- b -->

        <div class="slider-row">

            <label for="bSlider">
                b (kg/s)
            </label>

            <input
                id="bSlider"
                type="range"
                min="0"
                max="50"
                step="0.01"
                value="0.5"
            >

            <span
                id="bValue"
                class="value">
                0.50 kg/s
            </span>

        </div>


        <!-- theta0 -->

        <div class="slider-row">

            <label for="theta0Slider">
                θ₀ (rad)
            </label>

            <input
                id="theta0Slider"
                type="range"
                min="-3.14159265"
                max="3.14159265"
                step="0.01"
                value="1"
            >

            <span
                id="theta0Value"
                class="value">
                1.00 rad
            </span>

        </div>


        <!-- omega0 -->

        <div class="slider-row">

            <label for="omega0Slider">
                ω₀ (rad/s)
            </label>

            <input
                id="omega0Slider"
                type="range"
                min="-10"
                max="10"
                step="0.01"
                value="0"
            >

            <span
                id="omega0Value"
                class="value">
                0.00 rad/s
            </span>

        </div>


        <div class="regime">

            Regime linear:
            <span id="regimeValue">
                Subamortecido
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

let L = 0.10;

let m = 1.0;

let b = 0.5;

let theta0 = 1.0;

let omega0 = 0.0;


// ============================================================
// PARÂMETROS DA SIMULAÇÃO
// ============================================================

const N = 500;

const tStart = 0;

const tEnd = 10;


// ============================================================
// ARRAYS
// ============================================================

let time = [];

let theta = [];

let omega = [];

let x = [];

let y = [];


// ============================================================
// SISTEMA DIFERENCIAL
// ============================================================

function f(
    theta,
    omega
) {

    return {

        theta:
            omega,

        omega:
            -(g / L)
            *
            Math.sin(theta)

            -

            (b / m)
            *
            omega

    };
}


// ============================================================
// RK4
// ============================================================

function RK4() {

    const h =
        (tEnd - tStart) / N;


    time = [];

    theta = [];

    omega = [];


    let th =
        theta0;

    let om =
        omega0;


    time.push(
        tStart
    );

    theta.push(
        th
    );

    omega.push(
        om
    );


    for (
        let i = 0;
        i < N;
        i++
    ) {


        // ====================================================
        // k1
        // ====================================================

        const k1 =
            f(
                th,
                om
            );


        const k1th =
            h *
            k1.theta;

        const k1om =
            h *
            k1.omega;


        // ====================================================
        // k2
        // ====================================================

        const k2 =
            f(
                th
                +
                0.5 * k1th,

                om
                +
                0.5 * k1om
            );


        const k2th =
            h *
            k2.theta;

        const k2om =
            h *
            k2.omega;


        // ====================================================
        // k3
        // ====================================================

        const k3 =
            f(
                th
                +
                0.5 * k2th,

                om
                +
                0.5 * k2om
            );


        const k3th =
            h *
            k3.theta;

        const k3om =
            h *
            k3.omega;


        // ====================================================
        // k4
        // ====================================================

        const k4 =
            f(
                th + k3th,
                om + k3om
            );


        const k4th =
            h *
            k4.theta;

        const k4om =
            h *
            k4.omega;


        // ====================================================
        // ATUALIZAÇÃO RK4
        // ====================================================

        th +=
            (
                k1th
                +
                2 * k2th
                +
                2 * k3th
                +
                k4th
            )
            /
            6;


        om +=
            (
                k1om
                +
                2 * k2om
                +
                2 * k3om
                +
                k4om
            )
            /
            6;


        // ====================================================
        // SALVA
        // ====================================================

        time.push(
            tStart
            +
            (i + 1) * h
        );

        theta.push(
            th
        );

        omega.push(
            om
        );
    }
}


// ============================================================
// SOLVER
// ============================================================

function solve() {

    RK4();


    x = [];
    y = [];


    for (
        let i = 0;
        i <= N;
        i++
    ) {

        x.push(
            L *
            Math.sin(
                theta[i]
            )
        );


        y.push(
            -L *
            Math.cos(
                theta[i]
            )
        );
    }
}


// ============================================================
// CLASSIFICAÇÃO DO REGIME
// ============================================================

function classifyRegime() {

    const omegaNatural =
        Math.sqrt(
            g / L
        );


    const gamma =
        (b / m) / 2;


    const delta =
        Math.pow(gamma, 2)
        -
        Math.pow(
            omegaNatural,
            2
        );


    if (
        Math.abs(b / m)
        < 1e-6
    ) {

        return "Sem amortecimento";
    }


    if (
        Math.abs(delta)
        < 1e-3
    ) {

        return "Criticamente amortecido";
    }


    if (
        delta > 0
    ) {

        return "Superamortecido";
    }


    return "Subamortecido";
}


// ============================================================
// ESCALA DO PÊNDULO
// ============================================================

function getPendulumScale() {

    const limit =
        1.2 * L;


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
        *
        0.80;


    // --------------------------------------------------------
    // ORIGEM
    // --------------------------------------------------------

    const originX =
        width / 2;


    const originY =
        height / 2;


    // --------------------------------------------------------
    // MASSA
    // --------------------------------------------------------

    const px =
        originX
        +
        x[frame]
        *
        scale;


    const py =
        originY
        -
        y[frame]
        *
        scale;


    // --------------------------------------------------------
    // LINHA DE REFERÊNCIA
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
        L * scale
    );


    ctx.strokeStyle =
        "#cccccc";

    ctx.lineWidth =
        1;

    ctx.stroke();


    // --------------------------------------------------------
    // HASTE
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        originX,
        originY
    );

    ctx.lineTo(
        px,
        py
    );


    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth =
        4;

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
    // MASSA
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        17,
        0,
        2 * Math.PI
    );


    ctx.fillStyle =
        "#2563eb";

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


    const regime =
        classifyRegime();


    const lines = [

        `L = ${L.toFixed(2)} m`,

        `g = ${g.toFixed(2)} m/s²`,

        `m = ${m.toFixed(2)} kg`,

        `b = ${b.toFixed(2)} kg/s`,

        "",

        `Regime linear:`,

        `${regime}`,

        "",

        `θ = ${theta[frame].toFixed(2)} rad`,

        `ω = ${omega[frame].toFixed(2)} rad/s`,

        "",

        `t = ${time[frame].toFixed(2)} s`

    ];


    ctx.font =
        "14px Arial";


    ctx.fillStyle =
        "#111111";


    let yPosition =
        25;


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


    document.getElementById(
        "regimeValue"
    ).textContent =
        regime;
}


// ============================================================
// LIMITES DO GRÁFICO
// ============================================================

function getGraphLimits(
    data,
    frame
) {

    if (
        frame < 5
    ) {

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
                data[i]
            );


        dataMax =
            Math.max(
                dataMax,
                data[i]
            );
    }


    if (
        Math.abs(
            dataMax - dataMin
        )
        < 1e-8
    ) {

        dataMax += 1;
        dataMin -= 1;
    }


    return {

        min:
            dataMin
            -
            0.2 *
            (
                dataMax
                -
                dataMin
            ),

        max:
            dataMax
            +
            0.2 *
            (
                dataMax
                -
                dataMin
            )
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
    const right = width - 50;

    const top = 35;
    const bottom = height - 50;


    // --------------------------------------------------------
    // LIMITES θ
    // --------------------------------------------------------

    const thetaLimits =
        getGraphLimits(
            theta,
            frame
        );


    // --------------------------------------------------------
    // LIMITES ω
    // --------------------------------------------------------

    const omegaLimits =
        getGraphLimits(
            omega,
            frame
        );


    // --------------------------------------------------------
    // CONVERSÃO X
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


    // --------------------------------------------------------
    // CONVERSÃO Y θ
    // --------------------------------------------------------

    function screenYTheta(value) {

        return bottom
            -
            (
                (value - thetaLimits.min)
                /
                (
                    thetaLimits.max
                    -
                    thetaLimits.min
                )
            )
            *
            (
                bottom - top
            );
    }


    // --------------------------------------------------------
    // CONVERSÃO Y ω
    // --------------------------------------------------------

    function screenYOmega(value) {

        return bottom
            -
            (
                (value - omegaLimits.min)
                /
                (
                    omegaLimits.max
                    -
                    omegaLimits.min
                )
            )
            *
            (
                bottom - top
            );
    }


    // --------------------------------------------------------
    // EIXO X
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        left,
        bottom
    );

    ctx.lineTo(
        right,
        bottom
    );


    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth =
        1;

    ctx.stroke();


    // --------------------------------------------------------
    // EIXO θ
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        left,
        top
    );

    ctx.lineTo(
        left,
        bottom
    );


    ctx.strokeStyle =
        "#2563eb";

    ctx.stroke();


    // --------------------------------------------------------
    // EIXO ω
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        right,
        top
    );

    ctx.lineTo(
        right,
        bottom
    );


    ctx.strokeStyle =
        "#f97316";

    ctx.stroke();


    // --------------------------------------------------------
    // CURVA θ
    // --------------------------------------------------------

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
            screenYTheta(
                theta[i]
            );


        if (
            i === 0
        ) {

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

    ctx.lineWidth =
        2;

    ctx.stroke();


    // --------------------------------------------------------
    // CURVA ω
    // --------------------------------------------------------

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
            screenYOmega(
                omega[i]
            );


        if (
            i === 0
        ) {

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
        "#f97316";

    ctx.lineWidth =
        2;

    ctx.stroke();


    // --------------------------------------------------------
    // LABELS
    // --------------------------------------------------------

    ctx.font =
        "13px Arial";


    ctx.fillStyle =
        "#2563eb";


    ctx.fillText(
        "θ(t) [rad]",
        8,
        20
    );


    ctx.fillStyle =
        "#f97316";


    ctx.fillText(
        "ω(t) [rad/s]",
        right - 75,
        20
    );


    ctx.fillStyle =
        "#111111";


    ctx.fillText(
        "t [s]",
        width / 2,
        height - 10
    );


    // --------------------------------------------------------
    // VALORES DOS EIXOS
    // --------------------------------------------------------

    ctx.fillStyle =
        "#2563eb";


    ctx.fillText(
        thetaLimits.max.toFixed(1),
        8,
        top + 5
    );


    ctx.fillText(
        thetaLimits.min.toFixed(1),
        8,
        bottom
    );


    ctx.fillStyle =
        "#f97316";


    ctx.fillText(
        omegaLimits.max.toFixed(1),
        right + 5,
        top + 5
    );


    ctx.fillText(
        omegaLimits.min.toFixed(1),
        right + 5,
        bottom
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


const lSlider =
    document.getElementById(
        "lSlider"
    );


const mSlider =
    document.getElementById(
        "mSlider"
    );


const bSlider =
    document.getElementById(
        "bSlider"
    );


const theta0Slider =
    document.getElementById(
        "theta0Slider"
    );


const omega0Slider =
    document.getElementById(
        "omega0Slider"
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
            +
            " m/s²";


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
            +
            " m";


        updateSimulation();
    }
);


// ============================================================
// m
// ============================================================

mSlider.addEventListener(
    "input",
    function () {

        m =
            parseFloat(
                this.value
            );


        document.getElementById(
            "mValue"
        ).textContent =
            m.toFixed(2)
            +
            " kg";


        updateSimulation();
    }
);


// ============================================================
// b
// ============================================================

bSlider.addEventListener(
    "input",
    function () {

        b =
            parseFloat(
                this.value
            );


        document.getElementById(
            "bValue"
        ).textContent =
            b.toFixed(2)
            +
            " kg/s";


        updateSimulation();
    }
);


// ============================================================
// THETA0
// ============================================================

theta0Slider.addEventListener(
    "input",
    function () {

        theta0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "theta0Value"
        ).textContent =
            theta0.toFixed(2)
            +
            " rad";


        updateSimulation();
    }
);


// ============================================================
// OMEGA0
// ============================================================

omega0Slider.addEventListener(
    "input",
    function () {

        omega0 =
            parseFloat(
                this.value
            );


        document.getElementById(
            "omega0Value"
        ).textContent =
            omega0.toFixed(2)
            +
            " rad/s";


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
