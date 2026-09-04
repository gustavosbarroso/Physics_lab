class InclinedPlaneSolids {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

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
        // PLANO
        // =====================================================

        // Comprimento físico máximo do plano
        this.planeLength = 10;

        // Extremidade inferior do plano
        this.planeBottomX = 580;
        this.planeBottomY = 470;

        // Comprimento visual da superfície
        this.planePixelLength = 400;

        // =====================================================
        // SIMULAÇÃO
        // =====================================================

        this.dt = 0.02;

        // tMax será calculado automaticamente
        // para que a simulação termine no final do plano.
        this.tMax = 1;

        this.data = {};

        this.solids.forEach(solid => {

            this.data[solid.name] = {
                t: [],
                x: [],
                v: []
            };

        });

        this.running = false;
        this.frame = 0;
        this.animationSpeed = 1;

        // =====================================================
        // INTERFACE
        // =====================================================

        this.createControls();

        this.solve();

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
    // TEMPO PARA PERCORRER O PLANO
    //
    // x = 1/2 a t²
    //
    // Portanto:
    //
    // t = sqrt(2L/a)
    //
    // O tempo da simulação é determinado pelo sólido
    // mais lento.
    // =========================================================

    calculateSimulationTime() {

        let maxTime = 0;

        this.solids.forEach(solid => {

            const a =
                this.acceleration(solid.k);

            if (a > 0) {

                const time =
                    Math.sqrt(
                        2 *
                        this.planeLength /
                        a
                    );

                maxTime =
                    Math.max(
                        maxTime,
                        time
                    );
            }
        });

        // Pequena margem para incluir exatamente o último ponto
        this.tMax =
            Math.max(
                maxTime,
                this.dt
            );
    }


    // =========================================================
    // SOLUÇÃO
    // =========================================================

    solve() {

        // -----------------------------------------------------
        // Primeiro calcula quanto tempo o sólido mais lento
        // precisa para percorrer exatamente os 10 m.
        // -----------------------------------------------------

        this.calculateSimulationTime();

        const steps =
            Math.ceil(
                this.tMax /
                this.dt
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
                    Math.min(
                        i * this.dt,
                        this.tMax
                    );

                let x =
                    0.5 *
                    a *
                    t *
                    t;

                let v =
                    a * t;


                // -------------------------------------------------
                // LIMITA A POSIÇÃO AO COMPRIMENTO DO PLANO
                // -------------------------------------------------

                if (
                    x >=
                    this.planeLength
                ) {

                    x =
                        this.planeLength;

                    // Ao chegar ao final, a velocidade
                    // mostrada permanece a velocidade final.
                    v =
                        a *
                        Math.sqrt(
                            2 *
                            this.planeLength /
                            a
                        );
                }


                data.t.push(t);
                data.x.push(x);
                data.v.push(v);


                // -------------------------------------------------
                // Depois que chegou ao final, não continua
                // aumentando a posição.
                // -------------------------------------------------

                if (
                    x >=
                    this.planeLength
                ) {

                    const nextTime =
                        t + this.dt;

                    if (
                        nextTime <=
                        this.tMax
                    ) {

                        data.t.push(
                            nextTime
                        );

                        data.x.push(
                            this.planeLength
                        );

                        data.v.push(v);
                    }

                    break;
                }
            }

        });

        this.frame = 0;
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
                this.params[config.name];

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
                    this.params[config.name]
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
    // GEOMETRIA DO PLANO
    //
    // O plano forma um triângulo retângulo:
    //
    //                 ● topo
    //                 |\
    //                 | \
    //          altura |  \
    //                 |   \
    //                 |    \
    //                 ●-----●
    //                  base
    //
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
    // DESENHO DO PLANO
    //
    // TRIÂNGULO RETÂNGULO COMPLETO
    //
    // Sem θ.
    // Sem L.
    // Sem "10 m".
    // =========================================================

    drawPlane(ctx) {

        const plane =
            this.getPlaneGeometry();

        ctx.save();


        // =====================================================
        // PREENCHIMENTO DO TRIÂNGULO
        // =====================================================

        ctx.fillStyle =
            "rgba(220,220,220,0.30)";

        ctx.beginPath();

        // Topo
        ctx.moveTo(
            plane.x1,
            plane.y1
        );

        // Cateto vertical
        ctx.lineTo(
            plane.x1,
            plane.y2
        );

        // Cateto horizontal
        ctx.lineTo(
            plane.x2,
            plane.y2
        );

        // Fecha na hipotenusa
        ctx.closePath();

        ctx.fill();


        // =====================================================
        // CATETO VERTICAL — ALTURA
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
        // CATETO HORIZONTAL — BASE
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
        // HIPOTENUSA — PLANO INCLINADO
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

        const width = 32;
        const height = 32;

        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(theta);

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
    // ESFERA
    // =========================================================

    drawSphere(
        ctx,
        x,
        y,
        radius,
        rotation,
        color
    ) {

        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.fillStyle =
            color;

        ctx.globalAlpha =
            0.12;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius,
            0,
            2 * Math.PI
        );

        ctx.fill();

        ctx.globalAlpha =
            1;

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // Indicador de rotação
        ctx.rotate(rotation);

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            radius * 0.38,
            radius,
            0,
            0,
            2 * Math.PI
        );

        ctx.stroke();

        ctx.restore();
    }


    // =========================================================
    // CILINDRO
    // =========================================================

    drawCylinder(
        ctx,
        x,
        y,
        radius,
        rotation,
        theta,
        color
    ) {

        const length = 32;

        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(theta);

        ctx.fillStyle =
            color;

        ctx.globalAlpha =
            0.12;

        ctx.fillRect(
            -length / 2,
            -radius,
            length,
            2 * radius
        );

        ctx.globalAlpha =
            1;

        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            3;


        // Corpo
        ctx.beginPath();

        ctx.moveTo(
            -length / 2,
            -radius
        );

        ctx.lineTo(
            length / 2,
            -radius
        );

        ctx.lineTo(
            length / 2,
            radius
        );

        ctx.lineTo(
            -length / 2,
            radius
        );

        ctx.closePath();

        ctx.stroke();


        // Faces
        ctx.beginPath();

        ctx.ellipse(
            -length / 2,
            0,
            5,
            radius,
            0,
            0,
            2 * Math.PI
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.ellipse(
            length / 2,
            0,
            5,
            radius,
            0,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // Indicador de rotação
        ctx.save();

        ctx.rotate(rotation);

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

        ctx.restore();

        ctx.restore();
    }


    // =========================================================
    // ANEL
    // =========================================================

    drawRing(
        ctx,
        x,
        y,
        radius,
        rotation,
        theta,
        color
    ) {

        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(theta);


        // Parte externa
        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            5;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // Interior
        ctx.strokeStyle =
            "white";

        ctx.lineWidth =
            8;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius * 0.48,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // Borda interna
        ctx.strokeStyle =
            color;

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            radius * 0.48,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // Indicador de rotação
        ctx.rotate(rotation);

        ctx.lineWidth =
            2;

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

        ctx.restore();
    }


    // =========================================================
    // RASTRO
    // =========================================================

    drawTrail(
        ctx,
        solid,
        frame
    ) {

        if (frame < 1) {
            return;
        }

        const data =
            this.data[solid.name];

        const theta =
            this.getPlaneGeometry().theta;

        ctx.save();

        ctx.strokeStyle =
            solid.color;

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
            i <= frame &&
            i < data.x.length;
            i++
        ) {

            const physicalX =
                Math.min(
                    data.x[i],
                    this.planeLength
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
    // SÓLIDOS
    // =========================================================

    drawSolids(ctx) {

        const plane =
            this.getPlaneGeometry();

        const theta =
            plane.theta;

        this.solids.forEach(solid => {

            const data =
                this.data[solid.name];

            const index =
                Math.min(
                    Math.floor(this.frame),
                    data.x.length - 1
                );

            if (index < 0) {
                return;
            }

            const physicalX =
                Math.min(
                    data.x[index],
                    this.planeLength
                );

            const pos =
                this.positionOnPlane(
                    physicalX
                );

            const radius =
                18;


            // -------------------------------------------------
            // NORMAL PARA CIMA DO PLANO
            // -------------------------------------------------

            const x =
                pos.x +
                radius *
                Math.sin(theta);

            const y =
                pos.y -
                radius *
                Math.cos(theta);


            // -------------------------------------------------
            // RASTRO
            // -------------------------------------------------

            this.drawTrail(
                ctx,
                solid,
                index
            );


            // -------------------------------------------------
            // ROTAÇÃO
            // -------------------------------------------------

            const rotation =
                physicalX /
                radius;


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

            }

            else if (
                solid.type === "sphere"
            ) {

                this.drawSphere(
                    ctx,
                    x,
                    y,
                    radius,
                    rotation,
                    solid.color
                );

            }

            else if (
                solid.type === "cylinder"
            ) {

                this.drawCylinder(
                    ctx,
                    x,
                    y,
                    radius,
                    rotation,
                    theta,
                    solid.color
                );

            }

            else if (
                solid.type === "ring"
            ) {

                this.drawRing(
                    ctx,
                    x,
                    y,
                    radius,
                    rotation,
                    theta,
                    solid.color
                );

            }

        });
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


        const aBloco =
            this.acceleration(0);

        const aEsfera =
            this.acceleration(2 / 5);

        const aCilindro =
            this.acceleration(1 / 2);

        const aAnel =
            this.acceleration(1);


        const x = 20;
        const y = 55;

        const width = 300;
        const height = 165;


        ctx.save();

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
            `g = ${this.params.g.toFixed(2)} m/s²`,
            x + 12,
            y + 60
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            x + 12,
            y + 78
        );


        // =====================================================
        // ACELERAÇÕES
        // =====================================================

        ctx.fillStyle =
            "#7b1fa2";

        ctx.fillText(
            `Bloco: a = ${aBloco.toFixed(2)} m/s²`,
            x + 12,
            y + 101
        );


        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            `Esfera: a = ${aEsfera.toFixed(2)} m/s²`,
            x + 12,
            y + 119
        );


        ctx.fillStyle =
            "#388e3c";

        ctx.fillText(
            `Cilindro: a = ${aCilindro.toFixed(2)} m/s²`,
            x + 12,
            y + 137
        );


        ctx.fillStyle =
            "#d32f2f";

        ctx.fillText(
            `Anel: a = ${aAnel.toFixed(2)} m/s²`,
            x + 12,
            y + 155
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
            "Descida de sólidos em um plano inclinado",
            330,
            30
        );


        // =====================================================
        // ELEMENTOS
        // =====================================================

        this.drawPlane(ctx);

        this.drawSolids(ctx);

        this.drawHUD(ctx);
    }


    // =========================================================
    // INICIAR
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
            // A ANIMAÇÃO TERMINA QUANDO O ÚLTIMO SÓLIDO
            // CHEGA AO FINAL DO PLANO
            // =================================================

            if (
                this.frame >=
                this.totalFrames - 1
            ) {

                this.frame =
                    this.totalFrames - 1;

                this.draw();

                this.running = false;

                return;
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

        this.running = false;

        this.iniciar();

        this.draw();
    }
}
