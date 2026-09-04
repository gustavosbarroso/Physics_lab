class InclinedPlaneSolids {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {
            g: 9.81,
            theta: 20,
            ...options
        };

        // =====================================================
        // SÓLIDOS
        // =====================================================

        this.solids = [
            {
                name: "Bloco",
                k: 0,
                color: "#7b1fa2",
                type: "block"
            },
            {
                name: "Esfera",
                k: 2 / 5,
                color: "#1976d2",
                type: "sphere"
            },
            {
                name: "Cilindro",
                k: 1 / 2,
                color: "#388e3c",
                type: "cylinder"
            },
            {
                name: "Anel",
                k: 1,
                color: "#d32f2f",
                type: "ring"
            }
        ];

        // =====================================================
        // INTEGRAÇÃO
        // =====================================================

        this.dt = 0.02;
        this.tMax = 10;

        // =====================================================
        // DADOS
        // =====================================================

        this.data = {};

        this.solids.forEach(solid => {

            this.data[solid.name] = {
                t: [],
                x: [],
                v: []
            };
        });

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;
        this.animationSpeed = 1;

        // =====================================================
        // GEOMETRIA DO PLANO
        // =====================================================

        this.planeX = 70;
        this.planeY = 450;
        this.planeLength = 520;

        // =====================================================
        // GRÁFICO
        // =====================================================

        this.graphX = 680;
        this.graphY = 80;
        this.graphW = 450;
        this.graphH = 370;

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // ACELERAÇÃO
    // =========================================================

    acceleration(k) {

        const theta =
            this.params.theta *
            Math.PI / 180;

        return (
            this.params.g *
            Math.sin(theta) /
            (1 + k)
        );
    }


    // =========================================================
    // SOLUÇÃO ANALÍTICA
    // =========================================================

    solve() {

        const steps =
            Math.floor(
                this.tMax / this.dt
            ) + 1;

        this.totalFrames = steps;

        this.solids.forEach(solid => {

            const data =
                this.data[solid.name];

            data.t = [];
            data.x = [];
            data.v = [];

            const a =
                this.acceleration(
                    solid.k
                );

            for (
                let i = 0;
                i < steps;
                i++
            ) {

                const t =
                    i * this.dt;

                const x =
                    0.5 * a * t * t;

                const v =
                    a * t;

                data.t.push(t);
                data.x.push(x);
                data.v.push(v);
            }
        });

        this.calculateScale();

        this.frame = 0;
    }


    // =========================================================
    // ESCALA DO GRÁFICO
    // =========================================================

    calculateScale() {

        let maxX = 0;

        this.solids.forEach(solid => {

            const data =
                this.data[solid.name];

            for (const x of data.x) {

                maxX =
                    Math.max(maxX, x);
            }
        });

        this.xMax =
            Math.max(
                maxX * 1.10,
                1
            );

        this.tGraphMax =
            this.tMax;
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "inclined-plane-controls"
            );

        if (old) {

            old.remove();
        }

        const container =
            document.createElement("div");

        container.id =
            "inclined-plane-controls";

        container.style.width =
            "900px";

        container.style.maxWidth =
            "90%";

        container.style.margin =
            "20px auto";

        container.style.fontFamily =
            "Arial";


        const title =
            document.createElement("h2");

        title.innerText =
            "Parâmetros do plano inclinado";

        container.appendChild(title);


        this.sliders = {};


        const configs = [

            {
                name: "theta",
                label: "θ (°)",
                min: 5,
                max: 60,
                step: 1
            },

            {
                name: "g",
                label: "g (m/s²)",
                min: 1,
                max: 20,
                step: 0.01
            }
        ];


        configs.forEach(config => {

            const row =
                document.createElement("div");

            row.style.display =
                "flex";

            row.style.alignItems =
                "center";

            row.style.marginBottom =
                "8px";


            const label =
                document.createElement("label");

            label.style.width =
                "110px";

            label.innerText =
                config.label;


            const slider =
                document.createElement("input");

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


            const value =
                document.createElement("span");

            value.style.width =
                "70px";

            value.style.marginLeft =
                "10px";

            value.innerText =
                Number(
                    this.params[
                        config.name
                    ]
                ).toFixed(
                    config.name === "theta"
                        ? 0
                        : 2
                );


            slider.addEventListener(
                "input",
                () => {

                    const v =
                        Number(
                            slider.value
                        );

                    this.params[
                        config.name
                    ] = v;

                    value.innerText =
                        v.toFixed(
                            config.name === "theta"
                                ? 0
                                : 2
                        );

                    this.solve();

                    this.draw();
                }
            );


            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(value);

            container.appendChild(row);


            this.sliders[
                config.name
            ] = slider;
        });


        this.canvas.parentNode.insertBefore(
            container,
            this.canvas.nextSibling
        );
    }


    // =========================================================
    // COORDENADAS DO PLANO
    // =========================================================

    getPlaneGeometry() {

        const theta =
            this.params.theta *
            Math.PI / 180;

        const x1 =
            this.planeX;

        const y1 =
            this.planeY;

        const x2 =
            x1 +
            this.planeLength *
            Math.cos(theta);

        const y2 =
            y1 -
            this.planeLength *
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
    // POSIÇÃO NO PLANO
    // =========================================================

    positionOnPlane(distance) {

        const plane =
            this.getPlaneGeometry();

        const fraction =
            Math.min(
                distance /
                this.planeLength,
                1
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
    // DESENHO DO PLANO
    // =========================================================

    drawPlane(ctx) {

        const plane =
            this.getPlaneGeometry();


        ctx.save();


        // -----------------------------------------------------
        // Superfície
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#222";

        ctx.lineWidth = 3;

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


        // -----------------------------------------------------
        // Base
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            plane.x1,
            plane.y1
        );

        ctx.lineTo(
            plane.x2,
            plane.y1
        );

        ctx.stroke();


        // -----------------------------------------------------
        // Altura
        // -----------------------------------------------------

        ctx.beginPath();

        ctx.moveTo(
            plane.x2,
            plane.y1
        );

        ctx.lineTo(
            plane.x2,
            plane.y2
        );

        ctx.stroke();


        // -----------------------------------------------------
        // Ângulo
        // -----------------------------------------------------

        const arcRadius = 55;

        ctx.strokeStyle =
            "#555";

        ctx.lineWidth = 1.5;

        ctx.beginPath();

        ctx.arc(
            plane.x1,
            plane.y1,
            arcRadius,
            -plane.theta,
            0
        );

        ctx.stroke();


        ctx.font =
            "14px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";

        ctx.fillText(
            `θ = ${this.params.theta.toFixed(0)}°`,
            plane.x1 + 65,
            plane.y1 - 12
        );


        // -----------------------------------------------------
        // Comprimento
        // -----------------------------------------------------

        const midX =
            (plane.x1 + plane.x2) / 2;

        const midY =
            (plane.y1 + plane.y2) / 2;


        ctx.fillText(
            "L = 10 m",
            midX,
            midY - 18
        );


        ctx.restore();
    }


    // =========================================================
    // DESENHO DO BLOCO
    // =========================================================

    drawBlock(ctx, x, y, angle, color) {

        const size = 26;

        ctx.save();

        ctx.translate(x, y);

        ctx.rotate(-angle);

        ctx.strokeStyle =
            color;

        ctx.lineWidth = 3;

        ctx.strokeRect(
            -size / 2,
            -size / 2,
            size,
            size
        );

        ctx.restore();
    }


    // =========================================================
    // DESENHO DOS CORPOS ROLANTES
    // =========================================================

    drawRollingBody(
        ctx,
        x,
        y,
        radius,
        angle,
        color,
        type
    ) {

        ctx.save();

        ctx.translate(x, y);


        // -----------------------------------------------------
        // Corpo
        // -----------------------------------------------------

        ctx.strokeStyle =
            color;

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // -----------------------------------------------------
        // Marcação de rotação
        // -----------------------------------------------------

        if (
            type === "sphere" ||
            type === "cylinder" ||
            type === "ring"
        ) {

            ctx.rotate(
                angle
            );


            if (type === "sphere") {

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    radius * 0.55,
                    0,
                    Math.PI * 2
                );

                ctx.stroke();


                ctx.beginPath();

                ctx.moveTo(
                    -radius * 0.75,
                    0
                );

                ctx.lineTo(
                    radius * 0.75,
                    0
                );

                ctx.stroke();


            } else if (
                type === "cylinder"
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    -radius * 0.75,
                    0
                );

                ctx.lineTo(
                    radius * 0.75,
                    0
                );

                ctx.stroke();


            } else if (
                type === "ring"
            ) {

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    radius * 0.45,
                    0,
                    2 * Math.PI
                );

                ctx.stroke();


                ctx.beginPath();

                ctx.moveTo(
                    0,
                    -radius * 0.8
                );

                ctx.lineTo(
                    0,
                    radius * 0.8
                );

                ctx.stroke();
            }
        }


        ctx.restore();
    }


    // =========================================================
    // DESENHO DO RASTRO
    // =========================================================

    drawTrail(
        ctx,
        solid,
        frame
    ) {

        const data =
            this.data[solid.name];

        const plane =
            this.getPlaneGeometry();

        const theta =
            plane.theta;

        const radius = 16;


        if (frame < 1) {

            return;
        }


        ctx.save();

        ctx.strokeStyle =
            solid.color;

        ctx.globalAlpha =
            0.25;

        ctx.lineWidth = 2;

        ctx.beginPath();


        for (
            let i = 0;
            i <= frame &&
            i < data.x.length;
            i++
        ) {

            const pos =
                this.positionOnPlane(
                    data.x[i] *
                    this.planeLength /
                    this.xMax
                );


            const px =
                pos.x;

            const py =
                pos.y -
                radius *
                Math.cos(theta);


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


        ctx.stroke();

        ctx.restore();
    }


    // =========================================================
    // DESENHO DOS SÓLIDOS
    // =========================================================

    drawSolids(ctx) {

        const theta =
            this.params.theta *
            Math.PI / 180;


        this.solids.forEach(solid => {

            const data =
                this.data[solid.name];

            const index =
                Math.min(
                    Math.floor(this.frame),
                    data.x.length - 1
                );


            const physicalX =
                data.x[index];


            // Converte a posição física
            // para a extensão visual do plano.

            const distance =
                (
                    physicalX /
                    this.xMax
                ) *
                this.planeLength;


            const pos =
                this.positionOnPlane(
                    distance
                );


            const radius = 16;


            // deslocamento perpendicular
            // ao plano para colocar o corpo
            // sobre a superfície.

            const offsetX =
                radius *
                Math.sin(theta);

            const offsetY =
                radius *
                Math.cos(theta);


            const x =
                pos.x +
                offsetX;

            const y =
                pos.y -
                offsetY;


            // -------------------------------------------------
            // Rastro
            // -------------------------------------------------

            this.drawTrail(
                ctx,
                solid,
                index
            );


            // -------------------------------------------------
            // Corpo
            // -------------------------------------------------

            if (
                solid.type === "block"
            ) {

                this.drawBlock(
                    ctx,
                    x,
                    y,
                    theta,
                    solid.color
                );

            } else {

                // ângulo de rotação:
                //
                // φ = s/R

                const rotation =
                    physicalX /
                    radius;


                this.drawRollingBody(
                    ctx,
                    x,
                    y,
                    radius,
                    rotation,
                    solid.color,
                    solid.type
                );
            }
        });
    }


    // =========================================================
    // GRÁFICO POSIÇÃO × TEMPO
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


        // -----------------------------------------------------
        // Título
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // Grade
        // -----------------------------------------------------

        const xTicks = 5;
        const yTicks = 5;


        ctx.font =
            "11px Arial";


        for (
            let i = 0;
            i <= xTicks;
            i++
        ) {

            const value =
                this.tGraphMax *
                i /
                xTicks;

            const px =
                x +
                value /
                this.tGraphMax *
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
                value /
                this.xMax *
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


        // -----------------------------------------------------
        // Curvas
        // -----------------------------------------------------

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            x + 1,
            y + 1,
            w - 2,
            h - 2
        );

        ctx.clip();


        this.solids.forEach(solid => {

            const data =
                this.data[solid.name];

            const n =
                Math.min(
                    Math.floor(this.frame) + 1,
                    data.t.length
                );


            if (n < 1) {

                return;
            }


            ctx.strokeStyle =
                solid.color;

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
                        data.t[i] /
                        this.tGraphMax
                    ) *
                    w;


                const py =
                    y +
                    h -
                    (
                        data.x[i] /
                        this.xMax
                    ) *
                    h;


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


            ctx.stroke();


            // ponto atual

            const current =
                n - 1;

            const px =
                x +
                (
                    data.t[current] /
                    this.tGraphMax
                ) *
                w;

            const py =
                y +
                h -
                (
                    data.x[current] /
                    this.xMax
                ) *
                h;


            ctx.fillStyle =
                solid.color;

            ctx.beginPath();

            ctx.arc(
                px,
                py,
                4,
                0,
                2 * Math.PI
            );

            ctx.fill();
        });


        ctx.restore();


        // -----------------------------------------------------
        // Borda
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;

        ctx.strokeRect(
            x,
            y,
            w,
            h
        );


        // -----------------------------------------------------
        // Eixos
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // Legenda
        // -----------------------------------------------------

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "left";


        this.solids.forEach(
            (solid, i) => {

                ctx.fillStyle =
                    solid.color;

                ctx.fillText(
                    solid.name,
                    x + w - 90,
                    y + 20 + i * 20
                );
            }
        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const index =
            Math.min(
                Math.floor(this.frame),
                this.data.Bloco.x.length - 1
            );

        const t =
            this.data.Bloco.t[index] || 0;


        const theta =
            this.params.theta *
            Math.PI / 180;


        const width = 300;
        const height = 90;

        const x = 20;
        const y = 20;


        ctx.save();


        ctx.fillStyle =
            "rgba(255,255,255,0.95)";

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


        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "left";


        ctx.fillText(
            "Plano inclinado",
            x + 12,
            y + 20
        );


        ctx.font =
            "12px Arial";


        ctx.fillText(
            `θ = ${this.params.theta.toFixed(0)}°`,
            x + 12,
            y + 42
        );

        ctx.fillText(
            `g = ${this.params.g.toFixed(2)} m/s²`,
            x + 12,
            y + 60
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            x + 150,
            y + 42
        );

        ctx.fillText(
            `a = g·sen(θ)/(1+k)`,
            x + 150,
            y + 60
        );


        ctx.restore();
    }


    // =========================================================
    // DESENHO
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

        const w =
            this.canvas.width;

        const h =
            this.canvas.height;


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


        // título da animação

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Descida de sólidos em um plano inclinado",
            330,
            35
        );


        this.drawPlane(ctx);

        this.drawSolids(ctx);

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


        this.solve();

        this.draw();
    }
}
