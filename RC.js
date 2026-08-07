// rc.js

export class RCSimulacao {

    constructor(canvas, params = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.params = {
            R: 2.0,
            C: 1.0,
            q0: 1.0,
            ...params
        };


        this.t = [];
        this.q = [];
        this.i = [];

        this.frame = 0;
        this.running = false;


        this.electrons = [];

        for(let k = 0; k < 40; k++){
            this.electrons.push(k/40);
        }


        this.resolver();
    }


    // ------------------------
    // SISTEMA RC
    // dq/dt = -q/RC
    // ------------------------

    derivada(q){

        const R = this.params.R;
        const C = this.params.C;

        return -(1/(R*C))*q;
    }



    // ------------------------
    // RK4
    // ------------------------

    rk4(){

        const h = 10/500;

        let q = this.params.q0;


        this.t = [];
        this.q = [];
        this.i = [];


        for(let k=0;k<=500;k++){

            let tempo = k*h;


            this.t.push(tempo);
            this.q.push(q);


            let corrente =
                -(1/(this.params.R*this.params.C))*q;


            this.i.push(corrente);



            let k1 = h*this.derivada(q);

            let k2 =
                h*this.derivada(q+k1/2);

            let k3 =
                h*this.derivada(q+k2/2);

            let k4 =
                h*this.derivada(q+k3);


            q +=
            (k1+2*k2+2*k3+k4)/6;

        }

    }



    // ------------------------
    // RESOLVER
    // ------------------------

    resolver(){

        this.rk4();

        this.frame = 0;

    }



    // ------------------------
    // CAMINHO DO CIRCUITO
    // ------------------------

    caminho(s){

        let x0=100;
        let x1=300;

        let y0=150;
        let y1=300;


        if(s < 0.25){

            return [
                x0+(x1-x0)*(s/0.25),
                y0
            ];

        }

        else if(s < 0.5){

            return [
                x1,
                y0+(y1-y0)*((s-0.25)/0.25)
            ];

        }


        else if(s < 0.75){

            return [
                x1-(x1-x0)*((s-0.5)/0.25),
                y1
            ];

        }


        return [
            x0,
            y1-(y1-y0)*((s-0.75)/0.25)
        ];

    }



    // ------------------------
    // DESENHO
    // ------------------------

    desenhar(){


        const ctx=this.ctx;


        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );



        // circuito

        ctx.lineWidth=3;


        ctx.beginPath();

        ctx.moveTo(100,150);
        ctx.lineTo(300,150);
        ctx.lineTo(300,300);
        ctx.lineTo(100,300);
        ctx.closePath();

        ctx.stroke();



        // resistor

        ctx.beginPath();

        ctx.moveTo(170,150);

        for(let i=0;i<8;i++){

            ctx.lineTo(
                170+i*15,
                150+(i%2?15:-15)
            );

        }

        ctx.stroke();



        // capacitor

        ctx.beginPath();

        ctx.moveTo(300,200);
        ctx.lineTo(300,250);

        ctx.moveTo(285,200);
        ctx.lineTo(315,200);

        ctx.moveTo(285,250);
        ctx.lineTo(315,250);

        ctx.stroke();



        // elétrons


        let corrente =
        Math.abs(this.i[this.frame]);


        for(let k=0;k<this.electrons.length;k++){


            this.electrons[k]+=
            0.01*corrente;


            this.electrons[k]%=1;


            let pos =
            this.caminho(this.electrons[k]);


            ctx.beginPath();

            ctx.arc(
                pos[0],
                pos[1],
                4,
                0,
                2*Math.PI
            );

            ctx.fillStyle="red";

            ctx.fill();

        }



        // texto

        ctx.fillStyle="black";

        ctx.fillText(
            `R = ${this.params.R.toFixed(2)} Ω`,
            20,
            30
        );

        ctx.fillText(
            `C = ${this.params.C.toFixed(2)} F`,
            20,
            50
        );


        ctx.fillText(
            `q = ${this.q[this.frame].toFixed(3)} C`,
            20,
            70
        );


        ctx.fillText(
            `i = ${this.i[this.frame].toFixed(3)} A`,
            20,
            90
        );


    }



    // ------------------------
    // LOOP
    // ------------------------

    animar(){


        if(!this.running)
            return;


        this.desenhar();


        this.frame++;


        if(this.frame>=this.q.length)
            this.frame=0;


        requestAnimationFrame(
            ()=>this.animar()
        );

    }



    iniciar(){

        this.running=true;

        this.animar();

    }



    parar(){

        this.running=false;

    }



    atualizarParametros(novos){

        this.params={
            ...this.params,
            ...novos
        };


        this.resolver();

    }

}
