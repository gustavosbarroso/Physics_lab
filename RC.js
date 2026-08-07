class RCCircuit {

constructor(canvas, params={}){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");


    this.params = {

        R:2,
        C:1,
        q0:1,

        tempo:10,
        passos:500,

        ...params
    };


    this.t=[];
    this.q=[];
    this.i=[];


    this.frame=0;


    // elétrons

    this.num_e = 40;
    this.electron_pos=[];

}



// ----------------------
// SISTEMA RC
// ----------------------

f(r){

    let q = r[0];

    let R = this.params.R;
    let C = this.params.C;


    let dqdt = -(1/(R*C))*q;


    return [
        dqdt
    ];

}



// ----------------------
// RK4
// ----------------------

rk4(){


    let N=this.params.passos;
    let h=this.params.tempo/N;


    let r=[
        this.params.q0
    ];



    for(let k=0;k<=N;k++){


        let tempo=k*h;


        this.t.push(tempo);


        this.q.push(r[0]);


        let R=this.params.R;
        let C=this.params.C;


        this.i.push(
            -(1/(R*C))*r[0]
        );



        if(k<N){


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



            r[0]+=
            (k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;


        }


    }



    this.resetEletrons();

}




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



// ----------------------
// ELÉTRONS
// ----------------------


resetEletrons(){

    this.electron_pos=[];


    for(let i=0;i<this.num_e;i++){

        this.electron_pos.push(
            i/this.num_e
        );

    }

}



loopPath(s){


    let x0=80;
    let x1=320;

    let y0=150;
    let y1=250;



    if(s<0.25){

        return [

            x0+(x1-x0)*(s/0.25),
            y0

        ];

    }


    else if(s<0.5){

        return [

            x1,
            y0+(y1-y0)*((s-0.25)/0.25)

        ];

    }


    else if(s<0.75){


        return [

            x1-(x1-x0)*((s-0.5)/0.25),
            y1

        ];

    }


    else{


        return [

            x0,
            y1-(y1-y0)*((s-0.75)/0.25)

        ];

    }

}



// ----------------------
// DESENHO
// ----------------------

desenhar(i){


    let ctx=this.ctx;

    ctx.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
    );



    let x0=80;
    let x1=320;

    let y0=150;
    let y1=250;



    // fios

    ctx.beginPath();

    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y0);
    ctx.lineTo(x1,y1);
    ctx.lineTo(x0,y1);
    ctx.lineTo(x0,y0);

    ctx.stroke();



    // resistor

    ctx.beginPath();

    ctx.moveTo(160,y0);

    for(let k=0;k<8;k++){

        ctx.lineTo(
            160+k*15,
            y0+(k%2?10:-10)
        );

    }

    ctx.stroke();



    // capacitor

    ctx.beginPath();

    ctx.moveTo(x1,y0+40);
    ctx.lineTo(x1,y0+100);

    ctx.moveTo(x1-20,y0+40);
    ctx.lineTo(x1+20,y0+40);


    ctx.moveTo(x1-20,y0+100);
    ctx.lineTo(x1+20,y0+100);

    ctx.stroke();




    // elétrons


    let corrente=this.i[i];

    let velocidade=0.02*corrente;


    for(let j=0;j<this.num_e;j++){


        this.electron_pos[j]+=
        velocidade;


        this.electron_pos[j]%=1;


        let pos=this.loopPath(
            this.electron_pos[j]
        );


        ctx.beginPath();

        ctx.arc(
            pos[0],
            pos[1],
            4,
            0,
            2*Math.PI
        );

        ctx.fill();

    }


}



// ----------------------
// LOOP
// ----------------------

animar(){


    if(this.frame>=this.q.length){

        this.frame=0;

    }


    this.desenhar(this.frame);


    this.frame++;


    requestAnimationFrame(
        ()=>this.animar()
    );


}



// ----------------------
// ATUALIZAR SLIDERS
// ----------------------

atualizarParametros(novos){


    this.params={

        ...this.params,
        ...novos

    };


    this.t=[];
    this.q=[];
    this.i=[];


    this.frame=0;


    this.rk4();


}



// ----------------------
// INICIAR
// ----------------------

iniciar(){

    this.rk4();

    this.animar();

}


}
