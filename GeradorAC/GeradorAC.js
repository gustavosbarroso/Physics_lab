// ============================================================
// SIMULAÇÃO DE UM GERADOR AC
// ============================================================
//
// V(t) = N A B sen(w t)
//
// ============================================================


class GeradorAC {


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

            N:
                options.N ?? 100,

            A:
                options.A ?? 2.0,

            B:
                options.B ?? 0.5,

            w:
                options.w ?? 10
        };


        // ====================================================
        // TEMPO
        // ====================================================

        this.t = 0;

        this.dt = 0.02;

        this.interval = 20;

        this.ultimoFrame = 0;


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
    // TENSÃO INDUZIDA
    // ========================================================

    ddp(
        N,
        A,
        B,
        w,
        t
    ) {

        return N *
            A *
            B *
            Math.sin(
                w * t
            );
    }


    // ========================================================
    // CONTROLES
    // ========================================================

    createControls() {

        this.controlsContainer =
            document.createElement("div");


        this.controlsContainer.className =
            "gerador-controls";


        this.controlsContainer.innerHTML = `

            <h2>
                Parâmetros do gerador
            </h2>


            <!-- ==========================================
                 NÚMERO DE ESPIRAS
                 ========================================== -->

            <div class="control">

                <label>

                    <span class="control-label">
                        N:
                    </span>

                    <input
                        type="range"
                        id="gerador-N"
                        min="1"
                        max="500"
                        step="1"
                        value="${this.params.N}"
                    >

                    <span id="gerador-N-value">
                        ${this.params.N}
                    </span>

                </label>

            </div>


            <!-- ==========================================
                 ÁREA
                 ========================================== -->

            <div class="control">

                <label>

                    <span class="control-label">
                        A (m²):
                    </span>

                    <input
                        type="range"
                        id="gerador-A"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value="${this.params.A}"
                    >

                    <span id="gerador-A-value">
                        ${this.params.A.toFixed(1)}
                    </span>

                </label>

            </div>


            <!-- ==========================================
                 CAMPO MAGNÉTICO
                 ========================================== -->

            <div class="control">

                <label>

                    <span class="control-label">
                        B (T):
                    </span>

                    <input
                        type="range"
                        id="gerador-B"
                        min="-2"
                        max="2"
                        step="0.1"
                        value="${this.params.B}"
                    >

                    <span id="gerador-B-value">
                        ${this.params.B.toFixed(1)}
                    </span>

                </label>

            </div>


            <!-- ==========================================
                 FREQUÊNCIA ANGULAR
                 ========================================== -->

            <div class="control">

                <label>

                    <span class="control-label">
                        ω (rad/s):
                    </span>

                    <input
                        type="range"
                        id="gerador-w"
                        min="0"
                        max="20"
                        step="0.1"
                        value="${this.params.w}"
                    >

                    <span id="gerador-w-value">
                        ${this.params.w.toFixed(1)}
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

        const NInput =
            this.controlsContainer.querySelector(
                "#gerador-N"
            );


        const AInput =
            this.controlsContainer.querySelector(
                "#gerador-A"
            );


        const BInput =
            this.controlsContainer.querySelector(
                "#gerador-B"
            );


        const wInput =
            this.controlsContainer.querySelector(
                "#gerador-w"
            );


        // ====================================================
        // N
        // ====================================================

        NInput.addEventListener(
            "input",
            () => {

                this.params.N =
                    parseFloat(
                        NInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#gerador-N-value"
                    )
                    .textContent =
                    this.params.N;


                this.draw();
            }
        );


        // ====================================================
        // A
        // ====================================================

        AInput.addEventListener(
            "input",
            () => {

                this.params.A =
                    parseFloat(
                        AInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#gerador-A-value"
                    )
                    .textContent =
                    this.params.A.toFixed(1);


                this.draw();
            }
        );


        // ====================================================
        // B
        // ====================================================

        BInput.addEventListener(
            "input",
            () => {

                this.params.B =
                    parseFloat(
                        BInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#gerador-B-value"
                    )
                    .textContent =
                    this.params.B.toFixed(1);


                this.draw();
            }
        );


        // ====================================================
        // W
        // ====================================================

        wInput.addEventListener(
            "input",
            () => {

                this.params.w =
                    parseFloat(
                        wInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#gerador-w-value"
                    )
                    .textContent =
                    this.params.w.toFixed(1);


                this.draw();
            }
        );
    }


    // ========================================================
    // CONVERSÃO X → CANVAS
    // ========================================================

    xCanvas(
        x,
        xMin,
        xMax,
        xInicio,
        largura
    ) {

        return xInicio +

            (
                (x - xMin) /
                (xMax - xMin)
            ) *

            largura;
    }


    // ========================================================
    // CONVERSÃO Y → CANVAS
    // ========================================================

    yCanvas(
        y,
        yMin,
        yMax,
        yInicio,
        altura
    ) {

        return yInicio +

            (
                1 -

                (y - yMin) /
                (yMax - yMin)
            ) *

            altura;
    }


    // ========================================================
    // DESENHO DO GERADOR
    // ========================================================

    drawGenerator() {

        const ctx = this.ctx;


        // ====================================================
        // POSIÇÃO
        // ====================================================

        const xInicio = 55;

        const xFim = 500;

        const yCentro = 260;


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.fillStyle = "#222";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC",
            280,
            30
        );


        // ====================================================
        // LIMITES DOS ÍMÃS
        // ====================================================

        const magnetTop = 100;

        const magnetHeight = 320;


        // ====================================================
        // ÍMÃ ESQUERDO
        // ====================================================

        ctx.fillStyle = "#1976d2";

        ctx.fillRect(
            75,
            magnetTop,
            35,
            magnetHeight
        );


        ctx.fillStyle = "#d32f2f";

        ctx.fillRect(
            110,
            magnetTop,
            35,
            magnetHeight
        );


        // ====================================================
        // LETRAS
        // ====================================================

        ctx.fillStyle = "white";

        ctx.font =
            "bold 24px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";


        ctx.fillText(
            "S",
            92,
            yCentro
        );


        ctx.fillText(
            "N",
            127,
            yCentro
        );


        // ====================================================
        // ÍMÃ DIREITO
        // ====================================================

        ctx.fillStyle = "#1976d2";

        ctx.fillRect(
            425,
            magnetTop,
            35,
            magnetHeight
        );


        ctx.fillStyle = "#d32f2f";

        ctx.fillRect(
            460,
            magnetTop,
            35,
            magnetHeight
        );


        ctx.fillStyle = "white";


        ctx.fillText(
            "S",
            442,
            yCentro
        );


        ctx.fillText(
            "N",
            477,
            yCentro
        );


        ctx.textBaseline =
            "alphabetic";


        // ====================================================
        // CAMPO MAGNÉTICO
        // ====================================================

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.45)";

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.45)";

        ctx.lineWidth = 1.5;


        const direcao =
            this.params.B >= 0
                ? 1
                : -1;


        for (
            let y = 150;
            y <= 370;
            y += 55
        ) {

            const x1 =
                direcao > 0
                    ? 165
                    : 395;


            const x2 =
                direcao > 0
                    ? 395
                    : 165;


            ctx.beginPath();

            ctx.moveTo(
                x1,
                y
            );

            ctx.lineTo(
                x2,
                y
            );

            ctx.stroke();


            // ---------------------------------------------
            // PONTA DA SETA
            // ---------------------------------------------

            const tamanho = 7;

            ctx.beginPath();


            if (
                direcao > 0
            ) {

                ctx.moveTo(
                    x2,
                    y
                );

                ctx.lineTo(
                    x2 - tamanho,
                    y - tamanho / 2
                );

                ctx.lineTo(
                    x2 - tamanho,
                    y + tamanho / 2
                );

            } else {

                ctx.moveTo(
                    x2,
                    y
                );

                ctx.lineTo(
                    x2 + tamanho,
                    y - tamanho / 2
                );

                ctx.lineTo(
                    x2 + tamanho,
                    y + tamanho / 2
                );
            }


            ctx.closePath();

            ctx.fill();
        }


        // ====================================================
        // BOBINA
        // ====================================================

        const angulo =
            this.params.w *
            this.t;


        const largura =
            95 *
            Math.cos(
                angulo
            );


        const altura = 75;


        const x =
            280;


        const y =
            yCentro;


        ctx.strokeStyle = "#111";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            x - largura,
            y - altura
        );

        ctx.lineTo(
            x + largura,
            y - altura
        );

        ctx.lineTo(
            x + largura,
            y + altura
        );

        ctx.lineTo(
            x - largura,
            y + altura
        );

        ctx.closePath();

        ctx.stroke();


        // ====================================================
        // EIXO / FIO
        // ====================================================

        ctx.strokeStyle = "#111";

        ctx.lineWidth = 4;


        ctx.beginPath();

        ctx.moveTo(
            x,
            yCentro + 75
        );

        ctx.lineTo(
            x,
            430
        );

        ctx.stroke();


        // ====================================================
        // LÂMPADA
        // ====================================================

        const V =
            this.ddp(
                this.params.N,
                this.params.A,
                this.params.B,
                this.params.w,
                this.t
            );


        const Vmax =
            Math.abs(
                this.params.N *
                this.params.A *
                this.params.B *
                this.params.w
            );


        const brilho =
            Vmax > 0
                ? Math.min(
                    Math.abs(V) / Vmax,
                    1
                )
                : 0;


        ctx.beginPath();

        ctx.arc(
            x,
            455,
            28,
            0,
            2 * Math.PI
        );


        const valor =
            90 +
            165 * brilho;


        ctx.fillStyle =
            `rgb(${valor}, ${valor}, ${90 + 165 * brilho})`;


        ctx.fill();

        ctx.strokeStyle = "#222";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.fillStyle = "#222";

        ctx.font =
            "14px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Lâmpada",
            x,
            505
        );


        // ====================================================
        // EQUAÇÃO
        // ====================================================

        ctx.font =
            "15px Arial";

        ctx.fillStyle = "#333";

        ctx.fillText(
            "V(t) = N A B sen(ωt)",
            x,
            70
        );
    }


    // ========================================================
    // DESENHO DO GRÁFICO
    // ========================================================

    drawGraph() {

        const ctx = this.ctx;


        // ====================================================
        // DIMENSÕES
        // ====================================================

        const xInicio = 585;

        const largura = 560;

        const graphTop = 70;

        const graphBottom = 440;

        const graphHeight =
            graphBottom -
            graphTop;


        const xMin = 0;

        const xMax = 2;


        // ====================================================
        // VALOR MÁXIMO
        // ====================================================

        const Vmax =
            Math.abs(
                this.params.N *
                this.params.A *
                this.params.B *
                this.params.w
            );


        const escala =
            Vmax > 0
                ? Vmax
                : 1;


        const yMin =
            -1.1 * escala;


        const yMax =
            1.1 * escala;


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.fillStyle = "#222";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC - Voltagem x Tempo",
            xInicio + largura / 2,
            30
        );


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


        // -----------------------------------------------
        // LINHAS VERTICAIS
        // -----------------------------------------------

        for (
            let x = 0;
            x <= 2;
            x += 0.5
        ) {

            const px =
                this.xCanvas(
                    x,
                    xMin,
                    xMax,
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


        // -----------------------------------------------
        // LINHAS HORIZONTAIS
        // -----------------------------------------------

        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const y =
                i *
                escala /
                2;


            const py =
                this.yCanvas(
                    y,
                    yMin,
                    yMax,
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


        // ====================================================
        // EIXO X
        // ====================================================

        const yZero =
            this.yCanvas(
                0,
                yMin,
                yMax,
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


        const Npontos = 500;


        for (
            let i = 0;
            i < Npontos;
            i++
        ) {

            const t =
                xMin +

                (
                    i /
                    (Npontos - 1)
                ) *

                (
                    xMax -
                    xMin
                );


            const V =
                this.ddp(
                    this.params.N,
                    this.params.A,
                    this.params.B,
                    this.params.w,
                    t
                );


            const px =
                this.xCanvas(
                    t,
                    xMin,
                    xMax,
                    xInicio,
                    largura
                );


            const py =
                this.yCanvas(
                    V,
                    yMin,
                    yMax,
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
        // LINHA DO TEMPO
        // ====================================================

        const tempo =
            this.t % 2;


        const pxTempo =
            this.xCanvas(
                tempo,
                xMin,
                xMax,
                xInicio,
                largura
            );


        ctx.beginPath();

        ctx.moveTo(
            pxTempo,
            graphTop
        );

        ctx.lineTo(
            pxTempo,
            graphBottom
        );

        ctx.setLineDash(
            [6, 5]
        );

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.6)";

        ctx.lineWidth = 1;

        ctx.stroke();

        ctx.setLineDash([]);


        // ====================================================
        // PONTO INSTANTÂNEO
        // ====================================================

        const V =
            this.ddp(
                this.params.N,
                this.params.A,
                this.params.B,
                this.params.w,
                tempo
            );


        const py =
            this.yCanvas(
                V,
                yMin,
                yMax,
                graphTop,
                graphHeight
            );


        ctx.beginPath();

        ctx.arc(
            pxTempo,
            py,
            5,
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "#1976d2";

        ctx.fill();


        // ====================================================
        // EIXO X
        // ====================================================

        ctx.font =
            "13px Arial";

        ctx.fillStyle = "#222";

        ctx.textAlign = "center";

        ctx.fillText(
            "Tempo (s)",
            xInicio + largura / 2,
            graphBottom + 35
        );


        // ====================================================
        // MARCAÇÕES X
        // ====================================================

        ctx.font =
            "11px Arial";

        ctx.fillStyle = "#555";


        for (
            let x = 0;
            x <= 2;
            x += 0.5
        ) {

            const px =
                this.xCanvas(
                    x,
                    xMin,
                    xMax,
                    xInicio,
                    largura
                );


            ctx.fillText(
                x.toFixed(1),
                px,
                graphBottom + 50
            );
        }


        // ====================================================
        // EIXO Y
        // ====================================================

        ctx.save();


        ctx.translate(
            xInicio - 35,
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
            "V(t)",
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
            let i = -2;
            i <= 2;
            i++
        ) {

            const y =
                i *
                escala /
                2;


            const py =
                this.yCanvas(
                    y,
                    yMin,
                    yMax,
                    graphTop,
                    graphHeight
                );


            ctx.fillText(
                y.toFixed(1),
                xInicio - 5,
                py + 4
            );
        }
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
        // GERADOR
        // ====================================================

        this.drawGenerator();


        // ====================================================
        // GRÁFICO
        // ====================================================

        this.drawGraph();


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

        const animar = (
            timestamp
        ) => {


            // -----------------------------------------------
            // PRIMEIRO FRAME
            // -----------------------------------------------

            if (
                this.ultimoFrame === 0
            ) {

                this.ultimoFrame =
                    timestamp;
            }


            // -----------------------------------------------
            // TEMPO DECORRIDO
            // -----------------------------------------------

            const decorrido =
                timestamp -
                this.ultimoFrame;


            // -----------------------------------------------
            // ATUALIZA A CADA 20 ms
            // -----------------------------------------------

            if (
                decorrido >=
                this.interval
            ) {

                this.t +=
                    this.dt;


                this.draw();


                this.ultimoFrame =
                    timestamp -
                    (
                        decorrido %
                        this.interval
                    );
            }


            // -----------------------------------------------
            // PRÓXIMO FRAME
            // -----------------------------------------------

            this.frame =
                requestAnimationFrame(
                    animar
                );
        };


        this.frame =
            requestAnimationFrame(
                animar
            );
    }


    // ========================================================
    // ATUALIZAR PARÂMETROS
    // ========================================================

    atualizarParametros(
        newParams
    ) {

        this.params = {

            ...this.params,

            ...newParams
        };


        this.draw();
    }
}
