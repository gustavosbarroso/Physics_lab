// ============================================================
// GERADOR AC
// ============================================================

class GeradorAC {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            N: 100,
            A: 2.0,
            B: 0.5,
            w: 10,
            R: 10,

            ...options

        };

        // =====================================================
        // DADOS
        // =====================================================

        this.time = [];
        this.voltage = [];
        this.current = [];

        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;

        this.animationSpeed = 1;

        // =====================================================
        // TEMPO
        //
        // Python:
        //
        // t = np.linspace(0, 10, 1000)
        // =====================================================

        this.t0 = 0;
        this.tf = 10;
        this.Ntime = 1000;

        // =====================================================
        // FRAMES DA ANIMAÇÃO
        //
        // Python:
        //
        // frames=100
        // interval=20
        //
        // tempo = frame * 0.02
        // =====================================================

        this.animationFrames = 100;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.generatorLeft = 20;
        this.generatorTop = 50;
        this.generatorWidth = 560;
        this.generatorHeight = 450;

        // =====================================================
        // INICIA DADOS
        // =====================================================

        this.solve();

        // =====================================================
        // INICIA ANIMAÇÃO
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // TENSÃO INDUZIDA
    //
    // Python:
    //
    // def ddp(N, A, B, w, t):
    //     return N * A * B * np.sin(w * t)
    // =========================================================

    ddp(N, A, B, w, t) {

        return (
            N *
            A *
            B *
            Math.sin(
                w * t
            )
        );
    }


    // =========================================================
    // CORRENTE INDUZIDA
    //
    // Python:
    //
    // def I(ddp, R):
    //     if R == 0:
    //         return np.zeros_like(ddp)
    //     return ddp / R
    // =========================================================

    currentFromVoltage(
        voltage,
        R
    ) {

        if (R === 0)
            return 0;

        return voltage / R;
    }


    // =========================================================
    // SOLUÇÃO
    // =========================================================

    solve() {

        this.time = [];
        this.voltage = [];
        this.current = [];

        const h =
            (
                this.tf -
                this.t0
            ) /
            (
                this.Ntime - 1
            );

        const p =
            this.params;

        // =====================================================
        // GERA t = np.linspace(0,10,1000)
        // =====================================================

        for (
            let i = 0;
            i < this.Ntime;
            i++
        ) {

            const t =
                this.t0 +
                i * h;

            const V =
                this.ddp(
                    p.N,
                    p.A,
                    p.B,
                    p.w,
                    t
                );

            const I =
                this.currentFromVoltage(
                    V,
                    p.R
                );

            this.time.push(t);
            this.voltage.push(V);
            this.current.push(I);
        }

        // =====================================================
        // REINICIA FRAME
        // =====================================================

        this.frame = 0;
    }


    // =========================================================
    // COORDENADAS DO GERADOR
    // Equivalente a:
    //
    // ax.set_xlim(-3,3)
    // ax.set_ylim(-2.5,2.5)
    // ax.set_aspect("equal")
    // =========================================================

    mapX(x) {

        return (
            this.generatorLeft +
            (
                (x + 3) / 6
            ) *
            this.generatorWidth
        );
    }


    mapY(y) {

        return (
            this.generatorTop +
            (
                (2.5 - y) / 5
            ) *
            this.generatorHeight
        );
    }


    // =========================================================
    // CAMPO MAGNÉTICO
    // =========================================================

    drawMagneticField(ctx) {

        const ys = [
            -1.5,
            -0.75,
            0,
            0.75,
            1.5
        ];

        ctx.strokeStyle = "gray";
        ctx.fillStyle = "gray";
        ctx.lineWidth = 1.5;

        for (
            let i = 0;
            i < ys.length;
            i++
        ) {

            const y =
                this.mapY(
                    ys[i]
                );

            let x1;
            let x2;

            // =================================================
            // Mesmo comportamento do Python
            // =================================================

            if (
                this.params.B >= 0
            ) {

                x1 =
                    this.mapX(-1.7);

                x2 =
                    this.mapX(1.3);

            } else {

                x1 =
                    this.mapX(1.3);

                x2 =
                    this.mapX(-1.7);
            }

            // =================================================
            // LINHA
            // =================================================

            ctx.beginPath();

            ctx.moveTo(
                x1,
                y
            );

            ctx.lineTo(
                x2,
                y
            );

            ctx.stroke();

            // =================================================
            // PONTA DA SETA
            // =================================================

            const head =
                8;

            ctx.beginPath();

            if (
                this.params.B >= 0
            ) {

                ctx.moveTo(
                    x2,
                    y
                );

                ctx.lineTo(
                    x2 - head,
                    y - 4
                );

                ctx.lineTo(
                    x2 - head,
                    y + 4
                );

            } else {

                ctx.moveTo(
                    x2,
                    y
                );

                ctx.lineTo(
                    x2 + head,
                    y - 4
                );

                ctx.lineTo(
                    x2 + head,
                    y + 4
                );
            }

            ctx.closePath();

            ctx.fill();
        }
    }


    // =========================================================
    // ÍMÃS
    // =========================================================

    drawMagnets(ctx) {

        // =====================================================
        // ÍMÃ ESQUERDO - S
        // =====================================================

        ctx.fillStyle = "blue";

        ctx.fillRect(

            this.mapX(-2.7),
            this.mapY(2),

            this.mapX(-2.3) -
            this.mapX(-2.7),

            this.mapY(-2) -
            this.mapY(2)

        );

        // =====================================================
        // ÍMÃ ESQUERDO - N
        // =====================================================

        ctx.fillStyle = "red";

        ctx.fillRect(

            this.mapX(-2.3),
            this.mapY(2),

            this.mapX(-1.9) -
            this.mapX(-2.3),

            this.mapY(-2) -
            this.mapY(2)

        );

        // =====================================================
        // ÍMÃ DIREITO - S
        // =====================================================

        ctx.fillStyle = "blue";

        ctx.fillRect(

            this.mapX(1.9),
            this.mapY(2),

            this.mapX(2.3) -
            this.mapX(1.9),

            this.mapY(-2) -
            this.mapY(2)

        );

        // =====================================================
        // ÍMÃ DIREITO - N
        // =====================================================

        ctx.fillStyle = "red";

        ctx.fillRect(

            this.mapX(2.3),
            this.mapY(2),

            this.mapX(2.7) -
            this.mapX(2.3),

            this.mapY(-2) -
            this.mapY(2)

        );

        // =====================================================
        // LETRAS
        // =====================================================

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "S",
            this.mapX(-2.5),
            this.mapY(0)
        );

        ctx.fillText(
            "N",
            this.mapX(-2.1),
            this.mapY(0)
        );

        ctx.fillText(
            "S",
            this.mapX(2.1),
            this.mapY(0)
        );

        ctx.fillText(
            "N",
            this.mapX(2.5),
            this.mapY(0)
        );
    }


    // =========================================================
    // BOBINA
    //
    // Python:
    //
    // angulo = w * tempo
    // largura = 1.5 * np.cos(angulo)
    // altura = 1.2
    // =========================================================

    drawCoil(ctx, tempo) {

        const p =
            this.params;

        // =====================================================
        // ÂNGULO
        // =====================================================

        const angulo =
            p.w *
            tempo;

        // =====================================================
        // LARGURA
        // =====================================================

        const largura =
            1.5 *
            Math.cos(
                angulo
            );

        // =====================================================
        // ALTURA
        // =====================================================

        const altura =
            1.2;

        // =====================================================
        // COORDENADAS
        //
        // Python:
        //
        // x = [
        //     -largura,
        //      largura,
        //      largura,
        //     -largura,
        //     -largura
        // ]
        //
        // y = [
        //     -altura,
        //     -altura,
        //      altura,
        //      altura,
        //     -altura
        // ]
        // =====================================================

        const x = [

            -largura,
            largura,
            largura,
            -largura,
            -largura

        ];

        const y = [

            -altura,
            -altura,
            altura,
            altura,
            -altura

        ];

        // =====================================================
        // BOBINA
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            this.mapX(x[0]),
            this.mapY(y[0])
        );

        for (
            let i = 1;
            i < x.length;
            i++
        ) {

            ctx.lineTo(
                this.mapX(x[i]),
                this.mapY(y[i])
            );
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.stroke();

        // =====================================================
        // EIXO / FIO ÚNICO
        //
        // Python:
        //
        // eixo_fio.set_data(
        //     [0,0],
        //     [-1.7,-altura]
        // )
        //
        // Ele termina exatamente no centro da parte
        // inferior da espira.
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            this.mapX(0),
            this.mapY(-1.7)
        );

        ctx.lineTo(
            this.mapX(0),
            this.mapY(-altura)
        );

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.stroke();
    }


    // =========================================================
    // LÂMPADA
    // =========================================================

    drawLamp(ctx, tempo) {

        const p =
            this.params;

        // =====================================================
        // POSIÇÃO
        // =====================================================

        const x =
            this.mapX(0);

        const y =
            this.mapY(-1.7);

        const radius =
            0.35 *
            (
                this.generatorWidth / 6
            );

        // =====================================================
        // TENSÃO
        // =====================================================

        const V =
            this.ddp(
                p.N,
                p.A,
                p.B,
                p.w,
                tempo
            );

        // =====================================================
        // BRILHO
        // =====================================================

        const Vmax =
            Math.abs(
                p.N *
                p.A *
                p.B *
                p.w
            );

        let brilho = 0;

        if (
            Vmax > 0
        ) {

            brilho =
                Math.min(
                    Math.abs(V) /
                    Vmax,
                    1
                );
        }

        // =====================================================
        // COR
        //
        // Python:
        //
        // (
        //   0.35 + 0.65*brilho,
        //   0.35 + 0.65*brilho,
        //   0.35*(1-brilho)
        // )
        // =====================================================

        const r =
            0.35 +
            0.65 * brilho;

        const g =
            0.35 +
            0.65 * brilho;

        const b =
            0.35 *
            (1 - brilho);

        // =====================================================
        // CÍRCULO
        // =====================================================

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            2 * Math.PI
        );

        ctx.fillStyle =
            `rgb(
                ${r * 255},
                ${g * 255},
                ${b * 255}
            )`;

        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.stroke();

        // =====================================================
        // TEXTO
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "10px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";

        ctx.fillText(
            "Lâmpada",
            x,
            this.mapY(-2.2)
        );
    }


    // =========================================================
    // DESENHA GERADOR
    // =========================================================

    drawGenerator(
        ctx,
        tempo
    ) {

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "18px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC",
            this.generatorLeft +
            this.generatorWidth / 2,
            30
        );

        // =====================================================
        // ÍMÃS
        // =====================================================

        this.drawMagnets(
            ctx
        );

        // =====================================================
        // CAMPO
        // =====================================================

        this.drawMagneticField(
            ctx
        );

        // =====================================================
        // BOBINA
        // =====================================================

        this.drawCoil(
            ctx,
            tempo
        );

        // =====================================================
        // LÂMPADA
        // =====================================================

        this.drawLamp(
            ctx,
            tempo
        );
    }


    // =========================================================
    // ESCALA DO GRÁFICO
    // Python:
    //
    // mascara = t <= 2
    // Vmax = max(abs(V))
    // Imax = max(abs(I))
    // ymax = max(Vmax,Imax)
    // =========================================================

    getGraphScale() {

        let Vmax = 0;
        let Imax = 0;

        for (
            let i = 0;
            i < this.time.length;
            i++
        ) {

            if (
                this.time[i] <= 2
            ) {

                Vmax =
                    Math.max(
                        Vmax,
                        Math.abs(
                            this.voltage[i]
                        )
                    );

                Imax =
                    Math.max(
                        Imax,
                        Math.abs(
                            this.current[i]
                        )
                    );
            }
        }

        let ymax =
            Math.max(
                Vmax,
                Imax
            );

        if (
            ymax === 0
        ) {

            ymax = 1;
        }

        return (
            1.1 * ymax
        );
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(
        ctx,
        tempoAtual
    ) {

        const graphX =
            650;

        const graphY =
            70;

        const graphW =
            510;

        const graphH =
            360;

        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle = "black";

        ctx.font = "18px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Gerador AC - Tensão e Corrente x Tempo",
            graphX +
            graphW / 2,
            graphY - 12
        );

        // =====================================================
        // ESCALA
        // =====================================================

        const ymax =
            this.getGraphScale();

        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle = "#777";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );

        // =====================================================
        // GRID
        // =====================================================

        ctx.strokeStyle =
            "#dddddd";

        for (
            let i = 0;
            i <= 8;
            i++
        ) {

            // vertical
            const px =
                graphX +
                (
                    i / 8
                ) *
                graphW;

            ctx.beginPath();

            ctx.moveTo(
                px,
                graphY
            );

            ctx.lineTo(
                px,
                graphY +
                graphH
            );

            ctx.stroke();

            // horizontal
            const py =
                graphY +
                (
                    i / 8
                ) *
                graphH;

            ctx.beginPath();

            ctx.moveTo(
                graphX,
                py
            );

            ctx.lineTo(
                graphX +
                graphW,
                py
            );

            ctx.stroke();
        }

        // =====================================================
        // ESCALA X
        // =====================================================

        ctx.fillStyle = "black";
        ctx.font = "11px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (
            let i = 0;
            i <= 8;
            i++
        ) {

            const value =
                i * 0.25;

            const px =
                graphX +
                (
                    i / 8
                ) *
                graphW;

            ctx.fillText(
                value.toFixed(2),
                px,
                graphY +
                graphH +
                7
            );
        }

        // =====================================================
        // ESCALA Y
        // =====================================================

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        for (
            let i = 0;
            i <= 8;
            i++
        ) {

            const value =
                ymax -
                (
                    i / 8
                ) *
                2 *
                ymax;

            const py =
                graphY +
                (
                    i / 8
                ) *
                graphH;

            ctx.fillText(
                value.toFixed(0),
                graphX - 7,
                py
            );
        }

        // =====================================================
        // RÓTULO X
        // =====================================================

        ctx.textAlign = "center";

        ctx.textBaseline = "alphabetic";

        ctx.fillText(
            "Tempo (s)",
            graphX +
            graphW / 2,
            graphY +
            graphH +
            33
        );

        // =====================================================
        // RÓTULO Y
        // =====================================================

        ctx.save();

        ctx.translate(
            graphX - 42,
            graphY +
            graphH / 2
        );

        ctx.rotate(
            -Math.PI / 2
        );

        ctx.fillText(
            "V(t)-Volts, I(t)-A",
            0,
            0
        );

        ctx.restore();

        // =====================================================
        // CONVERSÃO
        // =====================================================

        function pxTempo(
            tempo
        ) {

            return (
                graphX +
                (
                    tempo / 2
                ) *
                graphW
            );
        }

        function pyValor(
            value
        ) {

            return (
                graphY +
                graphH / 2 -
                (
                    value / ymax
                ) *
                (
                    graphH / 2
                )
            );
        }

        // =====================================================
        // V(t)
        // =====================================================

        ctx.beginPath();

        let started =
            false;

        for (
            let i = 0;
            i < this.time.length;
            i++
        ) {

            if (
                this.time[i] > 2
            ) {
                break;
            }

            const px =
                pxTempo(
                    this.time[i]
                );

            const py =
                pyValor(
                    this.voltage[i]
                );

            if (!started) {

                ctx.moveTo(
                    px,
                    py
                );

                started = true;

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }

        ctx.strokeStyle =
            "#1f77b4";

        ctx.lineWidth = 2;

        ctx.stroke();

        // =====================================================
        // I(t)
        // =====================================================

        ctx.beginPath();

        started = false;

        for (
            let i = 0;
            i < this.time.length;
            i++
        ) {

            if (
                this.time[i] > 2
            ) {
                break;
            }

            const px =
                pxTempo(
                    this.time[i]
                );

            const py =
                pyValor(
                    this.current[i]
                );

            if (!started) {

                ctx.moveTo(
                    px,
                    py
                );

                started = true;

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }

        ctx.strokeStyle =
            "#ff7f0e";

        ctx.lineWidth = 2;

        ctx.stroke();

        // =====================================================
        // PONTO V(t)
        // =====================================================

        if (
            tempoAtual <= 2
        ) {

            const V =
                this.ddp(
                    this.params.N,
                    this.params.A,
                    this.params.B,
                    this.params.w,
                    tempoAtual
                );

            ctx.beginPath();

            ctx.arc(
                pxTempo(
                    tempoAtual
                ),
                pyValor(V),
                6,
                0,
                2 * Math.PI
            );

            ctx.fillStyle =
                "#1f77b4";

            ctx.fill();
        }

        // =====================================================
        // PONTO I(t)
        // =====================================================

        if (
            tempoAtual <= 2
        ) {

            const V =
                this.ddp(
                    this.params.N,
                    this.params.A,
                    this.params.B,
                    this.params.w,
                    tempoAtual
                );

            const I =
                this.currentFromVoltage(
                    V,
                    this.params.R
                );

            ctx.beginPath();

            ctx.arc(
                pxTempo(
                    tempoAtual
                ),
                pyValor(I),
                6,
                0,
                2 * Math.PI
            );

            ctx.fillStyle =
                "#ff7f0e";

            ctx.fill();
        }

        // =====================================================
        // LINHA DO TEMPO
        // =====================================================

        if (
            tempoAtual <= 2
        ) {

            const px =
                pxTempo(
                    tempoAtual
                );

            ctx.beginPath();

            ctx.moveTo(
                px,
                graphY
            );

            ctx.lineTo(
                px,
                graphY +
                graphH
            );

            ctx.strokeStyle =
                "rgba(0,0,0,0.6)";

            ctx.lineWidth = 1.5;

            ctx.setLineDash([
                6,
                4
            ]);

            ctx.stroke();

            ctx.setLineDash([]);
        }

        // =====================================================
        // LEGENDA
        // =====================================================

        const legendX =
            graphX + 10;

        const legendY =
            graphY +
            graphH -
            35;

        // V(t)

        ctx.beginPath();

        ctx.moveTo(
            legendX,
            legendY
        );

        ctx.lineTo(
            legendX + 30,
            legendY
        );

        ctx.strokeStyle =
            "#1f77b4";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.fillStyle = "black";

        ctx.font =
            "12px Arial";

        ctx.textAlign =
            "left";

        ctx.fillText(
            "V(t)",
            legendX + 38,
            legendY + 4
        );

        // I(t)

        ctx.beginPath();

        ctx.moveTo(
            legendX,
            legendY + 20
        );

        ctx.lineTo(
            legendX + 30,
            legendY + 20
        );

        ctx.strokeStyle =
            "#ff7f0e";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.fillText(
            "I(t)",
            legendX + 38,
            legendY + 24
        );
    }


    // =========================================================
    // DRAW
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

        // =====================================================
        // FUNDO
        // =====================================================

        ctx.fillStyle =
            "white";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // =====================================================
        // TEMPO ATUAL
        //
        // Python:
        //
        // tempo = frame * 0.02
        // =====================================================

        const tempo =
            this.frame * 0.02;

        // =====================================================
        // GERADOR
        // =====================================================

        this.drawGenerator(
            ctx,
            tempo
        );

        // =====================================================
        // GRÁFICO
        // =====================================================

        this.drawGraph(
            ctx,
            tempo
        );
    }


    // =========================================================
    // ATUALIZA PARÂMETROS
    // =========================================================

    atualizarParametros(
        newParams
    ) {

        this.params = {

            ...this.params,

            ...newParams

        };

        this.solve();

        this.draw();
    }


    // =========================================================
    // ANIMAÇÃO
    //
    // Mesmo padrão de CoupledOscillators
    // =========================================================

    iniciar() {

        if (
            this.running
        )
            return;

        this.running =
            true;

        const loop =
            () => {

                if (
                    !this.running
                )
                    return;

                // =================================================
                // DESENHA
                // =================================================

                this.draw();

                // =================================================
                // PRÓXIMO FRAME
                // =================================================

                this.frame +=
                    this.animationSpeed;

                // =================================================
                // repeat=True
                //
                // frames=100
                // =================================================

                if (
                    this.frame >=
                    this.animationFrames
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

        this.running =
            false;
    }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

const canvas =
    document.getElementById(
        "geradorCanvas"
    );

const geradorAC =
    new GeradorAC(
        canvas,
        {
            N: 100,
            A: 2.0,
            B: 0.5,
            w: 10,
            R: 10
        }
    );


// ============================================================
// SLIDERS
// ============================================================

const sliderN =
    document.getElementById(
        "slider_N"
    );

const sliderA =
    document.getElementById(
        "slider_A"
    );

const sliderB =
    document.getElementById(
        "slider_B"
    );

const sliderW =
    document.getElementById(
        "slider_w"
    );

const sliderR =
    document.getElementById(
        "slider_R"
    );

const valorN =
    document.getElementById(
        "valor_N"
    );

const valorA =
    document.getElementById(
        "valor_A"
    );

const valorB =
    document.getElementById(
        "valor_B"
    );

const valorW =
    document.getElementById(
        "valor_w"
    );

const valorR =
    document.getElementById(
        "valor_R"
    );


// ============================================================
// N
// ============================================================

sliderN.addEventListener(
    "input",
    () => {

        geradorAC.params.N =
            Number(
                sliderN.value
            );

        valorN.textContent =
            sliderN.value;

        geradorAC.solve();
    }
);


// ============================================================
// A
// ============================================================

sliderA.addEventListener(
    "input",
    () => {

        geradorAC.params.A =
            Number(
                sliderA.value
            );

        valorA.textContent =
            Number(
                sliderA.value
            ).toFixed(1);

        geradorAC.solve();
    }
);


// ============================================================
// B
// ============================================================

sliderB.addEventListener(
    "input",
    () => {

        geradorAC.params.B =
            Number(
                sliderB.value
            );

        valorB.textContent =
            Number(
                sliderB.value
            ).toFixed(1);

        geradorAC.solve();
    }
);


// ============================================================
// ω
// ============================================================

sliderW.addEventListener(
    "input",
    () => {

        geradorAC.params.w =
            Number(
                sliderW.value
            );

        valorW.textContent =
            Number(
                sliderW.value
            ).toFixed(1);

        geradorAC.solve();
    }
);


// ============================================================
// R
// ============================================================

sliderR.addEventListener(
    "input",
    () => {

        geradorAC.params.R =
            Number(
                sliderR.value
            );

        valorR.textContent =
            sliderR.value;

        geradorAC.solve();
    }
);
