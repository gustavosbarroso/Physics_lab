// ============================================================
// SIMULAÇÃO DE CAPACITOR DE PLACAS PARALELAS
// ============================================================
//
// Simulação interativa de um capacitor de placas paralelas.
//
// Campo elétrico entre as placas:
//
//             E = (σ₂ - σ₁) / (2ε₀)
//
// Capacitância:
//
//             C = ε₀ A / d
//
// Diferença de potencial:
//
//             ΔV = E d
//
// Energia armazenada:
//
//             U = 1/2 C (ΔV)²
//
// Não utiliza bibliotecas externas.
// Utiliza apenas JavaScript, Canvas e DOM.
// ============================================================


class Capacitor {

    // ========================================================
    // CONSTRUTOR
    // ========================================================

    constructor(canvas, options = {}) {

        // Canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ====================================================
        // PARÂMETROS
        // ====================================================

        this.params = {

            // Sinal da placa superior
            sign1: options.sign1 ?? 1,

            // Sinal da placa inferior
            sign2: options.sign2 ?? -1,

            // Densidade superficial em nC/m²
            sigma: options.sigma ?? 1.0,

            // Área das placas em m²
            area: options.area ?? 1.0,

            // Distância entre as placas em m
            distance: options.distance ?? 1.0
        };


        // ====================================================
        // CONSTANTE
        // ====================================================

        this.epsilon0 = 8.85e-12;


        // ====================================================
        // RESULTADOS
        // ====================================================

        this.sigmaSI = 0;

        this.sigma1 = 0;
        this.sigma2 = 0;

        this.E1 = 0;
        this.E2 = 0;

        this.E = 0;

        this.C = 0;

        this.deltaV = 0;

        this.U = 0;


        // ====================================================
        // GEOMETRIA
        // ====================================================

        this.centerX =
            this.canvas.width / 2;

        this.centerY =
            this.canvas.height / 2;

        this.plateWidth = 550;


        // ====================================================
        // CRIAR CONTROLES
        // ====================================================

        this.createControls();


        // ====================================================
        // RESOLVER INICIALMENTE
        // ====================================================

        this.solve();


        // ====================================================
        // DESENHAR
        // ====================================================

        this.draw();
    }


    // ========================================================
    // CONTROLES
    // ========================================================

