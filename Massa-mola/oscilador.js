class DampedMassSpring {
constructor(canvas, options = {}) {

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // =====================================================
    // PARÂMETROS
    // =====================================================

    this.params = {

        k: 5.0,
        b: 0.5,
        m: 1.0,

        x0: 1.3,
        v0: 0.0,

        x_eq: 0.5,

        ...options
    };

    // =====================================================
    // DADOS DA SOLUÇÃO
    // =====================================================

    this.time = [];
    this.x = [];
    this.v = [];

    // =====================================================
    // CONFIGURAÇÃO NUMÉRICA
    // =====================================================

    this.t0 = 0;
    this.tf = 10;
    this.N = 1000;

    // =====================================================
    // ANIMAÇÃO
    // =====================================================

    this.running = false;
    this.frame = 0;
    this.animationSpeed = 1.0;

    // =====================================================
    // GEOMETRIA
    // =====================================================

    this.xLeft = 120;
    this.systemY = 300;
    this.scaleX = 350;

    this.blockSize = 70;
    this.wallHeight = 160;

    // =====================================================
    // GRÁFICO
    // =====================================================

    this.graphX = 700;
    this.graphY = 70;

    this.graphW =
        this.canvas.width -
        this.graphX -
        40;

    this.graphH = 400;

    // =====================================================
    // LIMITE DIREITO DO SISTEMA MASSA-MOLA
    // =====================================================

    /*
     * O sistema físico/visual termina antes do gráfico.
     *
     * O chão termina neste ponto.
     */

    this.systemRight = this.graphX - 100;

    // =====================================================
    // LIMITES GEOMÉTRICOS DO BLOCO
    // =====================================================

    /*
     * O limite é aplicado ao CENTRO do bloco.
     *
     * Assim:
     *
     * borda direita do bloco <= systemRight
     */

    this.minBlockCenterX =
        this.xLeft +
        this.blockSize / 2;

    this.maxBlockCenterX =
        this.systemRight -
        this.blockSize / 2;

    // =====================================================
    // CONVERSÃO PARA METROS
    // =====================================================

    this.minX =
        (
            this.minBlockCenterX -
            this.xLeft
        ) / this.scaleX;

    this.maxX =
        (
            this.maxBlockCenterX -
            this.xLeft
        ) / this.scaleX;

    // =====================================================
    // GARANTE x0 DENTRO DOS LIMITES
    // =====================================================

    this.params.x0 =
        Math.min(
            Math.max(
                this.params.x0,
                this.minX
            ),
            this.maxX
        );

    // =====================================================
    // CONTROLES
    // =====================================================

    this.createControls();

    // =====================================================
    // SOLUÇÃO
    // =====================================================

    this.solve();

    // =====================================================
    // DESENHO INICIAL
    // =====================================================

    this.draw();

    // =====================================================
    // INICIA ANIMAÇÃO
    // =====================================================

    this.iniciar();
}

// =========================================================
// SISTEMA DIFERENCIAL
// =========================================================

f(state, t) {

    const x = state[0];
    const v = state[1];

    const p = this.params;

    /*
     * m x'' + b x' + k(x - x_eq) = 0
     */

    return [

        v,

        -(
            p.k / p.m
        ) *
        (
            x - p.x_eq
        )
        -
        (
            p.b / p.m
        ) *
        v

    ];
}

// =========================================================
// OPERAÇÕES VETORIAIS
// =========================================================

add(a, b) {

    return [
        a[0] + b[0],
        a[1] + b[1]
    ];
}

mul(a, x) {

    return [
        a[0] * x,
        a[1] * x
    ];
}

add4(a, b, c, d) {

    return [

        a[0] +
        2 * b[0] +
        2 * c[0] +
        d[0],

        a[1] +
        2 * b[1] +
        2 * c[1] +
        d[1]

    ];
}

// =========================================================
// RK4
// =========================================================

RK4() {

    const a = this.t0;
    const b = this.tf;
    const N = this.N;

    const h =
        (b - a) / N;

    let state = [

        this.params.x0,
        this.params.v0

    ];

    this.time = [];
    this.x = [];
    this.v = [];

    for (
        let n = 0;
        n <= N;
        n++
    ) {

        const t =
            a + n * h;

        this.time.push(t);

        this.x.push(
            state[0]
        );

        this.v.push(
            state[1]
        );

        if (n === N)
            break;

        const k1 =
            this.mul(
                this.f(
                    state,
                    t
                ),
                h
            );

        const k2 =
            this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(
                            k1,
                            0.5
                        )
                    ),
                    t + h / 2
                ),
                h
            );

        const k3 =
            this.mul(
                this.f(
                    this.add(
                        state,
                        this.mul(
                            k2,
                            0.5
                        )
                    ),
                    t + h / 2
                ),
                h
            );

        const k4 =
            this.mul(
                this.f(
                    this.add(
                        state,
                        k3
                    ),
                    t + h
                ),
                h
            );

        state =
            this.add(
                state,
                this.mul(
                    this.add4(
                        k1,
                        k2,
                        k3,
                        k4
                    ),
                    1 / 6
                )
            );
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
// MOLA
// =========================================================

