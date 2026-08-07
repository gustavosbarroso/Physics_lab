class PenduloDuplo {


constructor(canvas, params={}){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");


    this.params = {

        g:9.81,
        L1:1,
        L2:1,

        m1:1,
        m2:1,

        theta1:1,
        theta2:1,

        tempo:10,
        passos:300,

        ...params
    };


    this.t = [];
    this.th1=[];
    this.th2=[];


    this.x1=[];
    this.y1=[];

    this.x2=[];
    this.y2=[];


    this.frame=0;

}




// ----------------------
// SISTEMA
// ----------------------

f(r){


let [
    theta1,
    omega1,
    theta2,
    omega2

]=r;



let {
g,
L1,
L2,
m1,
m2

}=this.params;



let delta = theta2-theta1;



let den1 =
(m1+m2)*L1 -
m2*L1*Math.cos(delta)**2;



let a1 = (

m2*L1*omega1**2*
Math.sin(delta)*
Math.cos(delta)

+

m2*g*
Math.sin(theta2)*
Math.cos(delta)

+

m2*L2*
omega2**2*
Math.sin(delta)

-

(m1+m2)*
g*
Math.sin(theta1)

)/den1;



let den2=(L2/L1)*den1;



let a2=(

-m2*L2*
omega2**2*
Math.sin(delta)*
Math.cos(delta)

+

(m1+m2)*
g*
Math.sin(theta1)*
Math.cos(delta)

-

(m1+m2)*
L1*
omega1**2*
Math.sin(delta)

-

(m1+m2)*
g*
Math.sin(theta2)


)/den2;



return [

omega1,
a1,

omega2,
a2

];

}



// ----------------------
// RK4
// ----------------------

rk4(){


let N=this.params.passos;
let h=this.params.tempo/N;


let r=[

this.params.theta1,
0,

this.params.theta2,
0

];



for(let i=0;i<=N;i++){


let tempo=i*h;


this.t.push(tempo);


this.th1.push(r[0]);
this.th2.push(r[2]);



let L1=this.params.L1;
let L2=this.params.L2;



this.x1.push(
L1*Math.sin(r[0])
);


this.y1.push(
-L1*Math.cos(r[0])
);



this.x2.push(

this.x1[i]+
L2*Math.sin(r[2])

);



this.y2.push(

this.y1[i]-
L2*Math.cos(r[2])

);





let k1 =
this.multiplica(
this.f(r),
h
);



let k2 =
this.multiplica(
this.f(this.soma(r,this.multiplica(k1,0.5))),
h
);



let k3 =
this.multiplica(
this.f(this.soma(r,this.multiplica(k2,0.5))),
h
);



let k4 =
this.multiplica(
this.f(this.soma(r,k3)),
h
);



for(let j=0;j<4;j++){

r[j]+=
(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6;

}



}



}




multiplica(v,c){

return v.map(x=>x*c);

}


soma(a,b){

return a.map((x,i)=>x+b[i]);

}




// ----------------------
// DESENHO
// ----------------------

desenhar(i){


let ctx=this.ctx;
let c=this.canvas;


ctx.clearRect(
0,
0,
c.width,
c.height
);



let escala=120;



let ox=c.width/2;
let oy=100;



ctx.beginPath();


ctx.moveTo(
ox,
oy
);


ctx.lineTo(
ox+this.x1[i]*escala,
oy+this.y1[i]*escala
);



ctx.lineTo(
ox+this.x2[i]*escala,
oy+this.y2[i]*escala
);



ctx.stroke();



ctx.beginPath();


ctx.arc(

ox+this.x1[i]*escala,
oy+this.y1[i]*escala,

10,
0,
2*Math.PI

);



ctx.fill();



ctx.beginPath();


ctx.arc(

ox+this.x2[i]*escala,
oy+this.y2[i]*escala,

10,
0,
2*Math.PI

);



ctx.fill();



}




// ----------------------
// LOOP
// ----------------------

animar(){


if(this.frame>=this.t.length)

    this.frame=0;



this.desenhar(this.frame);


this.frame++;


requestAnimationFrame(
()=>this.animar()
);


}




// ----------------------
// INICIAR
// ----------------------

iniciar(){

this.rk4();

this.animar();

}


}
