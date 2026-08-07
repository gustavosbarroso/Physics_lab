class InterferenciaCadeiaMassas {


constructor(canvas, params={}){

this.canvas = canvas;
this.ctx = canvas.getContext("2d");


this.params = {

N:60,
m:1,
k:10,

c1:60*0.3,
c2:60*0.7,

l1:3,
l2:3,

A1:1,
A2:-1,

tempo:20,
passos:400,

...params

};


this.t=[];
this.x=[];
this.v=[];


this.frame=0;

}


// ---------------------------
// GAUSSIANA
// ---------------------------


gauss(i, centro, largura, amplitude){

return amplitude *
Math.exp(
-((i-centro)**2)/
(2*largura**2)
);

}



// ---------------------------
// SISTEMA
// ---------------------------


f(r){


let N=this.params.N;
let k=this.params.k;
let m=this.params.m;


let x=r.slice(0,N);
let v=r.slice(N);


let a=new Array(N).fill(0);



for(let i=0;i<N;i++){


if(i===0){

a[i]=(k/m)*(x[i+1]-x[i]);

}

else if(i===N-1){

a[i]=(k/m)*(x[i-1]-x[i]);

}

else{

a[i]=(k/m)*
(
x[i+1]+x[i-1]-2*x[i]
);

}


}


return [
...v,
...a
];


}



// ---------------------------
// OPERAÇÕES RK4
// ---------------------------


multiplica(v,c){

return v.map(x=>x*c);

}



soma(a,b){

return a.map(
(x,i)=>x+b[i]
);

}



// ---------------------------
// RK4
// ---------------------------


rk4(){


let N=this.params.N;

let h=this.params.tempo/
this.params.passos;


let r=this.inicial();


this.t=[];
this.x=[];
this.v=[];



for(let i=0;i<=this.params.passos;i++){


this.t.push(i*h);



this.x.push(
r.slice(0,N)
);


this.v.push(
r.slice(N)
);



let k1=this.multiplica(
this.f(r),
h
);


let k2=this.multiplica(
this.f(
this.soma(
r,
this.multiplica(k1,0.5)
)
),
h
);



let k3=this.multiplica(
this.f(
this.soma(
r,
this.multiplica(k2,0.5)
)
),
h
);



let k4=this.multiplica(
this.f(
this.soma(r,k3)
),
h
);



for(let j=0;j<r.length;j++){

r[j]+=
(
k1[j]
+2*k2[j]
+2*k3[j]
+k4[j]
)/6;

}



}


}



// ---------------------------
// CONDIÇÃO INICIAL
// ---------------------------


inicial(){


let N=this.params.N;


let x0=new Array(N).fill(0);
let v0=new Array(N).fill(0);



for(let i=0;i<N;i++){


x0[i]+=this.gauss(
i,
this.params.c1,
this.params.l1,
this.params.A1
);



x0[i]+=this.gauss(
i,
this.params.c2,
this.params.l2,
this.params.A2
);



}


return [
...x0,
...v0
];


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



let N=this.params.N;


let escala=80;


let dx=c.width/N;



ctx.beginPath();



for(let j=0;j<N;j++){


let x=j*dx;

let y=
c.height/2
-
this.x[i][j]*escala;



if(j===0)
ctx.moveTo(x,y);

else
ctx.lineTo(x,y);



}


ctx.stroke();



for(let j=0;j<N;j++){


ctx.beginPath();


ctx.arc(

j*dx,

c.height/2-
this.x[i][j]*escala,

5,

0,

2*Math.PI

);


ctx.fill();


}



}



// ---------------------------
// LOOP
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
// REINICIAR SIMULAÇÃO
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