spring(
    xStart,
    xEnd,
    y,
    coils = 12,
    amp = 18
) {

    const xs = [];
    const ys = [];

    const points = 120;

    const length =
        xEnd - xStart;

    /*
     * Evita problemas caso o bloco esteja
     * encostado na parede.
     */

    if (length <= 1) {

        return {
            x: [xStart, xEnd],
            y: [y, y]
        };
    }

    for (
        let i = 0;
        i < points;
        i++
    ) {

        const u =
            i / (points - 1);

        const x =
            xStart +
            u * length;

        const phase =
            u *
            coils *
            Math.PI;

        const yy =
            y +
            amp *
            Math.sin(phase);

        xs.push(x);
        ys.push(yy);
    }

    return {
        x: xs,
        y: ys
    };
}

// =========================================================
// CONVERSÃO DA POSIÇÃO
// =========================================================

physicalToCanvasX(x) {

    return this.xLeft +
        x * this.scaleX;
}

// =========================================================
// CONTROLES
// =========================================================

createControls() {

    const old =
        document.getElementById(
            "mass-spring-controls"
        );

    if (old)
        old.remove();

    const container =
        document.createElement(
            "div"
        );

    container.id =
        "mass-spring-controls";

    container.style.width =
        "100%";

    container.style.maxWidth =
        "900px";

    container.style.margin =
        "20px auto";

    container.style.fontFamily =
        "Arial, sans-serif";

    // =====================================================
    // TÍTULO
    // =====================================================

    const title =
        document.createElement(
            "h2"
        );

    title.innerText =
        "Parâmetros do oscilador";

    container.appendChild(
        title
    );

    this.sliders = {};

    // =====================================================
    // CONFIGURAÇÕES
    // =====================================================

    const configs = [

        {
            name: "k",
            label: "k (N/m)",
            min: 0.5,
            max: 20,
            step: 0.1
        },

        {
            name: "b",
            label: "b (kg/s)",
            min: 0,
            max: 10,
            step: 0.1
        },

        {
            name: "x0",
            label: "x₀ (m)",
            min: 0.3,

            /*
             * Limite calculado pela geometria.
             *
             * Com a configuração atual:
             *
             * graphX = 700
             * systemRight = 600
             * blockSize = 70
             * xLeft = 120
             * scaleX = 350
             *
             * resulta em aproximadamente:
             *
             * x₀ máximo = 1.27 m
             */

            max: this.maxX,

            step: 0.01
        },

        {
            name: "v0",
            label: "v₀ (m/s)",
            min: -5,
            max: 5,
            step: 0.1
        }

    ];

    // =====================================================
    // CRIA SLIDERS
    // =====================================================

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

            // -------------------------------------------------
            // LABEL
            // -------------------------------------------------

            const label =
                document.createElement(
                    "label"
                );

            label.style.width =
                "100px";

            label.style.flexShrink =
                "0";

            label.innerText =
                config.label;

            // -------------------------------------------------
            // SLIDER
            // -------------------------------------------------

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
                Math.min(
                    Math.max(
                        this.params[
                            config.name
                        ],
                        config.min
                    ),
                    config.max
                );

            slider.style.flex =
                "1";

            slider.style.minWidth =
                "0";

            // -------------------------------------------------
            // VALOR
            // -------------------------------------------------

            const value =
                document.createElement(
                    "span"
                );

            value.style.width =
                "70px";

            value.style.flexShrink =
                "0";

            value.style.marginLeft =
                "10px";

            value.innerText =
                Number(
                    slider.value
                ).toFixed(2);

            // -------------------------------------------------
            // EVENTO
            // -------------------------------------------------

            slider.addEventListener(
                "input",
                () => {

                    let v =
                        Number(
                            slider.value
                        );

                    /*
                     * Garantia adicional para x0.
                     */

                    if (
                        config.name === "x0"
                    ) {

                        v =
                            Math.min(
                                Math.max(
                                    v,
                                    this.minX
                                ),
                                this.maxX
                            );

                        slider.value = v;
                    }

                    this.params[
                        config.name
                    ] = v;

                    value.innerText =
                        v.toFixed(2);

                    this.solve();

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

    // =====================================================
    // INSERE DEPOIS DO CANVAS
    // =====================================================

    this.canvas.parentNode.insertBefore(
        container,
        this.canvas.nextSibling
    );
}

// =========================================================
// PAREDE
// =========================================================

drawWall(ctx) {

    const x =
        this.xLeft;

    const y =
        this.systemY -
        this.wallHeight / 2;

    ctx.save();

    ctx.strokeStyle =
        "black";

    ctx.lineWidth =
        4;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x,
        y +
        this.wallHeight
    );

    ctx.stroke();

    // =====================================================
    // HACHURAS
    // =====================================================

    ctx.lineWidth = 2;

    for (
        let yy = y;
        yy <= y + this.wallHeight;
        yy += 15
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            yy
        );

        ctx.lineTo(
            x - 12,
            yy + 10
        );

        ctx.stroke();
    }

    ctx.restore();
}

