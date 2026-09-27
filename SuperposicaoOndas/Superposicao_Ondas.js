// ============================================================
// SIMULAÇÃO DA SUPERPOSIÇÃO DE ONDAS
// ============================================================
//
// y(x,t) = A sen((2π/λ)x - (2πf)t + φ)
//
// A simulação mostra:
//
//        y_resultante = y₁(x,t) + y₂(x,t)
//
// ============================================================


class SuperposicaoOndas {


    // ========================================================
    // CONSTRUTOR
    // ========================================================

    constructor(canvas, options = {}) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");


        // ====================================================
        // PARÂMETROS
        // ====================================================

        this.params = {

            A1:
                options.A1 ?? 10,

            A2:
                options.A2 ?? 10,

            lambda1:
                options.lambda1 ?? 2,

            lambda2:
                options.lambda2 ?? 2,

            f1:
                options.f1 ?? 1,

            f2:
                options.f2 ?? 1,

            phi1:
                options.phi1 ?? 0,

            phi2:
                options.phi2 ?? Math.PI / 2
        };


        // ====================================================
        // PARÂMETROS ESPACIAIS
        // ====================================================

        this.xMin = 0;

        this.xMax = 10;

        this.N = 1000;


        // ====================================================
        // TEMPO
        // ====================================================

        this.t = 0;


        // ====================================================
        // LIMITES VERTICAIS
        // ====================================================

        this.yMin = -22;

        this.yMax = 22;


        // ====================================================
        // CONTROLES
        // ====================================================

        this.createControls();


        // ====================================================
        // DESENHO INICIAL
        // ====================================================

        this.draw();


        // ====================================================
        // ANIMAÇÃO
        // ====================================================

