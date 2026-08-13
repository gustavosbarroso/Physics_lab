class RLCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // DIMENSÕES DO CANVAS
        // =====================================================

        this.canvas.width = 700;
        this.canvas.height = 750;


        // =====================================================
        // PARÂMETROS FÍSICOS
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
        // RESULTADOS DA SIMULAÇÃO
        // =====================================================

        this.time = [];
        this.q = [];
        this.current = [];


        // =====================================================
        // ANIMAÇÃO
        // =====================================================

        this.running = false;
        this.frame = 0;


        // =====================================================
        // RESOLVE A EDO
        // =====================================================

        this.solve();
    }


    // =========================================================
    // SISTEMA DE EQUAÇÕES DIFERENCIAIS
    // =========================================================

    f(state, t) {

        const q = state[0];
        const i = state[1];

        const p = this.params;


        // Fonte externa

        const Vt =
            p.V0 *
            Math.cos(p.omega * t);


        /*
            dq/dt = i

            di/dt =
                V(t)/L
                - R/L * i
                - q/(LC)
        */

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


        let state = [

            this.params.q0,
            this.params.i0

        ];


        this.time = [];
        this.q = [];
        this.current = [];


        for (let n = 0; n <= N; n++) {

            const t =
                a + n * h;


            // Guardar solução

            this.time.push(t);

            this.q.push(
                state[0]
            );

            this.current.push(
                state[1]
            );


            if (n === N)
                break;


            // -------------------------
            // k1
            // -------------------------

            const k1 =
                this.mul(
                    this.f(state, t),
                    h
                );


            // -------------------------
            // k2
            // -------------------------

            const k2 =
                this.mul(

                    this.f(

                        this.add(
                            state,
                            this.mul(k1, 0.5)
                        ),

                        t + h / 2

                    ),

                    h
                );


            // -------------------------
            // k3
            // -------------------------

            const k3 =
                this.mul(

                    this.f(

                        this.add(
                            state,
                            this.mul(k2, 0.5)
                        ),

                        t + h / 2

                    ),

                    h
                );


            // -------------------------
            // k4
            // -------------------------

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


            // -------------------------
            // atualização
            // -------------------------

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
    // SOLVER
    // =========================================================

    solve() {

        this.RK4();

        this.frame = 0;

        this.draw();
    }


    // =========================================================
    // CLASSIFICAÇÃO DO REGIME
    // =========================================================

    regime() {

        const p = this.params;


        const omega0 =
            1 /
            Math.sqrt(
                p.L * p.C
            );


        const gamma =
            p.R /
            (2 * p.L);


        if (
            Math.abs(
                gamma - omega0
            ) < 1e-3
        ) {

            return "Criticamente amortecido";
        }


        if (gamma > omega0) {

            return "Superamortecido";
        }


        return "Subamortecido";
    }


    // =========================================================
    // DESENHO PRINCIPAL
    // =========================================================

    draw() {

        const ctx = this.ctx;

        const w = this.canvas.width;
        const h = this.canvas.height;


        // Limpar canvas

        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";

        ctx.lineWidth = 3;


        // =====================================================
        // TÍTULO DO CIRCUITO
        // =====================================================

        ctx.font =
            "bold 22px Arial";

        ctx.fillText(
            "Circuito RLC",
            40,
            35
        );


        // =====================================================
        // CIRCUITO
        // =====================================================

        this.drawCircuit();


        // =====================================================
        // GRÁFICO
        // =====================================================

        this.drawGraph();
    }


    // =========================================================
    // DESENHO DO CIRCUITO
    // =========================================================

    drawCircuit() {

        const ctx = this.ctx;


        // -------------------------
        // Geometria
        // -------------------------

        const left = 100;
        const right = 600;

        const top = 90;
        const bottom = 350;


        // -------------------------
        // Fios
        // -------------------------

        ctx.lineWidth = 3;

        ctx.beginPath();


        // lado esquerdo

        ctx.moveTo(
            left,
            top
        );

        ctx.lineTo(
            left,
            bottom
        );


        // parte inferior esquerda

        ctx.moveTo(
            left,
            bottom
        );

        ctx.lineTo(
            250,
            bottom
        );


        // parte inferior direita

        ctx.moveTo(
            450,
            bottom
        );

        ctx.lineTo(
            right,
            bottom
        );


        // lado direito

        ctx.moveTo(
            right,
            bottom
        );

        ctx.lineTo(
            right,
            top
        );


        // parte superior esquerda

        ctx.moveTo(
            left,
            top
        );

        ctx.lineTo(
            250,
            top
        );


        // parte superior direita

        ctx.moveTo(
            450,
            top
        );

        ctx.lineTo(
            right,
            top
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
                (n / 120)
                * coilWidth;


            const y =
                top
                +
                Math.sin(
                    (n / 120)
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


        // Letra L

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "L",
            340,
            65
        );


        // =====================================================
        // RESISTOR
        // =====================================================

        ctx.beginPath();


        const resistorTop = 150;
        const resistorBottom = 270;

        const resistorAmplitude = 15;

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
                (n / steps)
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
                    ? resistorAmplitude
                    : -resistorAmplitude
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


        // Letra R

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

        const capacitorX = 350;


        ctx.beginPath();


        // fio até placa superior

        ctx.moveTo(
            capacitorX - 50,
            bottom
        );

        ctx.lineTo(
            capacitorX - 25,
            bottom
        );


        // placa superior

        ctx.moveTo(
            capacitorX - 25,
            bottom - 20
        );

        ctx.lineTo(
            capacitorX + 25,
            bottom - 20
        );


        // placa inferior

        ctx.moveTo(
            capacitorX - 25,
            bottom + 20
        );

        ctx.lineTo(
            capacitorX + 25,
            bottom + 20
        );


        // fio depois da placa

        ctx.moveTo(
            capacitorX + 25,
            bottom
        );

        ctx.lineTo(
            capacitorX + 50,
            bottom
        );


        ctx.stroke();


        // Letra C

        ctx.font =
            "bold 20px Arial";

        ctx.fillText(
            "C",
            380,
            395
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

        const ctx = this.ctx;


        /*
            A posição é calculada ao longo
            do perímetro do circuito.
        */


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


        const distance =

            (
                this.frame * 2
            )
            %
            perimeter;


        let x;
        let y;


        // -------------------------
        // superior
        // -------------------------

        if (
            distance
            <
            right - left
        ) {

            x =
                left
                +
                distance;

            y = top;
        }


        // -------------------------
        // direita
        // -------------------------

        else if (

            distance
            <
            (
                right - left
                +
                bottom - top
            )

        ) {

            x = right;

            y =
                top
                +
                distance
                -
                (
                    right - left
                );
        }


        // -------------------------
        // inferior
        // -------------------------

        else if (

            distance
            <
            (
                2 *
                (right - left)
                +
                (bottom - top)
            )

        ) {

            x =

                right
                -
                (
                    distance
                    -
                    (right - left)
                    -
                    (bottom - top)
                );


            y = bottom;
        }


        // -------------------------
        // esquerda
        // -------------------------

        else {

            x = left;

            y =

                bottom
                -
                (
                    distance
                    -
                    2 *
                    (right - left)
                    -
                    (bottom - top)
                );
        }


        // -------------------------
        // desenho
        // -------------------------

        ctx.fillStyle =
            "black";


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            6,
            0,
            2 * Math.PI
        );


        ctx.fill();
    }


    // =========================================================
    // GRÁFICO q(t) E i(t)
    // =========================================================

    drawGraph() {

        const ctx = this.ctx;


        // =====================================================
        // ÁREA DO GRÁFICO
        // =====================================================

        const x0 = 80;
        const x1 = 650;

        const y0 = 450;
        const y1 = 700;


        const graphWidth =
            x1 - x0;

        const graphHeight =
            y1 - y0;


        // =====================================================
        // TÍTULO
        // =====================================================

        ctx.font =
            "bold 20px Arial";


        ctx.fillStyle =
            "black";


        ctx.fillText(
            "Solução numérica",
            x0,
            y0 - 20
        );


        // =====================================================
        // EIXOS
        // =====================================================

        ctx.lineWidth = 2;


        ctx.beginPath();


        // eixo x

        ctx.moveTo(
            x0,
            y1
        );

        ctx.lineTo(
            x1,
            y1
        );


        // eixo y

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
        // GRID
        // =====================================================

        ctx.strokeStyle =
            "#dddddd";

        ctx.lineWidth = 1;


        // linhas horizontais

        for (
            let n = 1;
            n < 5;
            n++
        ) {

            const y =
                y0
                +
                (
                    n / 5
                )
                *
                graphHeight;


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


        // linhas verticais

        for (
            let n = 1;
            n < 5;
            n++
        ) {

            const x =
                x0
                +
                (
                    n / 5
                )
                *
                graphWidth;


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


        // =====================================================
        // DETERMINAR ESCALA
        // =====================================================

        let maxQ = 0;
        let maxI = 0;


        for (
            let n = 0;
            n < this.q.length;
            n++
        ) {

            maxQ =
                Math.max(
                    maxQ,
                    Math.abs(
                        this.q[n]
                    )
                );


            maxI =
                Math.max(
                    maxI,
                    Math.abs(
                        this.current[n]
                    )
                );
        }


        // evitar divisão por zero

        if (maxQ === 0)
            maxQ = 1;


        if (maxI === 0)
            maxI = 1;


        // escala única para facilitar comparação

        const maxValue =
            Math.max(
                maxQ,
                maxI
            );


        // =====================================================
        // q(t)
        // =====================================================

        ctx.strokeStyle =
            "black";

        ctx.lineWidth = 2;


        ctx.beginPath();


        for (
            let n = 0;
            n < this.q.length;
            n++
        ) {

            const x =

                x0
                +
                (
                    this.time[n]
                    /
                    this.time[
                        this.time.length - 1
                    ]
                )
                *
                graphWidth;


            const y =

                y0
                +
                graphHeight / 2
                -
                (
                    this.q[n]
                    /
                    maxValue
                )
                *
                (
                    graphHeight / 2
                );


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


        // =====================================================
        // i(t)
        // =====================================================

        ctx.setLineDash([
            6,
            4
        ]);


        ctx.beginPath();


        for (
            let n = 0;
            n < this.current.length;
            n++
        ) {

            const x =

                x0
                +
                (
                    this.time[n]
                    /
                    this.time[
                        this.time.length - 1
                    ]
                )
                *
                graphWidth;


            const y =

                y0
                +
                graphHeight / 2
                -
                (
                    this.current[n]
                    /
                    maxValue
                )
                *
                (
                    graphHeight / 2
                );


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


        ctx.setLineDash([]);


        // =====================================================
        // LINHA ZERO
        // =====================================================

        ctx.strokeStyle =
            "#888888";

        ctx.lineWidth = 1;


        ctx.beginPath();


        ctx.moveTo(
            x0,
            y0 + graphHeight / 2
        );


        ctx.lineTo(
            x1,
            y0 + graphHeight / 2
        );


        ctx.stroke();


        // =====================================================
        // MARCADOR DA ANIMAÇÃO
        // =====================================================

        if (
            this.time.length > 0
        ) {

            const index =
                Math.floor(
                    this.frame
                    %
                    this.time.length
                );


            const x =

                x0
                +
                (
                    this.time[index]
                    /
                    this.time[
                        this.time.length - 1
                    ]
                )
                *
                graphWidth;


            ctx.strokeStyle =
                "#555555";

            ctx.lineWidth = 1;


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


        // =====================================================
        // LEGENDA
        // =====================================================

        ctx.font =
            "14px Arial";


        ctx.fillStyle =
            "black";


        ctx.fillText(
            "q(t)",
            x1 - 80,
            y0 + 20
        );


        ctx.setLineDash([
            6,
            4
        ]);


        ctx.beginPath();


        ctx.moveTo(
            x1 - 110,
            y0 + 15
        );


        ctx.lineTo(
            x1 - 90,
            y0 + 15
        );


        ctx.stroke();


        ctx.setLineDash([]);


        ctx.fillText(
            "i(t)",
            x1 - 80,
            y0 + 45
        );


        // =====================================================
        // EIXO DO TEMPO
        // =====================================================

        ctx.font =
            "13px Arial";


        ctx.fillText(
            "0",
            x0 - 5,
            y1 + 20
        );


        ctx.fillText(
            "t (s)",
            x1 - 20,
            y1 + 20
        );


        ctx.fillText(
            this.time[
                this.time.length - 1
            ].toFixed(1),
            x1 - 30,
            y1 + 20
        );
    }


    // =========================================================
    // INICIAR
    // =========================================================

    iniciar() {

        // Evita múltiplas animações

        if (this.running)
            return;


        this.running = true;


        const loop = () => {

            if (!this.running)
                return;


            this.draw();


            this.frame++;


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


        this.solve();
    }
}
