// ============================================================
// GERADOR AC
// ============================================================

const canvas = document.getElementById("geradorCanvas");
const ctx = canvas.getContext("2d");

// ============================================================
// PARÂMETROS
// ============================================================

const t = [];

for (let i = 0; i < 1000; i++) {
    t.push(10 * i / 999);
}

let N = 100;
let A = 2.0;
let B = 0.5;
let w = 10;
let R = 10;

// ============================================================
// FUNÇÕES
// ============================================================

function ddp(N, A, B, w, t) {
    return N * A * B * Math.sin(w * t);
}

function I(ddp, R) {

    if (R === 0) {
        return 0;
    }

    return ddp / R;
}

// ============================================================
// ELEMENTOS DOS SLIDERS
// ============================================================

const sliderN = document.getElementById("slider_N");
const sliderA = document.getElementById("slider_A");
const sliderB = document.getElementById("slider_B");
const sliderW = document.getElementById("slider_w");
const sliderR = document.getElementById("slider_R");

const valorN = document.getElementById("valor_N");
const valorA = document.getElementById("valor_A");
const valorB = document.getElementById("valor_B");
const valorW = document.getElementById("valor_w");
const valorR = document.getElementById("valor_R");

// ============================================================
// ÁREA DO GERADOR
// ============================================================

const gerador = {
    x: 170,
    y: 90,
    largura: 360,
    altura: 310
};

// ============================================================
// MAPA DE COORDENADAS
// Equivalente a:
// xlim(-3, 3)
// ylim(-2.5, 2.5)
// ============================================================

function mapX(x) {

    return (
        gerador.x +
        ((x + 3) / 6) * gerador.largura
    );
}

function mapY(y) {

    return (
        gerador.y +
        ((2.5 - y) / 5) * gerador.altura
    );
}

// ============================================================
// DESENHO DO GERADOR
// ============================================================

function desenharGerador() {

    // ========================================================
    // ÁREA
    // ========================================================

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        gerador.x,
        gerador.y,
        gerador.largura,
        gerador.altura
    );

    // ========================================================
    // TÍTULO
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(
        "Gerador AC",
        gerador.x + gerador.largura / 2,
        gerador.y - 10
    );

    // ========================================================
    // ÍMÃ ESQUERDO
    // ========================================================

    ctx.fillStyle = "blue";

    ctx.fillRect(
        mapX(-2.7),
        mapY(2),
        mapX(-2.3) - mapX(-2.7),
        mapY(-2) - mapY(2)
    );

    ctx.fillStyle = "red";

    ctx.fillRect(
        mapX(-2.3),
        mapY(2),
        mapX(-1.9) - mapX(-2.3),
        mapY(-2) - mapY(2)
    );

    // ========================================================
    // ÍMÃ DIREITO
    // ========================================================

    ctx.fillStyle = "blue";

    ctx.fillRect(
        mapX(1.9),
        mapY(2),
        mapX(2.3) - mapX(1.9),
        mapY(-2) - mapY(2)
    );

    ctx.fillStyle = "red";

    ctx.fillRect(
        mapX(2.3),
        mapY(2),
        mapX(2.7) - mapX(2.3),
        mapY(-2) - mapY(2)
    );

    // ========================================================
    // LETRAS
    // ========================================================

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        "S",
        mapX(-2.5),
        mapY(0)
    );

    ctx.fillText(
        "N",
        mapX(-2.1),
        mapY(0)
    );

    ctx.fillText(
        "S",
        mapX(2.1),
        mapY(0)
    );

    ctx.fillText(
        "N",
        mapX(2.5),
        mapY(0)
    );

    // ========================================================
    // CAMPO MAGNÉTICO
    // ========================================================

    const ys = [-1.5, -0.75, 0, 0.75, 1.5];

    ctx.strokeStyle = "gray";
    ctx.fillStyle = "gray";
    ctx.lineWidth = 1.5;

    for (let i = 0; i < ys.length; i++) {

        const y = mapY(ys[i]);

        let xInicio;
        let xFim;

        if (B >= 0) {

            xInicio = mapX(-1.7);
            xFim = mapX(1.3);

        } else {

            xInicio = mapX(1.3);
            xFim = mapX(-1.7);
        }

        const ponta = 8;

        // linha
        ctx.beginPath();

        ctx.moveTo(
            xInicio,
            y
        );

        ctx.lineTo(
            xFim,
            y
        );

        ctx.stroke();

        // ponta da seta
        ctx.beginPath();

        if (B >= 0) {

            ctx.moveTo(
                xFim,
                y
            );

            ctx.lineTo(
                xFim - ponta,
                y - 3
            );

            ctx.lineTo(
                xFim - ponta,
                y + 3
            );

        } else {

            ctx.moveTo(
                xFim,
                y
            );

            ctx.lineTo(
                xFim + ponta,
                y - 3
            );

            ctx.lineTo(
                xFim + ponta,
                y + 3
            );
        }

        ctx.closePath();
        ctx.fill();
    }

    // ========================================================
    // LÂMPADA
    // ========================================================

    const lampX = mapX(0);
    const lampY = mapY(-1.7);
    const lampRaio = 21;

    ctx.beginPath();

    ctx.arc(
        lampX,
        lampY,
        lampRaio,
        0,
        2 * Math.PI
    );

    ctx.fillStyle = "gray";
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ========================================================
    // NOME DA LÂMPADA
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(
        "Lâmpada",
        mapX(0),
        mapY(-2.2)
    );
}