        this.iniciar();
    }


    // ========================================================
    // GERADOR DE ONDA
    // ========================================================

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
                    (2 * Math.PI) /
                    comprimento_onda
                ) * x

                -

                (2 * Math.PI * f) * t

                +

                phi
            );
    }


    // ========================================================
    // CONTROLES
    // ========================================================

    createControls() {

        this.controlsContainer =
            document.createElement("div");


        this.controlsContainer.className =
            "ondas-controls";


        this.controlsContainer.innerHTML = `

            <h2>Superposição de Ondas</h2>


            <!-- ==========================================
                 ONDA 1
                 ========================================== -->

            <h3>Onda 1</h3>


            <div class="control">

                <label>

                    <span class="control-label">
                        A₁ (m):
                    </span>

                    <input
                        type="range"
                        id="ondas-A1"
                        min="-10"
                        max="10"
                        step="0.1"
                        value="${this.params.A1}"
                    >

                    <span id="ondas-A1-value">
                        ${this.params.A1.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        λ₁ (m):
                    </span>

                    <input
                        type="range"
                        id="ondas-lambda1"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value="${this.params.lambda1}"
                    >

                    <span id="ondas-lambda1-value">
                        ${this.params.lambda1.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        f₁ (Hz):
                    </span>

                    <input
                        type="range"
                        id="ondas-f1"
                        min="0"
                        max="5"
                        step="0.1"
                        value="${this.params.f1}"
                    >

                    <span id="ondas-f1-value">
                        ${this.params.f1.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        φ₁ (rad):
                    </span>

                    <input
                        type="range"
                        id="ondas-phi1"
                        min="${-Math.PI}"
                        max="${Math.PI}"
                        step="0.01"
                        value="${this.params.phi1}"
                    >

                    <span id="ondas-phi1-value">
                        ${this.params.phi1.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==========================================
                 ONDA 2
                 ========================================== -->

            <h3>Onda 2</h3>


            <div class="control">

                <label>

                    <span class="control-label">
                        A₂ (m):
                    </span>

                    <input
                        type="range"
                        id="ondas-A2"
                        min="-10"
                        max="10"
                        step="0.1"
                        value="${this.params.A2}"
                    >

                    <span id="ondas-A2-value">
                        ${this.params.A2.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        λ₂ (m):
                    </span>

                    <input
                        type="range"
                        id="ondas-lambda2"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value="${this.params.lambda2}"
                    >

                    <span id="ondas-lambda2-value">
                        ${this.params.lambda2.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        f₂ (Hz):
                    </span>

                    <input
                        type="range"
                        id="ondas-f2"
                        min="0"
                        max="5"
                        step="0.1"
                        value="${this.params.f2}"
                    >

                    <span id="ondas-f2-value">
                        ${this.params.f2.toFixed(1)}
                    </span>

                </label>

            </div>


            <div class="control">

                <label>

                    <span class="control-label">
                        φ₂ (rad):
                    </span>

                    <input
                        type="range"
                        id="ondas-phi2"
                        min="${-Math.PI}"
                        max="${Math.PI}"
                        step="0.01"
                        value="${this.params.phi2}"
                    >

                    <span id="ondas-phi2-value">
                        ${this.params.phi2.toFixed(2)}
                    </span>

                </label>

            </div>

        `;


        // ====================================================
        // COLOCA OS CONTROLES DEPOIS DO CANVAS
        // ====================================================

        this.canvas.parentElement.appendChild(
            this.controlsContainer
        );


        // ====================================================
        // INPUTS
        // ====================================================

        const A1Input =
            this.controlsContainer.querySelector(
                "#ondas-A1"
            );

        const lambda1Input =
            this.controlsContainer.querySelector(
                "#ondas-lambda1"
            );

        const f1Input =
            this.controlsContainer.querySelector(
                "#ondas-f1"
            );

        const phi1Input =
            this.controlsContainer.querySelector(
                "#ondas-phi1"
            );


        const A2Input =
            this.controlsContainer.querySelector(
                "#ondas-A2"
            );

        const lambda2Input =
            this.controlsContainer.querySelector(
                "#ondas-lambda2"
            );

        const f2Input =
            this.controlsContainer.querySelector(
                "#ondas-f2"
            );

        const phi2Input =
            this.controlsContainer.querySelector(
                "#ondas-phi2"
            );


        // ====================================================
        // EVENTOS
        // ====================================================

        A1Input.addEventListener(
            "input",
            () => {

                this.params.A1 =
                    parseFloat(
                        A1Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-A1-value"
                    )
                    .textContent =
                    this.params.A1.toFixed(1);

                this.draw();
            }
        );


        lambda1Input.addEventListener(
            "input",
            () => {

                this.params.lambda1 =
                    parseFloat(
                        lambda1Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-lambda1-value"
                    )
                    .textContent =
                    this.params.lambda1.toFixed(1);

                this.draw();
            }
        );


        f1Input.addEventListener(
            "input",
            () => {

                this.params.f1 =
                    parseFloat(
                        f1Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-f1-value"
                    )
                    .textContent =
                    this.params.f1.toFixed(1);

                this.draw();
            }
        );


        phi1Input.addEventListener(
            "input",
            () => {

                this.params.phi1 =
                    parseFloat(
                        phi1Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-phi1-value"
                    )
                    .textContent =
                    this.params.phi1.toFixed(2);

                this.draw();
            }
        );


        A2Input.addEventListener(
            "input",
            () => {

                this.params.A2 =
                    parseFloat(
                        A2Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-A2-value"
                    )
                    .textContent =
                    this.params.A2.toFixed(1);

                this.draw();
            }
        );


        lambda2Input.addEventListener(
            "input",
            () => {

                this.params.lambda2 =
                    parseFloat(
                        lambda2Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-lambda2-value"
                    )
                    .textContent =
                    this.params.lambda2.toFixed(1);

                this.draw();
            }
        );


        f2Input.addEventListener(
            "input",
            () => {

                this.params.f2 =
                    parseFloat(
                        f2Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-f2-value"
                    )
                    .textContent =
                    this.params.f2.toFixed(1);

                this.draw();
            }
        );


        phi2Input.addEventListener(
            "input",
            () => {

                this.params.phi2 =
                    parseFloat(
                        phi2Input.value
                    );

                this.controlsContainer
                    .querySelector(
                        "#ondas-phi2-value"
                    )
                    .textContent =
                    this.params.phi2.toFixed(2);

                this.draw();
            }
        );
    }


    // ========================================================
    // CONVERSÃO X → CANVAS
    // ========================================================

    xCanvas(
        x,
        xInicio,
        largura
    ) {

        return xInicio +

            (
                (x - this.xMin) /
                (this.xMax - this.xMin)
            ) *

            largura;
    }


    // ========================================================
    // CONVERSÃO Y → CANVAS
    // ========================================================

    yCanvas(
        y,
        yInicio,
        altura
    ) {

        return yInicio +

            (
                1 -

                (y - this.yMin) /
                (this.yMax - this.yMin)
            ) *

            altura;
    }


    // ========================================================
    // DESENHA UM GRÁFICO
    // ========================================================

    drawGraph(
        xInicio,
        largura,
        valores,
        titulo,
        eixoY
    ) {

        const ctx = this.ctx;


        const graphTop = 60;

        const graphBottom =
            this.canvas.height - 100;

        const graphHeight =
            graphBottom -
            graphTop;


        // ====================================================
        // MOLDURA
        // ====================================================

        ctx.strokeStyle = "#cccccc";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            xInicio,
            graphTop,
            largura,
            graphHeight
        );


        // ====================================================
        // GRADE
        // ====================================================

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.10)";

        ctx.lineWidth = 1;


        // Linhas horizontais

        for (
            let y = -20;
            y <= 20;
            y += 10
        ) {

            const py =
                this.yCanvas(
                    y,
                    graphTop,
                    graphHeight
                );


            ctx.beginPath();

            ctx.moveTo(
                xInicio,
                py
            );

            ctx.lineTo(
                xInicio + largura,
                py
            );

            ctx.stroke();
        }


        // Linhas verticais

        for (
            let x = 0;
            x <= 10;
            x += 2
        ) {

            const px =
                this.xCanvas(
                    x,
                    xInicio,
                    largura
                );


            ctx.beginPath();

            ctx.moveTo(
                px,
                graphTop
            );

            ctx.lineTo(
                px,
                graphBottom
            );

            ctx.stroke();
        }


        // ====================================================
        // EIXO X
        // ====================================================

        const yZero =
            this.yCanvas(
                0,
                graphTop,
                graphHeight
            );


        ctx.beginPath();

        ctx.moveTo(
            xInicio,
            yZero
        );

        ctx.lineTo(
            xInicio + largura,
            yZero
        );

        ctx.strokeStyle = "#777777";

        ctx.lineWidth = 1;

        ctx.stroke();


        // ====================================================
        // CURVA
        // ====================================================

        ctx.beginPath();


        for (
            let i = 0;
            i < this.N;
            i++
        ) {

            const x =
                this.xMin +

                (
                    i /
                    (this.N - 1)
                ) *

                (
                    this.xMax -
                    this.xMin
                );


            const px =
                this.xCanvas(
                    x,
                    xInicio,
                    largura
                );


            const py =
                this.yCanvas(
                    valores[i],
                    graphTop,
                    graphHeight
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


        ctx.strokeStyle = "#1976d2";

        ctx.lineWidth = 2;

        ctx.stroke();


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.fillStyle = "#222";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            titulo,
            xInicio + largura / 2,
            30
        );


        // ====================================================
        // EIXO X
        // ====================================================

        ctx.font =
            "13px Arial";

        ctx.fillText(
            "x (m)",
            xInicio + largura / 2,
            graphBottom + 30
        );


        // ====================================================
        // MARCAÇÕES X
        // ====================================================

        ctx.font =
            "11px Arial";

        ctx.fillStyle = "#555";

        ctx.textAlign = "center";


        for (
            let x = 0;
            x <= 10;
            x += 2
        ) {

            const px =
                this.xCanvas(
                    x,
                    xInicio,
                    largura
                );


            ctx.fillText(
                x.toString(),
                px,
                graphBottom + 45
            );
        }


        // ====================================================
        // EIXO Y
        // ====================================================

        ctx.save();


        ctx.translate(
            xInicio - 30,
            graphTop +
            graphHeight / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.font =
            "13px Arial";

        ctx.fillStyle = "#222";

        ctx.textAlign = "center";


        ctx.fillText(
            eixoY,
            0,
            0
        );


        ctx.restore();


        // ====================================================
        // MARCAÇÕES Y
        // ====================================================

        ctx.font =
            "11px Arial";

        ctx.fillStyle = "#555";

        ctx.textAlign = "right";


        for (
            let y = -20;
            y <= 20;
            y += 10
        ) {

            const py =
                this.yCanvas(
                    y,
                    graphTop,
                    graphHeight
                );


            ctx.fillText(
                y.toString(),
                xInicio - 5,
                py + 4
            );
        }
    }


    // ========================================================
    // SÍMBOLOS + E =
    // ========================================================

    drawSymbol(
        symbol,
        x,
        y
    ) {

        const ctx = this.ctx;


        ctx.fillStyle = "#222";

        ctx.font =
            "bold 32px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";


        ctx.fillText(
            symbol,
            x,
            y
        );


        ctx.textBaseline =
            "alphabetic";
    }


    // ========================================================
    // DESENHO PRINCIPAL
    // ========================================================

    draw() {

        const ctx = this.ctx;


        const width =
            this.canvas.width;

        const height =
            this.canvas.height;


        // ====================================================
        // LIMPA O CANVAS
        // ====================================================

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // ====================================================
        // CALCULA AS ONDAS
        // ====================================================

        const y1 = [];

        const y2 = [];

        const yResultante = [];


        for (
            let i = 0;
            i < this.N;
            i++
        ) {

            const x =
                this.xMin +

                (
                    i /
                    (this.N - 1)
                ) *

                (
                    this.xMax -
                    this.xMin
                );


            const valor1 =
                this.onda(

                    this.params.A1,

                    this.params.lambda1,

                    this.params.f1,

                    x,

                    this.t,

                    this.params.phi1

                );


            const valor2 =
                this.onda(

                    this.params.A2,

                    this.params.lambda2,

                    this.params.f2,

                    x,

                    this.t,

                    this.params.phi2

                );


            y1.push(valor1);

            y2.push(valor2);

            yResultante.push(
                valor1 + valor2
            );
        }


        // ====================================================
        // DIMENSÕES
        // ====================================================

        const margem = 55;

        const espacoSimbolo = 45;


        const largura =
            (
                width
                -
                2 * margem
                -
                2 * espacoSimbolo
            ) / 3;


        const x1 =
            margem;


        const x2 =
            x1 +
            largura +
            espacoSimbolo;


        const x3 =
            x2 +
            largura +
            espacoSimbolo;


        // ====================================================
        // PRIMEIRO GRÁFICO
        // ====================================================

        this.drawGraph(

            x1,

            largura,

            y1,

            "y₁(x,t)",

            "y₁ (m)"
        );


        // ====================================================
        // SEGUNDO GRÁFICO
        // ====================================================

        this.drawGraph(

            x2,

            largura,

            y2,

            "y₂(x,t)",

            "y₂ (m)"
        );


        // ====================================================
        // GRÁFICO RESULTANTE
        // ====================================================

        this.drawGraph(

            x3,

            largura,

            yResultante,

            "y₁(x,t) + y₂(x,t)",

            "y₁ + y₂ (m)"
        );


        // ====================================================
        // SINAL +
        // ====================================================

        const centroY =
            60 +
            (
                this.canvas.height -
                100 -
                60
            ) / 2;


        this.drawSymbol(

            "+",

            x1 +
            largura +
            espacoSimbolo / 2,

            centroY
        );


        // ====================================================
        // SINAL =
        // ====================================================

        this.drawSymbol(

            "=",

            x2 +
            largura +
            espacoSimbolo / 2,

            centroY
        );


        // ====================================================
        // TEMPO
        // ====================================================

        ctx.fillStyle = "#222";

        ctx.font =
            "15px Arial";

        ctx.textAlign = "left";


        ctx.fillText(

            `t = ${this.t.toFixed(2)} s`,

            15,

            height - 15
        );
    }


    // ========================================================
    // ANIMAÇÃO
    // ========================================================

    iniciar() {

        const animar = () => {

            // -----------------------------------------------
            // Avanço do tempo
            // -----------------------------------------------

            this.t += 0.02;


            // -----------------------------------------------
            // Atualiza os gráficos
            // -----------------------------------------------

            this.draw();


            // -----------------------------------------------
            // Próximo frame
            // -----------------------------------------------

            this.frame =
                requestAnimationFrame(
                    animar
                );
        };


        animar();
    }


    // ========================================================
    // ATUALIZAR PARÂMETROS
    // ========================================================

    atualizarParametros(newParams) {

        this.params = {

            ...this.params,

            ...newParams
        };


        this.draw();
    }
}
