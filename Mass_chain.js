class MassChain {


constructor(canvas, params={}){


    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");


    this.params = {

        N:30,
        m:1,
        k:10,

        tempo:20,
        passos:800,

        ...params
    };



    this.t=[];
    this.x=[];
    this.v=[];


    this.frame=0;

}



// ----------------------
// SISTEMA
// ----------------------

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



// ----------------------
// CONDIÇÃO INICIAL
// ----------------------

inicial(){


    let N=this.params.N;


    let x0=[];
    let v0=[];



    for(let i=0;i<N;i++){


        x0.push(

            Math.exp(
                -0.1*
                Math.pow(i-N/2,2)
            )

        );


        v0.push(0);

    }



    return [

        ...x0,
        ...v0

    ];

}



// ----------------------
// RK4
// ----------------------

rk4(){


    let Nsteps=this.params.passos;

    let h=this.params.tempo/Nsteps;


    let r=this.inicial();



    for(let i=0;i<=Nsteps;i++){


        this.t.push(i*h);



        let pos=[];

        let vel=[];



        for(let j=0;j<this.params.N;j++){

            pos.push(r[j]);
            vel.push(r[j+this.params.N]);

        }


        this.x.push(pos);
        this.v.push(vel);




        if(i<Nsteps){


            let k1=this.mult(
                this.f(r),
                h
            );


            let k2=this.mult(
                this.f(
                    this.soma(
                        r,
                        this.mult(k1,0.5)
                    )
                ),
                h
            );



            let k3=this.mult(
                this.f(
                    this.soma(
                        r,
                        this.mult(k2,0.5)
                    )
                ),
                h
            );



            let k4=this.mult(
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



}



mult(v,c){

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



    let N=this.params.N;



    let escala=100;



    let espacamento=
    c.width/(N+1);



    ctx.beginPath();



    for(let j=0;j<N;j++){


        let px=
        (j+1)*espacamento;



        let py=
        c.height/2
        -
        this.x[i][j]*escala;



        if(j===0){

            ctx.moveTo(px,py);

        }
        else{

            ctx.lineTo(px,py);

        }



    }


    ctx.stroke();



    // massas


    for(let j=0;j<N;j++){


        let px=
        (j+1)*espacamento;


        let py=
        c.height/2
        -
        this.x[i][j]*escala;



        ctx.beginPath();


        ctx.arc(
            px,
            py,
            8,
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


    if(this.frame>=this.x.length){

        this.frame=0;

    }



    this.desenhar(
        this.frame
    );



    this.frame++;


    requestAnimationFrame(
        ()=>this.animar()
    );


}



// ----------------------
// ALTERAR SLIDERS
// ----------------------

atualizarParametros(novos){


    this.params={

        ...this.params,
        ...novos

    };



    this.t=[];
    this.x=[];
    this.v=[];


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