// ============================================================
// CÁLCULO DOS DADOS
// ============================================================

function calcularDados() {

    const V = [];
    const corrente = [];

    for (let i = 0; i < t.length; i++) {

        const v = ddp(
            N,
            A,
            B,
            w,
            t[i]
        );

        V.push(v);

        corrente.push(
            I(v, R)
        );
    }

    return {
        V: V,
        I: corrente
    };
}

// ============================================================
// GRÁFICO
// ============================================================

function desenharGrafico(
    dados,
    tempoAtual
) {

    const x = 624;
    const y = 80;
    const largura = 660;
    const altura = 350;

    // ========================================================
    // TÍTULO
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Gerador AC - Tensão e Corrente x Tempo",
        x + largura / 2,
        y - 10
    );

    // ========================================================
    // ESCALA
    // ========================================================

    let Vmax = 0;
    let Imax = 0;

    for (let i = 0; i < t.length; i++) {

        if (t[i] <= 2) {

            Vmax = Math.max(
                Vmax,
                Math.abs(dados.V[i])
            );

            Imax = Math.max(
                Imax,
                Math.abs(dados.I[i])
            );
        }
    }

    let ymax = Math.max(
        Vmax,
        Imax
    );

    if (ymax === 0) {
        ymax = 1;
    }

    ymax = 1.1 * ymax;

    // ========================================================
    // ÁREA DO GRÁFICO
    // ========================================================

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        x,
        y,
        largura,
        altura
    );

    // ========================================================
    // GRADE
    // ========================================================

    ctx.strokeStyle = "#b0b0b0";
    ctx.lineWidth = 1;

    // linhas verticais
    for (let i = 0; i <= 8; i++) {

        const px =
            x +
            (i / 8) * largura;

        ctx.beginPath();

        ctx.moveTo(
            px,
            y
        );

        ctx.lineTo(
            px,
            y + altura
        );

        ctx.stroke();
    }

    // linhas horizontais
    for (let i = 0; i <= 8; i++) {

        const py =
            y +
            (i / 8) * altura;

        ctx.beginPath();

        ctx.moveTo(
            x,
            py
        );

        ctx.lineTo(
            x + largura,
            py
        );

        ctx.stroke();
    }

    // ========================================================
    // EIXO X
    // ========================================================

    ctx.fillStyle = "black";
    ctx.font = "13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let i = 0; i <= 8; i++) {

        const valor = i * 0.25;

        const px =
            x +
            (i / 8) * largura;

        ctx.fillText(
            valor.toFixed(2),
            px,
            y + altura + 8
        );
    }

    // ========================================================
    // EIXO Y
    // ========================================================

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 8; i++) {

        const valor =
            ymax -
            (i / 8) * 2 * ymax;

        const py =
            y +
            (i / 8) * altura;

        ctx.fillText(
            valor.toFixed(0),
            x - 8,
            py
        );
    }

    // ========================================================
    // RÓTULOS
    // ========================================================

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillText(
        "Tempo (s)",
        x + largura / 2,
        y + altura + 40
    );

    ctx.save();

    ctx.translate(
        x - 55,
        y + altura / 2
    );

    ctx.rotate(-Math.PI / 2);

    ctx.fillText(
        "V(t), I(t)",
        0,
        0
    );

    ctx.restore();

    // ========================================================
    // CONVERSÃO DE COORDENADAS
    // ========================================================

    function pxTempo(tempo) {

        return (
            x +
            (tempo / 2) * largura
        );
    }

    function pyValor(valor) {

        return (
            y +
            altura / 2 -
            (valor / ymax) *
            (altura / 2)
        );
    }

    // ========================================================
    // CURVA V(t)
    // ========================================================

    ctx.beginPath();

    let iniciou = false;

    for (let i = 0; i < t.length; i++) {

        if (t[i] > 2) {
            break;
        }

        const px = pxTempo(t[i]);
        const py = pyValor(dados.V[i]);

        if (!iniciou) {

            ctx.moveTo(
                px,
                py
            );

            iniciou = true;

        } else {

            ctx.lineTo(
                px,
                py
            );
        }
    }

    ctx.strokeStyle = "#1f77b4";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ========================================================
    // CURVA I(t)
    // ========================================================

    ctx.beginPath();

    iniciou = false;

    for (let i = 0; i < t.length; i++) {

        if (t[i] > 2) {
            break;
        }

        const px = pxTempo(t[i]);
        const py = pyValor(dados.I[i]);

        if (!iniciou) {

            ctx.moveTo(
                px,
                py
            );

            iniciou = true;

        } else {

            ctx.lineTo(
                px,
                py
            );
        }
    }

    ctx.strokeStyle = "#ff7f0e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ========================================================
    // LINHA DO TEMPO
    // ========================================================

    if (tempoAtual <= 2) {

        const px = pxTempo(
            tempoAtual
        );

        ctx.beginPath();

        ctx.moveTo(
            px,
            y
        );

        ctx.lineTo(
            px,
            y + altura
        );

        ctx.strokeStyle =
            "rgba(31,119,180,0.6)";

        ctx.lineWidth = 2;

        ctx.setLineDash([
            6,
            4
        ]);

        ctx.stroke();

        ctx.setLineDash([]);
    }

    // ========================================================
    // PONTO V(t)
    // ========================================================

    if (tempoAtual <= 2) {

        const VAtual = ddp(
            N,
            A,
            B,
            w,
            tempoAtual
        );

        const px = pxTempo(
            tempoAtual
        );

        const py = pyValor(
            VAtual
        );

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            6,
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "#1f77b4";
        ctx.fill();
    }

    // ========================================================
    // PONTO I(t)
    // ========================================================

    if (tempoAtual <= 2) {

        const VAtual = ddp(
            N,
            A,
            B,
            w,
            tempoAtual
        );

        const IAtual = I(
            VAtual,
            R
        );

        const px = pxTempo(
            tempoAtual
        );

        const py = pyValor(
            IAtual
        );

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            6,
            0,
            2 * Math.PI
        );

        ctx.fillStyle = "#ff7f0e";
        ctx.fill();
    }

    // ========================================================
    // LEGENDA
    // ========================================================

    const legendaX = x + 10;
    const legendaY =
        y + altura - 35;

    // V(t)
    ctx.beginPath();

    ctx.moveTo(
        legendaX,
        legendaY
    );

    ctx.lineTo(
        legendaX + 30,
        legendaY
    );

    ctx.strokeStyle = "#1f77b4";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "13px Arial";
    ctx.textAlign = "left";

    ctx.fillText(
        "V(t)",
        legendaX + 40,
        legendaY + 4
    );

    // I(t)
    ctx.beginPath();

    ctx.moveTo(
        legendaX,
        legendaY + 22
    );

    ctx.lineTo(
        legendaX + 30,
        legendaY + 22
    );

    ctx.strokeStyle = "#ff7f0e";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "black";

    ctx.fillText(
        "I(t)",
        legendaX + 40,
        legendaY + 26
    );
}

