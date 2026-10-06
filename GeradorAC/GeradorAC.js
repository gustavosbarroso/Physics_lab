// ============================================================
// PARÂMETROS INICIAIS
// ============================================================

let A = 2.0;
let B = 0.5;
let w = 10;
let N = 100;
let R = 10;


// ============================================================
// TENSÃO INDUZIDA (DDP)
// ============================================================

function ddp(N, A, B, w, t) {

    return N * A * B * Math.sin(w * t);
}


// ============================================================
// CORRENTE INDUZIDA
// ============================================================

function I(ddp, R) {

    if (R === 0) {
        return 0;
    }

    return ddp / R;
}


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("geradorCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// CONTROLES
// ============================================================

const slider_N =
    document.getElementById("slider_N");

const slider_A =
    document.getElementById("slider_A");

const slider_B =
    document.getElementById("slider_B");

const slider_w =
    document.getElementById("slider_w");

const slider_R =
    document.getElementById("slider_R");


// ============================================================
// VALORES DOS CONTROLES
// ============================================================

const valor_N =
    document.getElementById("valor_N");

const valor_A =
    document.getElementById("valor_A");

const valor_B =
    document.getElementById("valor_B");

const valor_w =
    document.getElementById("valor_w");

const valor_R =
    document.getElementById("valor_R");


// ============================================================
// TEMPO
// ============================================================

let frame = 0;


// ============================================================
// ATUALIZAÇÃO DOS SLIDERS
// ============================================================

function update_sliders() {

    N = Number(slider_N.value);
    A = Number(slider_A.value);
    B = Number(slider_B.value);
    w = Number(slider_w.value);
    R = Number(slider_R.value);

    valor_N.textContent = N;
    valor_A.textContent = A;
    valor_B.textContent = B;
    valor_w.textContent = w;
    valor_R.textContent = R;

    desenhar();
}


// ============================================================
// CONECTA SLIDERS
// ============================================================

slider_N.addEventListener(
    "input",
    update_sliders
);

slider_A.addEventListener(
    "input",
    update_sliders
);

slider_B.addEventListener(
    "input",
    update_sliders
);

slider_w.addEventListener(
    "input",
    update_sliders
);

slider_R.addEventListener(
    "input",
    update_sliders
);


// ============================================================
// DESENHA GERADOR
// ============================================================

function desenharGerador(tempo) {

    // ========================================================
    // LIMITES DO GERADOR
    // ========================================================

    const x0 = 40;
    const x1 = 570;

    const y0 = 40;
    const y1 = 290;

    const centroX = 305;
    const centroY = 165;


    // ========================================================
    // TÍTULO
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Gerador AC",
        centroX,
        25
    );


    // ========================================================
    // ÍMÃ ESQUERDO
    // ========================================================

    ctx.fillStyle = "blue";

    ctx.fillRect(
        centroX - 175,
        centroY - 100,
        26,
        200
    );

    ctx.fillStyle = "red";

    ctx.fillRect(
        centroX - 149,
        centroY - 100,
        26,
        200
    );


    // ========================================================
    // LETRAS ÍMÃ ESQUERDO
    // ========================================================

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";

    ctx.fillText(
        "S",
        centroX - 162,
        centroY + 7
    );

    ctx.fillText(
        "N",
        centroX - 136,
        centroY + 7
    );


    // ========================================================
    // ÍMÃ DIREITO
    // ========================================================

    ctx.fillStyle = "blue";

    ctx.fillRect(
        centroX + 124,
        centroY - 100,
        26,
        200
    );

    ctx.fillStyle = "red";

    ctx.fillRect(
        centroX + 150,
        centroY - 100,
        26,
        200
    );


    // ========================================================
    // LETRAS ÍMÃ DIREITO
    // ========================================================

    ctx.fillStyle = "white";

    ctx.fillText(
        "S",
        centroX + 137,
        centroY + 7
    );

    ctx.fillText(
        "N",
        centroX + 163,
        centroY + 7
    );


    // ========================================================
    // CAMPO MAGNÉTICO
    // ========================================================

    const sentido =
        B >= 0 ? 1 : -1;

    ctx.strokeStyle =
        "rgba(0,0,0,0.5)";

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.lineWidth = 1.5;

    for (let i = 0; i < 5; i++) {

        const y =
            centroY - 75 + i * 37.5;

        let inicio;
        let fim;

        if (sentido === 1) {

            inicio = centroX - 110;
            fim = centroX + 85;

        } else {

            inicio = centroX + 85;
            fim = centroX - 110;
        }


        // ----------------------------------------------------
        // Linha
        // ----------------------------------------------------

        ctx.beginPath();

        ctx.moveTo(
            inicio,
            y
        );

        ctx.lineTo(
            fim,
            y
        );

        ctx.stroke();


        // ----------------------------------------------------
        // Ponta da seta
        // ----------------------------------------------------

        const tamanho = 8;

        ctx.beginPath();

        if (sentido === 1) {

            ctx.moveTo(
                fim,
                y
            );

            ctx.lineTo(
                fim - tamanho,
                y - tamanho / 2
            );

            ctx.lineTo(
                fim - tamanho,
                y + tamanho / 2
            );

        } else {

            ctx.moveTo(
                fim,
                y
            );

            ctx.lineTo(
                fim + tamanho,
                y - tamanho / 2
            );

            ctx.lineTo(
                fim + tamanho,
                y + tamanho / 2
            );
        }

        ctx.closePath();

        ctx.fill();
    }


    // ========================================================
    // ÂNGULO DA BOBINA
    // ========================================================

    const angulo =
        w * tempo;


    // ========================================================
    // BOBINA RETANGULAR
    // ========================================================

    const largura =
        1.5 * Math.cos(angulo);

    const altura =
        1.2;

    const escala = 65;

    const xEsquerda =
        centroX - largura * escala;

    const xDireita =
        centroX + largura * escala;

    const yBaixo =
        centroY + altura * escala;

    const yTopo =
        centroY - altura * escala;


    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        xEsquerda,
        yBaixo
    );

    ctx.lineTo(
        xDireita,
        yBaixo
    );

    ctx.lineTo(
        xDireita,
        yTopo
    );

    ctx.lineTo(
        xEsquerda,
        yTopo
    );

    ctx.closePath();

    ctx.stroke();


    // ========================================================
    // EIXO / FIO ÚNICO
    // ========================================================

    ctx.beginPath();

    ctx.moveTo(
        centroX,
        centroY + 1.7 * escala
    );

    ctx.lineTo(
        centroX,
        yTopo
    );

    ctx.stroke();


    // ========================================================
    // TENSÃO INSTANTÂNEA
    // ========================================================

    const V =
        ddp(
            N,
            A,
            B,
            w,
            tempo
        );


    // ========================================================
    // BRILHO DA LÂMPADA
    // ========================================================

    const Vmax_lampada =
        Math.abs(
            N * A * B * w
        );

    let brilho = 0;

    if (Vmax_lampada > 0) {

        brilho = Math.min(
            Math.abs(V) / Vmax_lampada,
            1
        );
    }


    // ========================================================
    // LÂMPADA
    // ========================================================

    const vermelho =
        0.35 + 0.65 * brilho;

    const verde =
        0.35 + 0.65 * brilho;

    const azul =
        0.35 * (1 - brilho);

    ctx.fillStyle =
        `rgb(
            ${vermelho * 255},
            ${verde * 255},
            ${azul * 255}
        )`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        centroX,
        centroY + 1.7 * escala,
        0.35 * escala,
        0,
        2 * Math.PI
    );

    ctx.fill();
    ctx.stroke();


    // ========================================================
    // TEXTO LÂMPADA
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "10px Arial";

    ctx.fillText(
        "Lâmpada",
        centroX,
        centroY + 2.2 * escala
    );
}


