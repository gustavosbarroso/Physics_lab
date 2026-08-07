export class PenduloInvertido {

constructor(canvas, params={}){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");


    this.params = {

        g:9.81,
        m:1,
        M:2,
        l:1,
        A:0,
        w:2,
        theta0:0.05,

        ...params
    };


    this.dt = 10/1500;
    this.N = 1500;


    this.t = [];
    this.theta=[];
    this.omega=[];
    this.x=[];
    this.v=[];


    this.frame=0;


    this.solve();
}



f(r,t){


    let theta = r[0];
    let omega = r[1];
    let xpos = r[2];
    let vel = r[3];


    let {
        g,m,M,l,A,w
    } = this.params;


    let F = A*Math.cos(w*t);


    let A_mat = [

        [
            l,
            -Math.cos(theta)
        ],

        [
            -m*l*Math.cos(theta),
            M+m
        ]

    ];


    let b = [

        g*Math.sin(theta),

        F - m*l*omega*omega*Math.sin(theta)

    ];


    let det =
        A_mat[0][0]*A_mat[1][1]
        -
        A_mat[0][1]*A_mat[1][0];


    let a_theta =
    (
        b[0]*A_mat[1][1]
        -
        A_mat[0][1]*b[1]
    )/det;


    let a_x =
    (
        A_mat[0][0]*b[1]
        -
        b[0]*A_mat[1][0]
    )/det;



    return [

        omega,
        a_theta,
        vel,
        a_x

    ];

}




RK4(r,t,h){


    let k1 =
        this.f(r,t)
        .map(x=>h*x);


    let k2 =
        this.f(
            r.map((x,i)=>x+k1[i]/2),
            t+h/2
        )
        .map(x=>h*x);



    let k3 =
        this.f(
            r.map((x,i)=>x+k2[i]/2),
            t+h/2
        )
        .map(x=>h*x);



    let k4 =
        this.f(
            r.map((x,i)=>x+k3[i]),
            t+h
        )
        .map(x=>h*x);



    return r.map(
        (x,i)=>
        x+
        (k1[i]+2*k2[i]+2*k3[i]+k4[i])/6
    );

}





solve(){


    let h = 10/this.N;


    let r = [

        this.params.theta0,
        0,
        0,
        0

    ];


    this.t=[];
    this.theta=[];
    this.omega=[];
    this.x=[];
    this.v=[];



    for(let i=0;i<=this.N;i++){


        let time=i*h;


        this.t.push(time);

        this.theta.push(r[0]);
        this.omega.push(r[1]);
        this.x.push(r[2]);
        this.v.push(r[3]);



        r=this.RK4(r,time,h);

    }


}





atualizar(){


    this.frame++;


    if(this.frame>=this.N)
        this.frame=0;


}




desenhar(){


let ctx=this.ctx;

ctx.clearRect(
0,
0,
this.canvas.width,
this.canvas.height
);



let i=this.frame;



let scale=120;


let cartX =
this.canvas.width/2
+
this.x[i]*scale;



let cartY=300;


let cartW=80;
let cartH=40;



// carrinho

ctx.fillStyle="black";

ctx.fillRect(
cartX-cartW/2,
cartY,
cartW,
cartH
);



// rodas

ctx.fillStyle="gray";


ctx.beginPath();

ctx.arc(
cartX-25,
cartY+45,
10,
0,
2*Math.PI
);

ctx.fill();



ctx.beginPath();

ctx.arc(
cartX+25,
cartY+45,
10,
0,
2*Math.PI
);

ctx.fill();




// haste


let px=cartX;

let py=cartY;


let massX =
px+
this.params.l*
Math.sin(this.theta[i])*scale;


let massY =
py+
this.params.l*
Math.cos(this.theta[i])*scale;



ctx.strokeStyle="red";

ctx.lineWidth=3;

ctx.beginPath();

ctx.moveTo(px,py);

ctx.lineTo(
massX,
massY
);

ctx.stroke();



// massa


ctx.fillStyle="blue";

ctx.beginPath();

ctx.arc(
massX,
massY,
15,
0,
2*Math.PI
);

ctx.fill();



}




iniciar(){


const loop=()=>{


this.atualizar();

this.desenhar();


requestAnimationFrame(loop);


};


loop();


}



reset(){

this.frame=0;
this.solve();

}


setParametro(nome,valor){

this.params[nome]=valor;

this.solve();

}


}
