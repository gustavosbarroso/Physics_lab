```html
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Simulação - Pêndulo Simples</title>

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
            width: 1200px;
            max-width: 95%;
            margin: 20px auto;
        }

        .title {
            text-align: center;
            margin-bottom: 20px;
        }

        .simulation {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 20px;
        }

        .panel {
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        canvas {
            width: 100%;
            display: block;
        }

        #pendulumCanvas {
            height: 450px;
        }

        #graphCanvas {
            height: 400px;
        }

        .controls {
            margin-top: 20px;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .slider-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 12px 0;
        }

        .slider-row label {
            width: 100px;
            font-weight: bold;
        }

        .slider-row input {
            flex: 1;
        }

        .value {
            width: 100px;
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
        Simulação — Pêndulo Simples
    </h1>

    <div class="simulation">

        <!-- ================================================= -->
        <!-- PÊNDULO -->
        <!-- ================================================= -->

        <div class="panel">

            <h2>Pêndulo</h2>

            <canvas
                id="pendulumCanvas"
                width="500"
                height="450">
            </canvas>

        </div>

        <!-- ================================================= -->
        <!-- GRÁFICO -->
        <!-- ================================================= -->

        <div class="panel">

            <h2>Evolução temporal</h2>

            <canvas
                id="graphCanvas"
                width="700"
                height="400">
            </canvas>

        </div>

    </div>

    <!-- ===================================================== -->
    <!-- CONTROLES -->
    <!-- ===================================================== -->

    <div class="controls">

        <h2>Parâmetros</h2>

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
                value="9.81">

            <span
                id="gValue"
                class="value">
                9.81
            </span>

        </div>

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
                value="0.10">

            <span
                id="lValue"
                class="value">
                0.10
            </span>

        </div>

        <div class="slider-row">

            <label for="thetaSlider">
                θ₀ (rad)
            </label>

            <input
                id="thetaSlider"
                type="range"
                min="-3.14159265"
                max="3.14159265"
                step="0.01"
                value="1">

            <span
                id="thetaValue"
                class="value">
                1.00
            </span>

        </div>

        <div class="slider-row">

            <label for="omegaSlider">
                ω₀ (rad/s)
            </label>

            <input
                id="omegaSlider"
                type="range"
                min="-10"
                max="10"
                step="0.01"
                value="0">

            <span
                id="omegaValue"
                class="value">
                0.00
            </span>

        </div>

    </div>

</div>

<script>

// ============================================================
// CANVAS
// ============================================================

const pendulumCanvas =
    document.getElementById("pendulumCanvas");

const pendulumCtx =
    pendulumCanvas.getContext("2d");

const graphCanvas =
    document.getElementById("graphCanvas");

const graphCtx =
    graphCanvas.getContext("2d");


// ============================================================
// PARÂMETROS
// ============================================================

let g = 9.81;
let L = 0.10;

let theta0 = 1.0;
let omega0 = 0.0;


// ============================================================
// SIMULAÇÃO
// ============================================================

const N = 500;

const tStart = 0.0;
const tEnd = 10.0;

let time = [];
let theta = [];
let omega = [];

let x = [];
let y = [];


// ============================================================
// SISTEMA DIFERENCIAL
// ============================================================

function f(theta, omega, t) {

    const dTheta = omega;

    const dOmega =
        -(g / L) * Math.sin(theta);

    return {
        theta: dTheta,
        omega: dOmega
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

    let th = theta0;
    let om = omega0;

    time.push(tStart);
    theta.push(th);
    omega.push(om);

    for (let i = 0; i < N; i++) {

        const t =
            tStart + i * h;

        // ----------------------------------------------------
        // k1
        // ----------------------------------------------------

        const k1 =
            f(th, om, t);

        const k1Theta =
            h * k1.theta;

        const k1Omega =
            h * k1.omega;


        // ----------------------------------------------------
        // k2
        // ----------------------------------------------------

        const k2 =
            f(
                th + 0.5 * k1Theta,
                om + 0.5 * k1Omega,
                t + 0.5 * h
            );

        const k2Theta =
            h * k2.theta;

        const k2Omega =
            h * k2.omega;


        // ----------------------------------------------------
        // k3
        // ----------------------------------------------------

        const k3 =
            f(
                th + 0.5 * k2Theta,
                om + 0.5 * k2Omega,
                t + 0.5 * h
            );

        const k3Theta =
            h * k3.theta;

        const k3Omega =
            h * k3.omega;


        // ----------------------------------------------------
        // k4
        // ----------------------------------------------------

        const k4 =
            f(
                th + k3Theta,
                om + k3Omega,
                t + h
            );

        const k4Theta =
            h * k4.theta;

        const k4Omega =
            h * k4.omega;


        // ----------------------------------------------------
        // ATUALIZAÇÃO RK4
        // ----------------------------------------------------

        th +=
            (
                k1Theta
                + 2 * k2Theta
                + 2 * k3Theta
                + k4Theta
            ) / 6;

        om +=
            (
                k1Omega
                + 2 * k2Omega
                + 2 * k3Omega
                + k4Omega
            ) / 6;


        time.push(t + h);
        theta.push(th);
        omega.push(om);
    }


    // ========================================================
    // COORDENADAS CARTESIANAS
    // ========================================================

    x = [];
    y = [];

    for (let i = 0; i <= N; i++) {

        x.push(
            L * Math.sin(theta[i])
        );

        y.push(
            -L * Math.cos(theta[i])
        );
    }
}


// ============================================================
// SOLVER
// ============================================================

function solve() {

    RK4();
}


// ============================================================
// PÊNDULO
// ============================================================

function drawPendulum(frame) {

    const ctx =
        pendulumCtx;

    const width =
        pendulumCanvas.width;

    const height =
        pendulumCanvas.height;


    // --------------------------------------------------------
    // LIMPA
    // --------------------------------------------------------

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // --------------------------------------------------------
    // CENTRO
    // --------------------------------------------------------

    const pivotX =
        width / 2;

    const pivotY =
        130;


    // --------------------------------------------------------
    // ESCALA DINÂMICA
    // --------------------------------------------------------

    const displayLength =
        230;

    const scale =
        displayLength / L;


    const pendulumX =
        pivotX + x[frame] * scale;

    const pendulumY =
        pivotY - y[frame] * scale;


    // --------------------------------------------------------
    // LINHA DE REFERÊNCIA
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        pivotX,
        pivotY
    );

    ctx.lineTo(
        pivotX,
        pivotY + displayLength
    );

    ctx.strokeStyle =
        "#bbbbbb";

    ctx.lineWidth = 1;

    ctx.stroke();


    // --------------------------------------------------------
    // HASTE
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        pivotX,
        pivotY
    );

    ctx.lineTo(
        pendulumX,
        pendulumY
    );

    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 4;

    ctx.stroke();


    // --------------------------------------------------------
    // PIVÔ
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.arc(
        pivotX,
        pivotY,
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
        pendulumX,
        pendulumY,
        18,
        0,
        2 * Math.PI
    );

    ctx.fillStyle =
        "#1d4ed8";

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

    ctx.font =
        "14px Arial";

    ctx.fillStyle =
        "#111111";

    const lines = [

        `L = ${L.toFixed(2)} m`,
        `g = ${g.toFixed(2)} m/s²`,
        "",
        `θ₀ = ${theta0.toFixed(2)} rad`,
        `ω₀ = ${omega0.toFixed(2)} rad/s`,
        "",
        `θ = ${theta[frame].toFixed(2)} rad`,
        `ω = ${omega[frame].toFixed(2)} rad/s`,
        "",
        `t = ${time[frame].toFixed(2)} s`

    ];


    let yPosition = 25;

    for (const line of lines) {

        ctx.fillText(
            line,
            15,
            yPosition
        );

        yPosition += 20;
    }
}


// ============================================================
// ESCALA DINÂMICA DO GRÁFICO
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


    for (let i = 0; i <= frame; i++) {

        ymin =
            Math.min(
                ymin,
                theta[i],
                omega[i]
            );

        ymax =
            Math.max(
                ymax,
                theta[i],
                omega[i]
            );
    }


    if (
        Math.abs(ymax - ymin)
        < 1e-8
    ) {

        ymax += 1;
        ymin -= 1;
    }


    const margin =
        0.2 * (ymax - ymin);


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


    // --------------------------------------------------------
    // ÁREA DO GRÁFICO
    // --------------------------------------------------------

    const left = 60;
    const right = width - 30;

    const top = 25;
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
    // EIXOS
    // --------------------------------------------------------

    ctx.strokeStyle =
        "#222222";

    ctx.lineWidth = 1;


    // eixo X
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


    // eixo Y
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
    // FUNÇÃO DE CONVERSÃO
    // --------------------------------------------------------

    function screenX(t) {

        return left +
            (t / tEnd)
            * (right - left);
    }


    function screenY(value) {

        return bottom -
            (
                (value - ymin)
                / (ymax - ymin)
            )
            * (bottom - top);
    }


    // --------------------------------------------------------
    // THETA
    // --------------------------------------------------------

    ctx.beginPath();

    for (let i = 0; i <= frame; i++) {

        const px =
            screenX(time[i]);

        const py =
            screenY(theta[i]);


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


    // --------------------------------------------------------
    // OMEGA
    // --------------------------------------------------------

    ctx.beginPath();

    for (let i = 0; i <= frame; i++) {

        const px =
            screenX(time[i]);

        const py =
            screenY(omega[i]);


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


    ctx.fillStyle =
        "#2563eb";

    ctx.fillText(
        "θ(t) — rad",
        width - 130,
        25
    );


    ctx.fillStyle =
        "#dc2626";

    ctx.fillText(
        "ω(t) — rad/s",
        width - 130,
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

const lSlider =
    document.getElementById(
        "lSlider"
    );

const thetaSlider =
    document.getElementById(
        "thetaSlider"
    );

const omegaSlider =
    document.getElementById(
        "omegaSlider"
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
            g.toFixed(2);

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
            L.toFixed(2);

        updateSimulation();
    }
);


// ============================================================
// THETA0
// ============================================================

thetaSlider.addEventListener(
    "input",
    function () {

        theta0 =
            parseFloat(
                this.value
            );

        document.getElementById(
            "thetaValue"
        ).textContent =
            theta0.toFixed(2);

        updateSimulation();
    }
);


// ============================================================
// OMEGA0
// ============================================================

omegaSlider.addEventListener(
    "input",
    function () {

        omega0 =
            parseFloat(
                this.value
            );

        document.getElementById(
            "omegaValue"
        ).textContent =
            omega0.toFixed(2);

        updateSimulation();
    }
);


// ============================================================
// INICIALIZA
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
