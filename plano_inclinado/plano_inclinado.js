class InclinedPlaneFriction {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {
            g: 9.81,
            theta: 20,
            muS: 0.30,
            muK: 0.20,
            ...options
        };

        // Comprimento físico do plano
        this.planeLength = 10;

        // =====================================================
        // GEOMETRIA DO PLANO
        // Mesma lógica do plano inclinado com sólidos
        // =====================================================

        this.planeBottomX = 580;
        this.planeBottomY = 470;

        this.planePixelLength = 400;

        // =====================================================
        // BLOCO
        // =====================================================

        this.blockSize = 34;
        this.blockHalf = this.blockSize / 2;

        // =====================================================
        // SIMULAÇÃO
        // =====================================================

        this.dt = 0.02;

        this.tMax = 5;

        this.data = {
            t: [],
            s: [],
            v: [],
            a: []
        };

        this.totalFrames = 1;

        this.frame = 0;

        this.animationSpeed = 1;

        this.running = false;

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

        // Começa automaticamente
        this.iniciar();
    }


    // =========================================================
    // FÍSICA
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
    // TEMPO DE CHEGADA
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
    // SOLUÇÃO NUMÉRICA
    // =========================================================

    solve() {

        const sliding =
            this.isSliding();

        const a =
            sliding ?
            this.acceleration() :
            0;

        const arrivalTime =
            this.calculateArrivalTime();

        // =====================================================
        // TEMPO DA SIMULAÇÃO
        // =====================================================

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

        const steps =
            Math.ceil(
                this.tMax /
                this.dt
            ) + 1;

        this.totalFrames = steps;

        // =====================================================
        // LIMPA OS DADOS
        // =====================================================

        this.data.t = [];
        this.data.s = [];
        this.data.v = [];
        this.data.a = [];

        let s = 0;
        let v = 0;

        // =====================================================
        // INTEGRAÇÃO
        // =====================================================

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

            // =================================================
            // BLOCO EM REPOUSO
            // =================================================

            if (!sliding) {

                s = 0;
                v = 0;
            }

            // =================================================
            // BLOCO DESLIZANDO
            // =================================================

            else if (
                s < this.planeLength
            ) {

                /*
                 * Mesmo esquema do código Python:
                 *
                 * v = v + a dt
                 * s = s + v dt
                 */

                v =
                    v +
                    a * this.dt;

                s =
                    s +
                    v * this.dt;

                // Chegou ao final
                if (
                    s >=
                    this.planeLength
                ) {

                    s =
                        this.planeLength;

                    v =
                        Math.sqrt(
                            2 *
                            a *
                            this.planeLength
                        );
                }
            }

            // =================================================
            // JÁ CHEGOU AO FINAL
            // =================================================

            else {

                s =
                    this.planeLength;
            }

            this.data.t.push(t);

            this.data.s.push(s);

            this.data.v.push(v);

            this.data.a.push(
                sliding ?
                a :
                0
            );
        }

        // Reinicia a animação
        this.frame = 0;
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
                label: "Ângulo θ (°)",
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
            // TÍTULO DO CONTROLE
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
                    this.params[
                        config.name
                    ]
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

            slider.type = "range";

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


            // =================================================
            // ALTERAÇÃO DO SLIDER
            // =================================================

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


                    // Para a animação atual
                    this.parar();

                    // Recalcula a física
                    this.solve();

                    // Reinicia
                    this.iniciar();
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


        /*
         * Ponto superior da hipotenusa.
         *
         * A distância entre os dois pontos
         * é planePixelLength.
         */

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
    // POSIÇÃO AO LONGO DO PLANO
    // =========================================================

    positionOnPlane(s) {

        const plane =
            this.getPlaneGeometry();


        const fraction =
            Math.max(
                0,
                Math.min(
                    s /
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
            this.params.theta *
            Math.PI / 180;


        /*
         * Tangente apontando para baixo
         * ao longo da hipotenusa.
         */

        const tangent = {

            x:
                Math.cos(theta),

            y:
                Math.sin(theta)
        };


        /*
         * Normal apontando para FORA
         * do plano.
         *
         * Em coordenadas de canvas:
         *
         * x positivo
         * y negativo
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
        // TRIÂNGULO
        // =====================================================

        ctx.fillStyle =
            "rgba(220,220,220,0.30)";


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

        ctx.lineWidth = 3;


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

        ctx.lineWidth = 5;


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


        // Ângulo
        this.drawAngleMarker(
            ctx,
            plane
        );


        ctx.restore();
    }


    // =========================================================
    // ÂNGULO
    // =========================================================

    drawAngleMarker(ctx, plane) {

        const theta =
            plane.theta;


        /*
         * O ângulo está no vértice inferior
         * direito, entre a horizontal e a
         * hipotenusa.
         */

        const x =
            plane.x2;

        const y =
            plane.y2;


        const radius = 42;


        ctx.save();


        ctx.strokeStyle =
            "#555";

        ctx.lineWidth = 2;


        /*
         * Como o eixo y do canvas cresce
         * para baixo, o arco é construído
         * diretamente no quadrante correspondente.
         */

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            Math.PI,
            Math.PI + theta,
            false
        );

        ctx.stroke();


        // =====================================================
        // TEXTO DO ÂNGULO
        // =====================================================

        const textAngle =
            Math.PI +
            theta / 2;


        const tx =
            x +
            (radius + 15) *
            Math.cos(textAngle);


        const ty =
            y +
            (radius + 15) *
            Math.sin(textAngle);


        ctx.fillStyle =
            "#555";

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            `θ = ${this.params.theta.toFixed(0)}°`,
            tx,
            ty
        );


        ctx.restore();
    }


    // =========================================================
    // DESENHO DO BLOCO
    // =========================================================

    drawBlock(
        ctx,
        x,
        y,
        theta,
        color
    ) {

        ctx.save();


        ctx.translate(
            x,
            y
        );


        /*
         * A hipotenusa desce para a direita.
         * Portanto o bloco gira +theta.
         */

        ctx.rotate(theta);


        // =====================================================
        // PREENCHIMENTO
        // =====================================================

        ctx.fillStyle =
            color;

        ctx.globalAlpha =
            0.16;


        ctx.fillRect(
            -this.blockSize / 2,
            -this.blockSize / 2,
            this.blockSize,
            this.blockSize
        );


        // =====================================================
        // BORDA
        // =====================================================

        ctx.globalAlpha = 1;

        ctx.strokeStyle =
            color;

        ctx.lineWidth = 3;


        ctx.strokeRect(
            -this.blockSize / 2,
            -this.blockSize / 2,
            this.blockSize,
            this.blockSize
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


        const vectors =
            this.getPlaneVectors();


        const maxIndex =
            Math.min(
                Math.floor(frame),
                this.data.s.length - 1
            );


        ctx.save();


        ctx.strokeStyle =
            "#7b1fa2";

        ctx.globalAlpha =
            0.25;

        ctx.lineWidth = 2;


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

            const pos =
                this.positionOnPlane(
                    this.data.s[i]
                );


            /*
             * O rastro acompanha o centro
             * do bloco.
             */

            const x =
                pos.x +
                this.blockHalf *
                vectors.normal.x;


            const y =
                pos.y +
                this.blockHalf *
                vectors.normal.y;


            if (i === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            }
            else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }


        ctx.stroke();


        ctx.setLineDash([]);


        ctx.restore();
    }


    // =========================================================
    // VELOCIDADE
    // =========================================================

    drawVelocity(
        ctx,
        x,
        y,
        v
    ) {

        if (
            Math.abs(v) <
            0.001
        ) {
            return;
        }


        const vectors =
            this.getPlaneVectors();


        /*
         * Escala visual da velocidade.
         */

        const scale = 12;


        const dx =
            vectors.tangent.x *
            v *
            scale;


        const dy =
            vectors.tangent.y *
            v *
            scale;


        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (length < 5) {
            return;
        }


        const head = 10;


        ctx.save();


        ctx.strokeStyle =
            "#1565c0";

        ctx.fillStyle =
            "#1565c0";

        ctx.lineWidth = 2;


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
        // PONTA DA SETA
        // =====================================================

        const ux =
            dx / length;

        const uy =
            dy / length;


        const px =
            -uy;

        const py =
            ux;


        ctx.beginPath();


        ctx.moveTo(
            x + dx,
            y + dy
        );


        ctx.lineTo(
            x +
            dx -
            head * ux +
            head * 0.45 * px,

            y +
            dy -
            head * uy +
            head * 0.45 * py
        );


        ctx.lineTo(
            x +
            dx -
            head * ux -
            head * 0.45 * px,

            y +
            dy -
            head * uy -
            head * 0.45 * py
        );


        ctx.closePath();

        ctx.fill();


        ctx.restore();
    }


    // =========================================================
    // ESTADO DO BLOCO
    // =========================================================

    drawBlockState(ctx) {

        const index =
            Math.min(
                Math.floor(this.frame),
                this.data.s.length - 1
            );


        if (index < 0) {
            return;
        }


        const s =
            this.data.s[index];


        const v =
            this.data.v[index];


        const plane =
            this.getPlaneGeometry();


        const pos =
            this.positionOnPlane(s);


        const vectors =
            this.getPlaneVectors();


        // =====================================================
        // PONTO DE CONTATO
        // =====================================================

        const contactX =
            pos.x;

        const contactY =
            pos.y;


        // =====================================================
        // CENTRO DO BLOCO
        // =====================================================
        //
        // O bloco é deslocado pela normal
        // para ficar acima da hipotenusa.
        //

        const centerX =
            contactX +
            this.blockHalf *
            vectors.normal.x;


        const centerY =
            contactY +
            this.blockHalf *
            vectors.normal.y;


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
            centerX,
            centerY,
            plane.theta,
            "#7b1fa2"
        );


        // =====================================================
        // VELOCIDADE
        // =====================================================

        this.drawVelocity(
            ctx,
            centerX,
            centerY,
            v
        );
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


        const xMax =
            Math.max(
                this.tMax,
                1
            );


        const yMax =
            this.planeLength;


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


        const xTicks = 5;
        const yTicks = 5;


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
                xMax *
                i /
                xTicks;


            const px =
                x +
                (
                    value /
                    xMax
                ) *
                w;


            ctx.strokeStyle =
                "#eeeeee";

            ctx.lineWidth = 1;


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
                value.toFixed(1),
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
                yMax *
                i /
                yTicks;


            const py =
                y +
                h -
                (
                    value /
                    yMax
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
                Math.floor(
                    this.frame
                ) + 1,

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
                "#7b1fa2";

            ctx.lineWidth = 2;


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
                        xMax
                    ) *
                    w;


                const py =
                    y +
                    h -
                    (
                        this.data.s[i] /
                        yMax
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
                    xMax
                ) *
                w;


            const py =
                y +
                h -
                (
                    this.data.s[current] /
                    yMax
                ) *
                h;


            ctx.fillStyle =
                "#7b1fa2";


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

        ctx.lineWidth = 1;


        ctx.strokeRect(
            x,
            y,
            w,
            h
        );


        // =====================================================
        // EIXO X — TEXTO
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
        // EIXO Y — TEXTO
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
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const index =
            Math.min(
                Math.floor(
                    this.frame
                ),
                this.data.s.length - 1
            );


        const t =
            index >= 0 ?
            this.data.t[index] :
            0;


        const s =
            index >= 0 ?
            this.data.s[index] :
            0;


        const v =
            index >= 0 ?
            this.data.v[index] :
            0;


        const a =
            index >= 0 ?
            this.data.a[index] :
            0;


        const sliding =
            this.isSliding() &&
            this.acceleration() > 0;


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

        ctx.lineWidth = 1;


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


        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            x + 12,
            y + 150
        );


        ctx.fillText(
            `s = ${s.toFixed(2)} m`,
            x + 12,
            y + 168
        );


        ctx.fillText(
            `v = ${v.toFixed(2)} m/s`,
            x + 12,
            y + 186
        );


        ctx.fillText(
            `a = ${a.toFixed(2)} m/s²`,
            x + 12,
            y + 204
        );


        // =====================================================
        // ESTADO
        // =====================================================

        ctx.font =
            "bold 12px Arial";


        ctx.fillStyle =
            sliding ?
            "#7b1fa2" :
            "#2e7d32";


        ctx.fillText(
            sliding ?
            "Estado: Deslizando" :
            "Estado: Em repouso",

            x + 12,
            y + 222
        );


        ctx.restore();
    }


    // =========================================================
    // DESENHO PRINCIPAL
    // =========================================================

    draw() {

        const ctx =
            this.ctx;


        // =====================================================
        // LIMPA
        // =====================================================

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle =
            "white";


        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
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


            this.frame +=
                this.animationSpeed;


            // =================================================
            // VOLTA PARA O INÍCIO
            // =================================================

            if (
                this.frame >=
                this.totalFrames
            ) {

                this.frame = 0;
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
    // RESET
    // =========================================================

    reset() {

        this.parar();

        this.solve();

        this.draw();

        this.iniciar();
    }


    // =========================================================
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros(
        newParams
    ) {

        this.parar();


        this.params = {

            ...this.params,
            ...newParams
        };


        if (this.sliders) {

            Object.keys(
                newParams
            ).forEach(key => {

                if (
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];

                    const event =
                        new Event("input");

                    this.sliders[key]
                        .dispatchEvent(event);
                }
            });
        }


        this.solve();

        this.iniciar();
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
