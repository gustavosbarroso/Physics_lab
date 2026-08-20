class TwoBodySystem {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS CONTROLÁVEIS
        // =====================================================

        this.params = {

            // Massas
            m1: 1.0,       // M☉
            m2: 1.0,       // M☉

            // Excentricidade
            e: 0.5,

            // Semieixo maior FIXO
            a: 2.0,        // UA

            // Número de períodos simulados
            periods: 2.0
        };

        Object.assign(
            this.params,
            options
        );

        // =====================================================
        // CONSTANTES
        // =====================================================

        // G em UA³ / (M☉ ano²)
        this.G = 4 * Math.PI * Math.PI;

        // UA/ano -> km/s
        this.UA_POR_ANO = 4.74047;

        // =====================================================
        // ESTADO
        // =====================================================

        this.t = [];
        this.sol = [];

        this.frame = 0;

        this.running = true;
        this.animationId = null;

        // =====================================================
        // GEOMETRIA
        // =====================================================

        this.width = canvas.width;
        this.height = canvas.height;

        this.cx = this.width / 2;
        this.cy = this.height / 2;

        this.scale = 70;

        // =====================================================
        // CORPOS
        // =====================================================

        this.radius1 = 8;
        this.radius2 = 8;

        this.cmSize = 10;

        // =====================================================
        // TRAJETÓRIAS
        // =====================================================

        this.trail1 = [];
        this.trail2 = [];

        // =====================================================
        // INICIALIZAÇÃO
        // =====================================================

        this.solve();

        this.animate =
            this.animate.bind(this);
    }


    // =========================================================
    // PARÂMETROS
    // =========================================================

    setParameters(params) {

        Object.assign(
            this.params,
            params
        );

        // Garante uma excentricidade física
        this.params.e =
            Math.max(
                0,
                Math.min(
                    0.999,
                    this.params.e
                )
            );

        this.solve();

        this.frame = 0;

        this.trail1 = [];
        this.trail2 = [];

        this.draw();
    }


    // =========================================================
    // MASSA TOTAL
    // =========================================================

    getTotalMass() {

        return (
            this.params.m1 +
            this.params.m2
        );
    }


    // =========================================================
    // PERÍODO KEPLERIANO
    // =========================================================

    getKeplerPeriod() {

        const a =
            this.params.a;

        const M =
            this.getTotalMass();

        return Math.sqrt(
            a * a * a / M
        );
    }


    // =========================================================
    // PERIASTRO
    // =========================================================

    getPeriapsis() {

        const a =
            this.params.a;

        const e =
            this.params.e;

        return a * (1 - e);
    }


    // =========================================================
    // APOASTRO
    // =========================================================

    getApoapsis() {

        const a =
            this.params.a;

        const e =
            this.params.e;

        return a * (1 + e);
    }


    // =========================================================
    // VELOCIDADE NO PERIASTRO
    // =========================================================
    //
    // Conservação de energia:
    //
    // v²/2 - GM/r = -GM/(2a)
    //
    // portanto:
    //
    // v² = GM(2/r - 1/a)
    //
    // No periastro:
    //
    // r = a(1-e)
    //
    // então:
    //
    // v_p = sqrt[GM(1+e)/(a(1-e))]
    //
    // =========================================================

    getPeriapsisVelocity() {

        const M =
            this.getTotalMass();

        const a =
            this.params.a;

        const e =
            this.params.e;

        const rp =
            this.getPeriapsis();

        return Math.sqrt(
            this.G * M *
            (
                2 / rp -
                1 / a
            )
        );
    }


    // =========================================================
    // VELOCIDADE EM km/s
    // =========================================================

    getPeriapsisVelocityKmS() {

        return (
            this.getPeriapsisVelocity() *
            this.UA_POR_ANO
        );
    }


    // =========================================================
    // CONDIÇÃO INICIAL
    // =========================================================
    //
    // Começamos no periastro.
    //
    // A separação entre os corpos é:
    //
    // rp = a(1-e)
    //
    // A velocidade relativa é tangencial.
    //
    // =========================================================

    initialCondition() {

        const {
            m1,
            m2
        } = this.params;

        const M =
            m1 + m2;

        const e =
            this.params.e;

        const rp =
            this.getPeriapsis();

        const vp =
            this.getPeriapsisVelocity();

        // -----------------------------------------------------
        // POSIÇÕES NO REFERENCIAL DO CM
        // -----------------------------------------------------

        const x1 =
            -(m2 / M) * rp;

        const x2 =
            +(m1 / M) * rp;

        // -----------------------------------------------------
        // VELOCIDADES
        //
        // A velocidade relativa está na direção +y para m1
        // e -y para m2.
        // -----------------------------------------------------

        let vx1 = 0;
        let vx2 = 0;

        let vy1 =
            +(m2 / M) * vp;

        let vy2 =
            -(m1 / M) * vp;

        // -----------------------------------------------------
        // CENTRO DE MASSA
        // -----------------------------------------------------

        const vxCM =
            (m1 * vx1 + m2 * vx2) / M;

        const vyCM =
            (m1 * vy1 + m2 * vy2) / M;

        // -----------------------------------------------------
        // CM EM REPOUSO
        // -----------------------------------------------------

        vx1 -= vxCM;
        vy1 -= vyCM;

        vx2 -= vxCM;
        vy2 -= vyCM;

        return [

            x1,
            0,
            vx1,
            vy1,

            x2,
            0,
            vx2,
            vy2
        ];
    }


    // =========================================================
    // EQUAÇÕES DIFERENCIAIS
    // =========================================================

    derivatives(t, state) {

        const {
            m1,
            m2
        } = this.params;

        const [

            x1, y1,
            vx1, vy1,

            x2, y2,
            vx2, vy2

        ] = state;

        const dx =
            x2 - x1;

        const dy =
            y2 - y1;

        const r2 =
            dx * dx +
            dy * dy;

        const r =
            Math.sqrt(r2) + 1e-12;

        const r3 =
            r * r * r;

        // -----------------------------------------------------
        // ACELERAÇÃO DE m1
        // -----------------------------------------------------

        const ax1 =
            this.G *
            m2 *
            dx /
            r3;

        const ay1 =
            this.G *
            m2 *
            dy /
            r3;

        // -----------------------------------------------------
        // ACELERAÇÃO DE m2
        // -----------------------------------------------------

        const ax2 =
            -this.G *
            m1 *
            dx /
            r3;

        const ay2 =
            -this.G *
            m1 *
            dy /
            r3;

        return [

            vx1,
            vy1,
            ax1,
            ay1,

            vx2,
            vy2,
            ax2,
            ay2
        ];
    }


    // =========================================================
    // RK4
    // =========================================================

    rk4Step(state, t, dt) {

        const add =
            (a, b, factor) => {

                return a.map(
                    (value, i) =>
                        value +
                        factor * b[i]
                );
            };

        const k1 =
            this.derivatives(
                t,
                state
            );

        const k2 =
            this.derivatives(
                t + dt / 2,
                add(
                    state,
                    k1,
                    dt / 2
                )
            );

        const k3 =
            this.derivatives(
                t + dt / 2,
                add(
                    state,
                    k2,
                    dt / 2
                )
            );

        const k4 =
            this.derivatives(
                t + dt,
                add(
                    state,
                    k3,
                    dt
                )
            );

        return state.map(
            (value, i) =>
                value +
                dt / 6 *
                (
                    k1[i] +
                    2 * k2[i] +
                    2 * k3[i] +
                    k4[i]
                )
        );
    }


    // =========================================================
    // SOLVER
    // =========================================================

    solve() {

        const N = 1200;

        const T =
            this.getKeplerPeriod();

        const tMax =
            this.params.periods * T;

        const dt =
            tMax / (N - 1);

        let state =
            this.initialCondition();

        this.t = [];
        this.sol = [];

        for (
            let i = 0;
            i < N;
            i++
        ) {

            const t =
                i * dt;

            this.t.push(t);

            this.sol.push(
                [...state]
            );

            if (
                i < N - 1
            ) {

                state =
                    this.rk4Step(
                        state,
                        t,
                        dt
                    );
            }
        }

        return {

            t: this.t,
            sol: this.sol
        };
    }


    // =========================================================
    // INFORMAÇÕES ORBITAIS
    // =========================================================

    getOrbitInfo() {

        const {
            m1,
            m2,
            a,
            e
        } = this.params;

        const M =
            m1 + m2;

        const mu =
            this.G * M;

        const rp =
            a * (1 - e);

        const ra =
            a * (1 + e);

        const vp =
            this.getPeriapsisVelocity();

        const epsilon =
            -mu /
            (2 * a);

        const h =
            rp * vp;

        const vEsc =
            Math.sqrt(
                2 * mu / rp
            );

        let tipo;

        if (
            e < 1e-5
        ) {

            tipo = "Circular";

        } else if (
            e < 1
        ) {

            tipo = "Elíptica";

        } else {

            tipo = "Não elíptica";
        }

        return {

            tipo: tipo,

            e: e,

            a: a,

            rp: rp,

            ra: ra,

            vPeriapsis:
                vp,

            vPeriapsisKmS:
                vp *
                this.UA_POR_ANO,

            vEsc:
                vEsc,

            vEscKmS:
                vEsc *
                this.UA_POR_ANO,

            TKepler:
                this.getKeplerPeriod(),

            epsilon:
                epsilon,

            h:
                h
        };
    }


    // =========================================================
    // LIMITE DE DESENHO
    // =========================================================

    getLimit() {

        const info =
            this.getOrbitInfo();

        return Math.max(
            3,
            1.25 * info.ra
        );
    }


    // =========================================================
    // UA -> CANVAS
    // =========================================================

    toCanvas(x, y) {

        return {

            x:
                this.cx +
                x * this.scale,

            y:
                this.cy -
                y * this.scale
        };
    }


    // =========================================================
    // GRADE
    // =========================================================

    drawGrid() {

        const ctx =
            this.ctx;

        ctx.save();

        ctx.strokeStyle =
            "rgba(255,255,255,0.12)";

        ctx.lineWidth = 1;

        const step =
            this.scale;

        for (
            let x =
                this.cx % step;
            x < this.width;
            x += step
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                this.height
            );

            ctx.stroke();
        }

        for (
            let y =
                this.cy % step;
            y < this.height;
            y += step
        ) {

            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                this.width,
                y
            );

            ctx.stroke();
        }

        ctx.restore();
    }


    // =========================================================
    // CENTRO DE MASSA
    // =========================================================

    drawCM() {

        const ctx =
            this.ctx;

        ctx.save();

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            this.cx - this.cmSize,
            this.cy
        );

        ctx.lineTo(
            this.cx + this.cmSize,
            this.cy
        );

        ctx.moveTo(
            this.cx,
            this.cy - this.cmSize
        );

        ctx.lineTo(
            this.cx,
            this.cy + this.cmSize
        );

        ctx.stroke();

        ctx.restore();
    }


    // =========================================================
    // CORPOS
    // =========================================================

    drawBody(
        x,
        y,
        radius,
        label
    ) {

        const ctx =
            this.ctx;

        const p =
            this.toCanvas(
                x,
                y
            );

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            2 * Math.PI
        );

        ctx.fill();

        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 13px Arial";

        ctx.fillText(
            label,
            p.x + radius + 5,
            p.y - radius - 5
        );

        ctx.restore();
    }


    // =========================================================
    // TRAJETÓRIA
    // =========================================================

    drawTrail(trail) {

        if (
            trail.length < 2
        )
            return;

        const ctx =
            this.ctx;

        ctx.save();

        ctx.lineWidth = 1.5;

        ctx.beginPath();

        for (
            let i = 0;
            i < trail.length;
            i++
        ) {

            const p =
                this.toCanvas(
                    trail[i].x,
                    trail[i].y
                );

            if (i === 0) {

                ctx.moveTo(
                    p.x,
                    p.y
                );

            } else {

                ctx.lineTo(
                    p.x,
                    p.y
                );
            }
        }

        ctx.stroke();

        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD() {

        const ctx =
            this.ctx;

        const frame =
            this.frame %
            this.sol.length;

        const t =
            this.t[frame];

        const info =
            this.getOrbitInfo();

        ctx.save();

        ctx.fillStyle =
            "rgba(0,0,0,0.68)";

        ctx.strokeStyle =
            "rgba(255,255,255,0.3)";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            15,
            15,
            270,
            255,
            8
        );

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle =
            "white";

        ctx.font =
            "13px Arial";

        const lines = [

            `t = ${t.toFixed(2)} anos`,

            `M₁ = ${this.params.m1.toFixed(2)} M☉`,

            `M₂ = ${this.params.m2.toFixed(2)} M☉`,

            `e = ${info.e.toFixed(3)}`,

            `a = ${info.a.toFixed(2)} UA`,

            `rₚ = ${info.rp.toFixed(2)} UA`,

            `rₐ = ${info.ra.toFixed(2)} UA`,

            `vₚ = ${info.vPeriapsisKmS.toFixed(2)} km/s`,

            `T = ${info.TKepler.toFixed(2)} anos`,

            `Órbita: ${info.tipo}`

        ];

        lines.forEach(
            (line, i) => {

                ctx.fillText(
                    line,
                    28,
                    40 + i * 22
                );
            }
        );

        ctx.restore();
    }


    // =========================================================
    // DESENHO
    // =========================================================

    draw() {

        const ctx =
            this.ctx;

        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        const limit =
            this.getLimit();

        this.scale =
            Math.min(
                this.width,
                this.height
            ) /
            (
                2.2 *
                limit
            );

        this.drawGrid();

        this.drawCM();

        const frame =
            this.frame %
            this.sol.length;

        const state =
            this.sol[frame];

        const x1 =
            state[0];

        const y1 =
            state[1];

        const x2 =
            state[4];

        const y2 =
            state[5];

        // -----------------------------------------------------
        // TRAJETÓRIAS
        // -----------------------------------------------------

        this.drawTrail(
            this.trail1
        );

        this.drawTrail(
            this.trail2
        );

        // -----------------------------------------------------
        // m1
        // -----------------------------------------------------

        ctx.fillStyle =
            "#ff4444";

        this.drawBody(
            x1,
            y1,
            this.radius1,
            "m₁"
        );

        // -----------------------------------------------------
        // m2
        // -----------------------------------------------------

        ctx.fillStyle =
            "#4488ff";

        this.drawBody(
            x2,
            y2,
            this.radius2,
            "m₂"
        );

        // -----------------------------------------------------
        // HUD
        // -----------------------------------------------------

        this.drawHUD();
    }


    // =========================================================
    // ANIMAÇÃO
    // =========================================================

    animate() {

        if (!this.running)
            return;

        if (
            this.sol.length === 0
        )
            return;

        const state =
            this.sol[this.frame];

        this.trail1.push({

            x: state[0],
            y: state[1]
        });

        this.trail2.push({

            x: state[4],
            y: state[5]
        });

        if (
            this.trail1.length > 700
        ) {

            this.trail1.shift();
        }

        if (
            this.trail2.length > 700
        ) {

            this.trail2.shift();
        }

        this.draw();

        this.frame++;

        if (
            this.frame >=
            this.sol.length
        ) {

            this.frame = 0;

            this.trail1 = [];
            this.trail2 = [];
        }

        this.animationId =
            requestAnimationFrame(
                this.animate
            );
    }


    // =========================================================
    // START
    // =========================================================

    start() {

        if (this.running)
            return;

        this.running = true;

        this.animate();
    }


    // =========================================================
    // PAUSE
    // =========================================================

    pause() {

        this.running = false;

        if (
            this.animationId !== null
        ) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;
        }
    }


    // =========================================================
    // RESET
    // =========================================================

    reset() {

        this.pause();

        this.frame = 0;

        this.trail1 = [];
        this.trail2 = [];

        this.solve();

        this.draw();

        this.running = true;

        this.animate();
    }
}
