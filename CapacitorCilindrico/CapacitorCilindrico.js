// ============================================================
// SIMULAÇÃO DE CAPACITOR CILÍNDRICO
// ============================================================
//
// Simulação interativa de um capacitor cilíndrico/coaxial.
//
// Campo elétrico:
//
//             λ
// E(r) = ----------------
//        2π ε₀ r
//
// Capacitância:
//
//             2π ε₀ L
// C = -------------------------
//          ln(b/a)
//
// Diferença de potencial:
//
//             λ
// V = ---------------- ln(b/a)
//        2π ε₀
//
// Energia:
//
// U = 1/2 C V²
//
// Não utiliza bibliotecas externas.
// Utiliza apenas JavaScript, Canvas e DOM.
// ============================================================


class CapacitorCilindrico {


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

            // Densidade linear de carga
            // em nC/m

            lambda:
                options.lambda ?? 1.0,


            // Raio do cilindro interno

            a:
                options.a ?? 1.0,


            // Raio do cilindro externo

            b:
                options.b ?? 2.0,


            // Comprimento

            L:
                options.L ?? 1.0
        };


        // ====================================================
        // CONSTANTE
        // ====================================================

        this.epsilon0 =
            8.85e-12;


        // ====================================================
        // RESULTADOS
        // ====================================================

        this.lambdaSI = 0;

        this.C = 0;

        this.V = 0;

        this.U = 0;


        // ====================================================
        // ANIMAÇÃO
        // ====================================================

        this.animationTime = 0;

        this.lastTime = null;


        // ====================================================
        // GEOMETRIA
        // ====================================================

        this.centerX =
            this.canvas.width / 2;

        this.centerY =
            this.canvas.height / 2;


        // ====================================================
        // CONTROLES
        // ====================================================

        this.createControls();


        // ====================================================
        // RESOLVE
        // ====================================================

        this.solve();


        // ====================================================
        // DESENHA
        // ====================================================

        this.draw();


        // ====================================================
        // INICIA ANIMAÇÃO
        // ====================================================

        this.animate();
    }


    // ========================================================
    // CONTROLES
    // ========================================================

    createControls() {

        this.controlsContainer =
            document.createElement("div");


        this.controlsContainer.className =
            "capacitor-cilindrico-controls";


        // ====================================================
        // HTML
        // ====================================================

        this.controlsContainer.innerHTML = `

            <h2>
                Parâmetros do Capacitor Cilíndrico
            </h2>


            <!-- ==============================================
                 LAMBDA
                 ============================================== -->

            <div class="control">

                <label>

                    λ (nC/m):

                    <input
                        type="range"
                        id="cc-lambda"
                        min="-10"
                        max="10"
                        step="0.1"
                        value="${this.params.lambda}"
                    >

                    <span id="cc-lambda-value">
                        ${this.params.lambda.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==============================================
                 RAIO INTERNO
                 ============================================== -->

            <div class="control">

                <label>

                    a (m):

                    <input
                        type="range"
                        id="cc-a"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value="${this.params.a}"
                    >

                    <span id="cc-a-value">
                        ${this.params.a.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==============================================
                 RAIO EXTERNO
                 ============================================== -->

            <div class="control">

                <label>

                    b (m):

                    <input
                        type="range"
                        id="cc-b"
                        min="1"
                        max="4"
                        step="0.1"
                        value="${this.params.b}"
                    >

                    <span id="cc-b-value">
                        ${this.params.b.toFixed(2)}
                    </span>

                </label>

            </div>


            <!-- ==============================================
                 COMPRIMENTO
                 ============================================== -->

            <div class="control">

                <label>

                    L (m):

                    <input
                        type="range"
                        id="cc-L"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value="${this.params.L}"
                    >

                    <span id="cc-L-value">
                        ${this.params.L.toFixed(2)}
                    </span>

                </label>

            </div>

        `;


        // ====================================================
        // INSERIR CONTROLES
        // ====================================================

        this.canvas.parentElement.appendChild(
            this.controlsContainer
        );


        // ====================================================
        // REFERÊNCIAS
        // ====================================================

        const lambdaInput =
            this.controlsContainer.querySelector(
                "#cc-lambda"
            );


        const aInput =
            this.controlsContainer.querySelector(
                "#cc-a"
            );


        const bInput =
            this.controlsContainer.querySelector(
                "#cc-b"
            );


        const LInput =
            this.controlsContainer.querySelector(
                "#cc-L"
            );


        // ====================================================
        // LAMBDA
        // ====================================================

        lambdaInput.addEventListener(
            "input",
            () => {

                this.params.lambda =
                    parseFloat(
                        lambdaInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#cc-lambda-value"
                    )
                    .textContent =
                    this.params.lambda.toFixed(2);


                this.solve();
            }
        );


        // ====================================================
        // a
        // ====================================================

        aInput.addEventListener(
            "input",
            () => {

                this.params.a =
                    parseFloat(
                        aInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#cc-a-value"
                    )
                    .textContent =
                    this.params.a.toFixed(2);


                this.solve();
            }
        );


        // ====================================================
        // b
        // ====================================================

        bInput.addEventListener(
            "input",
            () => {

                this.params.b =
                    parseFloat(
                        bInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#cc-b-value"
                    )
                    .textContent =
                    this.params.b.toFixed(2);


                this.solve();
            }
        );


        // ====================================================
        // L
        // ====================================================

        LInput.addEventListener(
            "input",
            () => {

                this.params.L =
                    parseFloat(
                        LInput.value
                    );


                this.controlsContainer
                    .querySelector(
                        "#cc-L-value"
                    )
                    .textContent =
                    this.params.L.toFixed(2);


                this.solve();
            }
        );
    }


    // ========================================================
    // RESOLUÇÃO
    // ========================================================

    solve() {

        // ====================================================
        // GARANTIR b > a
        // ====================================================

        if (
            this.params.b <=
            this.params.a
        ) {

            this.params.b =
                this.params.a + 0.1;


            const bInput =
                this.controlsContainer
                    .querySelector(
                        "#cc-b"
                    );


            bInput.value =
                this.params.b;


            this.controlsContainer
                .querySelector(
                    "#cc-b-value"
                )
                .textContent =
                this.params.b.toFixed(2);
        }


        // ====================================================
        // PARÂMETROS
        // ====================================================

        const lambda =
            this.params.lambda * 1e-9;


        const a =
            this.params.a;


        const b =
            this.params.b;


        const L =
            this.params.L;


        // ====================================================
        // λ EM SI
        // ====================================================

        this.lambdaSI =
            lambda;


        // ====================================================
        // CAPACITÂNCIA
        // ====================================================

        this.C =
            (
                2 *
                Math.PI *
                this.epsilon0 *
                L
            ) /
            Math.log(b / a);


        // ====================================================
        // DIFERENÇA DE POTENCIAL
        // ====================================================

        this.V =
            (
                lambda /
                (
                    2 *
                    Math.PI *
                    this.epsilon0
                )
            ) *
            Math.log(b / a);


        // ====================================================
        // ENERGIA
        // ====================================================

        this.U =
            0.5 *
            this.C *
            this.V *
            this.V;
    }


    // ========================================================
    // CAMPO ELÉTRICO
    // ========================================================

    electricField(r) {

        if (
            r <= this.params.a ||
            r >= this.params.b
        ) {

            return 0;
        }


        return (
            this.lambdaSI /
            (
                2 *
                Math.PI *
                this.epsilon0 *
                r
            )
        );
    }


    // ========================================================
    // DESENHA CILINDROS
    // ========================================================

    drawCylinders() {

        const ctx =
            this.ctx;


        const cx =
            this.centerX;


        const cy =
            this.centerY;


        // ====================================================
        // ESCALA
        // ====================================================

        const maxRadius =
            Math.min(
                this.canvas.width,
                this.canvas.height
            ) * 0.32;


        const scale =
            maxRadius /
            this.params.b;


        this.scale =
            scale;


        this.innerRadius =
            this.params.a *
            scale;


        this.outerRadius =
            this.params.b *
            scale;


        // ====================================================
        // CILINDRO EXTERNO
        // ====================================================

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            this.outerRadius,
            0,
            2 * Math.PI
        );

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            5;

        ctx.stroke();


        // ====================================================
        // CILINDRO INTERNO
        // ====================================================

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            this.innerRadius,
            0,
            2 * Math.PI
        );

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            7;

        ctx.stroke();


        // ====================================================
        // PREENCHIMENTO DA REGIÃO CONDUTORA
        // ====================================================

        ctx.fillStyle =
            "rgba(120, 120, 120, 0.08)";


        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            this.innerRadius,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ====================================================
        // REGIÃO ENTRE OS CILINDROS
        // ====================================================

        ctx.fillStyle =
            "rgba(100, 180, 255, 0.08)";


        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            this.outerRadius,
            0,
            2 * Math.PI
        );

        ctx.arc(
            cx,
            cy,
            this.innerRadius,
            0,
            2 * Math.PI,
            true
        );

        ctx.fill();


        // ====================================================
        // SINAIS
        // ====================================================

        ctx.font =
            "bold 22px Arial";

        ctx.fillStyle =
            "#222";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        const signal =
            this.params.lambda > 0
                ? "+"
                : this.params.lambda < 0
                    ? "−"
                    : "0";


        ctx.fillText(
            signal,
            cx,
            cy
        );


        // ====================================================
        // RÓTULOS
        // ====================================================

        ctx.font =
            "14px Arial";


        ctx.textAlign =
            "left";


        ctx.fillText(
            `a = ${this.params.a.toFixed(2)} m`,
            cx +
            this.innerRadius +
            10,
            cy - 5
        );


        ctx.fillText(
            `b = ${this.params.b.toFixed(2)} m`,
            cx +
            this.outerRadius +
            10,
            cy + 15
        );
    }


    // ========================================================
    // LINHAS DE CAMPO
    // ========================================================

    drawFieldLines() {

        const ctx =
            this.ctx;


        const cx =
            this.centerX;


        const cy =
            this.centerY;


        // ====================================================
        // CAMPO NULO
        // ====================================================

        if (
            Math.abs(
                this.lambdaSI
            ) < 1e-20
        ) {

            return;
        }


        // ====================================================
        // NÚMERO DE LINHAS RADIAIS
        // ====================================================

        const numberOfLines =
            16;


        // ====================================================
        // DIREÇÃO DO CAMPO
        // ====================================================

        /*
         *
         * λ > 0:
         *
         * Campo aponta radialmente
         * para fora.
         *
         *
         * λ < 0:
         *
         * Campo aponta radialmente
         * para dentro.
         *
         */

        const outward =
            this.lambdaSI > 0;


        // ====================================================
        // LINHAS RADIAIS
        // ====================================================

        for (
            let i = 0;
            i < numberOfLines;
            i++
        ) {

            const angle =
                (
                    2 *
                    Math.PI *
                    i
                ) /
                numberOfLines;


            const cos =
                Math.cos(angle);


            const sin =
                Math.sin(angle);


            // =================================================
            // PONTO INICIAL
            // =================================================

            const x1 =
                cx +
                this.innerRadius *
                cos;


            const y1 =
                cy +
                this.innerRadius *
                sin;


            // =================================================
            // PONTO FINAL
            // =================================================

            const x2 =
                cx +
                this.outerRadius *
                cos;


            const y2 =
                cy +
                this.outerRadius *
                sin;


            // =================================================
            // LINHA
            // =================================================

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
                "rgba(60, 60, 60, 0.40)";

            ctx.lineWidth =
                1.5;

            ctx.stroke();


            // =================================================
            // SETAS FIXAS
            // =================================================

            const numberOfArrows =
                3;


            for (
                let j = 0;
                j < numberOfArrows;
                j++
            ) {

                const t =
                    0.22 +
                    j * 0.28;


                this.drawFieldArrow(
                    angle,
                    t,
                    outward
                );
            }


            // =================================================
            // SETA ANIMADA
            // =================================================

            this.drawAnimatedArrow(
                angle,
                outward
            );
        }
    }


    // ========================================================
    // SETA DE CAMPO
    // ========================================================

    drawFieldArrow(
        angle,
        t,
        outward
    ) {

        const ctx =
            this.ctx;


        // ====================================================
        // POSIÇÃO RADIAL
        // ====================================================

        const range =
            this.outerRadius -
            this.innerRadius;


        const radius =
            this.innerRadius +
            t * range;


        const x =
            this.centerX +
            radius *
            Math.cos(angle);


        const y =
            this.centerY +
            radius *
            Math.sin(angle);


        // ====================================================
        // DIREÇÃO
        // ====================================================

        const direction =
            outward
                ? 1
                : -1;


        const dx =
            Math.cos(angle) *
            direction;


        const dy =
            Math.sin(angle) *
            direction;


        // ====================================================
        // TAMANHO
        // ====================================================

        const arrowLength =
            14;


        const headLength =
            7;


        // ====================================================
        // PONTA DA SETA
        // ====================================================

        const tipX =
            x +
            dx *
            arrowLength;


        const tipY =
            y +
            dy *
            arrowLength;


        // ====================================================
        // ÂNGULO
        // ====================================================

        const theta =
            Math.atan2(
                dy,
                dx
            );


        // ====================================================
        // DESENHAR
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            tipX,
            tipY
        );

        ctx.lineTo(
            tipX -
            headLength *
            Math.cos(
                theta -
                Math.PI / 6
            ),
            tipY -
            headLength *
            Math.sin(
                theta -
                Math.PI / 6
            )
        );

        ctx.lineTo(
            tipX -
            headLength *
            Math.cos(
                theta +
                Math.PI / 6
            ),
            tipY -
            headLength *
            Math.sin(
                theta +
                Math.PI / 6
            )
        );

        ctx.closePath();


        ctx.fillStyle =
            "#1976d2";

        ctx.fill();
    }


    // ========================================================
    // SETA ANIMADA
    // ========================================================

    drawAnimatedArrow(
        angle,
        outward
    ) {

        const ctx =
            this.ctx;


        // ====================================================
        // POSIÇÃO ANIMADA
        // ====================================================

        const range =
            this.outerRadius -
            this.innerRadius;


        let t =
            (
                this.animationTime *
                0.00005
                +
                angle /
                (2 * Math.PI)
            ) % 1;


        if (!outward) {

            t =
                1 - t;
        }


        // ====================================================
        // MARGEM
        // ====================================================

        const margin =
            0.08;


        t =
            margin +
            t *
            (1 - 2 * margin);


        const radius =
            this.innerRadius +
            t *
            range;


        // ====================================================
        // POSIÇÃO
        // ====================================================

        const x =
            this.centerX +
            radius *
            Math.cos(angle);


        const y =
            this.centerY +
            radius *
            Math.sin(angle);


        // ====================================================
        // DIREÇÃO
        // ====================================================

        const direction =
            outward
                ? 1
                : -1;


        const dx =
            Math.cos(angle) *
            direction;


        const dy =
            Math.sin(angle) *
            direction;


        // ====================================================
        // TAMANHO
        // ====================================================

        const arrowLength =
            16;


        const headLength =
            8;


        // ====================================================
        // PONTA
        // ====================================================

        const x2 =
            x +
            dx *
            arrowLength;


        const y2 =
            y +
            dy *
            arrowLength;


        // ====================================================
        // ÂNGULO
        // ====================================================

        const theta =
            Math.atan2(
                dy,
                dx
            );


        // ====================================================
        // DESENHAR
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            x2,
            y2
        );

        ctx.lineTo(
            x2 -
            headLength *
            Math.cos(
                theta -
                Math.PI / 6
            ),
            y2 -
            headLength *
            Math.sin(
                theta -
                Math.PI / 6
            )
        );

        ctx.lineTo(
            x2 -
            headLength *
            Math.cos(
                theta +
                Math.PI / 6
            ),
            y2 -
            headLength *
            Math.sin(
                theta +
                Math.PI / 6
            )
        );

        ctx.closePath();


        ctx.fillStyle =
            "#1976d2";

        ctx.fill();
    }


    // ========================================================
    // GRÁFICO E(r)
    // ========================================================

    drawGraph() {

        const ctx =
            this.ctx;


        // ====================================================
        // POSIÇÃO DO GRÁFICO
        // ====================================================

        const graphX =
            25;


        const graphY =
            25;


        const graphWidth =
            320;


        const graphHeight =
            210;


        // ====================================================
        // FUNDO
        // ====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.94)";


        ctx.beginPath();

        ctx.roundRect(
            graphX,
            graphY,
            graphWidth,
            graphHeight,
            8
        );

        ctx.fill();


        ctx.strokeStyle =
            "rgba(0,0,0,0.25)";

        ctx.lineWidth =
            1;

        ctx.stroke();


        // ====================================================
        // TÍTULO
        // ====================================================

        ctx.fillStyle =
            "#222";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign =
            "left";


        ctx.fillText(
            "Campo elétrico E(r)",
            graphX + 10,
            graphY + 22
        );


        // ====================================================
        // ÁREA DO GRÁFICO
        // ====================================================

        const left =
            graphX + 55;


        const right =
            graphX +
            graphWidth -
            18;


        const top =
            graphY + 42;


        const bottom =
            graphY +
            graphHeight -
            45;


        // ====================================================
        // VALORES DE E
        // ====================================================

        /*
         *
         * Usamos os valores reais de E.
         *
         * Não existe normalização.
         *
         */

        const epsilon =
            1e-9;


        const rMin =
            this.params.a +
            epsilon;


        const rMax =
            this.params.b -
            epsilon;


        const E_min =
            this.electricField(
                rMax
            );


        const E_max =
            this.electricField(
                rMin
            );


        const absEmax =
            Math.abs(
                E_max
            );


        // ====================================================
        // CASO λ = 0
        // ====================================================

        if (
            absEmax === 0
        ) {

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
                "#1976d2";

            ctx.lineWidth =
                2.5;

            ctx.stroke();

        } else {

            // =================================================
            // EIXOS
            // =================================================

            ctx.beginPath();

            ctx.moveTo(
                left,
                top
            );

            ctx.lineTo(
                left,
                bottom
            );

            ctx.lineTo(
                right,
                bottom
            );

            ctx.strokeStyle =
                "#444";

            ctx.lineWidth =
                1;

            ctx.stroke();


            // =================================================
            // CURVA REAL E(r)
            // =================================================

            ctx.beginPath();


            const samples =
                200;


            for (
                let i = 0;
                i <= samples;
                i++
            ) {

                const r =
                    rMin +
                    (
                        rMax -
                        rMin
                    ) *
                    i /
                    samples;


                const E =
                    this.electricField(
                        r
                    );


                /*
                 * Como o campo pode ser negativo,
                 * usamos o valor real assinado.
                 *
                 * A escala vertical é definida
                 * pelo maior módulo de E.
                 */

                const x =
                    left +
                    (
                        r -
                        rMin
                    ) /
                    (
                        rMax -
                        rMin
                    ) *
                    (
                        right -
                        left
                    );


                const y =
                    bottom -
                    (
                        E /
                        absEmax
                    ) *
                    (
                        bottom -
                        top
                    );


                if (
                    i === 0
                ) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }


            ctx.strokeStyle =
                "#1976d2";

            ctx.lineWidth =
                2.5;

            ctx.stroke();
        }


        // ====================================================
        // MARCAÇÕES DO EIXO r
        // ====================================================

        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "#333";

        ctx.textAlign =
            "center";


        const rTicks =
            5;


        for (
            let i = 0;
            i <= rTicks;
            i++
        ) {

            const r =
                this.params.a +
                (
                    this.params.b -
                    this.params.a
                ) *
                i /
                rTicks;


            const x =
                left +
                (
                    r -
                    this.params.a
                ) /
                (
                    this.params.b -
                    this.params.a
                ) *
                (
                    right -
                    left
                );


            // Pequena marca
            ctx.beginPath();

            ctx.moveTo(
                x,
                bottom
            );

            ctx.lineTo(
                x,
                bottom + 5
            );

            ctx.strokeStyle =
                "#444";

            ctx.stroke();


            ctx.fillText(
                r.toFixed(2),
                x,
                bottom + 17
            );
        }


        // ====================================================
        // RÓTULO DO EIXO r
        // ====================================================

        ctx.font =
            "12px Arial";

        ctx.fillStyle =
            "#333";


        ctx.fillText(
            "r (m)",
            (
                left +
                right
            ) / 2,
            bottom + 35
        );


        // ====================================================
        // MARCAÇÕES DO EIXO E
        // ====================================================

        ctx.textAlign =
            "right";

        ctx.font =
            "11px Arial";


        const E_ticks =
            5;


        for (
            let i = 0;
            i <= E_ticks;
            i++
        ) {

            const fraction =
                i /
                E_ticks;


            /*
             * Valores reais de E.
             *
             * Para λ positivo:
             *
             * 0 até E_max.
             *
             * Para λ negativo:
             *
             * 0 até E_min.
             */

            const E =
                E_max *
                fraction;


            const y =
                bottom -
                fraction *
                (
                    bottom -
                    top
                );


            // Pequena marca
            ctx.beginPath();

            ctx.moveTo(
                left - 5,
                y
            );

            ctx.lineTo(
                left,
                y
            );

            ctx.strokeStyle =
                "#444";

            ctx.stroke();


            ctx.fillText(
                this.formatScientific(
                    E
                ),
                left - 8,
                y + 4
            );
        }


        // ====================================================
        // RÓTULO DO EIXO E
        // ====================================================

        ctx.save();


        ctx.translate(
            left - 43,
            (
                top +
                bottom
            ) / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.font =
            "12px Arial";


        ctx.fillText(
            "E (V/m)",
            0,
            0
        );


        ctx.restore();


        // ====================================================
        // LINHAS GUIA HORIZONTAIS
        // ====================================================

        ctx.strokeStyle =
            "rgba(0,0,0,0.10)";

        ctx.lineWidth =
            1;


        for (
            let i = 1;
            i < E_ticks;
            i++
        ) {

            const y =
                bottom -
                (
                    i /
                    E_ticks
                ) *
                (
                    bottom -
                    top
                );


            ctx.beginPath();

            ctx.moveTo(
                left,
                y
            );

            ctx.lineTo(
                right,
                y
            );

            ctx.stroke();
        }
    }


    // ========================================================
    // FORMATAÇÃO CIENTÍFICA
    // ========================================================

    formatScientific(value) {

        if (
            Math.abs(value) < 1e-15
        ) {

            return "0";
        }


        const exponent =
            Math.floor(
                Math.log10(
                    Math.abs(value)
                )
            );


        const mantissa =
            value /
            Math.pow(
                10,
                exponent
            );


        return (
            mantissa.toFixed(1) +
            "×10^" +
            exponent
        );
    }


    // ========================================================
    // DIMENSÃO DOS RAIOS
    // ========================================================

    drawRadiusIndicators() {

        const ctx =
            this.ctx;


        const cx =
            this.centerX;


        const cy =
            this.centerY;


        const angle =
            -Math.PI / 4;


        const cos =
            Math.cos(angle);


        const sin =
            Math.sin(angle);


        // ====================================================
        // RAIO a
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy
        );

        ctx.lineTo(
            cx +
            this.innerRadius *
            cos,
            cy +
            this.innerRadius *
            sin
        );

        ctx.strokeStyle =
            "#555";

        ctx.lineWidth =
            1;

        ctx.stroke();


        // ====================================================
        // RAIO b
        // ====================================================

        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy
        );

        ctx.lineTo(
            cx +
            this.outerRadius *
            cos,
            cy +
            this.outerRadius *
            sin
        );

        ctx.strokeStyle =
            "#555";

        ctx.stroke();


        // ====================================================
        // TEXTO a
        // ====================================================

        ctx.font =
            "14px Arial";

        ctx.fillStyle =
            "#333";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "a",
            cx +
            this.innerRadius *
            cos / 2,
            cy +
            this.innerRadius *
            sin / 2 - 8
        );


        // ====================================================
        // TEXTO b
        // ====================================================

        ctx.fillText(
            "b",
            cx +
            this.outerRadius *
            cos / 2,
            cy +
            this.outerRadius *
            sin / 2 - 8
        );
    }


    // ========================================================
    // HUD
    // ========================================================

    drawHUD() {

        const ctx =
            this.ctx;


        const x =
            this.canvas.width - 300;


        const y =
            25;


        const width =
            275;


        const height =
            175;


        // ====================================================
        // FUNDO
        // ====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.94)";


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
            "rgba(0,0,0,0.3)";

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
            "Capacitor cilíndrico",
            x + 10,
            y + 23
        );


        // ====================================================
        // RESULTADOS
        // ====================================================

        ctx.font =
            "14px Arial";


        ctx.fillText(
            `λ = ${this.params.lambda.toFixed(2)} nC/m`,
            x + 10,
            y + 48
        );


        ctx.fillText(
            `C = ${(this.C * 1e9).toFixed(4)} nF`,
            x + 10,
            y + 71
        );


        ctx.fillText(
            `V = ${this.V.toFixed(2)} V`,
            x + 10,
            y + 94
        );


        ctx.fillText(
            `U = ${(this.U * 1e6).toFixed(4)} µJ`,
            x + 10,
            y + 117
        );


        ctx.fillText(
            `a = ${this.params.a.toFixed(2)} m`,
            x + 10,
            y + 140
        );


        ctx.fillText(
            `b = ${this.params.b.toFixed(2)} m`,
            x + 130,
            y + 140
        );


        ctx.fillText(
            `L = ${this.params.L.toFixed(2)} m`,
            x + 10,
            y + 162
        );
    }


    // ========================================================
    // DESENHO PRINCIPAL
    // ========================================================

    draw() {

        const ctx =
            this.ctx;


        // ====================================================
        // LIMPAR
        // ====================================================

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // ====================================================
        // CILINDROS
        // ====================================================

        this.drawCylinders();


        // ====================================================
        // LINHAS DE CAMPO
        // ====================================================

        this.drawFieldLines();


        // ====================================================
        // INDICADORES
        // ====================================================

        this.drawRadiusIndicators();


        // ====================================================
        // GRÁFICO
        // ====================================================

        this.drawGraph();


        // ====================================================
        // HUD
        // ====================================================

        this.drawHUD();
    }


    // ========================================================
    // ANIMAÇÃO
    // ========================================================

    animate(timestamp) {

        if (
            this.lastTime === null
        ) {

            this.lastTime =
                timestamp;
        }


        const delta =
            timestamp -
            this.lastTime;


        this.lastTime =
            timestamp;


        this.animationTime +=
            delta;


        this.draw();


        requestAnimationFrame(
            (time) =>
                this.animate(time)
        );
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