// =========================================================
// CHÃO
// =========================================================

drawFloor(ctx) {

    ctx.save();

    ctx.strokeStyle =
        "black";

    ctx.lineWidth =
        2;

    ctx.beginPath();

    ctx.moveTo(
        this.xLeft - 30,
        this.systemY +
        this.blockSize / 2
    );

    /*
     * O chão termina exatamente
     * no limite do sistema.
     */

    ctx.lineTo(
        this.systemRight,
        this.systemY +
        this.blockSize / 2
    );

    ctx.stroke();

    ctx.restore();
}

// =========================================================
// MOLA
// =========================================================

drawSpring(ctx, xMass) {

    const blockLeft =
        xMass -
        this.blockSize / 2;

    const springData =
        this.spring(
            this.xLeft,
            blockLeft,
            this.systemY,
            12,
            18
        );

    ctx.save();

    ctx.strokeStyle =
        "black";

    ctx.lineWidth =
        2;

    ctx.beginPath();

    for (
        let i = 0;
        i < springData.x.length;
        i++
    ) {

        if (i === 0) {

            ctx.moveTo(
                springData.x[i],
                springData.y[i]
            );

        } else {

            ctx.lineTo(
                springData.x[i],
                springData.y[i]
            );
        }
    }

    ctx.stroke();

    ctx.restore();
}

// =========================================================
// BLOCO
// =========================================================

