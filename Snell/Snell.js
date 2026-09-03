class Snell {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            // Índice de refração do meio 1
            n1: 1.0,

            // Índice de refração do meio 2
            n2: 1.5,

            // Ângulo de incidência
            // SEMPRE EM GRAUS
            theta1: 30.0,

            ...options
        };

        // =====================================================
        // RESULTADOS
        // =====================================================

        this.theta2 = null;

        this.sinTheta2 = null;

        this.reflexaoTotal = false;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.interfaceY =
            this.canvas.height / 2;

        this.normalX =
            this.canvas.width / 2;

        // Comprimento dos raios
        this.rayLength = 180;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // DESENHO INICIAL
        // =====================================================

        this.draw();
    }


    // =========================================================
    // LEI DE SNELL
    // =========================================================

    solve() {

        const p =
            this.params;

        // =====================================================
        // CONVERSÃO DO ÂNGULO
        // =====================================================

        const theta1Rad =
            p.theta1 *
            Math.PI /
            180;

        // =====================================================
        // LEI DE SNELL
        // =====================================================

        this.sinTheta2 =
            (
                p.n1 /
                p.n2
            ) *
            Math.sin(
                theta1Rad
            );

        // =====================================================
        // REFLEXÃO TOTAL INTERNA
        // =====================================================

        if (
            Math.abs(
                this.sinTheta2
            ) <= 1
        ) {

            this.theta2 =
                Math.asin(
                    this.sinTheta2
                ) *
                180 /
                Math.PI;

            this.reflexaoTotal =
                false;

        } else {

            this.theta2 =
                null;

            this.reflexaoTotal =
                true;
        }
    }


    // =========================================================
    // ÂNGULO CRÍTICO
    // =========================================================

    getAnguloCritico() {

        const p =
            this.params;

        // =====================================================
        // Só existe reflexão total quando n1 > n2
        // =====================================================

        if (
            p.n1 <= p.n2
        ) {

            return null;
        }

        const ratio =
            p.n2 /
            p.n1;

        if (
            ratio > 1
        ) {

            return null;
        }

        return Math.asin(
            ratio
        ) *
        180 /
        Math.PI;
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "snell-controls"
            );

        if (old)
            old.remove();

        const container =
            document.createElement(
                "div"
            );

        container.id =
            "snell-controls";

        container.style.width =
            "900px";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial";

        // =====================================================
        // TÍTULO
        // =====================================================

        const title =
            document.createElement(
                "h2"
            );

        title.innerText =
            "Parâmetros da Lei de Snell";

        container.appendChild(
            title
        );

        this.sliders = {};

        // =====================================================
        // CONFIGURAÇÕES
        // =====================================================

        const configs = [

            {
                name: "n1",
                label: "n₁",
                min: 1.0,
                max: 2.5,
                step: 0.1
            },

            {
                name: "n2",
                label: "n₂",
                min: 1.0,
                max: 2.5,
                step: 0.1
            },

            {
                name: "theta1",
                label: "θ₁ (°)",
                min: 0,
                max: 89,
                step: 1
            }

        ];

        // =====================================================
        // CRIA SLIDERS
        // =====================================================

        configs.forEach(
            config => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.style.display =
                    "flex";

                row.style.alignItems =
                    "center";

                row.style.marginBottom =
                    "8px";

                // =================================================
                // LABEL
                // =================================================

                const label =
                    document.createElement(
                        "label"
                    );

                label.style.width =
                    "110px";

                label.innerText =
                    config.label;

                // =================================================
                // SLIDER
                // =================================================

                const slider =
                    document.createElement(
                        "input"
                    );

                slider.type =
                    "range";

                slider.min =
                    config.min;

                slider.max =
                    config.max;

                slider.step =
                    config.step;

                slider.value =
                    this.params[
                        config.name
                    ];

                slider.style.flex =
                    "1";

                // =================================================
                // VALOR
                // =================================================

                const value =
                    document.createElement(
                        "span"
                    );

                value.style.width =
                    "80px";

                value.style.marginLeft =
                    "10px";

                value.innerText =
                    Number(
                        this.params[
                            config.name
                        ]
                    ).toFixed(2);

                // =================================================
                // EVENTO
                // =================================================

                slider.addEventListener(
                    "input",
                    () => {

                        const v =
                            Number(
                                slider.value
                            );

                        this.params[
                            config.name
                        ] =
                            v;

                        value.innerText =
                            v.toFixed(2);

                        // =========================================
                        // RECALCULA
                        // =========================================

                        this.solve();

                        this.draw();

                    }
                );

                row.appendChild(
                    label
                );

                row.appendChild(
                    slider
                );

                row.appendChild(
                    value
                );

                container.appendChild(
                    row
                );

                this.sliders[
                    config.name
                ] =
                    slider;
            }
        );

        // =====================================================
        // INSERE DEPOIS DO CANVAS
        // =====================================================

        this.canvas.parentNode.insertBefore(

            container,

            this.canvas.nextSibling

        );
    }


    // =========================================================
    // DESENHO DA INTERFACE
    // =========================================================

    drawInterface(ctx) {

        const w =
            this.canvas.width;

        const h =
            this.canvas.height;

        const y =
            this.interfaceY;

        const x =
            this.normalX;

        // =====================================================
        // MEIO 1
        // =====================================================

        ctx.fillStyle =
            "rgba(120, 190, 255, 0.25)";

        ctx.fillRect(

            0,
            0,

            w,
            y

        );

        // =====================================================
        // MEIO 2
        // =====================================================

        ctx.fillStyle =
            "rgba(120, 220, 150, 0.25)";

        ctx.fillRect(

            0,
            y,

            w,
            h - y

        );

        // =====================================================
        // INTERFACE
        // =====================================================

        ctx.strokeStyle =
            "black";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            w,
            y
        );

        ctx.stroke();

        // =====================================================
        // NORMAL
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;

        ctx.setLineDash([
            8,
            6
        ]);

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            h
        );

        ctx.stroke();

        ctx.setLineDash([]);

        // =====================================================
        // LABELS DOS MEIOS
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(

            `Meio 1: n₁ = ${this.params.n1.toFixed(2)}`,

            20,
            30

        );

        ctx.fillText(

            `Meio 2: n₂ = ${this.params.n2.toFixed(2)}`,

            20,
            y + 30

        );

        // =====================================================
        // NORMAL
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.fillText(

            "Normal",

            x + 10,
            25

        );
    }


    // =========================================================
    // DESENHO DO RAIO INCIDENTE
    // =========================================================

    drawIncidentRay(ctx) {

        const x0 =
            this.normalX;

        const y0 =
            this.interfaceY;

        const theta =
            this.params.theta1 *
            Math.PI /
            180;

        // =====================================================
        // COMPONENTES
        // =====================================================

        const dx =
            this.rayLength *
            Math.sin(theta);

        const dy =
            this.rayLength *
            Math.cos(theta);

        // =====================================================
        // PONTO INICIAL
        // =====================================================

        const xStart =
            x0 -
            dx;

        const yStart =
            y0 -
            dy;

        // =====================================================
        // RAIO
        // =====================================================

        ctx.strokeStyle =
            "#1976d2";

        ctx.lineWidth =
            4;

        ctx.beginPath();

        ctx.moveTo(
            xStart,
            yStart
        );

        ctx.lineTo(
            x0,
            y0
        );

        ctx.stroke();

        // =====================================================
        // SETA
        // =====================================================

        this.drawArrow(

            ctx,

            xStart,
            yStart,

            x0,
            y0,

            "#1976d2"

        );
    }


    // =========================================================
    // DESENHO DO RAIO REFRATADO
    // =========================================================

    drawRefractedRay(ctx) {

        if (
            this.reflexaoTotal
        )
            return;

        const x0 =
            this.normalX;

        const y0 =
            this.interfaceY;

        const theta =
            this.theta2 *
            Math.PI /
            180;

        // =====================================================
        // COMPONENTES
        // =====================================================

        const dx =
            this.rayLength *
            Math.sin(theta);

        const dy =
            this.rayLength *
            Math.cos(theta);

        // =====================================================
        // PONTO FINAL
        // =====================================================

        const xEnd =
            x0 +
            dx;

        const yEnd =
            y0 +
            dy;

        // =====================================================
        // RAIO
        // =====================================================

        ctx.strokeStyle =
            "#d32f2f";

        ctx.lineWidth =
            4;

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            xEnd,
            yEnd
        );

        ctx.stroke();

        // =====================================================
        // SETA
        // =====================================================

        this.drawArrow(

            ctx,

            x0,
            y0,

            xEnd,
            yEnd,

            "#d32f2f"

        );
    }


    // =========================================================
    // REFLEXÃO TOTAL INTERNA
    // =========================================================

    drawTotalReflection(ctx) {

        if (
            !this.reflexaoTotal
        )
            return;

        const x0 =
            this.normalX;

        const y0 =
            this.interfaceY;

        const theta =
            this.params.theta1 *
            Math.PI /
            180;

        const dx =
            this.rayLength *
            Math.sin(theta);

        const dy =
            this.rayLength *
            Math.cos(theta);

        // =====================================================
        // RAIO REFLETIDO
        // =====================================================

        const xEnd =
            x0 +
            dx;

        const yEnd =
            y0 -
            dy;

        ctx.strokeStyle =
            "#f57c00";

        ctx.lineWidth =
            4;

        ctx.setLineDash([
            10,
            6
        ]);

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            xEnd,
            yEnd
        );

        ctx.stroke();

        ctx.setLineDash([]);

        // =====================================================
        // SETA
        // =====================================================

        this.drawArrow(

            ctx,

            x0,
            y0,

            xEnd,
            yEnd,

            "#f57c00"

        );
    }


    // =========================================================
    // SETA
    // =========================================================

    drawArrow(
        ctx,
        x1,
        y1,
        x2,
        y2,
        color
    ) {

        const angle =
            Math.atan2(
                y2 - y1,
                x2 - x1
            );

        const size =
            10;

        ctx.fillStyle =
            color;

        ctx.beginPath();

        ctx.moveTo(
            x2,
            y2
        );

        ctx.lineTo(

            x2 -
            size *
            Math.cos(
                angle -
                Math.PI / 6
            ),

            y2 -
            size *
            Math.sin(
                angle -
                Math.PI / 6
            )

        );

        ctx.lineTo(

            x2 -
            size *
            Math.cos(
                angle +
                Math.PI / 6
            ),

            y2 -
            size *
            Math.sin(
                angle +
                Math.PI / 6
            )

        );

        ctx.closePath();

        ctx.fill();
    }


    // =========================================================
    // ÂNGULOS
    // =========================================================

    drawAngles(ctx) {

        const x0 =
            this.normalX;

        const y0 =
            this.interfaceY;

        const theta1 =
            this.params.theta1 *
            Math.PI /
            180;

        // =====================================================
        // ARCO θ₁
        // =====================================================

        ctx.strokeStyle =
            "#1976d2";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.arc(

            x0,
            y0,

            55,

            -Math.PI / 2 -
            theta1,

            -Math.PI / 2

        );

        ctx.stroke();

        // =====================================================
        // TEXTO θ₁
        // =====================================================

        ctx.fillStyle =
            "#1976d2";

        ctx.font =
            "15px Arial";

        ctx.fillText(

            `θ₁ = ${this.params.theta1.toFixed(1)}°`,

            x0 - 95,
            y0 - 55

        );

        // =====================================================
        // θ₂
        // =====================================================

        if (
            !this.reflexaoTotal
        ) {

            const theta2 =
                this.theta2 *
                Math.PI /
                180;

            ctx.strokeStyle =
                "#d32f2f";

            ctx.beginPath();

            ctx.arc(

                x0,
                y0,

                55,

                Math.PI / 2,

                Math.PI / 2 +
                theta2

            );

            ctx.stroke();

            // =================================================
            // TEXTO θ₂
            // =================================================

            ctx.fillStyle =
                "#d32f2f";

            ctx.fillText(

                `θ₂ = ${this.theta2.toFixed(1)}°`,

                x0 + 65,
                y0 + 55

            );
        }
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;

        const x =
            15;

        const y =
            this.canvas.height -
            155;

        const width =
            300;

        const height =
            135;

        // =====================================================
        // CAIXA
        // =====================================================

        ctx.save();

        ctx.fillStyle =
            "rgba(255,255,255,0.92)";

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;

        ctx.beginPath();

        ctx.roundRect(

            x,
            y,
            width,
            height,
            7

        );

        ctx.fill();

        ctx.stroke();

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(

            "Lei de Snell",

            x + 10,
            y + 20

        );

        // =====================================================
        // VALORES
        // =====================================================

        ctx.font =
            "12px Arial";

        ctx.fillText(

            `n₁ = ${p.n1.toFixed(2)}`,

            x + 10,
            y + 42

        );

        ctx.fillText(

            `n₂ = ${p.n2.toFixed(2)}`,

            x + 10,
            y + 60

        );

        ctx.fillText(

            `θ₁ = ${p.theta1.toFixed(2)}°`,

            x + 10,
            y + 78

        );

        // =====================================================
        // RESULTADO
        // =====================================================

        if (
            this.reflexaoTotal
        ) {

            ctx.font =
                "bold 12px Arial";

            ctx.fillText(

                "Reflexão total interna!",

                x + 10,
                y + 100

            );

            const critical =
                this.getAnguloCritico();

            if (
                critical !== null
            ) {

                ctx.font =
                    "12px Arial";

                ctx.fillText(

                    `θc = ${critical.toFixed(2)}°`,

                    x + 10,
                    y + 120

                );
            }

        } else {

            ctx.fillText(

                `θ₂ = ${this.theta2.toFixed(2)}°`,

                x + 10,
                y + 100

            );

            ctx.fillText(

                `sen(θ₂) = ${this.sinTheta2.toFixed(4)}`,

                x + 10,
                y + 120

            );
        }

        ctx.restore();
    }


    // =========================================================
    // DRAW
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

        const w =
            this.canvas.width;

        const h =
            this.canvas.height;

        // =====================================================
        // LIMPA
        // =====================================================

        ctx.clearRect(
            0,
            0,
            w,
            h
        );

        // =====================================================
        // FUNDO
        // =====================================================

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // =====================================================
        // INTERFACE
        // =====================================================

        this.drawInterface(
            ctx
        );

        // =====================================================
        // RAIO INCIDENTE
        // =====================================================

        this.drawIncidentRay(
            ctx
        );

        // =====================================================
        // RAIO REFRATADO
        // =====================================================

        this.drawRefractedRay(
            ctx
        );

        // =====================================================
        // REFLEXÃO TOTAL
        // =====================================================

        this.drawTotalReflection(
            ctx
        );

        // =====================================================
        // ÂNGULOS
        // =====================================================

        this.drawAngles(
            ctx
        );

        // =====================================================
        // HUD
        // =====================================================

        this.drawHUD(
            ctx
        );
    }


    // =========================================================
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros(
        newParams
    ) {

        this.params = {

            ...this.params,
            ...newParams

        };

        // =====================================================
        // ATUALIZA SLIDERS
        // =====================================================

        Object.keys(
            newParams
        ).forEach(
            key => {

                if (
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];

                }

            }
        );

        // =====================================================
        // RECALCULA
        // =====================================================

        this.solve();

        this.draw();
    }
}
