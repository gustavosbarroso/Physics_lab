const canvas =
    document.getElementById("canvas");


const circuito =
    new RLCircuit(canvas, {

        R: 2,
        L: 1,
        C: 1,

        q0: 0,
        i0: 0,

        V0: 5,
        omega: 2

    });


// =========================================================
// FUNÇÃO PARA ATUALIZAR UM SLIDER
// =========================================================

function configurarSlider(
    id,
    parametro
) {

    const slider =
        document.getElementById(id);


    const display =
        document.getElementById(
            id + "_value"
        );


    slider.addEventListener(
        "input",
        function () {

            const value =
                Number(this.value);


            // Atualiza texto

            display.textContent =
                value.toFixed(1);


            // Atualiza circuito

            circuito.atualizarParametros({

                [parametro]: value

            });

        }
    );
}


// =========================================================
// SLIDERS
// =========================================================

configurarSlider(
    "R",
    "R"
);


configurarSlider(
    "L",
    "L"
);


configurarSlider(
    "C",
    "C"
);


configurarSlider(
    "V0",
    "V0"
);


configurarSlider(
    "omega",
    "omega"
);


// =========================================================
// BOTÃO INICIAR
// =========================================================

document
    .getElementById("start")
    .addEventListener(
        "click",
        function () {

            circuito.iniciar();

        }
    );


// =========================================================
// BOTÃO PARAR
// =========================================================

document
    .getElementById("stop")
    .addEventListener(
        "click",
        function () {

            circuito.parar();

        }
    );


// =========================================================
// BOTÃO REINICIAR
// =========================================================

document
    .getElementById("reset")
    .addEventListener(
        "click",
        function () {

            circuito.frame = 0;

            circuito.solve();

        }
    );


// =========================================================
// DESENHO INICIAL
// =========================================================

circuito.draw();
