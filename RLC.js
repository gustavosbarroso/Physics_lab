class RLCircuit {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");


        this.params = {

            R: 2.0,
            L: 1.0,
            C: 1.0,

            q0:0,
            i0:0,

            V0:5,
            omega:2,

            ...options
        };


        this.time = [];
        this.q = [];
        this.current = [];

        this.running = false;
        this.frame = 0;


        this.solve();

    }


    // ==========================
    // SISTEMA DIFERENCIAL
    // ==========================


    f(state,t){


        let q = state[0];
        let i = state[1];


        let p = this.params;


        let Vt = p.V0 * Math.cos(
            p.omega*t
        );


        return [

            i,

            (Vt/p.L)
            -
            (p.R/p.L)*i
            -
            (1/(p.L*p.C))*q

        ];

    }



    // ==========================
    // RK4
    // ==========================


    RK4(){

        let a=0;
        let b=20;
        let N=500;


        let h=(b-a)/N;


        let state=[
            this.params.q0,
            this.params.i0
        ];


        this.time=[];
        this.q=[];
        this.current=[];



        for(let n=0;n<=N;n++){


            let t=a+n*h;


            this.time.push(t);
            this.q.push(state[0]);
            this.current.push(state[1]);



            if(n===N)
                break;



            let k1=this.mul(
                this.f(state,t),
                h
            );


            let k2=this.mul(
                this.f(
                    this.add(state,this.mul(k1,0.5)),
                    t+h/2
                ),
                h
            );


            let k3=this.mul(
                this.f(
                    this.add(state,this.mul(k2,0.5)),
                    t+h/2
                ),
                h
            );



            let k4=this.mul(
                this.f(
                    this.add(state,k3),
                    t+h
                ),
                h
            );



            state=this.add(
                state,
                this.mul(
                    this.add4(k1,k2,k3,k4),
                    1/6
                )
            );


        }

    }



    add(a,b){

        return [
            a[0]+b[0],
            a[1]+b[1]
        ];

    }



    mul(a,x){

        return [
            a[0]*x,
            a[1]*x
        ];

    }



    add4(a,b,c,d){

        return [

            a[0]+2*b[0]+2*c[0]+d[0],

            a[1]+2*b[1]+2*c[1]+d[1]

        ];

    }



    solve(){

        this.RK4();

    }




    // ==========================
    // CLASSIFICAÇÃO
    // ==========================


    regime(){


        let p=this.params;


        let omega0=
            1/Math.sqrt(
                p.L*p.C
            );


        let gamma=
            p.R/(2*p.L);



        if(Math.abs(gamma-omega0)<1e-3)
            return "Criticamente amortecido";


        if(gamma>omega0)
            return "Superamortecido";


        return "Subamortecido";

    }





    // ==========================
    // VISUALIZAÇÃO
    // ==========================


    draw(){


        let ctx=this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        let w=this.canvas.width;
        let h=this.canvas.height;



        let x0=100;
        let x1=400;

        let y0=150;
        let y1=350;



        ctx.lineWidth=3;



        // fios

        ctx.beginPath();

        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y0);
        ctx.lineTo(x1,y1);
        ctx.lineTo(x0,y1);
        ctx.closePath();

        ctx.stroke();




        // resistor

        ctx.beginPath();

        for(let i=0;i<8;i++){

            let x=
            180+i*20;

            let y=
            y0+(i%2?20:-20);

            if(i===0)
                ctx.moveTo(x,y);
            else
                ctx.lineTo(x,y);

        }

        ctx.stroke();




        // capacitor

        ctx.beginPath();

        ctx.moveTo(x1-20,220);
        ctx.lineTo(x1+20,220);

        ctx.moveTo(x1-20,260);
        ctx.lineTo(x1+20,260);

        ctx.stroke();




        // indutor

        ctx.beginPath();


        for(let i=0;i<100;i++){

            let x=200+i*2;

            let y=
            y0+
            Math.sin(i*0.3)*15;


            if(i===0)
                ctx.moveTo(x,y);
            else
                ctx.lineTo(x,y);

        }


        ctx.stroke();





        // elétrons

        let pos=
        Math.floor(
            (this.frame*5)
            %
            300
        );


        ctx.fillStyle="black";


        ctx.beginPath();

        ctx.arc(
            x0+pos,
            y0,
            5,
            0,
            2*Math.PI
        );

        ctx.fill();



    }




    // ==========================
    // ANIMAÇÃO
    // ==========================


    iniciar(){


        this.running=true;


        const loop=()=>{


            if(!this.running)
                return;


            this.draw();


            this.frame++;


            requestAnimationFrame(loop);

        };


        loop();

    }



    parar(){

        this.running=false;

    }




    atualizarParametros(newParams){


        this.params={
            ...this.params,
            ...newParams
        };


        this.solve();

    }


}