    createControls() {

        // Container dos controles
        this.controlsContainer =
            document.createElement("div");

        this.controlsContainer.className =
            "capacitor-controls";


        // ====================================================
        // HTML DOS CONTROLES
        // ====================================================

        this.controlsContainer.innerHTML = `

            <h2>
                Parâmetros do Capacitor
            </h2>


            <!-- ==============================================
                 PLACA 1
                 ============================================== -->

            <div class="control">

                <label>

                    Placa 1:

                    <select id="capacitor-sign1">

                        <option value="1"
                            ${this.params.sign1 === 1 ? "selected" : ""}>
                            +
                        </option>

                        <option value="-1"
                            ${this.params.sign1 === -1 ? "selected" : ""}>
                            −
                        </option>

                    </select>

                </label>

            </div>


            <!-- ==============================================
                 PLACA 2
                 ============================================== -->

            <div class="control">

                <label>

                    Placa 2:

                    <select id="capacitor-sign2">

                        <option value="1"
                            ${this.params.sign2 === 1 ? "selected" : ""}>
                            +
                        </option>

                        <option value="-1"
                            ${this.params.sign2 === -1 ? "selected" : ""}>
                            −
                        </option>

                    </select>

                </label>

            </div>


            <!-- ==============================================
                 DENSIDADE SUPERFICIAL
                 ============================================== -->

            <div class="control">

                <label>

                    σ (nC/m²):

                    <input
                        type="range"
                        id="capacitor-sigma"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value="${this.params.sigma}"
                    >

                    <span id="capacitor-sigma-value">
                        ${this.params.sigma.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==============================================
                 ÁREA
                 ============================================== -->

            <div class="control">

                <label>

                    Área (m²):

                    <input
                        type="range"
                        id="capacitor-area"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value="${this.params.area}"
                    >

                    <span id="capacitor-area-value">
                        ${this.params.area.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==============================================
                 DISTÂNCIA
                 ============================================== -->

            <div class="control">

                <label>

                    Distância (m):

                    <input
                        type="range"
                        id="capacitor-distance"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value="${this.params.distance}"
                    >

                    <span id="capacitor-distance-value">
                        ${this.params.distance.toFixed(2)}
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
        // REFERÊNCIAS
        // ====================================================

        const sign1Input =
            this.controlsContainer.querySelector(
                "#capacitor-sign1"
            );


        const sign2Input =
            this.controlsContainer.querySelector(
                "#capacitor-sign2"
            );


        const sigmaInput =
            this.controlsContainer.querySelector(
                "#capacitor-sigma"
            );


        const areaInput =
            this.controlsContainer.querySelector(
                "#capacitor-area"
            );


        const distanceInput =
            this.controlsContainer.querySelector(
                "#capacitor-distance"
            );


        // ====================================================
        // EVENTO — PLACA 1
        // ====================================================

        sign1Input.addEventListener(
            "change",
            () => {

                this.params.sign1 =
                    parseInt(
                        sign1Input.value
                    );

                this.solve();
                this.draw();
            }
        );


        // ====================================================
        // EVENTO — PLACA 2
        // ====================================================

        sign2Input.addEventListener(
            "change",
            () => {

                this.params.sign2 =
                    parseInt(
                        sign2Input.value
                    );

                this.solve();
                this.draw();
            }
        );


        // ====================================================
        // EVENTO — SIGMA
        // ====================================================

        sigmaInput.addEventListener(
            "input",
            () => {

                this.params.sigma =
                    parseFloat(
                        sigmaInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#capacitor-sigma-value"
                    )
                    .textContent =
                    this.params.sigma.toFixed(2);


                this.solve();
                this.draw();
            }
        );


        // ====================================================
        // EVENTO — ÁREA
        // ====================================================

        areaInput.addEventListener(
            "input",
            () => {

                this.params.area =
                    parseFloat(
                        areaInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#capacitor-area-value"
                    )
                    .textContent =
                    this.params.area.toFixed(2);


                this.solve();
                this.draw();
            }
        );


        // ====================================================
        // EVENTO — DISTÂNCIA
        // ====================================================

        distanceInput.addEventListener(
            "input",
            () => {

                this.params.distance =
                    parseFloat(
                        distanceInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#capacitor-distance-value"
                    )
                    .textContent =
                    this.params.distance.toFixed(2);


                this.solve();
                this.draw();
            }
        );
    }


    // ========================================================
    // RESOLUÇÃO DO CAPACITOR
    // ========================================================

    solve() {

        const sigma =
            this.params.sigma;

        const sign1 =
            this.params.sign1;

        const sign2 =
            this.params.sign2;

        const area =
            this.params.area;

        const distance =
            this.params.distance;


        // ====================================================
        // CONVERSÃO
        // ====================================================

        // nC/m² → C/m²

        this.sigmaSI =
            sigma * 1e-9;


        // ====================================================
        // DENSIDADES DE CARGA
        // ====================================================

        this.sigma1 =
            sign1 * this.sigmaSI;

        this.sigma2 =
            sign2 * this.sigmaSI;


        // ====================================================
        // CAMPOS INDIVIDUAIS
        // ====================================================

        this.E1 =
            this.sigma1 /
            (2 * this.epsilon0);

        this.E2 =
            this.sigma2 /
            (2 * this.epsilon0);


        // ====================================================
        // CAMPO RESULTANTE
        // ====================================================
        //
        // Convenção:
        //
        // +y = para cima
        //
        // Placa 1 está acima.
        // Placa 2 está abaixo.
        //
        // Entre as placas:
        //
        // contribuição da placa 1 = -E1
        // contribuição da placa 2 = +E2
        //
        // Portanto:
        //
        // E = E2 - E1
        //
        // ====================================================

        this.E =
            this.E2 -
            this.E1;


        // ====================================================
        // CAPACITÂNCIA
        // ====================================================

        this.C =
            this.epsilon0 *
            area /
            distance;


        // ====================================================
        // DIFERENÇA DE POTENCIAL
        // ====================================================

        this.deltaV =
            this.E *
            distance;


        // ====================================================
        // ENERGIA
        // ====================================================

        this.U =
            0.5 *
            this.C *
            Math.pow(
                this.deltaV,
                2
            );
    }


    // ========================================================
    // DESENHA AS PLACAS
    // ========================================================

    drawPlates() {

        const ctx = this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;


        // ====================================================
        // CENTRO
        // ====================================================

        const centerX =
            width / 2;

        const centerY =
            height / 2;


        // ====================================================
        // DISTÂNCIA VISUAL
        // ====================================================

        /*
         * Transformamos a distância física em uma
         * distância visual adequada ao canvas.
         */

        const minDistance = 100;

        const maxDistance =
            height * 0.55;


        const normalized =
            (this.params.distance - 0.1) /
            (5.0 - 0.1);


        const visualDistance =
            minDistance +
            normalized *
            (maxDistance - minDistance);


        const yTop =
            centerY -
            visualDistance / 2;


        const yBottom =
            centerY +
            visualDistance / 2;


        // Guardar geometria para outros métodos

        this.yTop = yTop;
        this.yBottom = yBottom;


        // ====================================================
        // LARGURA DAS PLACAS
        // ====================================================

        const plateWidth =
            Math.min(
                this.plateWidth,
                width * 0.65
            );


        const xLeft =
            centerX -
            plateWidth / 2;


        const xRight =
            centerX +
            plateWidth / 2;


        this.xLeft = xLeft;
        this.xRight = xRight;


        // ====================================================
        // PLACA SUPERIOR
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            xLeft,
            yTop
        );

        ctx.lineTo(
            xRight,
            yTop
        );

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            8;

        ctx.stroke();


        // ====================================================
        // PLACA INFERIOR
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            xLeft,
            yBottom
        );

        ctx.lineTo(
            xRight,
            yBottom
        );

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            8;

        ctx.stroke();


        // ====================================================
        // SINAIS
        // ====================================================

        ctx.font =
            "bold 26px Arial";

        ctx.fillStyle =
            "#222";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        // Placa superior

        ctx.fillText(
            this.params.sign1 > 0
                ? "+"
                : "−",
            xLeft - 35,
            yTop
        );


        // Placa inferior

        ctx.fillText(
            this.params.sign2 > 0
                ? "+"
                : "−",
            xLeft - 35,
            yBottom
        );


        // ====================================================
        // IDENTIFICAÇÃO
        // ====================================================

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "bottom";


        ctx.fillText(
            "Placa 1",
            xRight + 10,
            yTop - 5
        );


        ctx.fillText(
            "Placa 2",
            xRight + 10,
            yBottom - 5
        );
    }


    // ========================================================
    // DESENHA LINHAS DE CAMPO
    // ========================================================

    drawFieldLines() {

        const ctx = this.ctx;


        // ====================================================
        // CAMPO NULO
        // ====================================================

        if (
            Math.abs(this.E) <
            1e-15
        ) {

            return;
        }


        // ====================================================
        // POSIÇÕES DAS LINHAS
        // ====================================================

        const numberOfLines =
            7;


        const width =
            this.xRight -
            this.xLeft;


        const spacing =
            width /
            (numberOfLines + 1);


        // ====================================================
        // DIREÇÃO
        // ====================================================

        /*
         * E > 0:
         *     campo para cima
         *
         * E < 0:
         *     campo para baixo
         */

        const direction =
            this.E > 0
                ? -1
                : 1;


        for (
            let i = 1;
            i <= numberOfLines;
            i++
        ) {

            const x =
                this.xLeft +
                spacing * i;


            // =================================================
            // LINHA
            // =================================================

            ctx.beginPath();

            ctx.moveTo(
                x,
                this.yTop
            );

            ctx.lineTo(
                x,
                this.yBottom
            );

            ctx.strokeStyle =
                "#555";

            ctx.lineWidth =
                1.5;

            ctx.stroke();


            // =================================================
            // SETA
            // =================================================

            const middleY =
                (
                    this.yTop +
                    this.yBottom
                ) / 2;


            const arrowLength =
                (
                    this.yBottom -
                    this.yTop
                ) * 0.18;


            const endY =
                middleY +
                direction *
                arrowLength;


            this.drawArrow(
                x,
                middleY,
                x,
                endY
            );
        }
    }


    // ========================================================
    // DESENHA SETA
    // ========================================================

    drawArrow(
        x1,
        y1,
        x2,
        y2
    ) {

        const ctx =
            this.ctx;


        const angle =
            Math.atan2(
                y2 - y1,
                x2 - x1
            );


        const arrowSize =
            10;


        // ====================================================
        // LINHA
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            x2,
            y2
        );

        ctx.strokeStyle =
            "#444";

        ctx.lineWidth =
            2;

        ctx.stroke();


        // ====================================================
        // PONTA
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            x2,
            y2
        );

        ctx.lineTo(
            x2 -
            arrowSize *
            Math.cos(
                angle - Math.PI / 6
            ),

            y2 -
            arrowSize *
            Math.sin(
                angle - Math.PI / 6
            )
        );

        ctx.lineTo(
            x2 -
            arrowSize *
            Math.cos(
                angle + Math.PI / 6
            ),

            y2 -
            arrowSize *
            Math.sin(
                angle + Math.PI / 6
            )
        );

        ctx.closePath();

        ctx.fillStyle =
            "#444";

        ctx.fill();
    }


    // ========================================================
    // DESENHA DIMENSÃO d
    // ========================================================

    drawDistance() {

        const ctx =
            this.ctx;


        const x =
            this.xRight + 55;


        // ====================================================
        // LINHA VERTICAL
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            x,
            this.yTop
        );

        ctx.lineTo(
            x,
            this.yBottom
        );

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1.5;

        ctx.stroke();


        // ====================================================
        // MARCAS
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            x - 6,
            this.yTop
        );

        ctx.lineTo(
            x + 6,
            this.yTop
        );

        ctx.moveTo(
            x - 6,
            this.yBottom
        );

        ctx.lineTo(
            x + 6,
            this.yBottom
        );

        ctx.stroke();


        // ====================================================
        // TEXTO
        // ====================================================

        ctx.save();

        ctx.translate(
            x + 18,
            (
                this.yTop +
                this.yBottom
            ) / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillStyle =
            "#555";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            `d = ${this.params.distance.toFixed(2)} m`,
            0,
            0
        );

        ctx.restore();
    }


    // ========================================================
    // DESENHA ÁREA
    // ========================================================

    drawArea() {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#555";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            `A = ${this.params.area.toFixed(2)} m²`,
            (
                this.xLeft +
                this.xRight
            ) / 2,
            this.yTop - 18
        );
    }


    // ========================================================
    // HUD / INFORMAÇÕES
    // ========================================================

    drawHUD() {

        const ctx =
            this.ctx;


        const x =
            15;


        const y =
            this.canvas.height - 185;


        const width =
            330;


        const height =
            165;


        // ====================================================
        // FUNDO
        // ====================================================

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.92)";


        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            width,
            height,
            8
        );

        ctx.fill();


        // ====================================================
        // BORDA
        // ====================================================

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.3)";

        ctx.lineWidth =
            1;

        ctx.stroke();


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.fillStyle =
            "#222";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "left";


        ctx.fillText(
            "Capacitor de placas paralelas",
            x + 10,
            y + 22
        );


        // ====================================================
        // INFORMAÇÕES
        // ====================================================

        ctx.font =
            "14px Arial";


        ctx.fillText(
            `σ = ${this.params.sigma.toFixed(2)} nC/m²`,
            x + 10,
            y + 47
        );


        ctx.fillText(
            `E = ${this.E.toExponential(3)} N/C`,
            x + 10,
            y + 69
        );


        ctx.fillText(
            `C = ${(this.C * 1e9).toFixed(3)} nF`,
            x + 10,
            y + 91
        );


        ctx.fillText(
            `ΔV = ${this.deltaV.toExponential(3)} V`,
            x + 10,
            y + 113
        );


        ctx.fillText(
            `U = ${this.U.toExponential(3)} J`,
            x + 10,
            y + 135
        );


        // ====================================================
        // SITUAÇÃO DO CAMPO
        // ====================================================

        if (
            Math.abs(this.E) <
            1e-15
        ) {

            ctx.fillStyle =
                "#555";

            ctx.fillText(
                "Campo resultante = 0",
                x + 10,
                y + 157
            );

        } else {

            ctx.fillStyle =
                "#222";

            ctx.fillText(
                this.E > 0
                    ? "Campo: para cima ↑"
                    : "Campo: para baixo ↓",
                x + 10,
                y + 157
            );
        }
    }


    // ========================================================
    // DESENHO PRINCIPAL
    // ========================================================

    draw() {

        const ctx =
            this.ctx;


        // ====================================================
        // LIMPAR CANVAS
        // ====================================================

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // ====================================================
        // PLACAS
        // ====================================================

        this.drawPlates();


        // ====================================================
        // LINHAS DE CAMPO
        // ====================================================

        this.drawFieldLines();


        // ====================================================
        // DISTÂNCIA
        // ====================================================

        this.drawDistance();


        // ====================================================
        // ÁREA
        // ====================================================

        this.drawArea();


        // ====================================================
        // HUD
        // ====================================================

        this.drawHUD();
    }


    // ========================================================
    // ATUALIZAR PARÂMETROS
    // ========================================================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };


        this.solve();

        this.draw();
    }
}
