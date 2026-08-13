import matplotlib
matplotlib.use('TkAgg')

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation
from matplotlib.widgets import Slider

# ---------------------------
# PARÂMETROS
# ---------------------------
params = {
    "g": 9.81,
    "L": 0.10,
    "m": 1.0,
    "b": 0.5,
    "theta0": 1.0,
    "omega0": 0.0
}

# ---------------------------
# SISTEMA
# ---------------------------
def f(r, t, params):
    theta, omega = r

    g = params["g"]
    L = params["L"]
    m = params["m"]
    b = params["b"]

    return np.array([
        omega,
        -(g / L) * np.sin(theta) - (b/m) * omega
    ], float)

# ---------------------------
# RK4
# ---------------------------
def RK4(f, a, b_int, N, r, params):
    h = (b_int - a) / N
    tp = np.linspace(a, b_int, N + 1)
    r = np.array(r, float)

    th, om = [r[0]], [r[1]]

    for i in range(N):
        t = tp[i]

        k1 = h * f(r, t, params)
        k2 = h * f(r + 0.5*k1, t + 0.5*h, params)
        k3 = h * f(r + 0.5*k2, t + 0.5*h, params)
        k4 = h * f(r + k3, t + h, params)

        r = r + (k1 + 2*k2 + 2*k3 + k4)/6

        th.append(r[0])
        om.append(r[1])

    return tp, np.array(th), np.array(om)

# ---------------------------
# SOLVER
# ---------------------------
def solve(params):
    tp, th, om = RK4(
        f, 0, 10, 500,
        [params["theta0"], params["omega0"]],
        params
    )

    L = params["L"]
    x = L * np.sin(th)
    y = -L * np.cos(th)

    return tp, th, om, x, y

# ---------------------------
# CLASSIFICAÇÃO
# ---------------------------
def classify_regime(params):
    g = params["g"]
    L = params["L"]
    m = params["m"]
    b = params["b"]

    omega0 = np.sqrt(g / L)
    gamma = (b/m) / 2

    delta = gamma**2 - omega0**2

    if abs(b/m) < 1e-6:
        return "Sem amortecimento"
    elif abs(delta) < 1e-3:
        return "Criticamente amortecido"
    elif delta > 0:
        return "Superamortecido"
    else:
        return "Subamortecido"

# ---------------------------
# INICIAL
# ---------------------------
tp, th, om, x, y = solve(params)

# ---------------------------
# FIGURA
# ---------------------------
fig, (ax_pend, ax_plot) = plt.subplots(1, 2, figsize=(11, 5))
plt.subplots_adjust(left=0.25, bottom=0.40)

# ---------------------------
# PÊNDULO
# ---------------------------
def update_pendulum_axis():
    limit = 1.2 * params["L"]
    ax_pend.set_xlim(-limit, limit)
    ax_pend.set_ylim(-limit, limit)

update_pendulum_axis()
ax_pend.set_aspect('equal')
ax_pend.set_title("Pêndulo amortecido")

line, = ax_pend.plot([], [], 'o-', lw=2)

# ---------------------------
# GRÁFICO
# ---------------------------
ax_plot.set_xlim(0, tp[-1])
ax_plot.set_title("Evolução temporal")
ax_plot.set_xlabel("t [s]")
ax_plot.set_ylabel("θ(t) [rad] e ω(t) [rad/s]")

line_th, = ax_plot.plot([], [], label="θ(t) [rad]")

ax_plot2 = ax_plot.twinx()
ax_plot2.set_ylabel("ω(t) [rad/s]")
line_om, = ax_plot2.plot([], [], color='orange', label="ω(t) [rad/s]")

lines = [line_th, line_om]
labels = [l.get_label() for l in lines]
ax_plot.legend(lines, labels)

# ---------------------------
# HUD
# ---------------------------
text_info = fig.text(
    0.02, 0.65,
    "",
    fontsize=10,
    bbox=dict(boxstyle="round", facecolor="white", alpha=0.8)
)

# ---------------------------
# INIT
# ---------------------------
def init():
    line.set_data([0, x[0]], [0, y[0]])
    return line,

