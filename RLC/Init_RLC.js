const canvas = document.getElementById("canvas");

const circuito = new RLCircuit(canvas, {
    R: 2,
    L: 1,
    C: 1,
    V0: 5,
    omega: 2
});

circuito.iniciar();
