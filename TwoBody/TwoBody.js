class TwoBodySystem {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // =====================================================
        // PARÂMETROS
        // =====================================================

        this.params = {

            r: 2.0,          // UA
            v_rel: 20.0,     // km/s

            m1: 1.0,         // massas solares
            m2: 1.0,

            t_max: 5.0       // anos
        };

        Object.assign(this.params, options);

        // =====================================================
        // CONSTANTES
        // =====================================================

        this.G = 4 * Math.PI * Math.PI;

        // Conversão aproximada:
        // 1 UA/ano = 4.74047 km/s
        // portanto km/s -> UA/ano
        this.UA_POR_ANO = 0.2108;

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
        // CORES / TAMANHOS
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
        // CONFIGURAÇÃO
        // =====================================================

        this.setParameters(this.params);

        this.animate = this.animate.bind(this);
    }


    // =========================================================
    // PARÂMETROS
    // =========================================================

    setParameters(params) {

        Object.assign(this.params, params);

        this.solve();

        this.frame = 0;

        this.trail1 = [];
        this.trail2 = [];

        this.draw();
    }


    // =========================================================
    // CONDIÇÃO INICIAL
    // =========================================================

    initialCondition() {

        const {
            r,
            v_rel,
            m1,
            m2
        } = this.params;

        const M = m1 + m2;

        // Posições em relação ao centro de massa

        const x1 = -(m2 / M) * r;
        const x2 = +(m1 / M) * r;

        // Conversão km/s -> UA/ano

        const v = v_rel * this.UA_POR_ANO;

        let vx1 = 0;
        let vx2 = 0;

        let vy1 = v * (m2 / M);
        let vy2 = -v * (m1 / M);

        // Centro de massa parado

        const vxCM =
            (m1 * vx1 + m2 * vx2) / M;

        const vyCM =
            (m1 * vy1 + m2 * vy2) / M;

        vx1 -= vxCM;
        vy1 -= vyCM;

        vx2 -= vxCM;
        vy2 -= vyCM;

        return [
            x1, 0,
            vx1, vy1,

            x2, 0,
            vx2, vy2
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

        const dx = x2 - x1;
        const dy = y2 - y1;

        const r2 = dx * dx + dy * dy;

        // Pequena proteção numérica

        const r = Math.sqrt(r2) + 1e-8;

        const r3 = r * r * r;

        // Aceleração de m1

        const ax1 =
            this.G * m2 * dx / r3;

        const ay1 =
            this.G * m2 * dy / r3;

        // Aceleração de m2

        const ax2 =
            -this.G * m1 * dx / r3;

        const ay2 =
            -this.G * m1 * dy / r3;

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

        const add = (a, b, factor) => {

            return a.map(
                (value, i) =>
                    value + factor * b[i]
            );
        };

        const k1 =
            this.derivatives(t, state);

        const k2 =
            this.derivatives(
                t + dt / 2,
                add(state, k1, dt / 2)
            );

        const k3 =
            this.derivatives(
                t + dt / 2,
                add(state, k2, dt / 2)
            );

        const k4 =
            this.derivatives(
                t + dt,
                add(state, k3, dt)
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

        const tMax = this.params.t_max;

        const N = 400;

        const dt = tMax / (N - 1);

        let state = this.initialCondition();

        this.t = [];
        this.sol = [];

        for (let i = 0; i < N; i++) {

            const t = i * dt;

            this.t.push(t);

            this.sol.push([...state]);

            if (i < N - 1) {

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
    // CLASSIFICAÇÃO DA ÓRBITA
    // =========================================================

    getOrbitType() {

        const {
            r,
            v_rel,
            m1,
            m2
        } = this.params;

        const M = m1 + m2;

        const v =
            v_rel * this.UA_POR_ANO;

        const vEsc =
            Math.sqrt(
                2 * this.G * M / r
            );

        const f = v / vEsc;

        let tipo;

        if (Math.abs(f - 1) < 0.02) {

            tipo = "Parabólica";

        } else if (f < 1) {

            tipo = "Elíptica";

        } else {

            tipo = "Hiperbólica";
        }

        return {
            tipo,
            vEsc: vEsc / this.UA_POR_ANO,
            f
        };
    }


    // =========================================================
    // LIMITES DOS GRÁFICOS
    // =========================================================

    getLimit() {

        return Math.max(
            3,
            2 * this.params.r
        );
    }


    // =========================================================
    // CONVERSÃO UA -> CANVAS
    // =========================================================

    toCanvas(x, y) {

        return {

            x: this.cx + x * this.scale,

            y: this.cy - y * this.scale
        };
    }


    // =========================================================
    // DESENHA GRADE
    // =========================================================

    drawGrid() {

        const ctx = this.ctx;

        ctx.save();

        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;

        const step = this.scale;

        // linhas verticais

        for (
            let x = this.cx % step;
            x < this.width;
            x += step
        ) {

            ctx.beginPath();

            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);

            ctx.stroke();
        }

        // linhas horizontais

        for (
            let y = this.cy % step;
            y < this.height;
            y += step
        ) {

            ctx.beginPath();

            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);

            ctx.stroke();
        }

        ctx.restore();
    }


    // =========================================================
    // DESENHA CENTRO DE MASSA
    // =========================================================

    drawCM() {

        const ctx = this.ctx;

        ctx.save();

        ctx.strokeStyle = "#ffffff";
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
    // DESENHA CORPO
    // =========================================================

    drawBody(x, y, radius, label) {

        const ctx = this.ctx;

        const p = this.toCanvas(x, y);

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

        ctx.font = "bold 13px Arial";

        ctx.fillText(
            label,
            p.x + radius + 5,
            p.y - radius - 5
        );

        ctx.restore();
    }


    // =========================================================
    // DESENHA TRAJETÓRIA
    // =========================================================

    drawTrail(trail, dashed = false) {

        if (trail.length < 2)
            return;

        const ctx = this.ctx;

        ctx.save();

        ctx.lineWidth = 1.5;

        if (dashed) {

            ctx.setLineDash([5, 5]);

        } else {

            ctx.setLineDash([]);
        }

        ctx.beginPath();

        for (let i = 0; i < trail.length; i++) {

            const p =
                this.toCanvas(
                    trail[i].x,
                    trail[i].y
                );

            if (i === 0) {

                ctx.moveTo(p.x, p.y);

            } else {

                ctx.lineTo(p.x, p.y);
            }
        }

        ctx.stroke();

        ctx.restore();
    }


    // =========================================================
    // HUD
    // =========================================================

    drawHUD() {

        const ctx = this.ctx;

        const frame =
            this.frame % this.sol.length;

        const t =
            this.t[frame];

        const info =
            this.getOrbitType();

        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.65)";

        ctx.strokeStyle =
            "rgba(255,255,255,0.3)";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.roundRect(
            15,
            15,
            215,
            150,
            8
        );

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "white";

        ctx.font = "13px Arial";

        const lines = [

            `t = ${t.toFixed(2)} anos`,

            `r = ${this.params.r.toFixed(2)} UA`,

            `v_rel = ${this.params.v_rel.toFixed(1)} km/s`,

            `v_esc = ${info.vEsc.toFixed(1)} km/s`,

            `f = ${info.f.toFixed(2)}`,

            `Órbita: ${info.tipo}`

        ];

        lines.forEach((line, i) => {

            ctx.fillText(
                line,
                28,
                40 + i * 19
            );
        });

        ctx.restore();
    }


    // =========================================================
    // DESENHO COMPLETO
    // =========================================================

    draw() {

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        this.scale =
            Math.min(
                this.width,
                this.height
            ) /
            (2.2 * this.getLimit());

        this.drawGrid();

        this.drawCM();

        const frame =
            this.frame % this.sol.length;

        const state =
            this.sol[frame];

        const x1 = state[0];
        const y1 = state[1];

        const x2 = state[4];
        const y2 = state[5];

        // ---------------------------------------------
        // Trajetórias
        // ---------------------------------------------

        this.drawTrail(
            this.trail1
        );

        this.drawTrail(
            this.trail2
        );

        // ---------------------------------------------
        // Corpos
        // ---------------------------------------------

        ctx.fillStyle = "#ff4444";

        this.drawBody(
            x1,
            y1,
            this.radius1,
            "m1"
        );

        ctx.fillStyle = "#4488ff";

        this.drawBody(
            x2,
            y2,
            this.radius2,
            "m2"
        );

        // ---------------------------------------------
        // HUD
        // ---------------------------------------------

        this.drawHUD();
    }


    // =========================================================
    // ANIMAÇÃO
    // =========================================================

    animate() {

        if (!this.running)
            return;

        if (this.sol.length === 0)
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

        // Evita crescimento infinito

        if (this.trail1.length > 400)
            this.trail1.shift();

        if (this.trail2.length > 400)
            this.trail2.shift();

        this.draw();

        this.frame++;

        if (this.frame >= this.sol.length) {

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
    // CONTROLE
    // =========================================================

    start() {

        if (this.running)
            return;

        this.running = true;

        this.animate();
    }


    pause() {

        this.running = false;

        if (this.animationId) {

            cancelAnimationFrame(
                this.animationId
            );

            this.animationId = null;
        }
    }


    reset() {

        this.pause();

        this.frame = 0;

        this.trail1 = [];
        this.trail2 = [];

        this.solve();

        this.running = true;

        this.animate();
    }
}
