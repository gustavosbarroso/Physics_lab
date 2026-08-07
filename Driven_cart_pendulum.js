class PenduloCarrinho {


constructor(canvas, params={}){


this.canvas = canvas;
this.ctx = canvas.getContext("2d");


this.params = {

g:9.81,

L:0.5,

A:0.3,

w_drive:2.0,

theta0:0.5,

omega0:0.0,


tempo:20,
passos:500,


...params

};



this.t=[];
this.theta=[];
this.omega=[];
this.x_cart=[];


this.frame=0;


}



// ---------------------------
// SISTEMA
// ---------------------------


f(r,t){


let theta=r[0];
let omega=r[1];


let {
g,
L,
A,
w_drive

}=this.params;



let dtheta=omega;


let domega =

-(g/L)*Math.sin(theta)

+

(A/L)
*Math.cos(theta)
*Math.cos(w_drive*t);



return [

dtheta,
domega

];


}



// ---------------------------
// RK4
// ---------------------------


multiplica(v,c){

return v.map(
x=>x*c
);

}



soma(a,b){

return a.map(
(x,i)=>x+b[i]
);

}



rk4(){


let h=
this.params.tempo/
this.params.passos;



let r=[

this.params.theta0,

this.params.omega0

];



this.t=[];
this.theta=[];
this.omega=[];



for(let i=0;i<=this.params.passos;i++){



let tempo=i*h;


this.t.push(tempo);


this.theta.push(r[0]);

this.omega.push(r[1]);



let k1=
this.multiplica(
this.f(r,tempo),
h
);



let k2=
this.multiplica(

this.f(
this.soma(
r,
this.multiplica(k1,0.5)
),
tempo+h/2
),

h

);



let k3=
this.multiplica(

this.f(
this.soma(
r,
this.multiplica(k2,0.5)
),
tempo+h/2
),

h

);



let k4=
this.multiplica(

this.f(
this.soma(r,k3),
tempo+h
),

h

);



for(let j=0;j<2;j++){


r[j]+=

(
k1[j]
+2*k2[j]
+2*k3[j]
+k4[j]

)/6;


}



}



this.x_cart =
this.t.map(

t=>

this.params.A*
Math.cos(
this.params.w_drive*t
)

);



}



// ---------------------------
// DESENHO
// ---------------------------


desenhar(i){


let ctx=this.ctx;

let c=this.canvas;



ctx.clearRect(
0,
0,
c.width,
c.height
);



let {

L

}=this.params;



let escala=150;


let xc =
c.width/2
+
this.x_cart[i]*escala;


let baseY=120;



// chão

ctx.beginPath();

ctx.moveTo(
0,
baseY+80
);

ctx.lineTo(
c.width,
baseY+80
);

ctx.stroke();



// carrinho


let cw=60;
let ch=30;



ctx.fillRect(

xc-cw/2,

baseY,

cw,

ch

);



// rodas


ctx.beginPath();

ctx.arc(
xc-20,
baseY+35,
8,
0,
2*Math.PI
);

ctx.arc(
xc+20,
baseY+35,
8,
0,
2*Math.PI
);


ctx.fill();




// pêndulo


let xp =
xc+
L*
Math.sin(
this.theta[i]
)
*escala;



let yp =

baseY

+

ch

-

L*
Math.cos(
this.theta[i]
)
*escala;



ctx.beginPath();


ctx.moveTo(
xc,
baseY+ch
);


ctx.lineTo(
xp,
yp
);


ctx.stroke();



// massa


ctx.beginPath();


ctx.arc(

xp,
yp,

10,

0,

2*Math.PI

);


ctx.fill();



}



// ---------------------------
// ANIMAÇÃO
// ---------------------------


animar(){


if(this.frame>=this.t.length)

this.frame=0;



this.desenhar(
this.frame
);



this.frame++;


requestAnimationFrame(
()=>this.animar()
);



}



// ---------------------------
// RESET
// ---------------------------


reiniciar(){


this.frame=0;

this.rk4();


}



// ---------------------------
// INICIAR
// ---------------------------


iniciar(){

this.rk4();

this.animar();

}


}
