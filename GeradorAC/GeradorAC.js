class GeradorAC {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // ============================================================
        // PARÂMETROS
        // ============================================================

        this.params = {
            N: options.N ?? 100,
            A: options.A ?? 2.0,
            B: options.B ?? 0.5,
            w: options.w ?? 10,
            R: options.R ?? 10
        };

        // ============================================================
        // ANIMAÇÃO
        // ============================================================

        this.t = 0;
        this.dt = 0.02;
        this.interval = 20;
        this.ultimoFrame = 0;

        // ============================================================
        // CORES DO GRÁFICO
        // ============================================================

        this.corV = "#1f77b4";
        this.corI = "#ff7f0e";

        // ============================================================
        // CONTROLES
        // ============================================================

        this.createControls();

        // ============================================================
        // INICIA
        // ============================================================

        this.iniciar();
    }


    // ============================================================
    // TENSÃO INDUZIDA
    // ============================================================

    ddp(N, A, B, w, t) {

        return N * A * B * Math.sin(w * t);
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

        const controls = document.getElementById("controls");

        controls.innerHTML = "";

        this.controles = {};

        const criarControle = (
            nome,
            texto,
            min,
            max,
            passo,
            valor
        ) => {

            const div = document.createElement("div");
            div.className = "control";

            const label = document.createElement("label");
            label.textContent = texto;

            const input = document.createElement("input");

            input.type = "range";
            input.min = min;
            input.max = max;
            input.step = passo;
            input.value = valor;

            const span = document.createElement("span");
            span.textContent = valor;

            input.addEventListener("input", () => {

                const novoValor = Number(input.value);

                this.params[nome] = novoValor;

                span.textContent = novoValor;

                this.atualizarParametros();
            });

            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(span);

            controls.appendChild(div);

            this.controles[nome] = input;
        };


        // ========================================================
        // SLIDER N
        // ========================================================

        criarControle(
            "N",
            "N",
            1,
            500,
            1,
            this.params.N
        );


        // ========================================================
        // SLIDER A
        // ========================================================

        criarControle(
            "A",
            "A",
            0.1,
            5,
            0.1,
            this.params.A
        );


        // ========================================================
        // SLIDER B
        // ========================================================

        criarControle(
            "B",
            "B",
            -2,
            2,
            0.1,
            this.params.B
        );


        // ========================================================
        // SLIDER ω
        // ========================================================

        criarControle(
            "w",
            "ω (rad/s)",
            0,
            20,
            0.1,
            this.params.w
        );


        // ========================================================
        // SLIDER R
        // ========================================================

        criarControle(
            "R",
            "R (Ω)",
            1,
            100,
            1,
            this.params.R
        );
    }


    // ============================================================
    // DESENHA GERADOR
    // ============================================================

    drawGenerator() {

        const ctx = this.ctx;

        const centroX = 330;
        const centroY = 175;

        const escala = 65;

        // ========================================================
        // ÍMÃ ESQUERDO
        // ========================================================

        ctx.fillStyle = "blue";

        ctx.fillRect(
            centroX - 175,
            centroY - 130,
            26,
            260
        );

        ctx.fillStyle = "red";

        ctx.fillRect(
            centroX - 149,
            centroY - 130,
            26,
            260
        );

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "S",
            centroX - 162,
            centroY
        );

        ctx.fillText(
            "N",
            centroX - 136,
            centroY
        );


        // ========================================================
        // ÍMÃ DIREITO
        // ========================================================

        ctx.fillStyle = "blue";

        ctx.fillRect(
            centroX + 124,
            centroY - 130,
            26,
            260
        );

        ctx.fillStyle = "red";

        ctx.fillRect(
            centroX + 150,
            centroY - 130,
            26,
            260
        );

        ctx.fillStyle = "white";

        ctx.fillText(
            "S",
            centroX + 137,
            centroY
        );

        ctx.fillText(
            "N",
            centroX + 163,
            centroY
        );


        // ========================================================
        // CAMPO MAGNÉTICO
        // ========================================================

        const sentido =
            this.params.B >= 0 ? 1 : -1;

        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 5; i++) {

            const y =
                centroY - 98 + i * 49;

            const x1 =
                sentido === 1
                    ? centroX - 110
                    : centroX + 110;

            const x2 =
                sentido === 1
                    ? centroX + 85
                    : centroX - 85;

            ctx.beginPath();

            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);

            ctx.stroke();

            const tamanho = 9;

            ctx.beginPath();

            if (sentido === 1) {

                ctx.moveTo(x2, y);

                ctx.lineTo(
                    x2 - tamanho,
                    y - tamanho / 2
                );

                ctx.lineTo(
                    x2 - tamanho,
                    y + tamanho / 2
                );

            } else {

                ctx.moveTo(x2, y);

                ctx.lineTo(
                    x2 + tamanho,
                    y - tamanho / 2
                );

                ctx.lineTo(
                    x2 + tamanho,
                    y + tamanho / 2
                );
            }

            ctx.closePath();

            ctx.fill();
        }


        // ========================================================
        // BOBINA RETANGULAR
        // ========================================================

        const angulo =
            this.params.w * this.t;

        const larguraBobina =
            1.5 * Math.cos(angulo);

        const alturaBobina = 1.2;

        const esquerda =
            centroX - larguraBobina * escala;

        const direita =
            centroX + larguraBobina * escala;

        const topo =
            centroY - alturaBobina * escala;

        const baixo =
            centroY + alturaBobina * escala;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(esquerda, baixo);
        ctx.lineTo(direita, baixo);
        ctx.lineTo(direita, topo);
        ctx.lineTo(esquerda, topo);
        ctx.closePath();

        ctx.stroke();


        // ========================================================
        // EIXO / FIO ÚNICO
        // ========================================================

        ctx.beginPath();

        ctx.moveTo(
            centroX,
            centroY + 1.7 * escala
        );

        ctx.lineTo(
            centroX,
            topo
        );

        ctx.stroke();


        // ========================================================
        // LÂMPADA
        // ========================================================

        const V = this.ddp(
            this.params.N,
            this.params.A,
            this.params.B,
            this.params.w,
            this.t
        );

        const VmaxLampada = Math.abs(
            this.params.N *
            this.params.A *
            this.params.B *
            this.params.w
        );

        let brilho = 0;

        if (VmaxLampada > 0) {

            brilho = Math.min(
                Math.abs(V) / VmaxLampada,
                1
            );
        }

        const r =
            0.35 + 0.65 * brilho;

        const g =
            0.35 + 0.65 * brilho;

        const b =
            0.35 * (1 - brilho);

        ctx.fillStyle =
            `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            centroX,
            centroY + 1.7 * escala,
            0.35 * escala,
            0,
            2 * Math.PI
        );

        ctx.fill();
        ctx.stroke();


        // ========================================================
        // TEXTO LÂMPADA
        // ========================================================

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Lâmpada",
            centroX,
            centroY + 2.35 * escala
        );


        // ========================================================
        // TÍTULO
        // ========================================================

        ctx.font = "bold 18px Arial";

        ctx.fillText(
            "Gerador AC",
            centroX,
            25
        );
    }


    // ============================================================
    // DESENHA GRÁFICO
    // ============================================================

    drawGraph() {

        const ctx = this.ctx;

        const x0 = 620;
        const y0 = 45;

        const largura = 500;
        const altura = 235;

        // ========================================================
        // ÁREA DO GRÁFICO
        // ========================================================

        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            x0,
            y0,
            largura,
            altura
        );


        // ========================================================
        // DADOS
        // ========================================================

        const N = this.params.N;
        const A = this.params.A;
        const B = this.params.B;
        const w = this.params.w;
        const R = this.params.R;

        const Vmax = Math.abs(
            N * A * B
        );

        const Imax = Math.abs(
            R === 0
                ? 0
                : N * A * B / R
        );

        let ymax =
            Math.max(
                Vmax,
                Imax
            );

        if (ymax === 0) {
            ymax = 1;
        }

        ymax *= 1.1;


        // ========================================================
        // EIXOS
        // ========================================================

        const eixoX =
            y0 + altura / 2;

        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
            x0,
            eixoX
        );

        ctx.lineTo(
            x0 + largura,
            eixoX
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x0,
            y0 + altura
        );

        ctx.stroke();


        // ========================================================
        // GRADE
        // ========================================================

        ctx.strokeStyle = "#dddddd";

        for (let i = 1; i < 5; i++) {

            const xx =
                x0 + largura * i / 5;

            ctx.beginPath();

            ctx.moveTo(
                xx,
                y0
            );

            ctx.lineTo(
                xx,
                y0 + altura
            );

            ctx.stroke();
        }

        for (let i = 1; i < 5; i++) {

            const yy =
                y0 + altura * i / 5;

            ctx.beginPath();

            ctx.moveTo(
                x0,
                yy
            );

            ctx.lineTo(
                x0 + largura,
                yy
            );

            ctx.stroke();
        }


        // ========================================================
        // COORDENADAS
        // ========================================================

        const converterX = (tempo) => {

            return x0 +
                (tempo / 2) *
                largura;
        };


        const converterY = (valor) => {

            return eixoX -
                (valor / ymax) *
                (altura / 2);
        };


        // ========================================================
        // CURVA V(t)
        // ========================================================

        ctx.strokeStyle = this.corV;
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (let i = 0; i <= 500; i++) {

            const tempo =
                2 * i / 500;

            const V =
                this.ddp(
                    N,
                    A,
                    B,
                    w,
                    tempo
                );

            const px =
                converterX(tempo);

            const py =
                converterY(V);

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.stroke();


        // ========================================================
        // CURVA I(t)
        // ========================================================

        ctx.strokeStyle = this.corI;
        ctx.lineWidth = 2;

        ctx.beginPath();

        for (let i = 0; i <= 500; i++) {

            const tempo =
                2 * i / 500;

            const V =
                this.ddp(
                    N,
                    A,
                    B,
                    w,
                    tempo
                );

            const corrente =
                this.corrente(
                    V,
                    R
                );

            const px =
                converterX(tempo);

            const py =
                converterY(corrente);

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.stroke();


        // ========================================================
        // PONTO INSTANTÂNEO
        // ========================================================

        const tempo =
            Math.min(
                this.t,
                2
            );

        const V =
            this.ddp(
                N,
                A,
                B,
                w,
                tempo
            );

        const corrente =
            this.corrente(
                V,
                R
            );

        const px =
            converterX(tempo);


        // ========================================================
        // PONTO V(t)
        // ========================================================

        const pyV =
            converterY(V);

        ctx.fillStyle = this.corV;

        ctx.beginPath();

        ctx.arc(
            px,
            pyV,
            5,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ========================================================
        // PONTO I(t)
        // ========================================================

        const pyI =
            converterY(corrente);

        ctx.fillStyle = this.corI;

        ctx.beginPath();

        ctx.arc(
            px,
            pyI,
            5,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ========================================================
        // LINHA DO TEMPO
        // ========================================================

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.6)";

        ctx.lineWidth = 1;

        ctx.setLineDash([6, 5]);

        ctx.beginPath();

        ctx.moveTo(
            px,
            y0
        );

        ctx.lineTo(
            px,
            y0 + altura
        );

        ctx.stroke();

        ctx.setLineDash([]);


        // ========================================================
        // LEGENDA
        // ========================================================

        ctx.font = "14px Arial";
        ctx.textAlign = "left";

        ctx.fillStyle = this.corV;

        ctx.fillText(
            "V(t)",
            x0 + 15,
            y0 + 22
        );

        ctx.fillStyle = this.corI;

        ctx.fillText(
            "I(t)",
            x0 + 65,
            y0 + 22
        );


        // ========================================================
        // TÍTULO
        // ========================================================

        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC - Tensão e Corrente x Tempo",
            x0 + largura / 2,
            y0 - 15
        );


        // ========================================================
        // EIXO X
        // ========================================================

        ctx.font = "12px Arial";

        ctx.fillText(
            "0",
            x0,
            y0 + altura + 18
        );

        ctx.fillText(
            "0.5",
            x0 + largura * 0.25,
            y0 + altura + 18
        );

        ctx.fillText(
            "1.0",
            x0 + largura * 0.5,
            y0 + altura + 18
        );

        ctx.fillText(
            "1.5",
            x0 + largura * 0.75,
            y0 + altura + 18
        );

        ctx.fillText(
            "2.0",
            x0 + largura,
            y0 + altura + 18
        );


        // ========================================================
        // EIXO Y
        // ========================================================

        ctx.textAlign = "right";

        ctx.fillText(
            ymax.toFixed(0),
            x0 - 8,
            y0 + 5
        );

        ctx.fillText(
            "0",
            x0 - 8,
            eixoX + 4
        );

        ctx.fillText(
            (-ymax).toFixed(0),
            x0 - 8,
            y0 + altura
        );


        // ========================================================
        // LABEL DOS EIXOS
        // ========================================================

        ctx.textAlign = "center";

        ctx.fillText(
            "Tempo (s)",
            x0 + largura / 2,
            y0 + altura + 38
        );

        ctx.save();

        ctx.translate(
            x0 - 42,
            y0 + altura / 2
        );

        ctx.rotate(-Math.PI / 2);

        ctx.fillText(
            "V(t), I(t)",
            0,
            0
        );

        ctx.restore();
    }


    // ============================================================
    // ATUALIZA PARÂMETROS
    // ============================================================

    atualizarParametros() {

        this.draw();
    }


    // ============================================================
    // DESENHA TUDO
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

        const animar = (timestamp) => {

            if (!this.ultimoFrame) {
                this.ultimoFrame = timestamp;
            }

            const diferenca =
                timestamp -
                this.ultimoFrame;

            if (diferenca >= this.interval) {

                this.t += this.dt;

                // ==================================================
                // REINICIA COMO FuncAnimation(frames=100)
                // ==================================================

                if (this.t >= 2) {
                    this.t = 0;
                }

                this.ultimoFrame = timestamp;
            }

            this.draw();

            requestAnimationFrame(animar);
        };

        requestAnimationFrame(animar);
    }
}
