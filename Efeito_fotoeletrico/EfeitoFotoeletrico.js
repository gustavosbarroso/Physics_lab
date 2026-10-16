class EfeitoFotoeletrico {
    constructor() {
        this.sceneCanvas = document.getElementById("sceneCanvas");
        this.sceneCtx = this.sceneCanvas.getContext("2d");

        this.graphCanvas = document.getElementById("graphCanvas");
        this.graphCtx = this.graphCanvas.getContext("2d");

        // Constante de Planck em eV·s
        this.h = 4.15e-15;

        // Parâmetros iniciais
        this.frequency = 1.2e15;
        this.workFunction = 4.1;
        this.intensity = 5.0;

        // Partículas emitidas
        this.particles = [];
        this.maxParticles = 16;
        this.lastEmission = 0;

        this.running = true;

        // Elementos HTML
        this.frequencySlider = document.getElementById("frequency");
        this.workFunctionSlider = document.getElementById("workFunction");
        this.intensitySlider = document.getElementById("intensity");

        this.frequencyValue = document.getElementById("frequencyValue");
        this.workFunctionValue = document.getElementById("workFunctionValue");
        this.intensityValue = document.getElementById("intensityValue");

        this.bindControls();
        this.updateValues();

        this.animate();
    }

    // =========================================================
    // CONTROLES
    // =========================================================

    bindControls() {
        this.frequencySlider.addEventListener("input", () => {
            this.frequency =
                Number(this.frequencySlider.value) * 1e15;

            this.updateValues();
        });

        this.workFunctionSlider.addEventListener("input", () => {
            this.workFunction =
                Number(this.workFunctionSlider.value);

            this.updateValues();
        });

        this.intensitySlider.addEventListener("input", () => {
            this.intensity =
                Number(this.intensitySlider.value);

            this.updateValues();
        });
    }

    updateValues() {
        this.frequencyValue.textContent =
            (this.frequency / 1e15).toFixed(2).replace(/0$/, "");

        this.workFunctionValue.textContent =
            this.workFunction.toFixed(1);

        this.intensityValue.textContent =
            Number.isInteger(this.intensity)
                ? this.intensity.toFixed(0)
                : this.intensity.toFixed(1);

        // Evita manter partículas emitidas quando não há emissão
        if (!this.isEmissionPossible()) {
            this.particles = [];
        }
    }

    // =========================================================
    // FÍSICA DO EFEITO FOTOELÉTRICO
    // =========================================================

    getCutoffFrequency() {
        return this.workFunction / this.h;
    }

    getMaximumKineticEnergy() {
        const kineticEnergy =
            this.h * this.frequency - this.workFunction;

        return Math.max(0, kineticEnergy);
    }

    isEmissionPossible() {
        return (
            this.frequency > this.getCutoffFrequency() &&
            this.intensity > 0
        );
    }

    // =========================================================
    // ANIMAÇÃO
    // =========================================================

    animate() {
        if (!this.running) return;

        this.updateParticles();
        this.drawScene();
        this.drawGraph();

        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        if (!this.isEmissionPossible()) {
            this.particles = [];
            return;
        }

        const now = performance.now();

        // Maior intensidade: maior taxa de emissão
        const emissionInterval =
            700 / Math.max(this.intensity, 0.1);

        if (
            now - this.lastEmission > emissionInterval &&
            this.particles.length < this.maxParticles
        ) {
            this.emitParticle();
            this.lastEmission = now;
        }

        const kineticEnergy = this.getMaximumKineticEnergy();

        // A energia cinética controla a velocidade visual
        const speed =
            0.6 + 0.8 * Math.sqrt(Math.max(0, kineticEnergy));

        for (const particle of this.particles) {
            particle.x += particle.vx * speed;
            particle.y += particle.vy * speed;
            particle.life -= 1;

            // Gravidade visual suave
            particle.vy += 0.008;
        }

        this.particles = this.particles.filter(particle => {
            return (
                particle.life > 0 &&
                particle.y > 25 &&
                particle.x > 65 &&
                particle.x < 1135
            );
        });
    }

    emitParticle() {
        const metalLeft = 115;
        const metalRight = 1135;
        const metalTop = 210;

        const x =
            metalLeft +
            Math.random() * (metalRight - metalLeft);

        this.particles.push({
            x: x,
            y: metalTop - 4,
            vx: (Math.random() - 0.5) * 1.0,
            vy: -(1.2 + Math.random() * 1.2),
            life: 100 + Math.random() * 70,
            radius: 3 + Math.random() * 1.2
        });
    }

    // =========================================================
    // CENA SUPERIOR
    // =========================================================

    drawScene() {
        const ctx = this.sceneCtx;
        const width = 1200;
        const height = 420;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Título
        ctx.fillStyle = "#111111";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Efeito fotoelétrico", width / 2, 17);

        // Moldura da cena
        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 1;

        ctx.strokeRect(60, 25, 1140, 270);

        // Informações
        ctx.textAlign = "left";
        ctx.fillStyle = this.isEmissionPossible()
            ? "#087b12"
            : "#666666";

        ctx.font = "bold 15px Arial";

        ctx.fillText(
            this.isEmissionPossible()
                ? "EMISSÃO DE FOTOELÉTRONS"
                : "SEM EMISSÃO DE FOTOELÉTRONS",
            120,
            44
        );

        ctx.fillStyle = "#111111";
        ctx.font = "13px Arial";

        const frequencyText =
            this.frequency.toExponential(2);

        const cutoffText =
            this.getCutoffFrequency().toExponential(2);

        const kineticEnergy =
            this.getMaximumKineticEnergy();

        ctx.fillText(
            `f = ${frequencyText} Hz | fc = ${cutoffText} Hz | Kmax = ${kineticEnergy.toFixed(2)} eV`,
            120,
            61
        );

        // -----------------------------------------------------
        // SUPERFÍCIE METÁLICA
        // Esta região é independente do gráfico inferior.
        // -----------------------------------------------------

        const metalX = 115;
        const metalY = 210;
        const metalWidth = 1020;
        const metalHeight = 26;

        ctx.fillStyle = "#c6c6c6";
        ctx.fillRect(
            metalX,
            metalY,
            metalWidth,
            metalHeight
        );

        ctx.strokeStyle = "#707070";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            metalX,
            metalY,
            metalWidth,
            metalHeight
        );

        // Elétrons ligados no metal
        ctx.fillStyle = "#ff2020";
        ctx.strokeStyle = "#8d0000";
        ctx.lineWidth = 1.5;

        const electronCount = 10;

        for (let i = 0; i < electronCount; i++) {
            const x =
                metalX + 55 +
                i * (metalWidth - 110) / (electronCount - 1);

            const y = metalY + metalHeight / 2;

            ctx.beginPath();
            ctx.ellipse(x, y, 8, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Brilho do elétron
            ctx.fillStyle = "#ffffff";

            ctx.beginPath();
            ctx.ellipse(x - 2, y - 1, 2, 0.8, 0, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "#ff2020";
        }

        // Rótulo da superfície
        ctx.fillStyle = "#111111";
        ctx.font = "13px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Superfície metálica",
            metalX + metalWidth / 2,
            247
        );

        // -----------------------------------------------------
        // LUZ INCIDENTE
        // -----------------------------------------------------

        const lightStartX = 925;
        const lightStartY = 85;

        const lightEndX = 810;
        const lightEndY = metalY - 5;

        ctx.strokeStyle = "#ff8000";
        ctx.fillStyle = "#ff8000";
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        ctx.moveTo(lightStartX, lightStartY);
        ctx.lineTo(lightEndX, lightEndY);
        ctx.stroke();

        // Ponta da seta
        const angle = Math.atan2(
            lightEndY - lightStartY,
            lightEndX - lightStartX
        );

        const arrowLength = 12;

        ctx.beginPath();

        ctx.moveTo(lightEndX, lightEndY);

        ctx.lineTo(
            lightEndX - arrowLength * Math.cos(angle - Math.PI / 6),
            lightEndY - arrowLength * Math.sin(angle - Math.PI / 6)
        );

        ctx.lineTo(
            lightEndX - arrowLength * Math.cos(angle + Math.PI / 6),
            lightEndY - arrowLength * Math.sin(angle + Math.PI / 6)
        );

        ctx.closePath();
        ctx.fill();

        ctx.font = "14px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            "Luz incidente",
            lightStartX + 20,
            lightStartY - 5
        );

        // -----------------------------------------------------
        // FOTOELÉTRONS EMITIDOS
        // -----------------------------------------------------

        if (this.isEmissionPossible()) {
            for (const particle of this.particles) {
                ctx.beginPath();

                ctx.fillStyle = "#ff2020";
                ctx.strokeStyle = "#8d0000";
                ctx.lineWidth = 1;

                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    2 * Math.PI
                );

                ctx.fill();
                ctx.stroke();

                // Brilho
                ctx.beginPath();

                ctx.fillStyle = "#ffffff";

                ctx.arc(
                    particle.x - 1,
                    particle.y - 1,
                    1.2,
                    0,
                    2 * Math.PI
                );

                ctx.fill();
            }
        }
    }

    // =========================================================
    // GRÁFICO Kmax × FREQUÊNCIA
    // =========================================================

    drawGraph() {
        const ctx = this.graphCtx;

        const width = 1200;
        const height = 155;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Área do gráfico
        const left = 90;
        const right = 1165;
        const top = 8;
        const bottom = 96;

        const plotWidth = right - left;
        const plotHeight = bottom - top;

        const fMin = 0;
        const fMax = 2.5e15;

        const kMin = 0;
        const kMax = 7;

        const mapX = f => {
            return left +
                (f - fMin) / (fMax - fMin) * plotWidth;
        };

        const mapY = k => {
            return bottom -
                (k - kMin) / (kMax - kMin) * plotHeight;
        };

        // Moldura
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            left,
            top,
            plotWidth,
            plotHeight
        );

        // Linhas horizontais e marcações do eixo y
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        for (let k = 0; k <= 7; k += 2.5) {
            const y = mapY(k);

            ctx.strokeStyle = "#dddddd";
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();

            ctx.fillStyle = "#111111";

            ctx.fillText(
                k.toFixed(1),
                left - 10,
                y
            );
        }

        // Marcações do eixo x
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (let f = 0; f <= 2.5; f += 0.5) {
            const x = mapX(f * 1e15);

            ctx.strokeStyle = "#dddddd";
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            ctx.fillStyle = "#111111";

            ctx.fillText(
                f.toFixed(1),
                x,
                bottom + 5
            );
        }

        // -----------------------------------------------------
        // CURVA TEÓRICA
        // Kmax = hf - phi, para f > fc
        // -----------------------------------------------------

        ctx.save();

        ctx.beginPath();
        ctx.rect(left, top, plotWidth, plotHeight);
        ctx.clip();

        ctx.strokeStyle = "#287db5";
        ctx.lineWidth = 2.5;

        ctx.beginPath();

        for (let i = 0; i <= 500; i++) {
            const f = fMin +
                (fMax - fMin) * i / 500;

            const energy = Math.max(
                0,
                this.h * f - this.workFunction
            );

            const x = mapX(f);
            const y = mapY(energy);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Frequência de corte
        const cutoff = this.getCutoffFrequency();
        const cutoffX = mapX(cutoff);

        ctx.strokeStyle = "#ff2020";
        ctx.lineWidth = 1.7;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(cutoffX, top);
        ctx.lineTo(cutoffX, bottom);
        ctx.stroke();

        ctx.setLineDash([]);

        ctx.restore();

        // -----------------------------------------------------
        // LEGENDA
        // -----------------------------------------------------

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;

        ctx.fillRect(98, 13, 172, 39);
        ctx.strokeRect(98, 13, 172, 39);

        // Linha azul
        ctx.strokeStyle = "#287db5";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(105, 25);
        ctx.lineTo(132, 25);
        ctx.stroke();

        ctx.fillStyle = "#111111";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "Kmax = hf − φ",
            140,
            25
        );

        // Linha vermelha tracejada
        ctx.strokeStyle = "#ff2020";
        ctx.lineWidth = 1.7;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(105, 40);
        ctx.lineTo(132, 40);
        ctx.stroke();

        ctx.setLineDash([]);

        ctx.fillStyle = "#111111";

        ctx.fillText(
            "Frequência de corte",
            140,
            40
        );

        // Título do eixo y
        ctx.save();

        ctx.translate(25, (top + bottom) / 2);
        ctx.rotate(-Math.PI / 2);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "12px Arial";
        ctx.fillStyle = "#111111";

        ctx.fillText(
            "Kmax (eV)",
            0,
            0
        );

        ctx.restore();

        // Título do eixo x
        ctx.fillStyle = "#111111";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "Frequência (Hz)",
            (left + right) / 2,
            139
        );

        // Notação científica
        ctx.font = "11px Arial";
        ctx.textAlign = "right";

        ctx.fillText(
            "×10¹⁵",
            right,
            114
        );
    }
}

// =============================================================
// INICIALIZAÇÃO
// =============================================================

window.addEventListener("DOMContentLoaded", () => {
    new EfeitoFotoeletrico();
});