drawBlock(ctx, xMass) {

    /*
     * Segunda garantia:
     * o desenho nunca permite que o bloco
     * ultrapasse os limites geométricos.
     */

    xMass =
        Math.max(
            this.minBlockCenterX,
            Math.min(
                xMass,
                this.maxBlockCenterX
            )
        );

    const left =
        xMass -
        this.blockSize / 2;

    const top =
        this.systemY -
        this.blockSize / 2;

    ctx.save();

    ctx.fillStyle =
        "#1976d2";

    ctx.strokeStyle =
        "#111";

    ctx.lineWidth =
        2;

    ctx.beginPath();

    ctx.rect(
        left,
        top,
        this.blockSize,
        this.blockSize
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// =========================================================
// POSIÇÃO DE EQUILÍBRIO
// =========================================================

drawEquilibrium(ctx) {

    const xEq =
        this.physicalToCanvasX(
            this.params.x_eq
        );

    ctx.save();

    ctx.strokeStyle =
        "#aaaaaa";

    ctx.lineWidth =
        1;

    ctx.setLineDash([
        6,
        6
    ]);

    ctx.beginPath();

    ctx.moveTo(
        xEq,
        this.systemY -
        this.blockSize
    );

    ctx.lineTo(
        xEq,
        this.systemY +
        this.blockSize
    );

    ctx.stroke();

    ctx.setLineDash([]);

    ctx.fillStyle =
        "black";

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "xₑq",
        xEq,
        this.systemY -
        this.blockSize -
        10
    );

    ctx.restore();
}

// =========================================================
// SISTEMA MASSA-MOLA
// =========================================================

drawSystem(ctx) {

    const index =
        Math.min(
            Math.floor(this.frame),
            this.x.length - 1
        );

    const x =
        this.x[index] ?? this.params.x0;

    let xMass =
        this.physicalToCanvasX(x);

    // =====================================================
    // LIMITE VISUAL ABSOLUTO
    // =====================================================

    /*
     * Independentemente da solução numérica,
     * o bloco jamais pode ultrapassar
     * o limite do sistema.
     */

    xMass =
        Math.max(
            this.minBlockCenterX,
            Math.min(
                xMass,
                this.maxBlockCenterX
            )
        );

    this.drawWall(ctx);

    this.drawFloor(ctx);

    this.drawEquilibrium(ctx);

    this.drawSpring(
        ctx,
        xMass
    );

    this.drawBlock(
        ctx,
        xMass
    );
}

// =========================================================
// HUD
// =========================================================

drawHUD(ctx) {

    const p =
        this.params;

    const index =
        Math.min(
            Math.floor(this.frame),
            this.x.length - 1
        );

    const x =
        this.x[index] ?? 0;

    const v =
        this.v[index] ?? 0;

    const t =
        this.time[index] ?? 0;

    const boxX = 20;
    const boxY = 20;

    const width = 315;
    const height = 170;

    ctx.save();

    // =====================================================
    // CAIXA
    // =====================================================

    ctx.fillStyle =
        "rgba(255,255,255,0.95)";

    ctx.strokeStyle =
        "#777";

    ctx.lineWidth =
        1;

    ctx.beginPath();

    /*
     * rect em vez de roundRect para
     * máxima compatibilidade.
     */

    ctx.rect(
        boxX,
        boxY,
        width,
        height
    );

    ctx.fill();
    ctx.stroke();

    // =====================================================
    // TEXTO
    // =====================================================

    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 14px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "Oscilador massa–mola amortecido",
        boxX + 12,
        boxY + 20
    );

    ctx.font =
        "12px Arial";

    ctx.fillText(
        `k = ${p.k.toFixed(2)} N/m`,
        boxX + 12,
        boxY + 45
    );

    ctx.fillText(
        `b = ${p.b.toFixed(2)} kg/s`,
        boxX + 12,
        boxY + 63
    );

    ctx.fillText(
        `m = ${p.m.toFixed(2)} kg`,
        boxX + 12,
        boxY + 81
    );

    ctx.fillText(
        `x₀ = ${p.x0.toFixed(3)} m`,
        boxX + 12,
        boxY + 99
    );

    ctx.fillText(
        `v₀ = ${p.v0.toFixed(3)} m/s`,
        boxX + 12,
        boxY + 117
    );

    const col2 =
        boxX + 165;

    ctx.fillText(
        `x = ${x.toFixed(3)} m`,
        col2,
        boxY + 45
    );

    ctx.fillText(
        `v = ${v.toFixed(3)} m/s`,
        col2,
        boxY + 63
    );

    ctx.fillText(
        `t = ${t.toFixed(2)} s`,
        col2,
        boxY + 81
    );

    ctx.fillText(
        `xₑq = ${p.x_eq.toFixed(2)} m`,
        col2,
        boxY + 99
    );

    ctx.restore();
}

// =========================================================
// GRÁFICO
// =========================================================

