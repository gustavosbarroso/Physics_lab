class RCCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            R: 2.0,
            C: 1.0,

            q0: 0.0,

            V0: 5.0,

            ...options
        };


        // =====================================================
        // DADOS DA SOLUÇÃO
        // =====================================================

        this.time = [];
        this.q = [];
        this.current = [];

        this.running = false;
        this.frame = 0;


        // =====================================================
        // CONFIGURAÇÃO NUMÉRICA
        // =====================================================

        this.t0 = 0;
        this.tf = 20;
        this.N = 500;


        // =====================================================
        // CONFIGURAÇÃO DOS ELÉTRONS
        // =====================================================

        this.electronCount = 50;
        this.electronPositions = [];


        // =====================================================
        // GEOMETRIA DO CIRCUITO
        // =====================================================

        this.x0 = 120;
        this.x1 = 620;

        this.y0 = 180;
        this.y1 = 440;


        // =====================================================
        // RESISTOR
        // =====================================================

        this.resStart = 270;
        this.resEnd = 420;


        // =====================================================
        // CAPACITOR
        // =====================================================

        this.capY1 = 280;
        this.capY2 = 315;


        // =====================================================
        // FONTE
        // =====================================================

        this.sourceY = 310;


        // =====================================================
        // CONTROLES
        // =====================================================

        this.createControls();


        // =====================================================
        // SOLUÇÃO
        // =====================================================

        this.solve();


        // =====================================================
        // CAMINHO DOS ELÉTRONS
        // =====================================================

        this.createCircuitPath();

        this.resetElectrons();


        // =====================================================
        // INICIA
        // =====================================================

        this.iniciar();
    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    //
    // dq/dt = i
    //
    // R i + q/C = V0
    //
    // portanto:
    //
    // dq/dt = (V0 - q/C)/R
    // =========================================================

    f(state, t) {

        const q =
            state[0];

        const p =
            this.params;

        const Vt =
            p.V0;

        const i =
            (
                Vt -
                q / p.C
            ) /
            p.R;

        return [
            i
        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a =
            this.t0;

        const b =
            this.tf;

        const N =
            this.N;


        const h =
            (b - a) / N;


        let q =
            this.params.q0;


        this.time = [];
        this.q = [];
        this.current = [];


        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;


            const i =
                (
                    this.params.V0 -
                    q / this.params.C
                ) /
                this.params.R;


            this.time.push(t);
            this.q.push(q);
            this.current.push(i);


            if (
                n === N
            ) {

                break;
            }


            // =================================================
            // k1
            // =================================================

            const k1 =
                this.f(
                    [q],
                    t
                )[0];


            // =================================================
            // k2
            // =================================================

            const k2 =
                this.f(
                    [
                        q +
                        h * k1 / 2
                    ],
                    t + h / 2
                )[0];


            // =================================================
            // k3
            // =================================================

            const k3 =
                this.f(
                    [
                        q +
                        h * k2 / 2
                    ],
                    t + h / 2
                )[0];


            // =================================================
            // k4
            // =================================================

            const k4 =
                this.f(
                    [
                        q +
                        h * k3
                    ],
                    t + h
                )[0];


            // =================================================
            // ATUALIZAÇÃO
            // =================================================

            q +=
                h *
                (
                    k1 +
                    2 * k2 +
                    2 * k3 +
                    k4
                ) /
                6;
        }
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;
    }


    // =========================================================
    // CONTROLES
    // =========================================================

    createControls() {

        const old =
            document.getElementById(
                "rc-controls"
            );

        if (old)
            old.remove();


        const container =
            document.createElement(
                "div"
            );


        container.id =
            "rc-controls";


        container.style.width =
            "900px";


        container.style.margin =
            "20px auto";


        container.style.fontFamily =
            "Arial";


        const title =
            document.createElement(
                "h2"
            );


        title.innerText =
            "Parâmetros do circuito";


        container.appendChild(
            title
        );


        this.sliders = {};


        const configs = [

            {
                name: "R",
                label: "R (Ω)",
                min: 0.1,
                max: 10,
                step: 0.1
            },

            {
                name: "C",
                label: "C (F)",
                min: 0.1,
                max: 5,
                step: 0.1
            },

            {
                name: "V0",
                label: "V₀ (V)",
                min: 0,
                max: 10,
                step: 0.1
            },

            {
                name: "q0",
                label: "q₀ (C)",
                min: -20,
                max: 20,
                step: 0.1
            }

        ];


        configs.forEach(
            config => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.style.display =
                    "flex";


                row.style.alignItems =
                    "center";


                row.style.marginBottom =
                    "8px";


                const label =
                    document.createElement(
                        "label"
                    );


                label.style.width =
                    "100px";


                label.innerText =
                    config.label;


                const slider =
                    document.createElement(
                        "input"
                    );


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
                    document.createElement(
                        "span"
                    );


                value.style.width =
                    "70px";


                value.style.marginLeft =
                    "10px";


                value.innerText =
                    Number(
                        this.params[
                            config.name
                        ]
                    ).toFixed(2);


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
                            v.toFixed(2);


                        this.solve();

                        this.resetElectrons();

                        this.draw();
                    }
                );


                row.appendChild(
                    label
                );

                row.appendChild(
                    slider
                );

                row.appendChild(
                    value
                );


                container.appendChild(
                    row
                );


                this.sliders[
                    config.name
                ] = slider;
            }
        );


        this.canvas.parentNode.insertBefore(
            container,
            this.canvas.nextSibling
        );
    }


    // =========================================================
    // CAMINHO DOS ELÉTRONS
    // =========================================================

    createCircuitPath() {

        this.path = [];


        const x0 =
            this.x0;

        const x1 =
            this.x1;

        const y0 =
            this.y0;

        const y1 =
            this.y1;


        // =====================================================
        // LADO ESQUERDO
        // =====================================================

        for (
            let y = y0;
            y <= y1;
            y += 3
        ) {

            this.path.push({

                x: x0,
                y: y

            });
        }


        // =====================================================
        // PARTE INFERIOR
        // =====================================================

        for (
            let x = x0;
            x <= x1;
            x += 3
        ) {

            this.path.push({

                x: x,
                y: y1

            });
        }


        // =====================================================
        // LADO DIREITO
        //
        // O caminho continua passando pelo capacitor.
        //
        // O elétron será ocultado visualmente quando
        // estiver entre as placas.
        // =====================================================

        for (
            let y = y1;
            y >= y0;
            y -= 3
        ) {

            this.path.push({

                x: x1,
                y: y

            });
        }


        // =====================================================
        // PARTE SUPERIOR
        // =====================================================

        for (
            let x = x1;
            x >= x0;
            x -= 3
        ) {

            this.path.push({

                x: x,
                y: y0

            });
        }


        this.pathLength =
            this.path.length;
    }


    // =========================================================
    // RESET DOS ELÉTRONS
    // =========================================================

    resetElectrons() {

        this.electronPositions = [];


        for (
            let k = 0;
            k < this.electronCount;
            k++
        ) {

            this.electronPositions.push(

                k *
                this.pathLength /
                this.electronCount

            );
        }
    }


    // =========================================================
    // DESENHO DO CIRCUITO
    // =========================================================

    drawCircuit(ctx) {

        ctx.save();


        const x0 =
            this.x0;

        const x1 =
            this.x1;

        const y0 =
            this.y0;

        const y1 =
            this.y1;


        ctx.lineWidth =
            3;

        ctx.strokeStyle =
            "black";

        ctx.fillStyle =
            "black";


        // =====================================================
        // FIO ESQUERDO
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x0,
            y1
        );

        ctx.stroke();


        // =====================================================
        // FIO SUPERIOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x1,
            y0
        );

        ctx.stroke();


        // =====================================================
        // FIO DIREITO ACIMA DO CAPACITOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y0
        );

        ctx.lineTo(
            x1,
            this.capY1
        );

        ctx.stroke();


        // =====================================================
        // CAPACITOR
        // =====================================================

        this.drawCapacitor(
            ctx
        );


        // =====================================================
        // FIO DIREITO ABAIXO DO CAPACITOR
        // =====================================================

        ctx.lineWidth =
            3;

        ctx.beginPath();

        ctx.moveTo(
            x1,
            this.capY2
        );

        ctx.lineTo(
            x1,
            y1
        );

        ctx.stroke();


        // =====================================================
        // LETRA C
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "C",
            x1 + 38,
            (
                this.capY1 +
                this.capY2
            ) / 2
        );


        // =====================================================
        // FIO INFERIOR
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            x1,
            y1
        );

        ctx.lineTo(
            this.resEnd,
            y1
        );

        ctx.stroke();


        // =====================================================
        // RESISTOR
        // =====================================================

        const resStart =
            this.resStart;

        const resEnd =
            this.resEnd;


        ctx.beginPath();


        const points = 8;


        for (
            let k = 0;
            k <= points;
            k++
        ) {

            const t =
                k / points;


            const x =
                resStart +
                (
                    resEnd -
                    resStart
                ) *
                t;


            let y =
                y1;


            if (
                k !== 0 &&
                k !== points
            ) {

                y =
                    y1 +
                    (
                        k % 2 === 0
                            ? -15
                            : 15
                    );
            }


            if (
                k === 0
            ) {

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


        // =====================================================
        // FIO ATÉ A FONTE
        // =====================================================

        ctx.beginPath();

        ctx.moveTo(
            resStart,
            y1
        );

        ctx.lineTo(
            x0,
            y1
        );

        ctx.stroke();


        // =====================================================
        // LETRA R
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "top";


        ctx.fillText(
            "R",
            (
                resStart +
                resEnd
            ) / 2,
            y1 + 22
        );


        // =====================================================
        // FONTE DC
        // =====================================================

        const sourceX =
            x0;

        const sourceY =
            this.sourceY;

        const radius =
            32;


        // =====================================================
        // APAGA TRECHO DO FIO
        // =====================================================

        ctx.fillStyle =
            "white";


        ctx.fillRect(
            sourceX - 6,
            sourceY -
            radius -
            6,
            12,
            2 * radius + 12
        );


        // =====================================================
        // CÍRCULO DA FONTE
        // =====================================================

        ctx.strokeStyle =
            "black";

        ctx.lineWidth =
            3;


        ctx.beginPath();

        ctx.arc(
            sourceX,
            sourceY,
            radius,
            0,
            2 * Math.PI
        );

        ctx.stroke();


        // =====================================================
        // SÍMBOLO +
        // =====================================================

        ctx.font =
            "bold 22px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillStyle =
            "black";


        ctx.fillText(
            "+",
            sourceX,
            sourceY - 13
        );


        // =====================================================
        // SÍMBOLO -
        // =====================================================

        ctx.fillText(
            "−",
            sourceX,
            sourceY + 13
        );


        // =====================================================
        // LETRA DC
        // =====================================================

        ctx.font =
            "bold 16px Arial";

        ctx.textBaseline =
            "top";


        ctx.fillText(
            "DC",
            sourceX,
            sourceY + radius + 8
        );


        ctx.restore();
    }


    // =========================================================
    // CAPACITOR
    // =========================================================

    drawCapacitor(ctx) {

        const x1 =
            this.x1;


        ctx.save();


        ctx.strokeStyle =
            "black";

        ctx.lineWidth =
            4;


        ctx.beginPath();


        // =====================================================
        // PLACA SUPERIOR
        // =====================================================

        ctx.moveTo(
            x1 - 25,
            this.capY1
        );

        ctx.lineTo(
            x1 + 25,
            this.capY1
        );


        // =====================================================
        // PLACA INFERIOR
        // =====================================================

        ctx.moveTo(
            x1 - 25,
            this.capY2
        );

        ctx.lineTo(
            x1 + 25,
            this.capY2
        );


        ctx.stroke();


        ctx.restore();
    }


    // =========================================================
    // ELÉTRONS
    //
    // Mesmo método utilizado no RLC:
    //
    // o caminho continua passando pelo capacitor,
    // mas o elétron não é desenhado dentro do vão.
    // =========================================================

    drawElectrons(ctx) {

        ctx.save();


        ctx.fillStyle =
            "#168aad";


        for (
            let k = 0;
            k < this.electronPositions.length;
            k++
        ) {

            let index =
                Math.floor(
                    this.electronPositions[k]
                );


            index =
                (
                    index %
                    this.pathLength +
                    this.pathLength
                ) %
                this.pathLength;


            const point =
                this.path[index];


            if (!point)
                continue;


            // =================================================
            // VÃO DO CAPACITOR
            // =================================================

            const insideCapacitor =
                point.x >= this.x1 - 4 &&
                point.x <= this.x1 + 4 &&
                point.y > this.capY1 &&
                point.y < this.capY2;


            // =================================================
            // NÃO DESENHA O ELÉTRON NO VÃO
            // =================================================

            if (insideCapacitor)
                continue;


            // =================================================
            // DESENHA O ELÉTRON
            // =================================================

            ctx.beginPath();


            ctx.arc(
                point.x,
                point.y,
                4,
                0,
                2 * Math.PI
            );


            ctx.fill();
        }


        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD(ctx) {

        const p =
            this.params;


        const x =
            20;

        const y =
            20;

        const width =
            315;

        const height =
            105;


        ctx.save();


        ctx.fillStyle =
            "rgba(255,255,255,0.95)";

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


        const index =
            Math.min(
                this.frame,
                this.q.length - 1
            );


        const q =
            this.q[index] || 0;

        const i =
            this.current[index] || 0;


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "left";

        ctx.textBaseline =
            "alphabetic";


        ctx.fillText(
            "Circuito RC",
            x + 12,
            y + 20
        );


        // =====================================================
        // COLUNA 1
        // =====================================================

        ctx.font =
            "12px Arial";


        ctx.fillText(
            `R = ${p.R.toFixed(2)} Ω`,
            x + 12,
            y + 42
        );


        ctx.fillText(
            `C = ${p.C.toFixed(2)} F`,
            x + 12,
            y + 60
        );


        ctx.fillText(
            `V₀ = ${p.V0.toFixed(2)} V`,
            x + 12,
            y + 78
        );


        // =====================================================
        // COLUNA 2
        // =====================================================

        const col2 =
            x + 170;


        ctx.fillText(
            `q₀ = ${p.q0.toFixed(2)} C`,
            col2,
            y + 42
        );


        ctx.fillText(
            `q(t) = ${q.toFixed(3)} C`,
            col2,
            y + 60
        );


        ctx.fillText(
            `i(t) = ${i.toFixed(3)} A`,
            col2,
            y + 78
        );


        ctx.restore();
    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph(ctx) {

        const graphX =
            760;

        const graphY =
            70;


        const graphW =
            this.canvas.width -
            graphX -
            40;


        const graphH =
            400;


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.font =
            "bold 18px Arial";

        ctx.fillStyle =
            "black";

        ctx.textAlign =
            "left";


        ctx.fillText(
            "Resposta do circuito",
            graphX + 120,
            graphY - 20
        );


        // =====================================================
        // BORDA
        // =====================================================

        ctx.strokeStyle =
            "#777";

        ctx.lineWidth =
            1;


        ctx.strokeRect(
            graphX,
            graphY,
            graphW,
            graphH
        );


        // =====================================================
        // DADOS
        // =====================================================

        const n =
            Math.min(
                this.frame + 1,
                this.time.length
            );


        if (
            n < 2
        )
            return;


        const qData =
            this.q.slice(
                0,
                n
            );


        const iData =
            this.current.slice(
                0,
                n
            );


        // =====================================================
        // ESCALA
        // =====================================================

        let maxAbs =
            0;


        for (
            const value of qData
        ) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(
                        value
                    )
                );
        }


        for (
            const value of iData
        ) {

            maxAbs =
                Math.max(
                    maxAbs,
                    Math.abs(
                        value
                    )
                );
        }


        if (
            maxAbs < 0.001
        )
            maxAbs = 1;


        maxAbs *= 1.15;


        // =====================================================
        // EIXO ZERO
        // =====================================================

        const centerY =
            graphY +
            graphH / 2;


        ctx.strokeStyle =
            "#999";


        ctx.beginPath();


        ctx.moveTo(
            graphX,
            centerY
        );


        ctx.lineTo(
            graphX + graphW,
            centerY
        );


        ctx.stroke();


        // =====================================================
        // TICKS Y
        // =====================================================

        const ticks =
            6;


        ctx.font =
            "11px Arial";

        ctx.fillStyle =
            "black";


        for (
            let k = -ticks;
            k <= ticks;
            k++
        ) {

            const value =
                maxAbs *
                k /
                ticks;


            const y =
                centerY -
                (
                    value /
                    maxAbs
                ) *
                (
                    graphH / 2
                );


            ctx.strokeStyle =
                "#777";


            ctx.beginPath();


            ctx.moveTo(
                graphX - 5,
                y
            );


            ctx.lineTo(
                graphX + 5,
                y
            );


            ctx.stroke();


            if (
                k !== 0
            ) {

                ctx.strokeStyle =
                    "#eeeeee";


                ctx.beginPath();


                ctx.moveTo(
                    graphX,
                    y
                );


                ctx.lineTo(
                    graphX + graphW,
                    y
                );


                ctx.stroke();
            }


            ctx.fillStyle =
                "black";


            ctx.fillText(
                value.toFixed(2),
                graphX - 50,
                y + 4
            );
        }


        // =====================================================
        // TICKS X
        // =====================================================

        const xTicks =
            5;


        for (
            let k = 0;
            k <= xTicks;
            k++
        ) {

            const time =
                this.tf *
                k /
                xTicks;


            const x =
                graphX +
                graphW *
                k /
                xTicks;


            ctx.strokeStyle =
                "#777";


            ctx.beginPath();


            ctx.moveTo(
                x,
                centerY - 5
            );


            ctx.lineTo(
                x,
                centerY + 5
            );


            ctx.stroke();


            ctx.fillStyle =
                "black";


            ctx.fillText(
                time.toFixed(1),
                x - 10,
                graphY +
                graphH +
                20
            );
        }


        // =====================================================
        // LABEL X
        // =====================================================

        ctx.font =
            "14px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "t [s]",
            graphX +
            graphW / 2,
            graphY +
            graphH +
            45
        );


        // =====================================================
        // LABEL Y
        // =====================================================

        ctx.save();


        ctx.translate(
            graphX - 70,
            graphY +
            graphH / 2
        );


        ctx.rotate(
            -Math.PI / 2
        );


        ctx.textAlign =
            "center";


        ctx.fillText(
            "q(t) [C] / i(t) [A]",
            0,
            0
        );


        ctx.restore();


        // =====================================================
        // CONVERSÃO
        // =====================================================

        const convertX =
            t => {

                return graphX +
                    (
                        t /
                        this.tf
                    ) *
                    graphW;
            };


        const convertY =
            value => {

                return centerY -
                    (
                        value /
                        maxAbs
                    ) *
                    (
                        graphH / 2
                    );
            };


        // =====================================================
        // q(t)
        // =====================================================

        ctx.lineWidth =
            2;

        ctx.strokeStyle =
            "#1976d2";


        ctx.beginPath();


        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(
                    this.time[k]
                );


            const y =
                convertY(
                    this.q[k]
                );


            if (
                k === 0
            ) {

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


        // =====================================================
        // i(t)
        // =====================================================

        ctx.strokeStyle =
            "#f57c00";


        ctx.beginPath();


        for (
            let k = 0;
            k < n;
            k++
        ) {

            const x =
                convertX(
                    this.time[k]
                );


            const y =
                convertY(
                    this.current[k]
                );


            if (
                k === 0
            ) {

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


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "13px Arial";

        ctx.textAlign =
            "left";


        ctx.fillStyle =
            "#1976d2";


        ctx.fillText(
            "q(t) [C]",
            graphX +
            graphW -
            90,
            graphY + 25
        );


        ctx.fillStyle =
            "#f57c00";


        ctx.fillText(
            "i(t) [A]",
            graphX +
            graphW -
            90,
            graphY + 45
        );
    }


    // =========================================================
    // DRAW
    // =========================================================

    draw() {

        const ctx =
            this.ctx;


        const w =
            this.canvas.width;

        const h =
            this.canvas.height;


        // =====================================================
        // LIMPA
        // =====================================================

        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        // =====================================================
        // FUNDO
        // =====================================================

        ctx.fillStyle =
            "white";


        ctx.fillRect(
            0,
            0,
            w,
            h
        );


        // =====================================================
        // CIRCUITO
        // =====================================================

        this.drawCircuit(
            ctx
        );


        // =====================================================
        // ELÉTRONS
        // =====================================================

        this.drawElectrons(
            ctx
        );


        // =====================================================
        // REDESENHA AS PLACAS
        // =====================================================

        this.drawCapacitor(
            ctx
        );


        // =====================================================
        // HUD
        // =====================================================

        this.drawHUD(
            ctx
        );


        // =====================================================
        // GRÁFICO
        // =====================================================

        this.drawGraph(
            ctx
        );
    }


    // =========================================================
    // ANIMAÇÃO
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


                this.draw();


                // =================================================
                // CORRENTE ATUAL
                // =================================================

                const index =
                    Math.min(
                        this.frame,
                        this.current.length - 1
                    );


                const current =
                    this.current[index] || 0;


                // =================================================
                // VELOCIDADE
                // =================================================

                const speed =
                    0.5 +
                    Math.abs(
                        current
                    ) *
                    2;


                // =================================================
                // SENTIDO
                // =================================================

                const direction =
                    Math.sign(
                        current || 1
                    );


                // =================================================
                // MOVIMENTO DOS ELÉTRONS
                // =================================================

                for (
                    let k = 0;
                    k <
                    this.electronPositions.length;
                    k++
                ) {

                    this.electronPositions[k] +=
                        speed *
                        direction;


                    if (
                        this.electronPositions[k]
                        >=
                        this.pathLength
                    ) {

                        this.electronPositions[k] -=
                            this.pathLength;
                    }


                    if (
                        this.electronPositions[k]
                        < 0
                    ) {

                        this.electronPositions[k] +=
                            this.pathLength;
                    }
                }


                // =================================================
                // AVANÇA TEMPO
                // =================================================

                this.frame++;


                if (
                    this.frame >=
                    this.time.length
                ) {

                    this.frame = 0;

                    this.resetElectrons();
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


        Object.keys(
            newParams
        ).forEach(
            key => {

                if (
                    this.sliders[key]
                ) {

                    this.sliders[key].value =
                        newParams[key];
                }
            }
        );


        this.solve();

        this.resetElectrons();

        this.draw();
    }
}
