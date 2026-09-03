// ============================================================
// SIMULAÇÃO DA LEI DE SNELL
// ============================================================
// Simulação interativa da refração da luz utilizando a Lei de
// Snell:
//
//              n₁ sen(θ₁) = n₂ sen(θ₂)
//
// A simulação também identifica quando ocorre Reflexão Total
// Interna (RTI).
//
// Não utiliza bibliotecas externas.
// Utiliza apenas JavaScript, Canvas e DOM.
// ============================================================

class Snell {

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
            n1: options.n1 ?? 1.0,
            n2: options.n2 ?? 1.5,
            theta1: options.theta1 ?? 30.0
        };

        // ====================================================
        // RESULTADOS
        // ====================================================
        this.theta2 = null;
        this.sinTheta2 = null;
        this.reflexaoTotal = false;

        // ====================================================
        // GEOMETRIA
        // ====================================================
        this.interfaceY = this.canvas.height / 2;
        this.normalX = this.canvas.width / 2;

        this.rayLength = 180;

        // Criar controles
        this.createControls();

        // Resolver inicialmente
        this.solve();

        // Desenhar
        this.draw();
    }


    // ========================================================
    // CONTROLES
    // ========================================================
    createControls() {

        // Container dos controles
        this.controlsContainer = document.createElement("div");

        this.controlsContainer.className = "snell-controls";

        this.controlsContainer.innerHTML = `
            <h2>Parâmetros da Lei de Snell</h2>

            <div class="control">
                <label>
                    n₁:
                    <input
                        type="range"
                        id="snell-n1"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value="${this.params.n1}"
                    >
                    <span id="snell-n1-value">
                        ${this.params.n1.toFixed(2)}
                    </span>
                </label>
            </div>

            <div class="control">
                <label>
                    n₂:
                    <input
                        type="range"
                        id="snell-n2"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value="${this.params.n2}"
                    >
                    <span id="snell-n2-value">
                        ${this.params.n2.toFixed(2)}
                    </span>
                </label>
            </div>

            <div class="control">
                <label>
                    θ₁ (°):
                    <input
                        type="range"
                        id="snell-theta1"
                        min="0"
                        max="89"
                        step="1"
                        value="${this.params.theta1}"
                    >
                    <span id="snell-theta1-value">
                        ${this.params.theta1.toFixed(2)}
                    </span>
                </label>
            </div>
        `;

        // Coloca os controles depois do canvas
        this.canvas.parentElement.appendChild(this.controlsContainer);

        // ====================================================
        // EVENTOS
        // ====================================================

        const n1Input =
            this.controlsContainer.querySelector("#snell-n1");

        const n2Input =
            this.controlsContainer.querySelector("#snell-n2");

        const theta1Input =
            this.controlsContainer.querySelector("#snell-theta1");


        n1Input.addEventListener("input", () => {

            this.params.n1 = parseFloat(n1Input.value);

            this.controlsContainer.querySelector(
                "#snell-n1-value"
            ).textContent = this.params.n1.toFixed(2);

            this.solve();
            this.draw();
        });


        n2Input.addEventListener("input", () => {

            this.params.n2 = parseFloat(n2Input.value);

            this.controlsContainer.querySelector(
                "#snell-n2-value"
            ).textContent = this.params.n2.toFixed(2);

            this.solve();
            this.draw();
        });


        theta1Input.addEventListener("input", () => {

            this.params.theta1 = parseFloat(theta1Input.value);

            this.controlsContainer.querySelector(
                "#snell-theta1-value"
            ).textContent = this.params.theta1.toFixed(2);

            this.solve();
            this.draw();
        });
    }


    // ========================================================
    // RESOLUÇÃO DA LEI DE SNELL
    // ========================================================
    solve() {

        const n1 = this.params.n1;
        const n2 = this.params.n2;
        const theta1 = this.params.theta1;

        // Converter graus para radianos
        const theta1Rad = theta1 * Math.PI / 180;

        // Lei de Snell:
        //
        // n₁ sen(θ₁) = n₂ sen(θ₂)
        //
        // Portanto:
        //
        // sen(θ₂) = (n₁/n₂) sen(θ₁)

        this.sinTheta2 =
            (n1 / n2) * Math.sin(theta1Rad);


        // Verificar reflexão total interna
        if (Math.abs(this.sinTheta2) <= 1) {

            this.reflexaoTotal = false;

            this.theta2 =
                Math.asin(this.sinTheta2) * 180 / Math.PI;

        } else {

            this.reflexaoTotal = true;

            this.theta2 = null;
        }
    }


    // ========================================================
    // ÂNGULO CRÍTICO
    // ========================================================
    getAnguloCritico() {

        // Reflexão total só pode ocorrer quando:
        //
        // n₁ > n₂

        if (this.params.n1 <= this.params.n2) {
            return null;
        }

        const valor =
            this.params.n2 / this.params.n1;

        return Math.asin(valor) * 180 / Math.PI;
    }


    // ========================================================
    // DESENHA A INTERFACE ENTRE OS MEIOS
    // ========================================================
    drawInterface() {

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // ----------------------------------------------------
        // Meio 1
        // ----------------------------------------------------
        ctx.fillStyle = "rgba(100, 180, 255, 0.25)";

        ctx.fillRect(
            0,
            0,
            width,
            this.interfaceY
        );


        // ----------------------------------------------------
        // Meio 2
        // ----------------------------------------------------
        ctx.fillStyle = "rgba(100, 220, 130, 0.25)";

        ctx.fillRect(
            0,
            this.interfaceY,
            width,
            height - this.interfaceY
        );


        // ----------------------------------------------------
        // Interface
        // ----------------------------------------------------
        ctx.beginPath();

        ctx.moveTo(
            0,
            this.interfaceY
        );

        ctx.lineTo(
            width,
            this.interfaceY
        );

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.stroke();


        // ----------------------------------------------------
        // Normal
        // ----------------------------------------------------
        ctx.beginPath();

        ctx.moveTo(
            this.normalX,
            0
        );

        ctx.lineTo(
            this.normalX,
            height
        );

        ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
        ctx.lineWidth = 2;

        ctx.setLineDash([8, 6]);

        ctx.stroke();

        ctx.setLineDash([]);


        // ----------------------------------------------------
        // Texto dos meios
        // ----------------------------------------------------

        ctx.fillStyle = "#222";
        ctx.font = "16px Arial";

        ctx.fillText(
            `Meio 1: n₁ = ${this.params.n1.toFixed(2)}`,
            20,
            30
        );

        ctx.fillText(
            `Meio 2: n₂ = ${this.params.n2.toFixed(2)}`,
            20,
            this.interfaceY + 30
        );
    }


    // ========================================================
    // RAIO INCIDENTE
    // ========================================================
    drawIncidentRay() {

        const ctx = this.ctx;

        const theta =
            this.params.theta1 * Math.PI / 180;


        // Ponto de incidência
        const x0 = this.normalX;
        const y0 = this.interfaceY;


        // Comprimento do raio
        const L = this.rayLength;


        // Como o raio vem do canto superior esquerdo
        // em direção ao ponto de incidência:

        const x1 =
            x0 - L * Math.sin(theta);

        const y1 =
            y0 - L * Math.cos(theta);


        // ----------------------------------------------------
        // Raio
        // ----------------------------------------------------

        ctx.beginPath();

        ctx.moveTo(x1, y1);

        ctx.lineTo(x0, y0);

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 4;

        ctx.stroke();


        // ----------------------------------------------------
        // Seta
        // ----------------------------------------------------

        this.drawArrow(
            x1,
            y1,
            x0,
            y0,
            "#1976d2"
        );
    }


    // ========================================================
    // RAIO REFRATADO
    // ========================================================
    drawRefractedRay() {

        if (this.reflexaoTotal) {
            return;
        }

        const ctx = this.ctx;

        const theta =
            this.theta2 * Math.PI / 180;


        const x0 = this.normalX;
        const y0 = this.interfaceY;

        const L = this.rayLength;


        // Raio refratado:
        //
        // sai do ponto de incidência para a direita
        // e para baixo.

        const x2 =
            x0 + L * Math.sin(theta);

        const y2 =
            y0 + L * Math.cos(theta);


        ctx.beginPath();

        ctx.moveTo(x0, y0);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "#d62728";
        ctx.lineWidth = 4;

        ctx.stroke();


        // ----------------------------------------------------
        // Seta
        // ----------------------------------------------------

        this.drawArrow(
            x0,
            y0,
            x2,
            y2,
            "#d62728"
        );
    }


    // ========================================================
    // REFLEXÃO TOTAL INTERNA
    // ========================================================
    drawTotalReflection() {

        if (!this.reflexaoTotal) {
            return;
        }

        const ctx = this.ctx;

        const theta =
            this.params.theta1 * Math.PI / 180;


        const x0 = this.normalX;
        const y0 = this.interfaceY;

        const L = this.rayLength;


        // ----------------------------------------------------
        // Raio refletido
        // ----------------------------------------------------

        const x2 =
            x0 + L * Math.sin(theta);

        const y2 =
            y0 - L * Math.cos(theta);


        ctx.beginPath();

        ctx.moveTo(x0, y0);

        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "orange";
        ctx.lineWidth = 4;

        ctx.setLineDash([10, 6]);

        ctx.stroke();

        ctx.setLineDash([]);


        // ----------------------------------------------------
        // Seta
        // ----------------------------------------------------

        this.drawArrow(
            x0,
            y0,
            x2,
            y2,
            "orange"
        );
    }


    // ========================================================
    // DESENHA SETA
    // ========================================================
    drawArrow(x1, y1, x2, y2, color) {

        const ctx = this.ctx;

        const angle =
            Math.atan2(y2 - y1, x2 - x1);

        const arrowSize = 12;


        // Posição aproximada da seta
        const t = 0.75;

        const x =
            x1 + (x2 - x1) * t;

        const y =
            y1 + (y2 - y1) * t;


        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            x - arrowSize * Math.cos(angle - Math.PI / 6),
            y - arrowSize * Math.sin(angle - Math.PI / 6)
        );

        ctx.lineTo(
            x - arrowSize * Math.cos(angle + Math.PI / 6),
            y - arrowSize * Math.sin(angle + Math.PI / 6)
        );

        ctx.closePath();

        ctx.fillStyle = color;

        ctx.fill();
    }


    // ========================================================
    // DESENHA OS ÂNGULOS
    // ========================================================
    drawAngles() {

        const ctx = this.ctx;

        const x0 = this.normalX;
        const y0 = this.interfaceY;

        const radius = 50;


        // ====================================================
        // ÂNGULO DE INCIDÊNCIA θ₁
        // ====================================================

        const theta1Rad =
            this.params.theta1 * Math.PI / 180;


        // No Canvas:
        //
        // π/2 representa a direção para baixo.
        //
        // O raio incidente está à esquerda da normal.

        const anguloNormalSuperior = -Math.PI / 2;

        const anguloRaioIncidente =
            -Math.PI / 2 - theta1Rad;


        ctx.beginPath();

        ctx.arc(
            x0,
            y0,
            radius,
            anguloRaioIncidente,
            anguloNormalSuperior,
            false
        );

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2;

        ctx.stroke();


        // Texto θ₁

        ctx.fillStyle = "#1976d2";
        ctx.font = "16px Arial";

        ctx.fillText(
            `θ₁ = ${this.params.theta1.toFixed(1)}°`,
            x0 - 95,
            y0 - 55
        );


        // ====================================================
        // ÂNGULO DE REFRAÇÃO θ₂
        // ====================================================

        if (!this.reflexaoTotal) {

            const theta2Rad =
                this.theta2 * Math.PI / 180;


            // ------------------------------------------------
            // CORREÇÃO IMPORTANTE
            // ------------------------------------------------
            //
            // O raio refratado está à DIREITA da normal.
            //
            // No Canvas:
            //
            // π/2  -> direção para baixo
            //
            // O raio refratado está inclinado para a direita,
            // portanto seu ângulo é:
            //
            // π/2 - θ₂
            //
            // O arco deve ser desenhado entre:
            //
            //     raio refratado
            //          e
            //        normal
            //
            // ------------------------------------------------

            const anguloNormal =
                Math.PI / 2;

            const anguloRaioRefratado =
                Math.PI / 2 - theta2Rad;


            ctx.beginPath();

            ctx.arc(
                x0,
                y0,
                radius,
                anguloRaioRefratado,
                anguloNormal,
                false
            );

            ctx.strokeStyle = "#d62728";
            ctx.lineWidth = 2;

            ctx.stroke();


            // ------------------------------------------------
            // Texto θ₂
            // ------------------------------------------------

            ctx.fillStyle = "#d62728";
            ctx.font = "16px Arial";

            ctx.fillText(
                `θ₂ = ${this.theta2.toFixed(1)}°`,
                x0 + 65,
                y0 + 55
            );
        }


        // ====================================================
        // REFLEXÃO TOTAL
        // ====================================================

        else {

            const thetaRad =
                this.params.theta1 * Math.PI / 180;


            const anguloNormal =
                -Math.PI / 2;

            const anguloRaio =
                -Math.PI / 2 + thetaRad;


            ctx.beginPath();

            ctx.arc(
                x0,
                y0,
                radius,
                anguloNormal,
                anguloRaio,
                false
            );

            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;

            ctx.stroke();


            ctx.fillStyle = "orange";
            ctx.font = "16px Arial";

            ctx.fillText(
                `θ₁ = ${this.params.theta1.toFixed(1)}°`,
                x0 + 55,
                y0 - 55
            );
        }
    }


    // ========================================================
    // HUD / INFORMAÇÕES
    // ========================================================
    drawHUD() {

        const ctx = this.ctx;

        const x = 15;
        const y = this.canvas.height - 155;

        const width = 300;
        const height = 135;


        // Fundo

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        ctx.beginPath();

        ctx.roundRect(
            x,
            y,
            width,
            height,
            8
        );

        ctx.fill();


        // Borda

        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;

        ctx.stroke();


        // Título

        ctx.fillStyle = "#222";
        ctx.font = "bold 16px Arial";

        ctx.fillText(
            "Lei de Snell",
            x + 10,
            y + 22
        );


        ctx.font = "14px Arial";


        // n1

        ctx.fillText(
            `n₁ = ${this.params.n1.toFixed(2)}`,
            x + 10,
            y + 44
        );


        // n2

        ctx.fillText(
            `n₂ = ${this.params.n2.toFixed(2)}`,
            x + 10,
            y + 64
        );


        // theta1

        ctx.fillText(
            `θ₁ = ${this.params.theta1.toFixed(2)}°`,
            x + 10,
            y + 84
        );


        // theta2

        if (!this.reflexaoTotal) {

            ctx.fillText(
                `θ₂ = ${this.theta2.toFixed(2)}°`,
                x + 10,
                y + 104
            );


            ctx.fillText(
                `sen(θ₂) = ${this.sinTheta2.toFixed(4)}`,
                x + 10,
                y + 124
            );

        } else {

            ctx.fillStyle = "orange";

            ctx.fillText(
                "Reflexão total interna!",
                x + 10,
                y + 104
            );


            const critico =
                this.getAnguloCritico();


            if (critico !== null) {

                ctx.fillStyle = "#222";

                ctx.fillText(
                    `θ crítico = ${critico.toFixed(2)}°`,
                    x + 10,
                    y + 124
                );
            }
        }
    }


    // ========================================================
    // DESENHO PRINCIPAL
    // ========================================================
    draw() {

        const ctx = this.ctx;

        // Limpar canvas

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // ----------------------------------------------------
        // Interface e meios
        // ----------------------------------------------------

        this.drawInterface();


        // ----------------------------------------------------
        // Raio incidente
        // ----------------------------------------------------

        this.drawIncidentRay();


        // ----------------------------------------------------
        // Raio refratado ou refletido
        // ----------------------------------------------------

        if (this.reflexaoTotal) {

            this.drawTotalReflection();

        } else {

            this.drawRefractedRay();
        }


        // ----------------------------------------------------
        // Ângulos
        // ----------------------------------------------------

        this.drawAngles();


        // ----------------------------------------------------
        // Informações
        // ----------------------------------------------------

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
