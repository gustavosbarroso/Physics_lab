class GeradorAC {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ========================================================
        // PARÂMETROS
        // ========================================================

        this.params = {

            N: options.N ?? 100,

            A: options.A ?? 2.0,

            B: options.B ?? 0.5,

            w: options.w ?? 10,

            R: options.R ?? 10

        };


        // ========================================================
        // TEMPO
        // ========================================================

        this.t = 0;

        this.dt = 0.02;

        this.interval = 20;

        this.ultimoFrame = 0;


        // ========================================================
        // CORES DO MATPLOTLIB
        // ========================================================

        // Primeira curva do Python
        this.corV = "#1f77b4";

        // Segunda curva do Python
        this.corI = "#ff7f0e";


        // ========================================================
        // CONTROLES
        // ========================================================

        this.createControls();


        // ========================================================
        // DESENHO INICIAL
        // ========================================================

        this.draw();


        // ========================================================
        // ANIMAÇÃO
        // ========================================================

        this.iniciar();
    }


    // ============================================================
    // TENSÃO INDUZIDA
    // ============================================================

    ddp(N, A, B, w, t) {

        return (
            N *
            A *
            B *
            Math.sin(w * t)
        );
    }


    // ============================================================
    // CORRENTE INDUZIDA
    // ============================================================

    corrente(ddp, R) {

        if (R === 0) {

            return 0;
        }

        return ddp / R;
    }


    // ============================================================
    // CONTROLES
    // ============================================================

    createControls() {

        const controls =
            document.getElementById("controls");

        controls.innerHTML = "";


        const criarSlider = (
            nome,
            min,
            max,
            step,
            valor,
            casas = 1
        ) => {

            const div =
                document.createElement("div");

            div.className = "control";


            const label =
                document.createElement("label");

            label.textContent = nome;


            const input =
                document.createElement("input");

            input.type = "range";

            input.min = min;

            input.max = max;

            input.step = step;

            input.value = valor;


            const span =
                document.createElement("span");

            span.textContent =
                Number(valor).toFixed(casas);


            input.addEventListener(
                "input",
                () => {

                    span.textContent =
                        Number(input.value)
                            .toFixed(casas);


                    const novosParametros = {
                        ...this.params
                    };


                    if (nome === "N") {

                        novosParametros.N =
                            Number(input.value);
                    }


                    if (nome === "A") {

                        novosParametros.A =
                            Number(input.value);
                    }


                    if (nome === "B") {

                        novosParametros.B =
                            Number(input.value);
                    }


                    if (nome === "ω (rad/s)") {

                        novosParametros.w =
                            Number(input.value);
                    }


                    if (nome === "R (Ω)") {

                        novosParametros.R =
                            Number(input.value);
                    }


                    this.atualizarParametros(
                        novosParametros
                    );
                }
            );


            div.appendChild(label);

            div.appendChild(input);

            div.appendChild(span);

            controls.appendChild(div);
        };


        // ========================================================
        // SLIDER N
        // ========================================================

        criarSlider(
            "N",
            1,
            500,
            1,
            this.params.N,
            0
        );


        // ========================================================
        // SLIDER A
        // ========================================================

        criarSlider(
            "A",
            0.1,
            5,
            0.1,
            this.params.A,
            1
        );


        // ========================================================
        // SLIDER B
        // ========================================================

        criarSlider(
            "B",
            -2,
            2,
            0.1,
            this.params.B,
            1
        );


        // ========================================================
        // SLIDER ω
        // ========================================================

        criarSlider(
            "ω (rad/s)",
            0,
            20,
            0.1,
            this.params.w,
            1
        );


        // ========================================================
        // SLIDER R
        // ========================================================

        criarSlider(
            "R (Ω)",
            1,
            100,
            1,
            this.params.R,
            0
        );
    }


    // ============================================================
    // GERADOR
    // ============================================================

    drawGenerator() {

        const ctx = this.ctx;


        // --------------------------------------------------------
        // CENTRO DO GERADOR
        // --------------------------------------------------------

        const centroX = 250;

        const centroY = 165;


        // --------------------------------------------------------
        // TÍTULO
        // --------------------------------------------------------

        ctx.fillStyle = "black";

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC",
            centroX,
            25
        );


        // --------------------------------------------------------
        // ÍMÃ ESQUERDO
        // --------------------------------------------------------

        ctx.fillStyle = "blue";

        ctx.fillRect(
            25,
            centroY - 100,
            40,
            200
        );


        ctx.fillStyle = "red";

        ctx.fillRect(
            65,
            centroY - 100,
            40,
            200
        );


        ctx.fillStyle = "white";

        ctx.font =
            "22px Arial";


        ctx.fillText(
            "S",
            45,
            centroY + 8
        );


        ctx.fillText(
            "N",
            85,
            centroY + 8
        );


        // --------------------------------------------------------
        // ÍMÃ DIREITO
        // --------------------------------------------------------

        ctx.fillStyle = "blue";

        ctx.fillRect(
            395,
            centroY - 100,
            40,
            200
        );


        ctx.fillStyle = "red";

        ctx.fillRect(
            435,
            centroY - 100,
            40,
            200
        );


        ctx.fillStyle = "white";


        ctx.fillText(
            "S",
            415,
            centroY + 8
        );


        ctx.fillText(
            "N",
            455,
            centroY + 8
        );


        // --------------------------------------------------------
        // CAMPO MAGNÉTICO
        // --------------------------------------------------------

        ctx.strokeStyle =
            "rgba(0,0,0,0.5)";

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";

        ctx.lineWidth = 2;


        const sentido =
            this.params.B >= 0
                ? 1
                : -1;


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const y =
                centroY -
                75 +
                i * 37.5;


            const xInicial =
                sentido === 1
                    ? 120
                    : 380;


            const xFinal =
                sentido === 1
                    ? 380
                    : 120;


            ctx.beginPath();

            ctx.moveTo(
                xInicial,
                y
            );

            ctx.lineTo(
                xFinal,
                y
            );

            ctx.stroke();


            ctx.beginPath();


            if (sentido === 1) {

                ctx.moveTo(
                    xFinal,
                    y
                );

                ctx.lineTo(
                    xFinal - 10,
                    y - 5
                );

                ctx.lineTo(
                    xFinal - 10,
                    y + 5
                );

            } else {

                ctx.moveTo(
                    xFinal,
                    y
                );

                ctx.lineTo(
                    xFinal + 10,
                    y - 5
                );

                ctx.lineTo(
                    xFinal + 10,
                    y + 5
                );
            }


            ctx.closePath();

            ctx.fill();
        }


        // --------------------------------------------------------
        // BOBINA
        // --------------------------------------------------------

        const angulo =
            this.params.w * this.t;


        const largura =
            125 *
            Math.cos(angulo);


        const altura = 100;


        ctx.strokeStyle = "black";

        ctx.lineWidth = 3;


        ctx.beginPath();


        ctx.moveTo(
            centroX - largura,
            centroY - altura
        );


        ctx.lineTo(
            centroX + largura,
            centroY - altura
        );


        ctx.lineTo(
            centroX + largura,
            centroY + altura
        );


        ctx.lineTo(
            centroX - largura,
            centroY + altura
        );


        ctx.closePath();


        ctx.stroke();


        // --------------------------------------------------------
        // EIXO / FIO ÚNICO
        // --------------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            centroX,
            centroY - altura
        );


        ctx.lineTo(
            centroX,
            centroY + 130
        );


        ctx.stroke();


        // --------------------------------------------------------
        // LÂMPADA
        // --------------------------------------------------------

        const V =
            this.ddp(
                this.params.N,
                this.params.A,
                this.params.B,
                this.params.w,
                this.t
            );


        const Vmax =
            Math.abs(
                this.params.N *
                this.params.A *
                this.params.B *
                this.params.w
            );


        let brilho = 0;


        if (Vmax > 0) {

            brilho =
                Math.min(
                    Math.abs(V) / Vmax,
                    1
                );
        }


        const lampX = centroX;

        const lampY =
            centroY + 135;


        const raio = 35;


        ctx.beginPath();


        ctx.arc(
            lampX,
            lampY,
            raio,
            0,
            2 * Math.PI
        );


        ctx.fillStyle =
            `rgb(
                ${Math.round(
                    128 + 127 * brilho
                )},
                ${Math.round(
                    128 + 127 * brilho
                )},
                ${Math.round(
                    128 * (1 - brilho)
                )}
            )`;


        ctx.fill();


        ctx.strokeStyle = "black";

        ctx.lineWidth = 2;

        ctx.stroke();


        // --------------------------------------------------------
        // TEXTO DA LÂMPADA
        // --------------------------------------------------------

        ctx.fillStyle = "black";

        ctx.font =
            "10px Arial";

        ctx.textAlign = "center";


        ctx.fillText(
            "Lâmpada",
            lampX,
            lampY + 50
        );


        // --------------------------------------------------------
        // VALORES INSTANTÂNEOS
        // --------------------------------------------------------

        const corrente =
            this.corrente(
                V,
                this.params.R
            );


        ctx.font =
            "13px Arial";

        ctx.textAlign = "left";


        ctx.fillText(
            `V(t) = ${V.toFixed(2)} V`,
            20,
            305
        );


        ctx.fillText(
            `I(t) = ${corrente.toFixed(2)} A`,
            20,
            323
        );
    }


    // ============================================================
    // GRÁFICO V(t) E I(t)
    // ============================================================

    drawGraph() {

        const ctx = this.ctx;


        // --------------------------------------------------------
        // ÁREA DO GRÁFICO
        // --------------------------------------------------------

        const x0 = 570;

        const x1 = 1170;

        const y0 = 65;

        const y1 = 430;


        const largura =
            x1 - x0;

        const altura =
            y1 - y0;


        // --------------------------------------------------------
        // ESCALA
        // --------------------------------------------------------

        const Vmax =
            Math.abs(
                this.params.N *
                this.params.A *
                this.params.B *
                this.params.w
            );


        const Imax =
            this.params.R === 0
                ? 0
                : Vmax / this.params.R;


        let ymax =
            Math.max(
                Vmax,
                Imax
            );


        if (ymax === 0) {

            ymax = 1;
        }


        const limite =
            1.1 * ymax;


        // --------------------------------------------------------
        // TÍTULO
        // --------------------------------------------------------

        ctx.fillStyle = "black";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign = "center";


        ctx.fillText(
            "Gerador AC - Tensão e Corrente × Tempo",
            (x0 + x1) / 2,
            35
        );


        // --------------------------------------------------------
        // EIXOS
        // --------------------------------------------------------

        ctx.strokeStyle = "black";

        ctx.lineWidth = 1.5;


        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x0,
            y1
        );

        ctx.lineTo(
            x1,
            y1
        );

        ctx.stroke();


        // --------------------------------------------------------
        // GRADE
        // --------------------------------------------------------

        ctx.strokeStyle =
            "#dddddd";

        ctx.lineWidth = 1;


        for (
            let i = 1;
            i < 5;
            i++
        ) {

            const y =
                y0 +
                i *
                altura / 5;


            ctx.beginPath();

            ctx.moveTo(
                x0,
                y
            );

            ctx.lineTo(
                x1,
                y
            );

            ctx.stroke();
        }


        for (
            let i = 1;
            i < 5;
            i++
        ) {

            const x =
                x0 +
                i *
                largura / 5;


            ctx.beginPath();

            ctx.moveTo(
                x,
                y0
            );

            ctx.lineTo(
                x,
                y1
            );

            ctx.stroke();
        }


        // --------------------------------------------------------
        // EIXO ZERO
        // --------------------------------------------------------

        const yZero =
            y0 +
            altura / 2;


        ctx.strokeStyle =
            "#999999";


        ctx.beginPath();

        ctx.moveTo(
            x0,
            yZero
        );

        ctx.lineTo(
            x1,
            yZero
        );

        ctx.stroke();


        // ========================================================
        // CURVA V(t)
        // ========================================================

        ctx.strokeStyle =
            this.corV;

        ctx.lineWidth = 2;


        ctx.beginPath();


        const pontos = 500;


        for (
            let i = 0;
            i <= pontos;
            i++
        ) {

            const tempo =
                2 * i / pontos;


            const V =
                this.ddp(
                    this.params.N,
                    this.params.A,
                    this.params.B,
                    this.params.w,
                    tempo
                );


            const x =
                x0 +
                (tempo / 2) *
                largura;


            const y =
                yZero -
                (V / limite) *
                (altura / 2);


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


        ctx.stroke();


        // ========================================================
        // CURVA I(t)
        // ========================================================

        ctx.strokeStyle =
            this.corI;

        ctx.lineWidth = 2.5;


        ctx.beginPath();


        for (
            let i = 0;
            i <= pontos;
            i++
        ) {

            const tempo =
                2 * i / pontos;


            const V =
                this.ddp(
                    this.params.N,
                    this.params.A,
                    this.params.B,
                    this.params.w,
                    tempo
                );


            const I =
                this.corrente(
                    V,
                    this.params.R
                );


            const x =
                x0 +
                (tempo / 2) *
                largura;


            const y =
                yZero -
                (I / limite) *
                (altura / 2);


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


        ctx.stroke();


        // ========================================================
        // VALORES INSTANTÂNEOS
        // ========================================================

        const tempo =
            Math.min(
                this.t,
                2
            );


        const V =
            this.ddp(
                this.params.N,
                this.params.A,
                this.params.B,
                this.params.w,
                tempo
            );


        const I =
            this.corrente(
                V,
                this.params.R
            );


        const xAtual =
            x0 +
            (tempo / 2) *
            largura;


        const yV =
            yZero -
            (V / limite) *
            (altura / 2);


        const yI =
            yZero -
            (I / limite) *
            (altura / 2);


        // --------------------------------------------------------
        // PONTO V(t)
        // --------------------------------------------------------

        ctx.beginPath();

        ctx.arc(
            xAtual,
            yV,
            6,
            0,
            2 * Math.PI
        );

        ctx.fillStyle =
            this.corV;

        ctx.fill();


        // --------------------------------------------------------
        // PONTO I(t)
        // --------------------------------------------------------

        ctx.beginPath();

        ctx.arc(
            xAtual,
            yI,
            6,
            0,
            2 * Math.PI
        );

        ctx.fillStyle =
            this.corI;

        ctx.fill();


        // --------------------------------------------------------
        // LINHA DO TEMPO
        // --------------------------------------------------------

        ctx.strokeStyle =
            "#777777";

        ctx.lineWidth = 1;

        ctx.setLineDash([
            5,
            5
        ]);


        ctx.beginPath();

        ctx.moveTo(
            xAtual,
            y0
        );

        ctx.lineTo(
            xAtual,
            y1
        );

        ctx.stroke();


        ctx.setLineDash([]);


        // --------------------------------------------------------
        // ESCALA Y
        // --------------------------------------------------------

        ctx.fillStyle = "black";

        ctx.font =
            "12px Arial";

        ctx.textAlign = "right";


        ctx.fillText(
            `${limite.toFixed(1)}`,
            x0 - 8,
            y0 + 4
        );


        ctx.fillText(
            "0",
            x0 - 8,
            yZero + 4
        );


        ctx.fillText(
            `${(-limite).toFixed(1)}`,
            x0 - 8,
            y1
        );


        // --------------------------------------------------------
        // ESCALA X
        // --------------------------------------------------------

        ctx.textAlign = "center";


        ctx.fillText(
            "0",
            x0,
            y1 + 18
        );


        ctx.fillText(
            "0,5",
            x0 + largura * 0.25,
            y1 + 18
        );


        ctx.fillText(
            "1",
            x0 + largura * 0.50,
            y1 + 18
        );


        ctx.fillText(
            "1,5",
            x0 + largura * 0.75,
            y1 + 18
        );


        ctx.fillText(
            "2",
            x1,
            y1 + 18
        );


        // --------------------------------------------------------
        // EIXO X
        // --------------------------------------------------------

        ctx.fillText(
            "Tempo (s)",
            (x0 + x1) / 2,
            y1 + 38
        );


        // --------------------------------------------------------
        // EIXO Y
        // --------------------------------------------------------

        ctx.save();


        ctx.translate(
            x0 - 45,
            (y0 + y1) / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.fillText(
            "V(t), I(t)",
            0,
            0
        );


        ctx.restore();


        // ========================================================
        // LEGENDA
        // ========================================================

        const legendaX =
            x1 - 125;

        const legendaY =
            y0 + 20;


        ctx.textAlign =
            "left";


        // --------------------------------------------------------
        // V(t)
        // --------------------------------------------------------

        ctx.strokeStyle =
            this.corV;

        ctx.lineWidth = 3;


        ctx.beginPath();

        ctx.moveTo(
            legendaX,
            legendaY
        );

        ctx.lineTo(
            legendaX + 25,
            legendaY
        );

        ctx.stroke();


        ctx.fillStyle =
            this.corV;

        ctx.fillText(
            "V(t)",
            legendaX + 35,
            legendaY + 4
        );


        // --------------------------------------------------------
        // I(t)
        // --------------------------------------------------------

        ctx.strokeStyle =
            this.corI;


        ctx.beginPath();

        ctx.moveTo(
            legendaX,
            legendaY + 22
        );

        ctx.lineTo(
            legendaX + 25,
            legendaY + 22
        );

        ctx.stroke();


        ctx.fillStyle =
            this.corI;

        ctx.fillText(
            "I(t)",
            legendaX + 35,
            legendaY + 26
        );
    }


    // ============================================================
    // DESENHO COMPLETO
    // ============================================================

    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.drawGenerator();

        this.drawGraph();
    }


    // ============================================================
    // ANIMAÇÃO
    // ============================================================

    iniciar() {

        const agora =
            performance.now();


        if (
            agora -
            this.ultimoFrame >=
            this.interval
        ) {

            this.t += this.dt;

            this.draw();

            this.ultimoFrame =
                agora;
        }


        requestAnimationFrame(
            () => this.iniciar()
        );
    }


    // ============================================================
    // ATUALIZA PARÂMETROS
    // ============================================================

    atualizarParametros(
        newParams
    ) {

        this.params = {
            ...this.params,
            ...newParams
        };


        this.draw();
    }
}
