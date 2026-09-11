class InclinedPlaneFriction {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            g: 9.81,
            theta: 20,
            muS: 0.30,
            muK: 0.20,
            ...options
        };

        // =====================================================
        // BLOCO
        // =====================================================

        this.block = {
            name: "Bloco",
            color: "#7b1fa2",
            type: "block"
        };

        // =====================================================
        // PLANO
        // =====================================================

        this.planeLength = 10;

        this.planeBottomX = 580;
        this.planeBottomY = 470;

        this.planePixelLength = 400;

        // =====================================================
        // SIMULAÇÃO
        // =====================================================

        this.dt = 0.02;

        this.tMax = 5;

        this.data = {
            t: [],
            x: [],
            v: []
        };

        this.running = false;
        this.frame = 0;
        this.animationSpeed = 1;

        // =====================================================
        // GRÁFICO
        // =====================================================

        this.graphX = 650;
        this.graphY = 80;
        this.graphW = 480;
        this.graphH = 360;

        // =====================================================
        // INTERFACE
        // =====================================================

        this.createControls();

        this.solve();

        this.iniciar();
    }


    // =========================================================
    // CONDIÇÃO DE DESLIZAMENTO
    // =========================================================

    isSliding() {

        const theta =
            this.params.theta *
            Math.PI / 180;

        return (
            Math.sin(theta) >
            this.params.muS *
            Math.cos(theta)
        );
    }


    // =========================================================
    // ACELERAÇÃO
    // =========================================================

    acceleration() {

        const theta =
            this.params.theta *
            Math.PI / 180;

        return (
            this.params.g *
            (
                Math.sin(theta) -
                this.params.muK *
                Math.cos(theta)
            )
        );
    }


    // =========================================================
    // TEMPO DE CHEGADA AO FINAL DO PLANO
    // =========================================================

    calculateArrivalTime() {

        if (!this.isSliding()) {
            return Infinity;
        }

        const a =
            this.acceleration();

        if (a <= 0) {
            return Infinity;
        }

        return Math.sqrt(
            2 *
            this.planeLength /
            a
        );
    }


    // =========================================================
    // TEMPO MÁXIMO DA SIMULAÇÃO
    // =========================================================

    calculateSimulationTime() {

        const arrivalTime =
            this.calculateArrivalTime();

        if (Number.isFinite(arrivalTime)) {

            this.tMax =
                Math.max(
                    arrivalTime + 0.5,
                    this.dt
                );

        }
        else {

            this.tMax = 5;
        }
    }


    // =========================================================
    // SOLUÇÃO
    // =========================================================

    solve() {

        this.calculateSimulationTime();

        const sliding =
            this.isSliding();

        // =====================================================
        // BLOCO PARADO
        // =====================================================

        if (!sliding) {

            this.data.t = [0];
            this.data.x = [0];
            this.data.v = [0];

            this.totalFrames = 1;
            this.frame = 0;

            this.calculateScale();

            return;
        }

        // =====================================================
        // BLOCO DESLIZANDO
        // =====================================================

        const steps =
            Math.ceil(
                this.tMax /
                this.dt
            ) + 1;

        this.totalFrames =
            steps;

        this.data.t = [];
        this.data.x = [];
        this.data.v = [];

        const a =
            this.acceleration();

        const arrivalTime =
            this.calculateArrivalTime();

        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const t =
                Math.min(
                    i * this.dt,
                    this.tMax
                );

            let x;
            let v;

            // =================================================
            // MOVIMENTO
            // =================================================

            if (t < arrivalTime) {

                /*
                 * Movimento uniformemente acelerado.
                 *
                 * O bloco parte do repouso:
                 *
                 * x = 1/2 a t²
                 * v = a t
                 */

                x =
                    0.5 *
                    a *
                    t *
                    t;

                v =
                    a *
                    t;
            }

            // =================================================
            // CHEGOU AO FINAL
            // =================================================

            else {

                x =
                    this.planeLength;

                v =
                    Math.sqrt(
                        2 *
                        a *
                        this.planeLength
                    );
            }

            // =================================================
            // LIMITA AO FINAL DO PLANO
            // =================================================

            x =
                Math.max(
                    0,
                    Math.min(
                        x,
                        this.planeLength
                    )
                );

            this.data.t.push(t);
            this.data.x.push(x);
            this.data.v.push(v);
        }

        this.calculateScale();

        this.frame = 0;
    }


    // =========================================================
    // ESCALA DO GRÁFICO
    // =========================================================

    calculateScale() {

        this.xMax =
            Math.max(
                this.planeLength,
                1
            );
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const container =
            document.getElementById(
                "inclinedPlaneFrictionControls"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        this.sliders = {};

        const configs = [

            {
                name: "theta",
                label: "θ (°)",
                min: 5,
                max: 60,
                step: 1,
                decimals: 0
            },

            {
                name: "muS",
                label: "Atrito estático μₛ",
                min: 0,
                max: 1,
                step: 0.01,
                decimals: 2
            },

            {
                name: "muK",
                label: "Atrito cinético μₖ",
                min: 0,
                max: 1,
                step: 0.01,
                decimals: 2
            }
        ];

        configs.forEach(config => {

            const group =
                document.createElement(
                    "div"
                );

            group.className =
                "control-group";

            // =================================================
            // TÍTULO
            // =================================================

            const title =
                document.createElement(
                    "div"
                );

            title.className =
                "control-title";

            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                config.label;

            const value =
                document.createElement(
                    "span"
                );

            value.className =
                "control-value";

            value.textContent =
                Number(
                    this.params[config.name]
                ).toFixed(
                    config.decimals
                );

            title.appendChild(label);
            title.appendChild(value);

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
                this.params[config.name];

            slider.addEventListener(
                "input",
                () => {

                    this.params[
                        config.name
                    ] =
                        Number(
                            slider.value
                        );

                    value.textContent =
                        this.params[
                            config.name
                        ].toFixed(
                            config.decimals
                        );

                    this.solve();

                    this.draw();
                }
            );

            group.appendChild(title);
            group.appendChild(slider);

            container.appendChild(group);

            this.sliders[
                config.name
            ] = slider;
        });
    }


    // =========================================================
    // GEOMETRIA DO PLANO
    // =========================================================

    getPlaneGeometry() {

        const theta =
            this.params.theta *
            Math.PI / 180;

        const x2 =
            this.planeBottomX;

        const y2 =
            this.planeBottomY;

        const x1 =
            x2 -
            this.planePixelLength *
            Math.cos(theta);

        const y1 =
            y2 -
            this.planePixelLength *
            Math.sin(theta);

        return {
            x1,
            y1,
            x2,
            y2,
            theta
        };
    }


    // =========================================================
    // POSIÇÃO SOBRE O PLANO
    // =========================================================

    positionOnPlane(distance) {

        const plane =
            this.getPlaneGeometry();

        const fraction =
            Math.max(
                0,
                Math.min(
                    distance /
                    this.planeLength,
                    1
                )
            );

        return {

            x:
                plane.x1 +
                fraction *
                (
                    plane.x2 -
                    plane.x1
                ),

            y:
                plane.y1 +
                fraction *
                (
                    plane.y2 -
                    plane.y1
                )
        };
    }


    // =========================================================
    // VETORES DO PLANO
    // =========================================================

    getPlaneVectors() {

        const theta =
            this.getPlaneGeometry().theta;

        /*
         * Tangente apontando para baixo
         * ao longo do plano.
         */

        const tangent = {

            x:
                Math.cos(theta),

            y:
                Math.sin(theta)
        };

        /*
         * Normal apontando para fora
         * do plano.
         */

        const normal = {

            x:
                Math.sin(theta),

            y:
                -Math.cos(theta)
        };

        return {
            tangent,
            normal
        };
    }


    // =========================================================
    // DESENHO DO PLANO
    // =========================================================

    drawPlane(ctx) {

        const plane =
            this.getPlaneGeometry();

        ctx.save();

        // =====================================================
        // PREENCHIMENTO
        // =====================================================

        ctx.fillStyle =
            "rgba(220, 220, 220, 0.30)";

        ctx.beginPath();

        ctx.moveTo(
            plane.x1,
            plane.y1
        );

        ctx.lineTo(
            plane.x1,
            plane.y2
        );

        ctx.lineTo(
            plane.x2,
            plane.y2
        );

        ctx.closePath();

        ctx.fill();

        // =====================================================
        // CATETO VERTICAL
        // =====================================================

        ctx.strokeStyle =
            "#555";

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            plane.x1,
            plane.y1
        );

        ctx.lineTo(
            plane.x1,
            plane.y2
        );

        ctx.stroke();

        // =====================================================
        // CATETO HORIZONTAL
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            plane.x1,
            plane.y2
        );

        ctx.lineTo(
            plane.x2,
            plane.y2
        );

        ctx.stroke();

        // =====================================================
        // HIPOTENUSA
        // =====================================================

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth =
            5;

        ctx.beginPath();

        ctx.moveTo(
            plane.x1,
            plane.y1
        );

        ctx.lineTo(
            plane.x2,
            plane.y2
        );

        ctx.stroke();

        /*
         * A indicação gráfica do ângulo foi removida.
         * O theta continua sendo usado normalmente
         * nos cálculos e na geometria do plano.
         */

        ctx.restore();
    }


    // =========================================================
    // BLOCO
    // =========================================================

    drawBlock(
        ctx,
        x,
        y,
        theta,
        color
    ) {

        const width =
            32;

        const height =
            32;

        ctx.save();

        ctx.translate(
            x,
            y
        );

        /*
         * O bloco acompanha a inclinação
         * da hipotenusa.
         */

        ctx.rotate(theta);

        // =====================================================
        // PREENCHIMENTO
        // =====================================================

        ctx.fillStyle =
            color;

        ctx.globalAlpha =
            0.18;

        ctx.fillRect(
            -width / 2,
            -height / 2,
            width,
            height
        );

        // =====================================================
        // BORDA
        // =====================================================

        ctx.globalAlpha =
            1;

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            3;

        ctx.strokeRect(
            -width / 2,
            -height / 2,
            width,
            height
        );

        ctx.restore();
    }


    // =========================================================
    // RASTRO
    // =========================================================

    drawTrail(
        ctx,
        frame
    ) {

        if (frame < 1) {
            return;
        }

        const theta =
            this.getPlaneGeometry().theta;

        const maxIndex =
            Math.min(
                Math.floor(frame),
                this.data.x.length - 1
            );

        ctx.save();

        ctx.strokeStyle =
            this.block.color;

        ctx.globalAlpha =
            0.25;

        ctx.lineWidth =
            2;

        ctx.setLineDash([
            4,
            4
        ]);

        ctx.beginPath();

        for (
            let i = 0;
            i <= maxIndex;
            i++
        ) {

            const physicalX =
                Math.max(
                    0,
                    Math.min(
                        this.data.x[i],
                        this.planeLength
                    )
                );

            const pos =
                this.positionOnPlane(
                    physicalX
                );

            const px =
                pos.x +
                18 *
                Math.sin(theta);

            const py =
                pos.y -
                18 *
                Math.cos(theta);

            if (i === 0) {

                ctx.moveTo(
                    px,
                    py
                );

            }
            else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }

        ctx.stroke();

        ctx.setLineDash([]);

        ctx.restore();
    }


    // =========================================================
    // BLOCO
    // =========================================================

    drawBlockState(ctx) {

        const data =
            this.data;

        const index =
            Math.min(
                Math.floor(this.frame),
                data.x.length - 1
            );

        if (index < 0) {
            return;
        }

        const physicalX =
            Math.max(
                0,
                Math.min(
                    data.x[index],
                    this.planeLength
                )
            );

        const pos =
            this.positionOnPlane(
                physicalX
            );

        const theta =
            this.getPlaneGeometry().theta;

        // =====================================================
        // RAIO VISUAL
        // =====================================================

        const radius =
            18;

        // =====================================================
        // POSIÇÃO ACIMA DO PLANO
        // =====================================================

        const x =
            pos.x +
            radius *
            Math.sin(theta);

        const y =
            pos.y -
            radius *
            Math.cos(theta);

        // =====================================================
        // RASTRO
        // =====================================================

        this.drawTrail(
            ctx,
            this.frame
        );

        // =====================================================
        // BLOCO
        // =====================================================

        this.drawBlock(
            ctx,
            x,
            y,
            theta,
            this.block.color
        );

        // =====================================================
        // VELOCIDADE
        // =====================================================

        this.drawVelocity(
            ctx,
            x,
            y,
            data.v[index]
        );
    }


    // =========================================================
    // VELOCIDADE
    // =========================================================

    drawVelocity(
        ctx,
        x,
        y,
        velocity
    ) {

        if (
            Math.abs(velocity) <
            0.001
        ) {
            return;
        }

        const theta =
            this.getPlaneGeometry().theta;

        const scale =
            12;

        const dx =
            scale *
            velocity *
            Math.cos(theta);

        const dy =
            scale *
            velocity *
            Math.sin(theta);

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (length < 5) {
            return;
        }

        const headLength =
            10;

        const ux =
            dx / length;

        const uy =
            dy / length;

        const px =
            -uy;

        const py =
            ux;

        ctx.save();

        ctx.strokeStyle =
            "#1565c0";

        ctx.fillStyle =
            "#1565c0";

        ctx.lineWidth =
            2;

        // =====================================================
        // LINHA
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x,
            y
        );

        ctx.lineTo(
            x + dx,
            y + dy
        );

        ctx.stroke();

        // =====================================================
        // PONTA
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x + dx,
            y + dy
        );

        ctx.lineTo(
            x +
            dx -
            headLength * ux +
            0.45 *
            headLength *
            px,

            y +
            dy -
            headLength * uy +
            0.45 *
            headLength *
            py
        );

        ctx.lineTo(
            x +
            dx -
            headLength * ux -
            0.45 *
            headLength *
            px,

            y +
            dy -
            headLength * uy -
            0.45 *
            headLength *
            py
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const x =
            this.graphX;

        const y =
            this.graphY;

        const w =
            this.graphW;

        const h =
            this.graphH;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Posição × Tempo",
            x + w / 2,
            y - 25
        );

        const xTicks =
            5;

        const yTicks =
            5;

        ctx.font =
            "11px Arial";

        // =====================================================
        // EIXO X
        // =====================================================

        for (
            let i = 0;
            i <= xTicks;
            i++
        ) {

            const value =
                this.tMax *
                i /
                xTicks;

            const px =
                x +
                (
                    value /
                    this.tMax
                ) *
                w;

            ctx.strokeStyle =
                "#eeeeee";

            ctx.lineWidth =
                1;

            ctx.beginPath();

            ctx.moveTo(
                px,
                y
            );

            ctx.lineTo(
                px,
                y + h
            );

            ctx.stroke();

            ctx.fillStyle =
                "black";

            ctx.textAlign =
                "center";

            ctx.fillText(
                value.toFixed(2),
                px,
                y + h + 20
            );
        }

        // =====================================================
        // EIXO Y
        // =====================================================

        for (
            let i = 0;
            i <= yTicks;
            i++
        ) {

            const value =
                this.xMax *
                i /
                yTicks;

            const py =
                y +
                h -
                (
                    value /
                    this.xMax
                ) *
                h;

            ctx.strokeStyle =
                "#eeeeee";

            ctx.beginPath();

            ctx.moveTo(
                x,
                py
            );

            ctx.lineTo(
                x + w,
                py
            );

            ctx.stroke();

            ctx.fillStyle =
                "black";

            ctx.textAlign =
                "right";

            ctx.fillText(
                value.toFixed(1),
                x - 10,
                py + 4
            );
        }

        // =====================================================
        // CURVA
        // =====================================================

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.data.t.length
            );

        if (n > 0) {

            ctx.save();

            ctx.beginPath();

            ctx.rect(
                x + 1,
                y + 1,
                w - 2,
                h - 2
            );

            ctx.clip();

            ctx.strokeStyle =
                this.block.color;

            ctx.lineWidth =
                2;

            ctx.beginPath();

            for (
                let i = 0;
                i < n;
                i++
            ) {

                const px =
                    x +
                    (
                        this.data.t[i] /
                        this.tMax
                    ) *
                    w;

                const py =
                    y +
                    h -
                    (
                        this.data.x[i] /
                        this.xMax
                    ) *
                    h;

                if (i === 0) {

                    ctx.moveTo(
                        px,
                        py
                    );

                }
                else {

                    ctx.lineTo(
                        px,
                        py
                    );
                }
            }

            ctx.stroke();

            // =================================================
            // PONTO ATUAL
            // =================================================

            const current =
                n - 1;

            const px =
                x +
                (
                    this.data.t[current] /
                    this.tMax
                ) *
                w;

            const py =
                y +
                h -
                (
                    this.data.x[current] /
                    this.xMax
                ) *
                h;

            ctx.fillStyle =
                this.block.color;

            ctx.beginPath();

            ctx.arc(
                px,
                py,
                4,
                0,
                2 * Math.PI
            );

            ctx.fill();

            ctx.restore();
        }

        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;

        ctx.strokeRect(
            x,
            y,
            w,
            h
        );

        // =====================================================
        // EIXO X
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Tempo [s]",
            x + w / 2,
            y + h + 45
        );

        // =====================================================
        // EIXO Y
        // =====================================================

        ctx.save();

        ctx.translate(
            x - 48,
            y + h / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "Posição [m]",
            0,
            0
        );

        ctx.restore();

        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.fillStyle =
            this.block.color;

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "Bloco",
            x + w - 55,
            y + 20
        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        // =====================================================
        // VERIFICA SE ESTÁ DESLIZANDO
        // =====================================================

        const sliding =
            this.isSliding() &&
            this.acceleration() > 0;

        // =====================================================
        // DADOS
        // =====================================================

        let t = 0;
        let s = 0;
        let v = 0;
        let a = 0;

        if (sliding) {

            const index =
                Math.min(
                    Math.floor(this.frame),
                    this.data.x.length - 1
                );

            t =
                this.data.t[index] || 0;

            s =
                this.data.x[index] || 0;

            v =
                this.data.v[index] || 0;

            a =
                this.acceleration();
        }

        // =====================================================
        // ÂNGULO CRÍTICO
        // =====================================================

        const thetaCrit =
            Math.atan(
                this.params.muS
            ) *
            180 /
            Math.PI;

        const x = 20;
        const y = 55;

        const width = 300;
        const height = 225;

        ctx.save();

        // =====================================================
        // CAIXA
        // =====================================================

        ctx.fillStyle =
            "rgba(255,255,255,0.96)";

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
            8
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
            "Parâmetros da simulação",
            x + 12,
            y + 20
        );

        // =====================================================
        // PARÂMETROS
        // =====================================================

        ctx.font =
            "12px Arial";

        ctx.fillText(
            `θ = ${this.params.theta.toFixed(0)}°`,
            x + 12,
            y + 42
        );

        ctx.fillText(
            `μₛ = ${this.params.muS.toFixed(2)}`,
            x + 12,
            y + 60
        );

        ctx.fillText(
            `μₖ = ${this.params.muK.toFixed(2)}`,
            x + 12,
            y + 78
        );

        ctx.fillText(
            `g = ${this.params.g.toFixed(2)} m/s²`,
            x + 12,
            y + 96
        );

        ctx.fillText(
            `L = ${this.planeLength.toFixed(1)} m`,
            x + 12,
            y + 114
        );

        ctx.fillText(
            `θ crítico ≈ ${thetaCrit.toFixed(1)}°`,
            x + 12,
            y + 132
        );

        // =====================================================
        // ESTADO
        // =====================================================

        ctx.fillStyle =
            sliding ?
            this.block.color :
            "#388e3c";

        ctx.font =
            "bold 12px Arial";

        ctx.fillText(
            sliding ?
            "Estado: Deslizando" :
            "Estado: Em repouso",

            x + 12,
            y + 154
        );

        // =====================================================
        // DADOS DO MOVIMENTO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            x + 12,
            y + 174
        );

        ctx.fillText(
            `s = ${s.toFixed(2)} m`,
            x + 12,
            y + 192
        );

        ctx.fillText(
            `v = ${v.toFixed(2)} m/s`,
            x + 12,
            y + 210
        );

        ctx.fillText(
            `a = ${a.toFixed(2)} m/s²`,
            x + 12,
            y + 228
        );

        ctx.restore();
    }


    // =========================================================
    // DESENHO PRINCIPAL
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

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            w,
            h
        );

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Plano inclinado com atrito",
            330,
            30
        );

        // =====================================================
        // ELEMENTOS
        // =====================================================

        this.drawPlane(ctx);

        this.drawBlockState(ctx);

        this.drawGraph(ctx);

        this.drawHUD(ctx);
    }


    // =========================================================
    // INICIAR ANIMAÇÃO
    // =========================================================

    iniciar() {

        if (this.running) {
            return;
        }

        this.running = true;

        const loop = () => {

            if (!this.running) {
                return;
            }

            this.draw();

            // =================================================
            // SÓ AVANÇA SE ESTIVER DESLIZANDO
            // =================================================

            if (
                this.isSliding() &&
                this.acceleration() > 0
            ) {

                this.frame +=
                    this.animationSpeed;

                // =================================================
                // RECOMEÇA AO CHEGAR AO FINAL
                // =================================================

                if (
                    this.frame >=
                    this.totalFrames
                ) {

                    this.frame = 0;
                }
            }

            requestAnimationFrame(
                loop
            );
        };

        loop();
    }


    // =========================================================
    // PARAR
    // =========================================================

    parar() {

        this.running = false;
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

        Object.keys(newParams)
            .forEach(key => {

                if (
                    this.sliders &&
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];
                }

            });

        this.solve();

        this.draw();
    }
}


// =============================================================
// INICIALIZAÇÃO
// =============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const canvas =
            document.getElementById(
                "inclinedPlaneFrictionCanvas"
            );

        if (!canvas) {

            console.error(
                "Canvas inclinedPlaneFrictionCanvas não encontrado."
            );

            return;
        }

        window.inclinedPlaneFriction =
            new InclinedPlaneFriction(
                canvas
            );
    }
);
