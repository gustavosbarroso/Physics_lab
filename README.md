# Physics_lab

Adaptation of some simulations originally made in Python, built to work as interactive virtual physics labs for teachers and students.

🌐 **Interactive Physics Lab:**  
https://gustavosbarroso.github.io/Physics_lab/

---

## 📦 IMPLEMENTED SYSTEMS

### I. DAMPED PENDULUM AND SIMPLE PENDULUM

Nonlinear pendulum with damping:

$$
\theta'' + \frac{b}{m}\theta' + \frac{g}{L}\sin(\theta) = 0
$$

Simple pendulum $(b = 0)$:

$$
\theta'' + \frac{g}{L}\sin(\theta) = 0
$$

---

### II. DOUBLE PENDULUM — CHAOTIC SYSTEM

The double pendulum is a nonlinear coupled system that exhibits chaotic behavior and sensitive dependence on initial conditions.

$$
\theta_1'' =
\frac{
-g(2m_1+m_2)\sin(\theta_1)
-m_2g\sin(\theta_1-2\theta_2)
-2m_2\sin(\theta_1-\theta_2)
\left[
\theta_2'^2L_2+
\theta_1'^2L_1\cos(\theta_1-\theta_2)
\right]
}{
L_1
\left[
2m_1+m_2-m_2\cos(2\theta_1-2\theta_2)
\right]
}
$$

$$
\theta_2'' =
\frac{
2\sin(\theta_1-\theta_2)
\left[
\theta_1'^2L_1(m_1+m_2)
+g(m_1+m_2)\cos(\theta_1)
+\theta_2'^2L_2m_2\cos(\theta_1-\theta_2)
\right]
}{
L_2
\left[
2m_1+m_2-m_2\cos(2\theta_1-2\theta_2)
\right]
}
$$

---

### III. COUPLED MASS-SPRING CHAIN

Simulation of a coupled mass-spring system:

$$
m\ddot{x}_i =
k(x_{i+1}+x_{i-1}-2x_i)
$$

---

### IV. WAVE INTERFERENCE IN A MASS-SPRING CHAIN

Simulation of wave propagation and interference using Gaussian perturbations in a coupled mass-spring chain.

---

### V. GRAVITATIONAL TWO-BODY PROBLEM

Numerical solution of the gravitational interaction between two bodies:

$$
\vec{r}_1'' =
Gm_2
\frac{\vec{r}_2-\vec{r}_1}
{|\vec{r}_2-\vec{r}_1|^3}
$$

$$
\vec{r}_2'' =
Gm_1
\frac{\vec{r}_1-\vec{r}_2}
{|\vec{r}_2-\vec{r}_1|^3}
$$

This system conserves total energy and angular momentum.

---

### VI. RLC CIRCUIT SIMULATION

Driven RLC circuit:

$$
V(t)=V_0\cos(\omega t)
$$

$$
q'(t)=i
$$

$$
i'(t)=
\frac{V_0}{L}\cos(\omega t)
-\frac{R}{L}i
-\frac{1}{LC}q
$$

---

### VII. RC CIRCUIT

Charging and discharging behavior of an RC circuit:

$$
q' + \frac{1}{RC}q = 0
$$

---

### VIII. KAPITZA'S PENDULUM

Parametrically driven pendulum with vertically oscillating point of suspension:

$$
y(t)=A\cos(\omega t)
$$

$$
L\theta'' =
-g\sin(\theta)
+A\omega^2\cos(\omega t)\sin(\theta)
$$

---

### IX. DRIVEN PENDULUM ON AN OSCILLATING CART

Pendulum with an oscillating horizontal point of suspension:

$$
x(t)=A\cos(\omega t)
$$

$$
\theta'' =
-\frac{g}{L}\sin(\theta)
+\frac{A}{L}\cos(\theta)\cos(\omega t)
$$

---

## 🧮 NUMERICAL METHODS

The simulations are based on numerical solutions of ordinary differential equations.

The original implementations were developed in Python, using numerical integration methods such as the fourth-order Runge-Kutta method (RK4).

The web adaptations are being developed using HTML, CSS and JavaScript.

---

## 🌐 VIRTUAL PHYSICS LAB

The interactive simulations are available through the project website:

**[Open Physics_lab](https://gustavosbarroso.github.io/Physics_lab/)**

---

## 📄 LICENSE

MIT License

Copyright (c) 2026 Gustavo Sobreira Barroso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
