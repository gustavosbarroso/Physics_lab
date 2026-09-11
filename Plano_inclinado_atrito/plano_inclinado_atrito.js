// ============================================================
// PLANO INCLINADO COM ATRITO
//
// Adaptação da implementação Python para o padrão
// visual/estrutural da simulação "Plano Inclinado com
// Sólidos" do LAVINA.
//
// Modelo:
//
//   repouso:
//   sin(theta) <= mu_s cos(theta)
//
//   deslizamento:
//   a = g (sin(theta) - mu_k cos(theta))
//
// A coordenada s é medida ao longo do plano.
// ============================================================


class InclinedPlaneFriction {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            g: options.g ?? 9.81,

            theta: options.theta ?? 20,

            muS: options.muS ?? 0.30,

            muK: options.muK ?? 0.20,

            L: options.L ?? 10
        };


        // =====================================================
        // GEOMETRIA VISUAL
        // =====================================================

        this.planePixelLength = 400;

        this.planeBottomX = 500;

        this.planeBottomY = 430;

        this.blockHalfSize = 18;


        // =====================================================
        // SIMULAÇÃO
        // =====================================================

        this.dt = 0.02;

        this.t = [];

        this.s = [];

        this.v = [];

        this.sliding = false;

        this.acceleration = 0;

        this.arrivalTime = null;

        this.tMax = 5;


        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.animationId = null;

        this.running = false;


        // =====================================================
        // CONTROLES
        // =====================================================

        this.controls = {};


        this.createControls();

        this.solve();

        this.draw();
    }


    // =========================================================
    // FÍSICA
    // =========================================================

    solve() {

        const theta =
            this.params.theta *
            Math.PI / 180;

        const {
            g,
            muS,
            muK,
            L
        } = this.params;


        // -----------------------------------------------------
        // ATRITO ESTÁTICO
        // -----------------------------------------------------

        this.sliding =
            Math.sin(theta) >
            muS * Math.cos(theta);


        let a = 0;


        // -----------------------------------------------------
        // ATRITO CINÉTICO
        // -----------------------------------------------------

        if (this.sliding) {

            a = g * (
                Math.sin(theta) -
                muK * Math.cos(theta)
            );


            // Evita uma situação inconsistente:
            // o bloco não deve começar a deslizar se a
            // aceleração resultante for negativa.
            if (a <= 0) {

                this.sliding = false;

                a = 0;
            }
        }


        this.acceleration = a;


        // -----------------------------------------------------
        // TEMPO DE CHEGADA
        // -----------------------------------------------------

        if (this.sliding) {

            this.arrivalTime =
                Math.sqrt(
                    2 * L / a
                );

            this.tMax =
                this.arrivalTime + 0.5;

        } else {

            this.arrivalTime = null;

            this.tMax = 5;
        }


        // -----------------------------------------------------
        // VETORES TEMPORAIS
        // -----------------------------------------------------

        const n =
            Math.ceil(
                this.tMax / this.dt
            ) + 1;


        this.t =
            new Array(n);

        this.s =
            new Array(n);

        this.v =
            new Array(n);


        this.t[0] = 0;

        this.s[0] = 0;

        this.v[0] = 0;


        // -----------------------------------------------------
        // INTEGRAÇÃO NUMÉRICA
        // -----------------------------------------------------

        for (
            let i = 1;
            i < n;
            i++
        ) {

            this.t[i] =
                this.t[i - 1] +
                this.dt;


            if (!this.sliding) {

                this.s[i] = 0;

                this.v[i] = 0;

            } else {

                this.v[i] =
                    this.v[i - 1] +
                    a * this.dt;


                this.s[i] =
                    this.s[i - 1] +
                    this.v[i] * this.dt;


                // -------------------------------------------------
                // CHEGADA AO FINAL DO PLANO
                // -------------------------------------------------

                if (
                    this.s[i] >= L
                ) {

                    this.s[i] = L;


                    this.v[i] =
                        Math.sqrt(
                            2 * a * L
                        );


                    for (
                        let j = i + 1;
                        j < n;
                        j++
                    ) {

                        this.t[j] =
                            this.t[j - 1] +
                            this.dt;

                        this.s[j] = L;

                        this.v[j] =
                            this.v[i];
                    }

                    break;
                }
            }
        }
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


        // -----------------------------------------------------
        // ÂNGULO
        // -----------------------------------------------------

        this.addSlider(
            container,

            "theta",

            "Ângulo θ",

            5,

            60,

            1,

            this.params.theta,

            "°"
        );


        // -----------------------------------------------------
        // ATRITO ESTÁTICO
        // -----------------------------------------------------

        this.addSlider(
            container,

            "muS",

            "Atrito estático μₛ",

            0,

            1,

            0.01,

            this.params.muS,

            ""
        );


        // -----------------------------------------------------
        // ATRITO CINÉTICO
        // -----------------------------------------------------

        this.addSlider(
            container,

            "muK",

            "Atrito cinético μₖ",

            0,

            1,

            0.01,

            this.params.muK,

            ""
        );
    }


    // =========================================================
    // CRIA SLIDER
    // =========================================================

    addSlider(
        container,
        key,
        label,
        min,
        max,
        step,
        value,
        unit
    ) {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "control-group";


        const title =
            document.createElement("div");


        title.className =
            "control-title";


        const valueText =
            document.createElement("span");


        valueText.className =
            "control-value";


        const updateText = () => {

            const decimals =
                step < 0.1
                    ? 2
                    : 0;


            valueText.textContent =
                `${Number(
                    this.params[key]
                ).toFixed(decimals)}${unit}`;
        };


        title.innerHTML =
            `<span>${label}</span>`;


        title.appendChild(
            valueText
        );


        const slider =
            document.createElement("input");


        slider.type = "range";

        slider.min = min;

        slider.max = max;

        slider.step = step;

        slider.value = value;


        slider.addEventListener(
            "input",
            () => {

                this.params[key] =
                    Number(
                        slider.value
                    );


                updateText();


                this.solve();

                this.reset();

                this.draw();
            }
        );


        wrapper.appendChild(title);

        wrapper.appendChild(slider);


        container.appendChild(
            wrapper
        );


        this.controls[key] =
            slider;


        updateText();
    }


    // =========================================================
    // GEOMETRIA DO PLANO
    // =========================================================

    getPlaneGeometry() {

        const theta =
            this.params.theta *
            Math.PI / 180;


        const x0 =
            this.planeBottomX;


        const y0 =
            this.planeBottomY;


        const x1 =
            x0 -
            this.planePixelLength *
            Math.cos(theta);


        const y1 =
            y0 -
            this.planePixelLength *
            Math.sin(theta);


        return {

            xTop: x1,

            yTop: y1,

            xBottom: x0,

            yBottom: y0,

            theta
        };
    }


    // =========================================================
    // POSIÇÃO SOBRE O PLANO
    // =========================================================

    positionOnPlane(s) {

        const geometry =
            this.getPlaneGeometry();


        const fraction =
            Math.max(
                0,
                Math.min(
                    1,
                    s / this.params.L
                )
            );


        return {

            x:
                geometry.xTop +
                fraction *
                (
                    geometry.xBottom -
                    geometry.xTop
                ),


            y:
                geometry.yTop +
                fraction *
                (
                    geometry.yBottom -
                    geometry.yTop
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


        // Direção de descida
        const tangent = {

            x: Math.cos(theta),

            y: Math.sin(theta)
        };


        // Normal para fora do plano
        const normal = {

            x: -Math.sin(theta),

            y: Math.cos(theta)
        };


        return {

            tangent,

            normal
        };
    }


    // =========================================================
    // DESENHA O PLANO
    // =========================================================

    drawPlane() {

        const ctx =
            this.ctx;


        const g =
            this.getPlaneGeometry();


        const baseY =
            g.yBottom;


        // -----------------------------------------------------
        // ÁREA TRIANGULAR
        // -----------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            g.xTop,
            g.yTop
        );


        ctx.lineTo(
            g.xBottom,
            g.yBottom
        );


        ctx.lineTo(
            g.xTop,
            baseY
        );


        ctx.closePath();


        ctx.fillStyle =
            "#f3f3f3";


        ctx.fill();


        // -----------------------------------------------------
        // CONTORNO
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#333";


        ctx.lineWidth = 2;


        ctx.beginPath();


        ctx.moveTo(
            g.xTop,
            g.yTop
        );


        ctx.lineTo(
            g.xBottom,
            g.yBottom
        );


        ctx.lineTo(
            g.xTop,
            baseY
        );


        ctx.closePath();


        ctx.stroke();


        // -----------------------------------------------------
        // HIPOTENUSA
        // -----------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            g.xTop,
            g.yTop
        );


        ctx.lineTo(
            g.xBottom,
            g.yBottom
        );


        ctx.strokeStyle =
            "#222";


        ctx.lineWidth = 4;


        ctx.stroke();


        // -----------------------------------------------------
        // ÂNGULO
        // -----------------------------------------------------

        this.drawAngleMarker(
            g.xTop,
            g.yTop,
            this.params.theta
        );
    }


    // =========================================================
    // MARCADOR DO ÂNGULO
    // =========================================================

    drawAngleMarker(
        x,
        y,
        thetaDeg
    ) {

        const ctx =
            this.ctx;


        const r = 35;


        const theta =
            thetaDeg *
            Math.PI / 180;


        ctx.strokeStyle =
            "#777";


        ctx.lineWidth = 1.5;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            r,
            0,
            theta
        );


        ctx.stroke();


        ctx.fillStyle =
            "#555";


        ctx.font =
            "13px Arial";


        ctx.fillText(
            `θ = ${thetaDeg.toFixed(1)}°`,
            x + 8,
            y + 20
        );
    }


    // =========================================================
    // BLOCO
    // =========================================================

    drawBlock(s) {

        const ctx =
            this.ctx;


        const p =
            this.positionOnPlane(s);


        const {
            tangent,
            normal
        } =
            this.getPlaneVectors();


        const half =
            this.blockHalfSize;


        // Centro do bloco
        const center = {

            x:
                p.x +
                normal.x *
                half,

            y:
                p.y +
                normal.y *
                half
        };


        // -----------------------------------------------------
        // EIXO TANGENTE
        // -----------------------------------------------------

        const tx =
            tangent.x *
            half;


        const ty =
            tangent.y *
            half;


        // -----------------------------------------------------
        // EIXO NORMAL
        // -----------------------------------------------------

        const nx =
            normal.x *
            half;


        const ny =
            normal.y *
            half;


        // -----------------------------------------------------
        // VÉRTICES
        // -----------------------------------------------------

        const vertices = [

            {
                x:
                    center.x -
                    tx -
                    nx,

                y:
                    center.y -
                    ty -
                    ny
            },

            {
                x:
                    center.x +
                    tx -
                    nx,

                y:
                    center.y +
                    ty -
                    ny
            },

            {
                x:
                    center.x +
                    tx +
                    nx,

                y:
                    center.y +
                    ty +
                    ny
            },

            {
                x:
                    center.x -
                    tx +
                    nx,

                y:
                    center.y -
                    ty +
                    ny
            }
        ];


        // -----------------------------------------------------
        // DESENHO
        // -----------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            vertices[0].x,
            vertices[0].y
        );


        for (
            let i = 1;
            i < vertices.length;
            i++
        ) {

            ctx.lineTo(
                vertices[i].x,
                vertices[i].y
            );
        }


        ctx.closePath();


        ctx.fillStyle =
            "#ffffff";


        ctx.fill();


        ctx.strokeStyle =
            "#7b1fa2";


        ctx.lineWidth = 3;


        ctx.stroke();


        // Centro
        ctx.beginPath();


        ctx.arc(
            center.x,
            center.y,
            3,
            0,
            2 * Math.PI
        );


        ctx.fillStyle =
            "#7b1fa2";


        ctx.fill();
    }


    // =========================================================
    // RASTRO
    // =========================================================

    drawTrail(currentIndex) {

        if (currentIndex <= 0) {
            return;
        }


        const ctx =
            this.ctx;


        ctx.beginPath();


        const start =
            this.positionOnPlane(
                this.s[0]
            );


        ctx.moveTo(
            start.x,
            start.y
        );


        for (
            let i = 1;
            i <= currentIndex;
            i++
        ) {

            const p =
                this.positionOnPlane(
                    this.s[i]
                );


            ctx.lineTo(
                p.x,
                p.y
            );
        }


        ctx.strokeStyle =
            "rgba(123, 31, 162, 0.40)";


        ctx.lineWidth = 3;


        ctx.stroke();
    }


    // =========================================================
    // VETOR VELOCIDADE
    // =========================================================

    drawVelocity(
        s,
        v
    ) {

        if (
            !this.sliding ||
            v <= 0 ||
            s >= this.params.L
        ) {
            return;
        }


        const ctx =
            this.ctx;


        const p =
            this.positionOnPlane(s);


        const {
            tangent
        } =
            this.getPlaneVectors();


        const scale = 18;


        const length =
            Math.min(
                110,
                Math.max(
                    20,
                    v * scale
                )
            );


        const x2 =
            p.x +
            tangent.x *
            length;


        const y2 =
            p.y +
            tangent.y *
            length;


        ctx.strokeStyle =
            "#1565c0";


        ctx.fillStyle =
            "#1565c0";


        ctx.lineWidth = 3;


        // -----------------------------------------------------
        // LINHA
        // -----------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            p.x,
            p.y
        );


        ctx.lineTo(
            x2,
            y2
        );


        ctx.stroke();


        // -----------------------------------------------------
        // PONTA
        // -----------------------------------------------------

        const head = 9;


        const angle =
            Math.atan2(
                y2 - p.y,
                x2 - p.x
            );


        ctx.beginPath();


        ctx.moveTo(
            x2,
            y2
        );


        ctx.lineTo(

            x2 -
            head *
            Math.cos(
                angle -
                Math.PI / 6
            ),

            y2 -
            head *
            Math.sin(
                angle -
                Math.PI / 6
            )
        );


        ctx.lineTo(

            x2 -
            head *
            Math.cos(
                angle +
                Math.PI / 6
            ),

            y2 -
            head *
            Math.sin(
                angle +
                Math.PI / 6
            )
        );


        ctx.closePath();


        ctx.fill();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(
        currentIndex
    ) {

        const ctx =
            this.ctx;


        const graphX = 690;

        const graphY = 80;

        const graphW = 450;

        const graphH = 320;


        const left = graphX;

        const right =
            graphX +
            graphW;

        const top = graphY;

        const bottom =
            graphY +
            graphH;


        const tMax =
            this.t[
                this.t.length - 1
            ] || 1;


        const xMax =
            Math.max(
                this.params.L,
                1
            );


        // -----------------------------------------------------
        // FUNDO
        // -----------------------------------------------------

        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            graphX,
            graphY,
            graphW,
            graphH
        );


        // -----------------------------------------------------
        // BORDA
        // -----------------------------------------------------

        ctx.strokeStyle =
            "#aaa";


        ctx.lineWidth = 1;


        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );


        // -----------------------------------------------------
        // GRADE HORIZONTAL
        // -----------------------------------------------------

        ctx.strokeStyle =
            "rgba(0,0,0,0.10)";


        for (
            let i = 0;
            i <= 5;
            i++
        ) {

            const y =
                bottom -
                (i / 5) *
                graphH;


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


        // -----------------------------------------------------
        // GRADE VERTICAL
        // -----------------------------------------------------

        for (
            let i = 0;
            i <= 5;
            i++
        ) {

            const x =
                left +
                (i / 5) *
                graphW;


            ctx.beginPath();


            ctx.moveTo(
                x,
                top
            );


            ctx.lineTo(
                x,
                bottom
            );


            ctx.stroke();
        }


        // -----------------------------------------------------
        // CURVA COMPLETA
        // -----------------------------------------------------

        ctx.beginPath();


        for (
            let i = 0;
            i < this.t.length;
            i++
        ) {

            const x =
                left +
                (
                    this.t[i] /
                    tMax
                ) *
                graphW;


            const y =
                bottom -
                (
                    this.s[i] /
                    xMax
                ) *
                graphH;


            if (i === 0) {

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
            "rgba(123,31,162,0.25)";


        ctx.lineWidth = 2;


        ctx.stroke();


        // -----------------------------------------------------
        // CURVA PERCORRIDA
        // -----------------------------------------------------

        ctx.beginPath();


        const last =
            Math.min(
                currentIndex,
                this.t.length - 1
            );


        for (
            let i = 0;
            i <= last;
            i++
        ) {

            const x =
                left +
                (
                    this.t[i] /
                    tMax
                ) *
                graphW;


            const y =
                bottom -
                (
                    this.s[i] /
                    xMax
                ) *
                graphH;


            if (i === 0) {

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
            "#7b1fa2";


        ctx.lineWidth = 3;


        ctx.stroke();


        // -----------------------------------------------------
        // PONTO ATUAL
        // -----------------------------------------------------

        const currentT =
            this.t[last] || 0;


        const currentS =
            this.s[last] || 0;


        const pointX =
            left +
            (
                currentT /
                tMax
            ) *
            graphW;


        const pointY =
            bottom -
            (
                currentS /
                xMax
            ) *
            graphH;


        ctx.beginPath();


        ctx.arc(
            pointX,
            pointY,
            5,
            0,
            2 * Math.PI
        );


        ctx.fillStyle =
            "#7b1fa2";


        ctx.fill();


        // -----------------------------------------------------
        // ESCALA X
        // -----------------------------------------------------

        ctx.fillStyle =
            "#444";


        ctx.font =
            "12px Arial";


        ctx.textAlign =
            "center";


        for (
            let i = 0;
            i <= 5;
            i++
        ) {

            const value =
                (
                    i / 5
                ) *
                tMax;


            const x =
                left +
                (
                    i / 5
                ) *
                graphW;


            ctx.fillText(
                value.toFixed(1),
                x,
                bottom + 20
            );
        }


        // -----------------------------------------------------
        // ESCALA Y
        // -----------------------------------------------------

        ctx.textAlign =
            "right";


        for (
            let i = 0;
            i <= 5;
            i++
        ) {

            const value =
                (
                    i / 5
                ) *
                xMax;


            const y =
                bottom -
                (
                    i / 5
                ) *
                graphH;


            ctx.fillText(
                value.toFixed(1),
                left - 8,
                y + 4
            );
        }


        // -----------------------------------------------------
        // TÍTULOS DOS EIXOS
        // -----------------------------------------------------

        ctx.textAlign =
            "center";


        ctx.font =
            "13px Arial";


        ctx.fillText(
            "Tempo (s)",
            left +
            graphW / 2,
            bottom + 43
        );


        ctx.save();


        ctx.translate(
            left - 48,
            top + graphH / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.fillText(
            "Posição ao longo do plano (m)",
            0,
            0
        );


        ctx.restore();


        // -----------------------------------------------------
        // TÍTULO DO GRÁFICO
        // -----------------------------------------------------

        ctx.font =
            "bold 15px Arial";


        ctx.fillStyle =
            "#222";


        ctx.fillText(
            "Posição × Tempo",
            left +
            graphW / 2,
            top - 18
        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(
        currentIndex
    ) {

        const ctx =
            this.ctx;


        const i =
            Math.min(
                currentIndex,
                this.t.length - 1
            );


        const currentT =
            this.t[i] || 0;


        const currentS =
            this.s[i] || 0;


        const currentV =
            this.v[i] || 0;


        let state;


        if (!this.sliding) {

            state =
                "Em repouso";

        } else if (
            currentS >=
            this.params.L
        ) {

            state =
                "Chegou ao final";

        } else {

            state =
                "Deslizando";
        }


        // -----------------------------------------------------
        // CAIXA
        // -----------------------------------------------------

        const x = 20;

        const y = 55;

        const w = 305;

        const h = 225;


        ctx.fillStyle =
            "rgba(255,255,255,0.92)";


        ctx.strokeStyle =
            "#bbb";


        ctx.lineWidth = 1;


        ctx.beginPath();


        ctx.roundRect(
            x,
            y,
            w,
            h,
            10
        );


        ctx.fill();

        ctx.stroke();


        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        ctx.fillStyle =
            "#222";


        ctx.font =
            "bold 15px Arial";


        ctx.fillText(
            "Plano inclinado com atrito",
            x + 15,
            y + 25
        );


        // -----------------------------------------------------
        // INFORMAÇÕES
        // -----------------------------------------------------

        ctx.font =
            "13px Arial";


        const lines = [

            `θ = ${this.params.theta.toFixed(1)}°`,

            `μₛ = ${this.params.muS.toFixed(2)}`,

            `μₖ = ${this.params.muK.toFixed(2)}`,

            `L = ${this.params.L.toFixed(1)} m`,

            "",

            `Estado: ${state}`,

            `s = ${currentS.toFixed(2)} m`,

            `v = ${currentV.toFixed(2)} m/s`,

            `a = ${this.acceleration.toFixed(2)} m/s²`
        ];


        lines.forEach(
            (line, index) => {

                ctx.fillText(
                    line,
                    x + 15,
                    y +
                    49 +
                    index * 18
                );
            }
        );
    }


    // =========================================================
    // DESENHO PRINCIPAL
    // =========================================================

    draw(
        currentIndex = 0
    ) {

        const ctx =
            this.ctx;


        // -----------------------------------------------------
        // LIMPA CANVAS
        // -----------------------------------------------------

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // -----------------------------------------------------
        // TÍTULO GERAL
        // -----------------------------------------------------

        ctx.fillStyle =
            "#222";


        ctx.font =
            "bold 18px Arial";


        ctx.textAlign =
            "left";


        ctx.fillText(
            "Plano inclinado com atrito",
            20,
            30
        );


        // -----------------------------------------------------
        // SIMULAÇÃO
        // -----------------------------------------------------

        this.drawPlane();


        this.drawTrail(
            currentIndex
        );


        const i =
            Math.min(
                currentIndex,
                this.s.length - 1
            );


        this.drawBlock(
            this.s[i] || 0
        );


        this.drawVelocity(
            this.s[i] || 0,
            this.v[i] || 0
        );


        // -----------------------------------------------------
        // GRÁFICO
        // -----------------------------------------------------

        this.drawGraph(
            currentIndex
        );


        // -----------------------------------------------------
        // HUD
        // -----------------------------------------------------

        this.drawHUD(
            currentIndex
        );
    }


    // =========================================================
    // INICIAR
    // =========================================================

    iniciar() {

        this.parar();


        this.running =
            true;


        let frame = 0;


        const animate = () => {

            if (!this.running) {
                return;
            }


            this.draw(
                frame
            );


            frame++;


            if (
                frame >=
                this.t.length
            ) {

                this.running =
                    false;

                return;
            }


            this.animationId =
                requestAnimationFrame(
                    animate
                );
        };


        animate();
    }


    // =========================================================
    // PARAR
    // =========================================================

    parar() {

        this.running =
            false;


        if (
            this.animationId !== null
        ) {

            cancelAnimationFrame(
                this.animationId
            );


            this.animationId =
                null;
        }
    }


    // =========================================================
    // RESET
    // =========================================================

    reset() {

        this.parar();

        this.draw(0);
    }


    // =========================================================
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros() {

        this.params.theta =
            Number(
                this.controls.theta.value
            );


        this.params.muS =
            Number(
                this.controls.muS.value
            );


        this.params.muK =
            Number(
                this.controls.muK.value
            );


        this.solve();

        this.reset();
    }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const canvas =
            document.getElementById(
                "inclinedPlaneFrictionCanvas"
            );


        if (!canvas) {
            return;
        }


        window.inclinedPlaneFriction =
            new InclinedPlaneFriction(
                canvas
            );
    }
);