// ============================================================
// GRÁFICO V(t) E I(t)
// ============================================================

function desenharGrafico(tempo) {

    const x0 = 625;
    const y0 = 50;

    const largura = 500;
    const altura = 235;


    // ========================================================
    // SIMULAÇÃO INICIAL
    // ========================================================

    const Vmax =
        Math.abs(
            N * A * B
        );

    const Imax =
        Math.abs(
            I(
                N * A * B,
                R
            )
        );

    let ymax =
        Math.max(
            Vmax,
            Imax
        );

    if (ymax === 0) {
        ymax = 1;
    }

    ymax *= 1.1;


    // ========================================================
    // ÁREA DO GRÁFICO
    // ========================================================

    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        x0,
        y0,
        largura,
        altura
    );


    // ========================================================
    // TÍTULO
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Gerador AC - Tensão e Corrente x Tempo",
        x0 + largura / 2,
        y0 - 15
    );


    // ========================================================
    // EIXO X
    // ========================================================

    const eixoX =
        y0 + altura / 2;

    ctx.strokeStyle = "#666666";

    ctx.beginPath();

    ctx.moveTo(
        x0,
        eixoX
    );

    ctx.lineTo(
        x0 + largura,
        eixoX
    );

    ctx.stroke();


    // ========================================================
    // GRADE
    // ========================================================

    ctx.strokeStyle = "#dddddd";

    for (let i = 1; i < 5; i++) {

        const x =
            x0 + largura * i / 5;

        ctx.beginPath();

        ctx.moveTo(
            x,
            y0
        );

        ctx.lineTo(
            x,
            y0 + altura
        );

        ctx.stroke();
    }

    for (let i = 1; i < 5; i++) {

        const y =
            y0 + altura * i / 5;

        ctx.beginPath();

        ctx.moveTo(
            x0,
            y
        );

        ctx.lineTo(
            x0 + largura,
            y
        );

        ctx.stroke();
    }


    // ========================================================
    // CONVERSÃO DE COORDENADAS
    // ========================================================

    function converterX(t) {

        return x0 +
            (t / 2) * largura;
    }

    function converterY(valor) {

        return eixoX -
            (valor / ymax) *
            (altura / 2);
    }


    // ========================================================
    // CURVA V(t)
    // ========================================================

    ctx.strokeStyle = "#1f77b4";
    ctx.lineWidth = 2;

    ctx.beginPath();

    for (let i = 0; i <= 500; i++) {

        const t =
            2 * i / 500;

        const V =
            ddp(
                N,
                A,
                B,
                w,
                t
            );

        const x =
            converterX(t);

        const y =
            converterY(V);

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


    // ========================================================
    // CURVA I(t)
    // ========================================================

    ctx.strokeStyle = "#ff7f0e";
    ctx.lineWidth = 2;

    ctx.beginPath();

    for (let i = 0; i <= 500; i++) {

        const t =
            2 * i / 500;

        const V =
            ddp(
                N,
                A,
                B,
                w,
                t
            );

        const corrente =
            I(
                V,
                R
            );

        const x =
            converterX(t);

        const y =
            converterY(corrente);

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


    // ========================================================
    // PONTO INSTANTÂNEO
    // ========================================================

    if (tempo <= 2) {

        const V =
            ddp(
                N,
                A,
                B,
                w,
                tempo
            );

        const corrente =
            I(
                V,
                R
            );

        const x =
            converterX(tempo);


        // ----------------------------------------------------
        // Ponto V(t)
        // ----------------------------------------------------

        ctx.fillStyle = "#1f77b4";

        ctx.beginPath();

        ctx.arc(
            x,
            converterY(V),
            5,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ----------------------------------------------------
        // Ponto I(t)
        // ----------------------------------------------------

        ctx.fillStyle = "#ff7f0e";

        ctx.beginPath();

        ctx.arc(
            x,
            converterY(corrente),
            5,
            0,
            2 * Math.PI
        );

        ctx.fill();


        // ----------------------------------------------------
        // Linha do tempo
        // ----------------------------------------------------

        ctx.strokeStyle =
            "rgba(0,0,0,0.6)";

        ctx.setLineDash([
            6,
            5
        ]);

        ctx.beginPath();

        ctx.moveTo(
            x,
            y0
        );

        ctx.lineTo(
            x,
            y0 + altura
        );

        ctx.stroke();

        ctx.setLineDash([]);
    }


    // ========================================================
    // LEGENDA
    // ========================================================

    ctx.textAlign = "left";
    ctx.font = "14px Arial";

    ctx.fillStyle = "#1f77b4";

    ctx.fillText(
        "V(t)",
        x0 + 15,
        y0 + 22
    );

    ctx.fillStyle = "#ff7f0e";

    ctx.fillText(
        "I(t)",
        x0 + 65,
        y0 + 22
    );


    // ========================================================
    // EIXO X — TEMPO
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "0",
        x0,
        y0 + altura + 18
    );

    ctx.fillText(
        "0.5",
        x0 + largura * 0.25,
        y0 + altura + 18
    );

    ctx.fillText(
        "1.0",
        x0 + largura * 0.5,
        y0 + altura + 18
    );

    ctx.fillText(
        "1.5",
        x0 + largura * 0.75,
        y0 + altura + 18
    );

    ctx.fillText(
        "2.0",
        x0 + largura,
        y0 + altura + 18
    );


    // ========================================================
    // UNIDADE DO EIXO X
    // ========================================================

    ctx.font = "12px Arial";

    ctx.fillText(
        "Tempo (s)",
        x0 + largura / 2,
        y0 + altura + 38
    );


    // ========================================================
    // EIXO Y
    // ========================================================

    ctx.textAlign = "right";

    ctx.fillText(
        ymax.toFixed(0),
        x0 - 8,
        y0 + 5
    );

    ctx.fillText(
        "0",
        x0 - 8,
        eixoX + 4
    );

    ctx.fillText(
        (-ymax).toFixed(0),
        x0 - 8,
        y0 + altura
    );


    // ========================================================
    // UNIDADE DO EIXO Y
    // ========================================================

    ctx.save();

    ctx.translate(
        x0 - 42,
        y0 + altura / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.textAlign = "center";

    ctx.fillText(
        "V(t), I(t)",
        0,
        0
    );

    ctx.restore();
}


// ============================================================
// DESENHA TUDO
// ============================================================

function desenhar() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const tempo =
        frame * 0.02;

    desenharGerador(tempo);

    desenharGrafico(tempo);
}


// ============================================================
// ANIMAÇÃO
// ============================================================

function animar() {

    const tempo =
        frame * 0.02;

    desenhar();

    frame++;

    // ========================================================
    // EQUIVALENTE A frames=100, repeat=True
    // ========================================================

    if (frame >= 100) {
        frame = 0;
    }

    setTimeout(
        () => requestAnimationFrame(animar),
        20
    );
}


// ============================================================
// INICIA ANIMAÇÃO
// ============================================================

animar();
