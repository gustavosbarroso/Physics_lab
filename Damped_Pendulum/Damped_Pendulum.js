// =================================================
// PARÂMETROS
// =================================================


let params={

    g:9.81,

    L:0.10,

    m:1.0,

    b:0.5,

    theta0:1.0,

    omega0:0.0

};



// =================================================
// SISTEMA
// =================================================


function f(state){


    let theta=state[0];

    let omega=state[1];


    return [

        omega,


        -(params.g/params.L)
        *
        Math.sin(theta)


        -

        (params.b/params.m)
        *
        omega

    ];

}




// =================================================
// RK4
// =================================================


function RK4(){


    let N=500;

    let h=10/N;


    let state=[

        params.theta0,

        params.omega0

    ];


    let data=[];


    data.push({

        t:0,

        theta:state[0],

        omega:state[1]

    });



    for(let i=0;i<N;i++){


        let k1=f(state);


        let k2=f([

            state[0]+0.5*h*k1[0],

            state[1]+0.5*h*k1[1]

        ]);



        let k3=f([

            state[0]+0.5*h*k2[0],

            state[1]+0.5*h*k2[1]

        ]);



        let k4=f([

            state[0]+h*k3[0],

            state[1]+h*k3[1]

        ]);




        state[0]+=

        h*

        (

            k1[0]
            +
            2*k2[0]
            +
            2*k3[0]
            +
            k4[0]

        )/6;



        state[1]+=

        h*

        (

            k1[1]
            +
            2*k2[1]
            +
            2*k3[1]
            +
            k4[1]

        )/6;



        data.push({

            t:(i+1)*h,

            theta:state[0],

            omega:state[1]

        });


    }


    return data;

}



// =================================================
// SOLVER
// =================================================


function solve(){


    let data=RK4();


    data.forEach(p=>{


        p.x =
        params.L *
        Math.sin(p.theta);


        p.y =
        -params.L *
        Math.cos(p.theta);


    });


    return data;

}



let simulation=solve();




// =================================================
// CLASSIFICAÇÃO
// =================================================


function classifyRegime(){


    let omega0 =
    Math.sqrt(
        params.g/params.L
    );


    let gamma =
    (params.b/params.m)/2;



    let delta =
    gamma*gamma -
    omega0*omega0;



    if(Math.abs(params.b/params.m)<1e-6)

        return "Sem amortecimento";


    if(Math.abs(delta)<1e-3)

        return "Criticamente amortecido";


    if(delta>0)

        return "Superamortecido";


    return "Subamortecido";

}



// =================================================
// DESENHO
// =================================================


let canvas =
document.getElementById("pendulo");


let ctx =
canvas.getContext("2d");



function drawPendulum(i){


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    let p=simulation[i];


    let scale=200;


    let ox=200;

    let oy=100;



    let x=ox+p.x*scale;

    let y=oy-p.y*scale;



    ctx.beginPath();

    ctx.moveTo(ox,oy);

    ctx.lineTo(x,y);

    ctx.lineWidth=3;

    ctx.stroke();



    ctx.beginPath();

    ctx.arc(
        x,
        y,
        15,
        0,
        2*Math.PI
    );


    ctx.fillStyle="red";

    ctx.fill();


}




// =================================================
// GRÁFICO
// =================================================


let chart=new Chart(

document.getElementById("grafico"),

{

type:"line",

data:{


labels:
simulation.map(p=>p.t),


datasets:[


{

label:"θ(t)",

data:
simulation.map(p=>p.theta)

},


{

label:"ω(t)",

data:
simulation.map(p=>p.omega)

}


]

},


options:{

animation:false

}

});




// =================================================
// ANIMAÇÃO
// =================================================


let frame=0;


function animate(){


drawPendulum(frame);



let p=simulation[frame];



document
.getElementById("info")
.innerHTML=`

L = ${params.L.toFixed(2)} m<br>

g = ${params.g.toFixed(2)} m/s²<br>

m = ${params.m.toFixed(2)} kg<br>

b = ${params.b.toFixed(2)} kg/s<br><br>


Regime: ${classifyRegime()}<br><br>


θ = ${p.theta.toFixed(2)} rad<br>

ω = ${p.omega.toFixed(2)} rad/s<br><br>


t = ${p.t.toFixed(2)} s

`;



frame++;


if(frame>=simulation.length)

frame=0;



requestAnimationFrame(animate);


}



animate();




// =================================================
// SLIDERS
// =================================================


function update(){


params.g =
Number(g.value);


params.L =
Number(L.value);


params.m =
Number(m.value);


params.b =
Number(b.value);


params.theta0 =
Number(theta0.value);


params.omega0 =
Number(omega0.value);



simulation=solve();



chart.data.labels =
simulation.map(p=>p.t);


chart.data.datasets[0].data =
simulation.map(p=>p.theta);


chart.data.datasets[1].data =
simulation.map(p=>p.omega);


chart.update();



}



document
.querySelectorAll("input")
.forEach(

s=>s.oninput=update

);
