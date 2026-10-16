// ============================================================
// SIMULAÇÃO DO EFEITO FOTOELÉTRICO
// Proporção inspirada na implementação original em Matplotlib
// ============================================================

class EfeitoFotoeletrico {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // Parâmetros
        this.params = {
            frequencia: options.frequencia ?? 1.2,
            phi: options.phi ?? 4.1,
            intensidade: options.intensidade ?? 5.0
        };

        // Constante de Planck
        this.h = 4.15e-15; // eV s

        // Proporções da figura original: [3.2, 1.2]
        this.sceneRatio = 3.2;
        this.graphRatio = 1.2;
        this.totalRatio = this.sceneRatio + this.graphRatio;

        // Região superior destinada à cena física
        this.sceneHeight =
            this.canvas.height * this.sceneRatio / this.totalRatio;

        // Elétrons
        this.N_METAL = 9;
        this.N = 16;

        // Estado temporal
        this.tempo = 0;
        this.ultimaEmissao = 0;
        this.indice = 0;

        this.ultimoFrame = 0;
        this.interval = 40;
        this.dt = 0.04;

        this.paused = false;

        // Partículas
        this.particulas = Array.from(
            { length: this.N },
            () => ({
                ativa: false,
                x0: 0,
                y0: 1.28,
                vx: 0,
                vy: 0,
                nascimento: 0,
                vida: 0
            })
        );