// ============================================================
// DESENHO COMPLETO
// ============================================================

function desenhar(
    tempoAtual = 0
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const dados =
        calcularDados();

    desenharGerador();

    // ========================================================
    // BOBINA RETANGULAR
    // Diretamente equivalente ao Python
    // ========================================================

    const tempo = tempoAtual;

    const angulo = w * tempo;

    const largura =
        1.5 * Math.cos(angulo);

    const altura = 1.2;

    const x = [
        -largura,
        largura,
        largura,
        -largura,
        -largura
    ];

    const y = [
        -altura,
        -altura,
        altura,
        altura,
        -altura
    ];

    // ========================================================
    // DESENHA A BOBINA
    // ========================================================

    ctx.beginPath();

    ctx.moveTo(
        mapX(x[0]),
        mapY(y[0])
    );

    for (let i = 1; i < x.length; i++) {

        ctx.lineTo(
            mapX(x[i]),
            mapY(y[i])
        );
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    // ========================================================
    // EIXO / FIO ÚNICO
    // Diretamente equivalente ao Python:
    //
    // eixo_fio.set_data(
    //     [0, 0],
    //     [-1.7, -altura]
    // )
    // ========================================================

    ctx.beginPath();

    ctx.moveTo(
        mapX(0),
        mapY(-1.7)
    );

    ctx.lineTo(
        mapX(0),
        mapY(-altura)
    );

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    // ========================================================
    // LÂMPADA
    // ========================================================

    const lampX = mapX(0);
    const lampY = mapY(-1.7);
    const lampRaio = 0.35;

    // brilho
    const V = ddp(
        N,
        A,
        B,
        w,
        tempo
    );

    const corrente = I(
        V,
        R
    );

    const VmaxLampada =
        Math.abs(
            N * A * B * w
        );

    let brilho = 0;

    if (VmaxLampada > 0) {

        brilho = Math.min(
            Math.abs(V) / VmaxLampada,
            1
        );
    }

    // ========================================================
    // LÂMPADA
    // Cinza -> amarelo
    // ========================================================

    const r =
        0.35 + 0.65 * brilho;

    const g =
        0.35 + 0.65 * brilho;

    const b =
        0.35 * (1 - brilho);

    ctx.beginPath();

    ctx.arc(
        lampX,
        lampY,
        lampRaio * 60,
        0,
        2 * Math.PI
    );

    ctx.fillStyle =
        `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ========================================================
    // GRÁFICO
    // ========================================================

    desenharGrafico(
        dados,
        tempoAtual
    );
}

// ============================================================
// ATUALIZA SLIDERS
// ============================================================

function atualizarParametros() {

    N = Number(
        sliderN.value
    );

    A = Number(
        sliderA.value
    );

    B = Number(
        sliderB.value
    );

    w = Number(
        sliderW.value
    );

    R = Number(
        sliderR.value
    );

    valorN.textContent = N;

    valorA.textContent =
        A.toFixed(1);

    valorB.textContent =
        B.toFixed(1);

    valorW.textContent =
        w.toFixed(1);

    valorR.textContent = R;

    desenhar(
        tempoAtual
    );
}

// ============================================================
// EVENTOS
// ============================================================

sliderN.addEventListener(
    "input",
    atualizarParametros
);

sliderA.addEventListener(
    "input",
    atualizarParametros
);

sliderB.addEventListener(
    "input",
    atualizarParametros
);

sliderW.addEventListener(
    "input",
    atualizarParametros
);

sliderR.addEventListener(
    "input",
    atualizarParametros
);

// ============================================================
// ANIMAÇÃO
//
// Equivalente a:
//
// FuncAnimation(
//     fig,
//     animar,
//     frames=100,
//     interval=20,
//     repeat=True
// )
// ============================================================

let frame = 0;
let tempoAtual = 0;

function animar() {

    // ========================================================
    // TEMPO
    // Python:
    // tempo = frame * 0.02
    // ========================================================

    tempoAtual =
        frame * 0.02;

    desenhar(
        tempoAtual
    );

    frame++;

    // repeat=True
    if (frame >= 100) {
        frame = 0;
    }

    setTimeout(
        () => {
            requestAnimationFrame(animar);
        },
        20
    );
}

// ============================================================
// INÍCIO
// ============================================================

desenhar(0);

animar();