drawGraph(ctx) {

    const graphX =
        this.graphX;

    const graphY =
        this.graphY;

    const graphW =
        this.graphW;

    const graphH =
        this.graphH;

    ctx.save();

    // =====================================================
    // TÍTULO
    // =====================================================

    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 18px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "Evolução temporal",
        graphX + 100,
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
            Math.floor(this.frame) + 1,
            this.time.length
        );

    if (n < 2) {

        ctx.restore();

        return;
    }

    // =====================================================
    // ESCALA
    // =====================================================

    let minValue =
        Infinity;

    let maxValue =
        -Infinity;

    for (
        let i = 0;
        i < n;
        i++
    ) {

        minValue =
            Math.min(
                minValue,
                this.x[i],
                this.v[i]
            );

        maxValue =
            Math.max(
                maxValue,
                this.x[i],
                this.v[i]
            );
    }

    if (
        Math.abs(
            maxValue -
            minValue
        ) < 1e-8
    ) {

        maxValue += 1;
        minValue -= 1;
    }

    const margem =
        0.2 *
        (
            maxValue -
            minValue
        );

    minValue -= margem;
    maxValue += margem;

    // =====================================================
    // CONVERSÕES
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

            return graphY +
                graphH -
                (
                    (
                        value -
                        minValue
                    ) /
                    (
                        maxValue -
                        minValue
                    )
                ) *
                graphH;
        };

    // =====================================================
    // EIXO ZERO
    // =====================================================

    if (
        minValue <= 0 &&
        maxValue >= 0
    ) {

        const zeroY =
            convertY(0);

        ctx.strokeStyle =
            "#999";

        ctx.beginPath();

        ctx.moveTo(
            graphX,
            zeroY
        );

        ctx.lineTo(
            graphX + graphW,
            zeroY
        );

        ctx.stroke();
    }

    // =====================================================
    // TICKS Y
    // =====================================================

    const ticks = 6;

    ctx.font =
        "11px Arial";

    ctx.fillStyle =
        "black";

    ctx.textAlign =
        "right";

    for (
        let k = 0;
        k <= ticks;
        k++
    ) {

        const value =
            minValue +
            (
                maxValue -
                minValue
            ) *
            k /
            ticks;

        const y =
            convertY(value);

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

        ctx.fillStyle =
            "black";

        ctx.fillText(
            value.toFixed(2),
            graphX - 8,
            y + 4
        );
    }

    // =====================================================
    // TICKS X
    // =====================================================

    const xTicks = 5;

    ctx.textAlign =
        "center";

    for (
        let k = 0;
        k <= xTicks;
        k++
    ) {

        const time =
            this.tf *
            k /
            xTicks;

        const xx =
            graphX +
            graphW *
            k /
            xTicks;

        ctx.strokeStyle =
            "#777";

        ctx.beginPath();

        ctx.moveTo(
            xx,
            graphY + graphH
        );

        ctx.lineTo(
            xx,
            graphY + graphH + 5
        );

        ctx.stroke();

        ctx.fillStyle =
            "black";

        ctx.fillText(
            time.toFixed(1),
            xx,
            graphY +
            graphH +
            18
        );
    }

    // =====================================================
    // LABEL X
    // =====================================================

    ctx.font =
        "14px Arial";

    ctx.fillText(
        "t [s]",
        graphX +
        graphW / 2,
        graphY +
        graphH +
        40
    );

    // =====================================================
    // LABEL Y
    // =====================================================

    ctx.save();

    ctx.translate(
        graphX - 60,
        graphY +
        graphH / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.textAlign =
        "center";

    ctx.fillText(
        "x(t) [m] / v(t) [m/s]",
        0,
        0
    );

    ctx.restore();

    // =====================================================
    // x(t)
    // =====================================================

    ctx.lineWidth =
        2;

    ctx.strokeStyle =
        "#1976d2";

    ctx.beginPath();

    for (
        let i = 0;
        i < n;
        i++
    ) {

        const xx =
            convertX(
                this.time[i]
            );

        const yy =
            convertY(
                this.x[i]
            );

        if (i === 0) {

            ctx.moveTo(
                xx,
                yy
            );

        } else {

            ctx.lineTo(
                xx,
                yy
            );
        }
    }

    ctx.stroke();

    // =====================================================
    // v(t)
    // =====================================================

    ctx.strokeStyle =
        "#f57c00";

    ctx.beginPath();

    for (
        let i = 0;
        i < n;
        i++
    ) {

        const xx =
            convertX(
                this.time[i]
            );

        const yy =
            convertY(
                this.v[i]
            );

        if (i === 0) {

            ctx.moveTo(
                xx,
                yy
            );

        } else {

            ctx.lineTo(
                xx,
                yy
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
        "x(t) [m]",
        graphX +
        graphW -
        100,
        graphY + 25
    );

    ctx.fillStyle =
        "#f57c00";

    ctx.fillText(
        "v(t) [m/s]",
        graphX +
        graphW -
        100,
        graphY + 45
    );

    ctx.restore();
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

    this.drawSystem(ctx);

    this.drawHUD(ctx);

    this.drawGraph(ctx);
}

// =========================================================
// ANIMAÇÃO
// =========================================================

iniciar() {

    if (this.running)
        return;

    this.running = true;

    const loop = () => {

        if (!this.running)
            return;

        this.draw();

        this.frame +=
            this.animationSpeed;

        if (
            this.frame >=
            this.time.length
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

    // =====================================================
    // GARANTE x0 DENTRO DA GEOMETRIA
    // =====================================================

    this.params.x0 =
        Math.min(
            Math.max(
                this.params.x0,
                this.minX
            ),
            this.maxX
        );

    // =====================================================
    // ATUALIZA SLIDERS
    // =====================================================

    Object.keys(
        this.sliders
    ).forEach(
        key => {

            if (
                key in this.params
            ) {

                this.sliders[key].value =
                    this.params[key];
            }
        }
    );

    this.solve();

    this.draw();
}

}
