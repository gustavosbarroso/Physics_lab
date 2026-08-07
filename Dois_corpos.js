class DoisCorpos {

constructor(canvas, params={}){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");


    this.params = {

        r:2,
        v_rel:20,

        m1:1,
        m2:1,

        t_max:5,

        ...params
    };


    this.G = 4*Math.PI*Math.PI;
    this.UA_POR_ANO = 0.2108;


    this.t=[];
    this.sol=[];


    this.frame=0;

}



// --------------------------------
// EQUAÇÕES
// --------------------------------

f(t,y){


    let m1=this.params.m1;
    let m2=this.params.m2;


    let [

        x1,
        y1,
        vx1,
        vy1,

        x2,
        y2,
        vx2,
        vy2

    ] = y;



    let dx=x2-x1;
    let dy=y2-y1;


    let r=Math.sqrt(dx*dx+dy*dy)+1e-8;



    let ax1=this.G*m2*dx/(r**3);
    let ay1=this.G*m2*dy/(r**3);


    let ax2=-this.G*m1*dx/(r**3);
    let ay2=-this.G*m1*dy/(r**3);



    return [

        vx1,
        vy1,
        ax1,
        ay1,

        vx2,
        vy2,
        ax2,
        ay2

    ];

}



// --------------------------------
// CONDIÇÃO INICIAL
// --------------------------------

inicial(){


    let {

        r,
        v_rel,
        m1,
        m2

    }=this.params;



    let M=m1+m2;



    let x1=-(m2/M)*r;
    let x2=(m1/M)*r;



    let v=v_rel*this.UA_POR_ANO;



    let vx1=0;
    let vx2=0;


    let vy1=v*(m2/M);
    let vy2=-v*(m1/M);



    let vx_cm=(m1*vx1+m2*vx2)/M;
    let vy_cm=(m1*vy1+m2*vy2)/M;



    return [

        x1,
        0,
        vx1-vx_cm,
        vy1-vy_cm,


        x2,
        0,
        vx2-vx_cm,
        vy2-vy_cm

    ];

}



// --------------------------------
// RK4
// --------------------------------


rk4(){


    let N=400;

    let h=this.params.t_max/N;


    let r=this.inicial();


    this.t=[];
    this.sol=[];



    for(let i=0;i<=N;i++){


        this.t.push(i*h);
        this.sol.push([...r]);



        let k1=this.mult(this.f(i*h,r),h);


        let k2=this.mult(
            this.f(
                i*h+h/2,
                this.sum(r,this.mult(k1,0.5))
            ),
            h
        );


        let k3=this.mult(
            this.f(
                i*h+h/2,
                this.sum(r,this.mult(k2,0.5))
            ),
            h
        );


        let k4=this.mult(
            this.f(
                i*h+h,
                this.sum(r,k3)
            ),
            h
        );



        for(let j=0;j<8;j++){

            r[j]+=
            (k1[j]+2*k2[j]+2*k3[j]+k4[j])/6;

        }

    }

}




mult(v,c){

    return v.map(x=>x*c);

}


sum(a,b){

    return a.map((x,i)=>x+b[i]);

}



// --------------------------------
// DESENHO
// --------------------------------


desenhar(i){


    let ctx=this.ctx;
    let c=this.canvas;


    ctx.clearRect(
        0,
        0,
        c.width,
        c.height
    );



    let escala=80;


    let ox=c.width/2;
    let oy=c.height/2;



    let s=this.sol[i];



    let x1=s[0]*escala;
    let y1=s[1]*escala;


    let x2=s[4]*escala;
    let y2=s[5]*escala;



    // órbita

    ctx.strokeStyle="red";

    ctx.beginPath();

    for(let k=0;k<=i;k++){

        let p=this.sol[k];

        let x=p[0]*escala+ox;
        let y=p[1]*escala+oy;


        if(k==0)
            ctx.moveTo(x,y);
        else
            ctx.lineTo(x,y);

    }

    ctx.stroke();



    // corpo 1

    ctx.fillStyle="red";

    ctx.beginPath();

    ctx.arc(
        ox+x1,
        oy+y1,
        8,
        0,
        2*Math.PI
    );

    ctx.fill();



    // corpo 2

    ctx.fillStyle="blue";

    ctx.beginPath();

    ctx.arc(
        ox+x2,
        oy+y2,
        8,
        0,
        2*Math.PI
    );

    ctx.fill();



    // centro de massa

    ctx.fillStyle="black";

    ctx.fillRect(
        ox-3,
        oy-3,
        6,
        6
    );

}



// --------------------------------
// ANIMAÇÃO
// --------------------------------


animar(){


    if(this.frame>=this.t.length)
        this.frame=0;


    this.desenhar(this.frame);


    this.frame++;


    requestAnimationFrame(
        ()=>this.animar()
    );

}



// --------------------------------
// ALTERAR SLIDERS
// --------------------------------


atualizar(params){


    this.params={
        ...this.params,
        ...params
    };


    this.frame=0;

    this.rk4();

}



// --------------------------------
// START
// --------------------------------


iniciar(){

    this.rk4();

    this.animar();

}


}