        this.createControls();
        this.draw();
        this.iniciar();
    }

    // ========================================================
    // ENERGIA CINÉTICA MÁXIMA
    // ========================================================

    energiaCinetica(f, phi) {

        const fc = phi / this.h;

        if (f <= fc) {
            return 0;
        }

        return this.h * f - phi;
    }

    // ========================================================
    // NÚMEROS ALEATÓRIOS
    // ========================================================

    random(min, max) {
        return min + Math.random() * (max - min);
    }

    // ========================================================
    // CONVERSÃO DE COORDENADAS
    // ========================================================

    px(x) {

        return x * this.canvas.width / 10;
    }

    py(y) {

        // ATENÇÃO:
        // A transformação vertical usa somente a altura da cena.
        // O gráfico de energia ocupa uma região separada abaixo.

        return this.sceneHeight
            - y * this.sceneHeight / 6;
    }

    // ========================================================
    // CONTROLES
    // ========================================================

    createControls() {

        this.controlsContainer =
            document.createElement("div");

        this.controlsContainer.className =
            "foto-controls";

        this.controlsContainer.innerHTML = `

            <h2>Efeito fotoelétrico</h2>

            <div class="control">
                <label>
                    <span class="control-label">
                        Frequência (10¹⁵ Hz)
                    </span>

                    <input
                        type="range"
                        id="foto-f"
                        min="0"
                        max="2.5"
                        step="0.01"
                        value="${this.params.frequencia}"
                    >

                    <span id="foto-f-value">
                        ${this.params.frequencia.toFixed(2)}
                    </span>
                </label>
            </div>

            <div class="control">
                <label>
                    <span class="control-label">
                        Função trabalho (eV)
                    </span>

                    <input
                        type="range"
                        id="foto-phi"
                        min="1"
                        max="6"
                        step="0.05"
                        value="${this.params.phi}"
                    >

                    <span id="foto-phi-value">
                        ${this.params.phi.toFixed(2)}
                    </span>
                </label>
            </div>

            <div class="control">
                <label>
                    <span class="control-label">
                        Intensidade relativa
                    </span>

                    <input
                        type="range"
                        id="foto-I"
                        min="0"
                        max="10"
                        step="0.1"
                        value="${this.params.intensidade}"
                    >

                    <span id="foto-I-value">
                        ${this.params.intensidade.toFixed(1)}
                    </span>
                </label>
            </div>

            <div class="actions">
                <button type="button" id="foto-pause">
                    Pausar animação
                </button>

                <button type="button" id="foto-reset">
                    Reiniciar partículas
                </button>
            </div>

            <p class="hint">
                A frequência e a função trabalho determinam
                se há emissão. A intensidade altera a taxa
                visual de emissão, não a energia cinética
                máxima. As velocidades das partículas são
                ilustrativas e não estão em escala física.
            </p>
        `;

        this.canvas.insertAdjacentElement(
            "afterend",
            this.controlsContainer
        );

        // Sliders
        const bindSlider = (id, key, format) => {

            const input =
                this.controlsContainer.querySelector(`#${id}`);

            const output =
                this.controlsContainer.querySelector(`#${id}-value`);

            input.addEventListener("input", () => {

                this.params[key] = Number(input.value);

                output.textContent =
                    format(this.params[key]);

                this.draw();
            });
        };

        bindSlider(
            "foto-f",
            "frequencia",
            v => v.toFixed(2)
        );

        bindSlider(
            "foto-phi",
            "phi",
            v => v.toFixed(2)
        );

        bindSlider(
            "foto-I",
            "intensidade",
            v => v.toFixed(1)
        );

        // Pausar e retomar
        this.controlsContainer
            .querySelector("#foto-pause")
            .addEventListener("click", event => {

                this.paused = !this.paused;

                event.currentTarget.textContent =
                    this.paused
                        ? "Retomar animação"
                        : "Pausar animação";
            });

        // Reiniciar partículas
        this.controlsContainer
            .querySelector("#foto-reset")
            .addEventListener("click", () => {

                this.particulas.forEach(
                    p => p.ativa = false
                );

                this.tempo = 0;
                this.ultimaEmissao = 0;

                this.draw();
            });
    }

    // ========================================================
    // TEXTO
    // ========================================================

    drawText(text, x, y, options = {}) {

        const ctx = this.ctx;

        ctx.save();

        ctx.fillStyle = options.color ?? "#222";
        ctx.font = options.font ?? "14px Arial";
        ctx.textAlign = options.align ?? "left";
        ctx.textBaseline = options.baseline ?? "alphabetic";

        ctx.fillText(text, x, y);

        ctx.restore();
    }

    // ========================================================
    // SETA DA LUZ INCIDENTE
    // ========================================================

    drawArrow(x1, y1, x2, y2, color) {

        const ctx = this.ctx;

        const a = {
            x: this.px(x1),
            y: this.py(y1)
        };

        const b = {
            x: this.px(x2),
            y: this.py(y2)
        };

        const angle = Math.atan2(
            b.y - a.y,
            b.x - a.x
        );

        ctx.save();

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const head = 12;

        ctx.beginPath();
        ctx.moveTo(b.x, b.y);

        ctx.lineTo(
            b.x - head * Math.cos(angle - Math.PI / 6),
            b.y - head * Math.sin(angle - Math.PI / 6)
        );

        ctx.lineTo(
            b.x - head * Math.cos(angle + Math.PI / 6),
            b.y - head * Math.sin(angle + Math.PI / 6)
        );

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // ========================================================
    // DESENHO DOS ELÉTRONS
    // ========================================================

    drawElectron(x, y, radius) {

        const ctx = this.ctx;

        const cx = this.px(x);
        const cy = this.py(y);

        const r = radius * this.canvas.width / 10;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            r,
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "red";
        ctx.fill();

        ctx.strokeStyle = "darkred";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "white";

        ctx.font =
            `bold ${Math.max(10, r * 1.5)}px Arial`;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("−", cx, cy + 0.5);
    }

    // ========================================================
    // CENA FÍSICA
    // ========================================================

    drawScene() {

        const ctx = this.ctx;
        const w = this.canvas.width;

        // Limpa somente a região da cena superior
        ctx.clearRect(0, 0, w, this.sceneHeight);

        ctx.save();

        // Impede a cena de desenhar sobre o gráfico
        ctx.beginPath();
        ctx.rect(0, 0, w, this.sceneHeight);
        ctx.clip();

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, this.sceneHeight);

        // Título
        this.drawText(
            "Efeito fotoelétrico",
            w / 2,
            this.py(5.60),
            {
                font: "bold 20px Arial",
                align: "center"
            }
        );

        // Superfície metálica
        const metalX = this.px(0.5);
        const metalY = this.py(1.2);

        const metalW =
            this.px(9.5) - this.px(0.5);

        const metalH =
            this.py(0.55) - this.py(1.2);

        ctx.fillStyle = "silver";
        ctx.strokeStyle = "dimgray";
        ctx.lineWidth = 2;

        ctx.fillRect(
            metalX,
            metalY,
            metalW,
            metalH
        );

        ctx.strokeRect(
            metalX,
            metalY,
            metalW,
            metalH
        );

        this.drawText(
            "Superfície metálica",
            this.px(5),
            this.py(0.28),
            { align: "center" }
        );

        // Elétrons no metal
        for (let i = 0; i < this.N_METAL; i++) {

            const x = 1 + i;

            this.drawElectron(
                x,
                0.88,
                0.075
            );
        }

        // Luz incidente
        this.drawArrow(
            7.6,
            4.7,
            6.5,
            1.35,
            "darkorange"
        );

        this.drawText(
            "Luz incidente",
            this.px(7.8),
            this.py(4.8),
            {
                color: "darkorange",
                font: "bold 14px Arial"
            }
        );

        // Estado físico
        const f = this.params.frequencia * 1e15;
        const phi = this.params.phi;
        const intensidade = this.params.intensidade;

        const fc = phi / this.h;
        const Kmax = this.energiaCinetica(f, phi);

        const emissao =
            f > fc &&
            Kmax > 0 &&
            intensidade > 0;

        this.drawText(
            emissao
                ? "EMISSÃO DE FOTOELÉTRONS"
                : "SEM EMISSÃO DE FOTOELÉTRONS",
            this.px(0.55),
            this.py(5.55),
            {
                color: emissao ? "darkgreen" : "firebrick",
                font: "bold 15px Arial"
            }
        );

        this.drawText(
            `f = ${f.toExponential(2)} Hz | ` +
            `fc = ${fc.toExponential(2)} Hz | ` +
            `Kmax = ${Kmax.toFixed(2)} eV`,
            this.px(0.55),
            this.py(5.15),
            { font: "12px Arial" }
        );

        // Fotoelétrons ejetados
        for (const p of this.particulas) {

            if (!p.ativa) continue;

            const idade = this.tempo - p.nascimento;

            if (idade > p.vida) continue;

            const x = p.x0 + p.vx * idade;
            const y = p.y0 + p.vy * idade;

            if (
                x >= 0.2 &&
                y >= 1.2 &&
                y <= 5.8
            ) {
                this.drawElectron(x, y, 0.13);
            }
        }

        ctx.restore();
    }

    // ========================================================
    // GRÁFICO DA ENERGIA CINÉTICA
    // ========================================================

    drawEnergyGraph(phi, fc, f, Kmax) {

        const ctx = this.ctx;

        // O gráfico começa abaixo da região física.
        const gx = 80;
        const gy = this.sceneHeight + 18;
        const gw = this.canvas.width - 140;
        const gh = 145;

        ctx.save();

        // Fundo branco independente
        ctx.fillStyle = "white";
        ctx.fillRect(
            gx - 2,
            gy - 16,
            gw + 4,
            gh + 55
        );

        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(gx, gy, gw, gh);

        const xMax = 2.5e15;
        const yMax = 7;

        const X = value =>
            gx + value / xMax * gw;

        const Y = value =>
            gy + gh - value / yMax * gh;

        // Grade horizontal
        ctx.strokeStyle = "rgba(0,0,0,0.13)";
        ctx.lineWidth = 1;

        for (let k = 0; k <= 7; k++) {

            ctx.beginPath();
            ctx.moveTo(gx, Y(k));
            ctx.lineTo(gx + gw, Y(k));
            ctx.stroke();

            this.drawText(
                String(k),
                gx - 10,
                Y(k) + 4,
                {
                    font: "10px Arial",
                    align: "right",
                    color: "#555"
                }
            );
        }

        // Grade vertical
        for (let k = 0; k <= 2.5; k += 0.5) {

            const x = X(k * 1e15);

            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x, gy + gh);
            ctx.stroke();

            this.drawText(
                k.toFixed(1),
                x,
                gy + gh + 14,
                {
                    font: "10px Arial",
                    align: "center",
                    color: "#555"
                }
            );
        }

        // ====================================================
        // ALTERAÇÃO: recorta a curva e os elementos internos
        // para que não ultrapassem os limites da malha.
        // Isso reproduz o recorte automático dos eixos
        // utilizado pelo Matplotlib.
        // ====================================================

        ctx.save();

        ctx.beginPath();
        ctx.rect(gx, gy, gw, gh);
        ctx.clip();

        // Curva Kmax = max(hf - phi, 0)
        ctx.beginPath();

        for (let i = 0; i <= 500; i++) {

            const freq = xMax * i / 500;

            const energy = Math.max(
                this.h * freq - phi,
                0
            );

            if (i === 0) {
                ctx.moveTo(X(freq), Y(energy));
            } else {
                ctx.lineTo(X(freq), Y(energy));
            }
        }

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Frequência de corte
        ctx.save();

        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = "red";

        ctx.beginPath();
        ctx.moveTo(X(fc), gy);
        ctx.lineTo(X(fc), gy + gh);
        ctx.stroke();

        ctx.restore();

        // Ponto da frequência selecionada
        if (f >= 0 && f <= xMax) {

            ctx.beginPath();

            ctx.arc(
                X(f),
                Y(Kmax),
                5,
                0,
                2 * Math.PI
            );

            ctx.fillStyle = "#ef6c00";
            ctx.fill();
        }

        // ALTERAÇÃO: encerra o recorte antes de desenhar
        // os eixos, títulos e a legenda.
        ctx.restore();

        // Eixos
        ctx.strokeStyle = "#555";

        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + gh);
        ctx.lineTo(gx + gw, gy + gh);
        ctx.stroke();

        // Títulos dos eixos
        this.drawText(
            "Kmax (eV)",
            gx - 42,
            gy + gh / 2,
            {
                font: "12px Arial",
                align: "center"
            }
        );

        this.drawText(
            "Frequência (Hz)",
            gx + gw / 2,
            gy + gh + 35,
            {
                font: "12px Arial",
                align: "center"
            }
        );

        // Notação científica do eixo x
        this.drawText(
            "×10¹⁵",
            gx + gw + 35,
            gy + gh + 14,
            {
                font: "11px Arial",
                align: "right"
            }
        );

        // Legenda
        const lx = gx + 8;
        const ly = gy + 8;

        ctx.fillStyle = "white";
        ctx.strokeStyle = "#ccc";

        ctx.fillRect(lx, ly, 178, 40);
        ctx.strokeRect(lx, ly, 178, 40);

        ctx.strokeStyle = "#1976d2";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(lx + 8, ly + 12);
        ctx.lineTo(lx + 32, ly + 12);
        ctx.stroke();

        this.drawText(
            "Kmax = hf − φ",
            lx + 39,
            ly + 16,
            { font: "12px Arial" }
        );

        ctx.strokeStyle = "red";
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(lx + 8, ly + 29);
        ctx.lineTo(lx + 32, ly + 29);
        ctx.stroke();

        ctx.setLineDash([]);

        this.drawText(
            "Frequência de corte",
            lx + 39,
            ly + 33,
            { font: "12px Arial" }
        );

        ctx.restore();
    }

    // ========================================================
    // ATUALIZAÇÃO DAS PARTÍCULAS
    // ========================================================

    atualizarParticulas() {

        const f = this.params.frequencia * 1e15;
        const phi = this.params.phi;
        const intensidade = this.params.intensidade;

        const fc = phi / this.h;
        const Kmax = this.energiaCinetica(f, phi);

        const emissao =
            f > fc &&
            Kmax > 0 &&
            intensidade > 0;

        if (!emissao) {

            this.particulas.forEach(
                p => p.ativa = false
            );

            return;
        }

        const taxa = intensidade * 0.22;

        if (
            this.tempo - this.ultimaEmissao >=
            1 / Math.max(taxa, 0.05)
        ) {

            const p = this.particulas[this.indice];

            p.ativa = true;
            p.x0 = this.random(5.7, 6.8);
            p.y0 = 1.28;

            // Direção para cima e para a esquerda
            const angulo = this.random(
                115 * Math.PI / 180,
                155 * Math.PI / 180
            );

            // Velocidade visual ilustrativa
            const velocidade =
                0.45 + 0.38 * Math.sqrt(Kmax);

            p.vx = velocidade * Math.cos(angulo);
            p.vy = velocidade * Math.sin(angulo);

            p.nascimento = this.tempo;
            p.vida = this.random(2.2, 3.6);

            this.indice = (this.indice + 1) % this.N;
            this.ultimaEmissao = this.tempo;
        }

        // Movimento retilíneo uniforme
        for (const p of this.particulas) {

            if (!p.ativa) continue;

            const idade = this.tempo - p.nascimento;

            const x = p.x0 + p.vx * idade;
            const y = p.y0 + p.vy * idade;

            if (
                idade > p.vida ||
                x < 0.2 ||
                y < 1.2 ||
                y > 5.8
            ) {
                p.ativa = false;
            }
        }
    }

    // ========================================================
    // DESENHO PRINCIPAL
    // ========================================================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Desenha primeiro a cena superior
        this.drawScene();

        // Depois desenha o gráfico na região inferior
        const f = this.params.frequencia * 1e15;
        const phi = this.params.phi;

        const fc = phi / this.h;
        const Kmax = this.energiaCinetica(f, phi);

        this.drawEnergyGraph(phi, fc, f, Kmax);
    }

    // ========================================================
    // ANIMAÇÃO
    // ========================================================

    iniciar() {

        const animar = timestamp => {

            if (this.ultimoFrame === 0) {
                this.ultimoFrame = timestamp;
            }

            const decorrido = timestamp - this.ultimoFrame;

            if (decorrido >= this.interval) {

                if (!this.paused) {
                    this.tempo += this.dt;
                    this.atualizarParticulas();
                }

                this.draw();

                this.ultimoFrame =
                    timestamp - (decorrido % this.interval);
            }

            this.frame = requestAnimationFrame(animar);
        };

        this.frame = requestAnimationFrame(animar);
    }

    // ========================================================
    // ATUALIZAR PARÂMETROS EXTERNAMENTE
    // ========================================================

    atualizarParametros(newParams) {

        this.params = {
            ...this.params,
            ...newParams
        };

        this.draw();
    }
}

