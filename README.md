# Physics_lab
Adaptation of some simulations made in python built to work as virtual physics labs for teachers.

📦 IMPLEMENTED SYSTEMS

I.DAMPED PENDULUM AND SIMPLE PENDULUM

Nonlinear pendulum with damping:

θ'' + (b/m)θ' + (g/L) sin(θ) = 0
Simple pendulum (b = 0):

θ'' + (g/L) sin(θ) = 0

II.DOUBLE PENDULUM (CHAOTIC SYSTEM)

θ₁'' = [ -g(2m₁ + m₂)sin(θ₁) - m₂g sin(θ₁ - 2θ₂) - 2 sin(θ₁ - θ₂)m₂(θ₂'²L₂ + θ₁'²L₁cos(θ₁ - θ₂)) ]
/ [ L₁(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)) ]

θ₂'' = [ 2 sin(θ₁ - θ₂)(θ₁'²L₁(m₁ + m₂) + g(m₁ + m₂)cos(θ₁) + θ₂'²L₂m₂cos(θ₁ - θ₂)) ]
/ [ L₂(2m₁ + m₂ - m₂cos(2θ₁ - 2θ₂)) ]

III.COUPLED MASS-SPRING CHAIN

m xᵢ'' = k(xᵢ₊₁ + xᵢ₋₁ − 2xᵢ)

IV.WAVE INTERFERENCE IN MASS-SPRING CHAIN

Simulation of wave propagation and interference using Gaussian perturbations.

IV.GRAVITATIONAL TWO-BODY PROBLEM

r₁'' = G m₂ (r₂ − r₁) / |r₂ − r₁|³

r₂'' = G m₁ (r₁ − r₂) / |r₂ − r₁|³

This system conserves total energy and angular momentum.

VI.RLC CIRCUIT SIMULATION

V(t) = V₀ cos(ωt)

q'(t) = i

i'(t) = (V₀/L) cos(ωt) − (R/L)i − (1/(LC))q

VI.RC CIRCUIT

q' + (1/RC) q = 0

VII.KAPITZA'S PENDULUM

y(t) = A cos(ωt)

Lθ'' = -g sin(θ) + Aω² cos(ωt) sin(θ)

IX.DRIVEN PENDULUM ON OSCILLATING CART

x(t) = A cos(ωt)

θ'' = −(g/L) sin(θ) + (A/L) cos(θ) cos(ωt)



MIT License

Copyright (c) 2026 Gustavo Sobreira Barroso

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

