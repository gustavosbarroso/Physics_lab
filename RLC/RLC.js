class RLCircuit {

    constructor(canvas, options = {}) {

        // =====================================================
        // CANVAS
        // =====================================================

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");


        // =====================================================
        // PARÂMETROS DO CIRCUITO
        // =====================================================

        this.params = {

            R: 2.0,
            L: 1.0,
            C: 1.0,

            q0: 0.0,
            i0: 0.0,

            V0: 5.0,
            omega: 2.0,

            ...options

        };


        // =====================================================
        // ARRAYS DA SOLUÇÃO NUMÉRICA
        // =====================================================

        this.time = [];
        this.q = [];
        this.current = [];


        // =====================================================
        // CONTROLE DA ANIMAÇÃO
        // =====================================================

        this.running = false;

        this.frame = 0;

        this.animationId = null;


        // =====================================================
        // RESOLVE A EDO
        // =====================================================

        this.solve();

    }


    // =========================================================
    // SISTEMA DIFERENCIAL
    // =========================================================
    //
    // Para um circuito RLC série:
    //
    // L q'' + R q' + q/C = V(t)
    //
    // Definindo:
    //
    // q' = i
    //
    // i' = V(t)/L - R*i/L - q/(LC)
    //
    // =========================================================

    f(state, t) {

        const q = state[0];

        const i = state[1];

        const p = this.params;


        // Fonte senoidal

        const Vt =
            p.V0 *
            Math.cos(
                p.omega * t
            );


        return [

            i,

            (Vt / p.L)
            -
            (p.R / p.L) * i
            -
            (1 / (p.L * p.C)) * q

        ];

    }


    // =========================================================
    // RK4
    // =========================================================

    RK4() {

        const a = 0;

        const b = 20;

        const N = 500;


        const h =
            (b - a) / N;


        // Estado inicial

        let state = [

            this.params.q0,

            this.params.i0

        ];


        // Limpa resultados anteriores

        this.time = [];

        this.q = [];

        this.current = [];


        // =====================================================
        // INTEGRAÇÃO
        // =====================================================

        for (
            let n = 0;
            n <= N;
            n++
        ) {

            const t =
                a + n * h;


            // Guarda solução

            this.time.push(t);

            this.q.push(state[0]);

            this.current.push(state[1]);


            if (n === N) {

                break;

            }


            // -------------------------------------------------
            // k1
            // -------------------------------------------------

            const k1 =
                this.mul(
                    this.f(
                        state,
                        t
                    ),
                    h
                );


            // -------------------------------------------------
            // k2
            // -------------------------------------------------

            const state2 =
                this.add(
                    state,
                    this.mul(
                        k1,
                        0.5
                    )
                );


            const k2 =
                this.mul(
                    this.f(
                        state2,
                        t + h / 2
                    ),
                    h
                );


            // -------------------------------------------------
            // k3
            // -------------------------------------------------

            const state3 =
                this.add(
                    state,
                    this.mul(
                        k2,
                        0.5
                    )
                );


            const k3 =
                this.mul(
                    this.f(
                        state3,
                        t + h / 2
                    ),
                    h
                );


            // -------------------------------------------------
            // k4
            // -------------------------------------------------

            const state4 =
                this.add(
                    state,
                    k3
                );


            const k4 =
                this.mul(
                    this.f(
                        state4,
                        t + h
                    ),
                    h
                );


            // -------------------------------------------------
            // RK4
            // -------------------------------------------------

            const weighted =
                this.add4(
                    k1,
                    k2,
                    k3,
                    k4
                );


            state =
                this.add(
                    state,
                    this.mul(
                        weighted,
                        1 / 6
                    )
                );

        }

    }


    // =========================================================
    // OPERAÇÕES COM VETORES
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

            a[0]
            + 2 * b[0]
            + 2 * c[0]
            + d[0],

            a[1]
            + 2 * b[1]
            + 2 * c[1]
            + d[1]

        ];

    }


    // =========================================================
    // RESOLVER
    // =========================================================

    solve() {

        this.RK4();

    }


    // =========================================================
    // CLASSIFICAÇÃO DO REGIME
    // =========================================================

    regime() {

        const p =
            this.params;


        // Frequência natural

        const omega0 =
            1 /
            Math.sqrt(
                p.L * p.C
            );


        // Coeficiente de amortecimento

        const gamma =
            p.R /
            (2 * p.L);


        const tolerance = 1e-3;


        if (
            Math.abs(
                gamma - omega0
            ) < tolerance
        ) {

            return "Criticamente amortecido";

        }


        if (
            gamma > omega0
        ) {

            return "Superamortecido";

        }


        return "Subamortecido";

    }


    // =========================================================
    // DESENHO COMPLETO
    // =========================================================

    draw() {

        const ctx =
            this.ctx;


        // Limpa canvas

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
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 24px Arial";

        ctx.fillText(
            "Circuito RLC",
            40,
            40
        );


        // =====================================================
        // CIRCUITO
        // =====================================================

        this.drawCircuit();


        // =====================================================
        // GRÁFICO
        // =====================================================

        this.drawGraph();


        // =====================================================
        // INFORMAÇÕES
        // =====================================================

        this.drawInfo();

    }


    // =========================================================
    // DESENHAR CIRCUITO
    // =========================================================

    drawCircuit() {

        const ctx =
            this.ctx;


        // =====================================================
        // GEOMETRIA
        // =====================================================

        const left = 100;

        const right = 600;

        const top = 90;

        const bottom = 350;


        // =====================================================
        // CONFIGURAÇÃO
        // =====================================================

        ctx.lineWidth = 3;

        ctx.strokeStyle =
            "black";

        ctx.fillStyle =
            "black";


        // =====================================================
        // FIOS
        // =====================================================

        ctx.beginPath();


        // ---------------------------------
        // RAMO ESQUERDO
        // ---------------------------------

        ctx.moveTo(
            left,
            top
        );

        ctx.lineTo(
            left,
            bottom
        );


        // ---------------------------------
        // RAMO SUPERIOR
        // Antes do indutor
        // ---------------------------------

        ctx.moveTo(
            left,
            top
        );

        ctx.lineTo(
            250,
            top
        );


        // ---------------------------------
        // RAMO SUPERIOR
        // Depois do indutor
        // ---------------------------------

        ctx.moveTo(
            450,
            top
        );

        ctx.lineTo(
            right,
            top
        );


        // ---------------------------------
        // RAMO DIREITO
        // ---------------------------------

        ctx.moveTo(
            right,
            top
        );

        ctx.lineTo(
            right,
            bottom
        );


        // ---------------------------------
        // RAMO INFERIOR
        // Antes do capacitor
        // ---------------------------------

        ctx.moveTo(
            left,
            bottom
        );

        ctx.lineTo(
            325,
            bottom
        );


        // ---------------------------------
        // RAMO INFERIOR
        // Depois do capacitor
        // ---------------------------------

        ctx.moveTo(
            375,
            bottom
        );

        ctx.lineTo(
            right,
            bottom
        );


        ctx.stroke();


        // =====================================================
        // INDUTOR
        // =====================================================

        ctx.beginPath();


        const coilStart = 250;

        const coilEnd = 450;

        const coilWidth =
            coilEnd - coilStart;


        const loops = 6;


        for (
            let n = 0;
            n <= 120;
            n++
        ) {

            const x =
                coilStart
                +
                (
                    n / 120
                )
                *
                coilWidth;


            const y =
                top
                +
                Math.sin(
                    (
                        n / 120
                    )
                    *
                    loops
                    *
                    2
                    *
                    Math.PI
                )
                *
                15;


            if (n === 0) {

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


        // Label L

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "L",
            370,
            65
        );


        // =====================================================
        // RESISTOR
        // =====================================================

        ctx.beginPath();


        const resistorTop = 150;

        const resistorBottom = 270;

        const amplitude = 15;

        const steps = 8;


        ctx.moveTo(
            left,
            resistorTop
        );


        for (
            let n = 0;
            n <= steps;
            n++
        ) {

            const y =
                resistorTop
                +
                (
                    n / steps
                )
                *
                (
                    resistorBottom
                    -
                    resistorTop
                );


            const x =
                left
                +
                (
                    n % 2 === 0
                        ? amplitude
                        : -amplitude
                );


            ctx.lineTo(
                x,
                y
            );

        }


        ctx.lineTo(
            left,
            resistorBottom
        );


        ctx.stroke();


        // Label R

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "R",
            65,
            215
        );


        // =====================================================
        // CAPACITOR
        // =====================================================

        /*
            O fio inferior é horizontal:

            ─────────────────────────────

            Portanto as placas devem ser
            verticais:

                    │
                    │
                    │

                    │
                    │
                    │

            Dessa forma:

            placas ⟂ fio
        */


        const capacitorX = 350;

        const plateHeight = 45;

        const gap = 10;


        ctx.beginPath();


        // ---------------------------------
        // PLACA ESQUERDA
        // ---------------------------------

        ctx.moveTo(
            capacitorX - gap / 2,
            bottom - plateHeight / 2
        );

        ctx.lineTo(
            capacitorX - gap / 2,
            bottom + plateHeight / 2
        );


        // ---------------------------------
        // PLACA DIREITA
        // ---------------------------------

        ctx.moveTo(
            capacitorX + gap / 2,
            bottom - plateHeight / 2
        );

        ctx.lineTo(
            capacitorX + gap / 2,
            bottom + plateHeight / 2
        );


        ctx.stroke();


        // Label C

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "C",
            capacitorX - 7,
            bottom + 70
        );


        // =====================================================
        // ELÉTRON
        // =====================================================

        this.drawElectron(
            left,
            right,
            top,
            bottom
        );

    }


    // =========================================================
    // ELÉTRON
    // =========================================================

    drawElectron(
        left,
        right,
        top,
        bottom
    ) {

        const ctx =
            this.ctx;


        // Comprimento aproximado do circuito

        const perimeter =
            2 *
            (
                right - left
            )
            +
            2 *
            (
                bottom - top
            );


        // Posição animada

        const distance =
            (
                this.frame * 2
            )
            %
            perimeter;


        let x;

        let y;


        // =====================================================
        // PERCURSO
        // =====================================================


        // ---------------------------------
        // segmento superior
        // ---------------------------------

        if (
            distance <
            (right - left)
        ) {

            x =
                left
                +
                distance;

            y =
                top;

        }


        // ---------------------------------
        // segmento direito
        // ---------------------------------

        else if (
            distance <
            (
                (right - left)
                +
                (bottom - top)
            )
        ) {

            const d =
                distance
                -
                (right - left);


            x =
                right;

            y =
                top + d;

        }


        // ---------------------------------
        // segmento inferior
        // ---------------------------------

        else if (
            distance <
            (
                2 *
                (right - left)
                +
                (bottom - top)
            )
        ) {

            const d =
                distance
                -
                (
                    (right - left)
                    +
                    (bottom - top)
                );


            x =
                right - d;

            y =
                bottom;

        }


        // ---------------------------------
        // segmento esquerdo
        // ---------------------------------

        else {

            const d =
                distance
                -
                (
                    2 *
                    (right - left)
                    +
                    (bottom - top)
                );


            x =
                left;

            y =
                bottom - d;

        }


        // =====================================================
        // DESENHO
        // =====================================================

        ctx.fillStyle =
            "black";


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            5,
            0,
            2 * Math.PI
        );


        ctx.fill();

    }


    // =========================================================
    // GRÁFICO
    // =========================================================

    drawGraph() {

        const ctx =
            this.ctx;


        const x0 = 70;

        const x1 = 650;

        const y0 = 430;

        const y1 = 690;


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "Solução numérica",
            x0,
            y0 - 20
        );


        // =====================================================
        // EIXOS
        // =====================================================

        ctx.lineWidth = 1;

        ctx.strokeStyle =
            "black";


        ctx.beginPath();


        // eixo Y

        ctx.moveTo(
            x0,
            y0
        );

        ctx.lineTo(
            x0,
            y1
        );


        // eixo X

        ctx.moveTo(
            x0,
            y1
        );

        ctx.lineTo(
            x1,
            y1
        );


        ctx.stroke();


        // =====================================================
        // CASO NÃO EXISTAM DADOS
        // =====================================================

        if (
            this.time.length === 0
        ) {

            return;

        }


        // =====================================================
        // ENCONTRAR ESCALA
        // =====================================================

        let maxQ = 0;

        let maxI = 0;


        for (
            let i = 0;
            i < this.q.length;
            i++
        ) {

            maxQ =
                Math.max(
                    maxQ,
                    Math.abs(
                        this.q[i]
                    )
                );


            maxI =
                Math.max(
                    maxI,
                    Math.abs(
                        this.current[i]
                    )
                );

        }


        const maxValue =
            Math.max(
                maxQ,
                maxI,
                0.001
            );


        // =====================================================
        // DESENHA Q(t)
        // =====================================================

        ctx.lineWidth = 2;

        ctx.strokeStyle =
            "black";


        ctx.setLineDash([]);


        ctx.beginPath();


        for (
            let i = 0;
            i < this.q.length;
            i++
        ) {

            const x =
                x0
                +
                (
                    i /
                    (
                        this.q.length - 1
                    )
                )
                *
                (
                    x1 - x0
                );


            const normalized =
                this.q[i]
                /
                maxValue;


            const y =
                (
                    y0 + y1
                ) / 2
                -
                normalized
                *
                (
                    y1 - y0
                )
                *
                0.45;


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


        // =====================================================
        // DESENHA i(t)
        // =====================================================

        ctx.setLineDash([
            7,
            5
        ]);


        ctx.beginPath();


        for (
            let i = 0;
            i < this.current.length;
            i++
        ) {

            const x =
                x0
                +
                (
                    i /
                    (
                        this.current.length - 1
                    )
                )
                *
                (
                    x1 - x0
                );


            const normalized =
                this.current[i]
                /
                maxValue;


            const y =
                (
                    y0 + y1
                ) / 2
                -
                normalized
                *
                (
                    y1 - y0
                )
                *
                0.45;


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


        ctx.setLineDash([]);


        // =====================================================
        // LINHA CENTRAL
        // =====================================================

        ctx.strokeStyle =
            "#cccccc";

        ctx.lineWidth = 1;


        ctx.beginPath();


        ctx.moveTo(
            x0,
            (y0 + y1) / 2
        );

        ctx.lineTo(
            x1,
            (y0 + y1) / 2
        );


        ctx.stroke();


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.fillStyle =
            "black";

        ctx.font =
            "14px Arial";


        ctx.fillText(
            "q(t)",
            x1 - 55,
            y0 + 20
        );


        ctx.setLineDash([
            7,
            5
        ]);


        ctx.fillText(
            "i(t)",
            x1 - 55,
            y0 + 45
        );


        ctx.setLineDash([]);

    }


    // =========================================================
    // INFORMAÇÕES DO CIRCUITO
    // =========================================================

    drawInfo() {

        const ctx =
            this.ctx;


        const p =
            this.params;


        ctx.fillStyle =
            "black";


        ctx.font =
            "14px Arial";


        // Regime

        ctx.fillText(
            "Regime: " +
            this.regime(),
            70,
            720
        );


        // Frequência natural

        const omega0 =
            1 /
            Math.sqrt(
                p.L * p.C
            );


        ctx.fillText(
            "ω₀ = " +
            omega0.toFixed(3)
            +
            " rad/s",
            300,
            720
        );

    }


    // =========================================================
    // INICIAR ANIMAÇÃO
    // =========================================================

    iniciar() {

        // Evita criar várias animações
        // simultâneas

        if (
            this.running
        ) {

            return;

        }


        this.running = true;


        const loop = () => {

            if (
                !this.running
            ) {

                return;

            }


            this.draw();


            this.frame++;


            this.animationId =
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
    // ATUALIZAR PARÂMETROS
    // =========================================================

    atualizarParametros(
        newParams
    ) {

        this.params = {

            ...this.params,

            ...newParams

        };


        // Recalcula a solução

        this.solve();


        // Redesenha imediatamente

        this.draw();

    }

}