# ---------------------------
# UPDATE
# ---------------------------
def update(frame):
    i = frame

    line.set_data([0, x[i]], [0, y[i]])
    line_th.set_data(tp[:i], th[:i])
    line_om.set_data(tp[:i], om[:i])

    if i > 5:
        ax_plot.set_ylim(np.min(th[:i])*1.2, np.max(th[:i])*1.2)
        ax_plot2.set_ylim(np.min(om[:i])*1.2, np.max(om[:i])*1.2)

    regime = classify_regime(params)

    texto = (
        f"L = {params['L']:.2f} m\n"
        f"g = {params['g']:.2f} m/s²\n"
        f"m = {params['m']:.2f} kg\n"
        f"b = {params['b']:.2f} kg/s\n\n"
        f"Regime linear: {regime}\n\n"
        f"θ = {th[i]:.2f} rad\n"
        f"ω = {om[i]:.2f} rad/s\n"
        f"t = {tp[i]:.2f} s"
    )

    text_info.set_text(texto)

    return line, line_th, line_om, text_info

ani = FuncAnimation(fig, update, frames=len(tp), init_func=init, interval=20)

# ---------------------------
# SLIDERS
# ---------------------------
ax_g = plt.axes([0.25, 0.30, 0.65, 0.03])
ax_L = plt.axes([0.25, 0.25, 0.65, 0.03])
ax_m = plt.axes([0.25, 0.20, 0.65, 0.03])
ax_b = plt.axes([0.25, 0.15, 0.65, 0.03])
ax_theta0 = plt.axes([0.25, 0.10, 0.65, 0.03])
ax_omega0 = plt.axes([0.25, 0.05, 0.65, 0.03])

slider_g = Slider(ax_g, 'g [m/s²]', 1, 20, valinit=params["g"])
slider_L = Slider(ax_L, 'L [m]', 0.1, 5, valinit=params["L"])
slider_m = Slider(ax_m, 'm [kg]', 0.1, 10, valinit=params["m"])
slider_b = Slider(ax_b, 'b [kg/s]', 0, 50, valinit=params["b"])
slider_theta0 = Slider(ax_theta0, 'θ₀ [rad]', -np.pi, np.pi, valinit=params["theta0"])
slider_omega0 = Slider(ax_omega0, 'ω₀ [rad/s]', -10, 10, valinit=params["omega0"])

# ---------------------------
# UPDATE SLIDERS
# ---------------------------
def update_sliders(val):
    global tp, th, om, x, y

    params["g"] = slider_g.val
    params["L"] = slider_L.val
    params["m"] = slider_m.val
    params["b"] = slider_b.val
    params["theta0"] = slider_theta0.val
    params["omega0"] = slider_omega0.val

    tp, th, om, x, y = solve(params)

    update_pendulum_axis()

    ani.event_source.stop()
    ani.frame_seq = ani.new_frame_seq()
    ani.event_source.start()

    fig.canvas.draw_idle()

slider_g.on_changed(update_sliders)
slider_L.on_changed(update_sliders)
slider_m.on_changed(update_sliders)
slider_b.on_changed(update_sliders)
slider_theta0.on_changed(update_sliders)
slider_omega0.on_changed(update_sliders)

plt.show()
ax_m = plt.axes([0.25, 0.20, 0.65, 0.03])
ax_b = plt.axes([0.25, 0.15, 0.65, 0.03])
ax_theta0 = plt.axes([0.25, 0.10, 0.65, 0.03])
ax_omega0 = plt.axes([0.25, 0.05, 0.65, 0.03])

slider_g = Slider(ax_g, 'g [m/s²]', 1, 20, valinit=params["g"])
slider_L = Slider(ax_L, 'L [m]', 0.1, 5, valinit=params["L"])
slider_m = Slider(ax_m, 'm [kg]', 0.1, 10, valinit=params["m"])
slider_b = Slider(ax_b, 'b [kg/s]', 0, 50, valinit=params["b"])
slider_theta0 = Slider(ax_theta0, 'θ₀ [rad]', -np.pi, np.pi, valinit=params["theta0"])
slider_omega0 = Slider(ax_omega0, 'ω₀ [rad/s]', -10, 10, valinit=params["omega0"])

# ---------------------------
# UPDATE SLIDERS
# ---------------------------
def update_sliders(val):
    global tp, th, om, x, y

    params["g"] = slider_g.val
    params["L"] = slider_L.val
    params["m"] = slider_m.val
    params["b"] = slider_b.val
    params["theta0"] = slider_theta0.val
    params["omega0"] = slider_omega0.val

    tp, th, om, x, y = solve(params)

    update_pendulum_axis()

    ani.event_source.stop()
    ani.frame_seq = ani.new_frame_seq()
    ani.event_source.start()

    fig.canvas.draw_idle()

slider_g.on_changed(update_sliders)
slider_L.on_changed(update_sliders)
slider_m.on_changed(update_sliders)
slider_b.on_changed(update_sliders)
slider_theta0.on_changed(update_sliders)
slider_omega0.on_changed(update_sliders)

plt.show()
