// ============================================================
// SIMULAÇÃO DA SUPERPOSIÇÃO DE ONDAS
// ============================================================
//
// Simulação da superposição de duas ondas senoidais:
//
// y(x,t) = A sen(kx - wt + φ)
//
// com:
//
// k = 2π / λ
// w = 2πf
//
// A simulação mostra:
//     y₁(x,t) + y₂(x,t) = y_resultante(x,t)
//
// ============================================================

class SuperposicaoOndas {

    // ========================================================
    // CONSTRUTOR
    // ========================================================

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ====================================================
        // PARÂMETROS
        // ====================================================

        this.params = {

            A1: options.A1 ?? 10,
            A2: options.A2 ?? 10,

            lambda1: options.lambda1 ?? 2,
            lambda2: options.lambda2 ?? 2,

            f1: options.f1 ?? 1,
            f2: options.f2 ?? 1,

            phi1: options.phi1 ?? 0,
            phi2: options.phi2 ?? Math.PI / 2

        };

        // ====================================================
        // PARÂMETROS DA SIMULAÇÃO
        // ====================================================

        this.xMin = 0;
        this.xMax = 10;

        this.N = 1000;

        this.t = 0;

        // ====================================================
        // GEOMETRIA DOS GRÁFICOS
        // ====================================================

        this.graphTop = 60;
        this.graphBottom = 400;

        this.graphHeight =
            this.graphBottom -
            this.graphTop;

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
        // INICIA A ANIMAÇÃO
        // ====================================================

        this.iniciar();
    }


    // ========================================================
    // FUNÇÃO DA ONDA
    // ========================================================

    onda(A, lambda, f, x, t, phi) {

        return A *
            Math.sin(
                ((2 * Math.PI) / lambda) * x
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
        // REFERÊNCIAS AOS INPUTS
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
        // FUNÇÃO AUXILIAR PARA ATUALIZAR CONTROLES
        // ====================================================

        const atualizar = (
            input,
            parametro,
            id,
            casas
        ) => {

            input.addEventListener(
                "input",
                () => {

                    this.params[parametro] =
                        parseFloat(input.value);

                    this.controlsContainer
                        .querySelector(id)
                        .textContent =
                        this.params[parametro]
                            .toFixed(casas);

                    this.draw();
                }
            );
        };


        // ====================================================
        // EVENTOS
        // ====================================================

        atualizar(
            A1Input,
            "A1",
            "#ondas-A1-value",
            1
        );

        atualizar(
            lambda1Input,
            "lambda1",
            "#ondas-lambda1-value",
            1
        );

        atualizar(
            f1Input,
            "f1",
            "#ondas-f1-value",
            1
        );

        atualizar(
            phi1Input,
            "phi1",
            "#ondas-phi1-value",
            2
        );


        atualizar(
            A2Input,
            "A2",
            "#ondas-A2-value",
            1
        );

        atualizar(
            lambda2Input,
            "lambda2",
            "#ondas-lambda2-value",
            1
        );

        atualizar(
            f2Input,
            "f2",
            "#ondas-f2-value",
            1
        );

        atualizar(
            phi2Input,
            "phi2",
            "#ondas-phi2-value",
            2
        );
    }


    // ========================================================
    // CONVERTE X PARA COORDENADA DO CANVAS
    // ========================================================

    xCanvas(x, xInicio, largura) {

        return xInicio +
            (
                (x - this.xMin) /
                (this.xMax - this.xMin)
            ) *
            largura;
    }


    // ========================================================
    // CONVERTE Y PARA COORDENADA DO CANVAS
    // ========================================================

    yCanvas(y, yInicio, altura) {

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

        // ----------------------------------------------------
        // Moldura
        // ----------------------------------------------------

        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            xInicio,
            this.graphTop,
            largura,
            this.graphHeight
        );


        // ----------------------------------------------------
        // Eixo x
        // ----------------------------------------------------

        const yZero =
            this.yCanvas(
                0,
                this.graphTop,
                this.graphHeight
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

        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 1;

        ctx.stroke();


        // ----------------------------------------------------
        // Curva
        // ----------------------------------------------------

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
                    this.graphTop,
                    this.graphHeight
                );

            if (i === 0) {

                ctx.moveTo(px, py);

            } else {

                ctx.lineTo(px, py);
            }
        }

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2;

        ctx.stroke();


        // ----------------------------------------------------
        // Título
        // ----------------------------------------------------

        ctx.fillStyle = "#222";
        ctx.font = "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            titulo,
            xInicio + largura / 2,
            30
        );


        // ----------------------------------------------------
        // Eixo x
        // ----------------------------------------------------

        ctx.font = "13px Arial";

        ctx.fillText(
            "x (m)",
            xInicio + largura / 2,
            this.graphBottom + 25
        );


        // ----------------------------------------------------
        // Eixo y
        // ----------------------------------------------------

        ctx.save();

        ctx.translate(
            xInicio - 25,
            this.graphTop +
            this.graphHeight / 2
        );

        ctx.rotate(-Math.PI / 2);

        ctx.fillText(
            eixoY,
            0,
            0
        );

        ctx.restore();


        // ----------------------------------------------------
        // Limites do eixo y
        // ----------------------------------------------------

        ctx.textAlign = "right";

        ctx.font = "11px Arial";

        ctx.fillStyle = "#555";

        ctx.fillText(
            this.yMax,
            xInicio - 5,
            this.graphTop + 5
        );

        ctx.fillText(
            this.yMin,
            xInicio - 5,
            this.graphBottom
        );
    }


    // ========================================================
    // DESENHA SÍMBOLO ENTRE OS GRÁFICOS
    // ========================================================

    drawSymbol(
        symbol,
        x,
        y
    ) {

        const ctx = this.ctx;

        ctx.fillStyle = "#222";

        ctx.font = "bold 32px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            symbol,
            x,
            y
        );

        ctx.textBaseline = "alphabetic";
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


        // ----------------------------------------------------
        // Limpa o canvas
        // ----------------------------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // ----------------------------------------------------
        // Calcula as ondas
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Dimensões dos gráficos
        // ----------------------------------------------------

        const margem = 45;

        const simbolo = 35;

        const largura =
            (
                width -
                2 * margem -
                2 * simbolo
            ) / 3;


        const x1 = margem;

        const x2 =
            x1 +
            largura +
            simbolo;

        const x3 =
            x2 +
            largura +
            simbolo;


        // ----------------------------------------------------
        // Gráficos
        // ----------------------------------------------------

        this.drawGraph(
            x1,
            largura,
            y1,
            "y₁(x,t)",
            "y₁ (m)"
        );


        this.drawGraph(
            x2,
            largura,
            y2,
            "y₂(x,t)",
            "y₂ (m)"
        );


        this.drawGraph(
            x3,
            largura,
            yResultante,
            "y₁(x,t) + y₂(x,t)",
            "y₁ + y₂ (m)"
        );


        // ----------------------------------------------------
        // Símbolos
        // ----------------------------------------------------

        this.drawSymbol(
            "+",
            x1 + largura + simbolo / 2,
            this.graphTop +
            this.graphHeight / 2
        );


        this.drawSymbol(
            "=",
            x2 + largura + simbolo / 2,
            this.graphTop +
            this.graphHeight / 2
        );


        // ----------------------------------------------------
        // Tempo
        // ----------------------------------------------------

        ctx.fillStyle = "#222";

        ctx.font = "15px Arial";

        ctx.textAlign = "left";

        ctx.fillText(
            `t = ${this.t.toFixed(2)} s`,
            15,
            height - 15
        );
    }


    // ========================================================
    // ANIMAÇÃO
   
