class PenduloAmortecido {

    constructor(canvas, params={}) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");


        this.g = params.g ?? 9.81;
        this.L = params.L ?? 1;
        this.m = params.m ?? 1;
        this.b = params.b ?? 0.5;


        this.theta = params.theta0 ?? 1;
        this.omega = params.omega0 ?? 0;


        this.dt = 0.02;

        this.t = 0;

        this.historicoTheta = [];
        this.historicoOmega = [];

        this.animando = false;

    }



    // =========================
    // EQUAÇÃO DO MOVIMENTO
    // =========================

    aceleracao(theta,omega){

        return (
            -(this.g/this.L)*Math.sin(theta)
            -
            (this.b/this.m)*omega
        );

    }



    derivada(state){

        let theta = state[0];
        let omega = state[1];


        return [
            omega,
            this.aceleracao(theta,omega)
        ];

    }



    // =========================
    // RK4
    // =========================

    RK4(){

        let estado=[
            this.theta,
            this.omega
        ];


        let h=this.dt;


        let k1=this.derivada(estado);


        let k2=this.derivada([
            estado[0]+h*k1[0]/2,
            estado[1]+h*k1[1]/2
        ]);


        let k3=this.derivada([
            estado[0]+h*k2[0]/2,
            estado[1]+h*k2[1]/2
        ]);


        let k4=this.derivada([
            estado[0]+h*k3[0],
            estado[1]+h*k3[1]
        ]);



        this.theta += 
        h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;


        this.omega += 
        h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6;


    }



    // =========================
    // POSIÇÃO
    // =========================

    posicao(){

        return {

            x:
            this.L*Math.sin(this.theta),


            y:
            this.L*Math.cos(this.theta)

        };

    }



    // =========================
    // REGIME
    // =========================

    regime(){

        let omega0=Math.sqrt(this.g/this.L);

        let gamma=(this.b/this.m)/2;


        let delta=gamma*gamma-omega0*omega0;


        if(Math.abs(this.b/this.m)<1e-6)
            return "Sem amortecimento";


        if(Math.abs(delta)<1e-3)
            return "Criticamente amortecido";


        if(delta>0)
            return "Superamortecido";


        return "Subamortecido";

    }



    // =========================
    // DESENHO
    // =========================

    desenhar(){

        let ctx=this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        let p=this.posicao();


        let cx=this.canvas.width/2;
        let cy=80;


        let escala=150;



        ctx.beginPath();

        ctx.moveTo(cx,cy);

        ctx.lineTo(
            cx+p.x*escala,
            cy+p.y*escala
        );


        ctx.strokeStyle="black";
        ctx.lineWidth=3;

        ctx.stroke();



        ctx.beginPath();

        ctx.arc(
            cx+p.x*escala,
            cy+p.y*escala,
            12,
            0,
            2*Math.PI
        );


        ctx.fillStyle="gray";

        ctx.fill();



        ctx.fillStyle="black";

        ctx.fillText(
            "θ = "+this.theta.toFixed(2),
            20,
            20
        );


        ctx.fillText(
            "ω = "+this.omega.toFixed(2),
            20,
            40
        );


        ctx.fillText(
            this.regime(),
            20,
            60
        );


    }



    // =========================
    // LOOP
    // =========================

    atualizar(){

        this.RK4();


        this.historicoTheta.push(this.theta);
        this.historicoOmega.push(this.omega);


        this.desenhar();


        this.t+=this.dt;


    }



    iniciar(){

        this.animando=true;


        const loop=()=>{

            if(!this.animando)
                return;


            this.atualizar();


            requestAnimationFrame(loop);

        };


        loop();

    }



    parar(){

        this.animando=false;

    }



    // =========================
    // CONTROLE PELO APP
    // =========================

    alterarParametro(nome,valor){

        this[nome]=valor;

    }


}
