class PenduloSimples {

    constructor(canvas, options = {}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");


        // parâmetros físicos
        this.g = options.g ?? 9.81;
        this.L = options.L ?? 0.10;

        this.theta0 = options.theta0 ?? 1.0;
        this.omega0 = options.omega0 ?? 0.0;


        // estado
        this.theta = [];
        this.omega = [];
        this.time = [];

        this.frame = 0;

        this.running = false;
    }



    derivada(theta, omega){

        return {
            theta: omega,
            omega:
            -(this.g/this.L)*Math.sin(theta)
        };
    }



    resolver(){

        let N = 500;
        let tempo = 10;
        let h = tempo/N;


        let theta = this.theta0;
        let omega = this.omega0;


        this.theta=[];
        this.omega=[];
        this.time=[];


        for(let i=0;i<=N;i++){

            let t=i*h;


            this.time.push(t);
            this.theta.push(theta);
            this.omega.push(omega);



            let k1=this.derivada(theta,omega);


            let k2=this.derivada(
                theta+h*k1.theta/2,
                omega+h*k1.omega/2
            );


            let k3=this.derivada(
                theta+h*k2.theta/2,
                omega+h*k2.omega/2
            );


            let k4=this.derivada(
                theta+h*k3.theta,
                omega+h*k3.omega
            );


            theta += h*
            (
                k1.theta+
                2*k2.theta+
                2*k3.theta+
                k4.theta
            )/6;


            omega += h*
            (
                k1.omega+
                2*k2.omega+
                2*k3.omega+
                k4.omega
            )/6;

        }


    }



    desenhar(){

        let ctx=this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        let theta =
        this.theta[this.frame];


        let cx =
        this.canvas.width/2;

        let cy=80;


        let escala=200;


        let x =
        cx + escala*this.L*Math.sin(theta);


        let y =
        cy + escala*this.L*Math.cos(theta);



        // haste

        ctx.beginPath();

        ctx.moveTo(cx,cy);
        ctx.lineTo(x,y);

        ctx.stroke();



        // massa

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            15,
            0,
            2*Math.PI
        );

        ctx.fill();


    }



    iniciar(){

        this.resolver();

        this.running=true;


        const loop=()=>{

            if(!this.running)
                return;


            this.desenhar();


            this.frame++;


            if(this.frame>=this.theta.length)
                this.frame=0;


            requestAnimationFrame(loop);

        };


        loop();

    }


}
