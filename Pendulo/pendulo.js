class SimplePendulum {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.g = 9.81;
        this.L = 1.0;

        this.theta0 = 1.0;
        this.omega0 = 0.0;

        // =====================================================
        // TEMPO
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 1000;

        // =====================================================
        // DADOS
        // =====================================================

        this.time = [];
        this.theta = [];
        this.omega = [];

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.frame = 0;
        this.running = true;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.pivotX = 300;
        this.pivotY = 180;

        this.visualLength = 260;
        this.radius = 18;

        // =====================================================
        // RESOLVE
        // =====================================================

        this.solve();

        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();

        // =====================================================
        // PRIMEIRO DESENHO
        // =====================================================

        this.draw();

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.animate();
    }


    // =========================================================
    // EQUAÇÕES
    // =========================================================

    derivatives(theta, omega) {

        return {
            theta: omega,

            omega:
                -(
                    this.g / this.L
                ) *
                Math.sin(theta)
        };
    }


    // =========================================================
    // RK4
    // =========================================================

    solve() {

        const h =
            (this.tf - this.t0) /
            this.N;

        let theta =
            this.theta0;

        let omega =
            this.omega0;

        this.time = [];
        this.theta = [];
        this.omega = [];

        for (let i = 0; i <= this.N; i++) {

            const t =
                this.t0 + i * h;

            this.time.push(t);
            this.theta.push(theta);
            this.omega.push(omega);

            if (i === this.N)
                break;


            // -------------------------------------------------
            // k1
            // -------------------------------------------------

            const k1 =
                this.derivatives(
                    theta,
                    omega
                );


            // -------------------------------------------------
            // k2
            // -------------------------------------------------

            const k2 =
                this.derivatives(

                    theta +
                    h * k1.theta / 2,

                    omega +
                    h * k1.omega / 2
                );


            // -------------------------------------------------
            // k3
            // -------------------------------------------------

            const k3 =
                this.derivatives(

                    theta +
                    h * k2.theta / 2,

                    omega +
                    h * k2.omega / 2
                );


            // -------------------------------------------------
            // k4
            // -------------------------------------------------

            const k4 =
                this.derivatives(

                    theta +
                    h * k3.theta,

                    omega +
                    h * k3.omega
                );


            // -------------------------------------------------
            // ATUALIZA
            // -------------------------------------------------

            theta +=
                h *
                (
                    k1.theta +
                    2 * k2.theta +
                    2 * k3.theta +
                    k4.theta
                ) /
                6;


            omega +=
                h *
                (
                    k1.omega +
                    2 * k2.omega +
                    2 * k3.omega +
                    k4.omega
                ) /
                6;
        }

        this.frame = 0;
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const container =
            document.getElementById("controls");

        container.innerHTML = "";

        this.addSlider(
            container,
            "g",
            "g (m/s²)",
            1,
            20,
            0.01,
            this.g
        );

        this.addSlider(
            container,
            "L",
            "L (m)",
            0.2,
            5,
            0.01,
            this.L
        );

        this.addSlider(
            container,
            "theta0",
            "θ₀ (rad)",
            -Math.PI,
            Math.PI,
            0.01,
            this.theta0
        );

        this.addSlider(
            container,
            "omega0",
            "ω₀ (rad/s)",
            -10,
            10,
            0.01,
            this.omega0
        );
    }


    addSlider(
        container,
        property,
        labelText,
        min,
        max,
        step,
        initial
    ) {

        const row =
            document.createElement("div");

        row.className = "control";


        const label =
            document.createElement("label");

        label.textContent =
            labelText;


        const slider =
            document.createElement("input");

        slider.type = "range";

        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = initial;


        const value =
            document.createElement("span");

        value.className = "value";

        value.textContent =
            Number(initial).toFixed(2);


        slider.addEventListener(
            "input",
            () => {

                const v =
                    Number(slider.value);

                this[property] = v;

                value.textContent =
                    v.toFixed(2);

                this.solve();

                this.draw();
            }
        );


        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(value);

        container.appendChild(row);
    }


    // =========================================================
    // PÊNDULO
    // =========================================================

    drawPendulum() {

        const ctx = this.ctx;

        const i =
            Math.min(
                Math.floor(this.frame),
                this.theta.length - 1
            );

        const theta =
            this.theta[i];


        const px =
            this.pivotX;

        const py =
            this.pivotY;

        const L =
            this.visualLength;


        const bx =
            px +
            L *
            Math.sin(theta);


        const by =
            py +
            L *
            Math.cos(theta);


        // =====================================================
        // TETO
        // =====================================================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            px - 100,
            py
        );

        ctx.lineTo(
            px + 100,
            py
        );

        ctx.stroke();


        // =====================================================
        // HACHURAS
        // =====================================================

        ctx.lineWidth = 2;

        for (
            let x = px - 90;
            x <= px + 90;
            x += 15
        ) {

            ctx.beginPath();

            ctx.moveTo(x, py);

            ctx.lineTo(
                x - 10,
                py + 10
            );

            ctx.stroke();
        }


        // =====================================================
        // VERTICAL
        // =====================================================

        ctx.strokeStyle = "#aaaaaa";
        ctx.lineWidth = 1;

        ctx.setLineDash([6, 6]);

        ctx.beginPath();

        ctx.moveTo(px, py);

        ctx.lineTo(
            px,
            py + L
        );

        ctx.stroke();

        ctx.setLineDash([]);


        // =====================================================
        // CORDA
        // =====================================================

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(px, py);

        ctx.lineTo(bx, by);

        ctx.stroke();


        // =====================================================
        // PIVÔ
        // =====================================================

        ctx.fillStyle = "#333";

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            7,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // =====================================================
        // MASSA
        // =====================================================

        ctx.fillStyle = "#1976d2";
        ctx.strokeStyle = "#111";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            bx,
            by,
            this.radius,
            0,
            2 * Math.PI
        );

        ctx.fill();

        ctx.stroke();


        // =====================================================
        // COMPRIMENTO
        // =====================================================

        ctx.fillStyle = "black";

        ctx.font = "14px Arial";

        ctx.fillText(

            `L = ${this.L.toFixed(2)} m`,

            (px + bx) / 2 + 10,

            (py + by) / 2

        );
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD() {

        const ctx = this.ctx;

        const i =
            Math.min(
                Math.floor(this.frame),
                this.theta.length - 1
            );


        const theta =
            this.theta[i];

        const omega =
            this.omega[i];

        const t =
            this.time[i];


        ctx.fillStyle =
            "rgba(255,255,255,0.95)";

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.roundRect(
            15,
            15,
            290,
            120,
            8
        );

        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = "black";

        ctx.font =
            "bold 13px Arial";

        ctx.fillText(
            "Pêndulo simples",
            25,
            35
        );


        ctx.font =
            "11px Arial";


        ctx.fillText(
            `g = ${this.g.toFixed(2)} m/s²`,
            25,
            55
        );

        ctx.fillText(
            `L = ${this.L.toFixed(2)} m`,
            25,
            72
        );

        ctx.fillText(
            `θ₀ = ${this.theta0.toFixed(2)} rad`,
            25,
            89
        );

        ctx.fillText(
            `ω₀ = ${this.omega0.toFixed(2)} rad/s`,
            25,
            106
        );


        ctx.fillText(
            `θ(t) = ${theta.toFixed(2)} rad`,
            165,
            55
        );

        ctx.fillText(
            `ω(t) = ${omega.toFixed(2)} rad/s`,
            165,
            72
        );

        ctx.fillText(
            `t = ${t.toFixed(2)} s`,
            165,
            89
        );

        ctx.fillText(
            `T ≈ ${this.period().toFixed(3)} s`,
            165,
            106
        );
    }


    // =========================================================
    // PERÍODO
    // =========================================================

    period() {

        return (
            2 *
            Math.PI *
            Math.sqrt(
                this.L / this.g
            )
        );
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph() {

        const ctx = this.ctx;

        const x0 = 700;
        const y0 = 70;

        const width =
            this.canvas.width -
            x0 -
            40;

        const height = 400;


        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle = "#777";

        ctx.strokeRect(
            x0,
            y0,
            width,
            height
        );


        ctx.fillStyle = "black";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "Resposta do pêndulo",
            x0 + 100,
            y0 - 20
        );


        // =====================================================
        // DADOS
        // =====================================================

        const n =
            Math.min(
                Math.floor(this.frame) + 1,
                this.time.length
            );


        if (n < 2)
            return;


        // =====================================================
        // ESCALA
        // =====================================================

        let max =
            0;

        for (
            let i = 0;
            i < n;
            i++
        ) {

            max =
                Math.max(
                    max,
                    Math.abs(this.theta[i]),
                    Math.abs(this.omega[i])
                );
        }


        if (max < 1)
            max = 1;

        max *= 1.15;


        const center =
            y0 + height / 2;


        // =====================================================
        // EIXO ZERO
        // =====================================================

        ctx.strokeStyle = "#aaa";

        ctx.beginPath();

        ctx.moveTo(
            x0,
            center
        );

        ctx.lineTo(
            x0 + width,
            center
        );

        ctx.stroke();


        // =====================================================
        // FUNÇÕES
        // =====================================================

        const mapX =
            t =>
                x0 +
                (t / this.tf) *
                width;


        const mapY =
            value =>
                center -
                (value / max) *
                height / 2;


        // =====================================================
        // THETA
        // =====================================================

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const x =
                mapX(this.time[i]);

            const y =
                mapY(this.theta[i]);

            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // OMEGA
        // =====================================================

        ctx.strokeStyle = "#f57c00";

        ctx.beginPath();

        for (
            let i = 0;
            i < n;
            i++
        ) {

            const x =
                mapX(this.time[i]);

            const y =
                mapY(this.omega[i]);

            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        ctx.stroke();


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.fillStyle =
            "#1976d2";

        ctx.fillText(
            "θ(t) [rad]",
            x0 + width - 100,
            y0 + 25
        );


        ctx.fillStyle =
            "#f57c00";

        ctx.fillText(
            "ω(t) [rad/s]",
            x0 + width - 110,
            y0 + 45
        );


        // =====================================================
        // EIXOS
        // =====================================================

        ctx.fillStyle = "black";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            "0",
            x0 - 15,
            center + 4
        );

        ctx.fillText(
            `${this.tf} s`,
            x0 + width - 20,
            y0 + height + 20
        );
    }


    // =========================================================
    // DESENHAR TUDO
    // =========================================================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle = "white";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.drawPendulum();

        this.drawHUD();

        this.drawGraph();
    }


    // =========================================================
    // ANIMAÇÃO
    // =========================================================

    animate() {

        if (!this.running)
            return;


        this.frame += 1;


        if (
            this.frame >=
            this.time.length
        ) {

            this.frame = 0;
        }


        this.draw();


        requestAnimationFrame(
            () => this.animate()
        );
    }
}
