class InvertedPendulum {

    constructor(params = {}) {

        this.params = {
            g: 9.81,
            m: 1.0,
            M: 2.0,
            l: 1.0,
            A: 0.0,
            w: 2.0,
            theta0: 0.05,
            ...params
        };


        this.t = [];
        this.theta = [];
        this.omega = [];
        this.x = [];
        this.v = [];

        this.xMass = [];
        this.yMass = [];

    }



    // ===========================
    // SISTEMA DINÂMICO
    // ===========================

    f(r, t) {


        let theta = r[0];
        let omega = r[1];


        let g = this.params.g;
        let m = this.params.m;
        let M = this.params.M;
        let l = this.params.l;

        let A = this.params.A;
        let w = this.params.w;


        let F = A * Math.cos(w*t);



        let a11 = l;
        let a12 = -Math.cos(theta);

        let a21 = -m*l*Math.cos(theta);
        let a22 = M + m;



        let b1 = g*Math.sin(theta);

        let b2 =
            F -
            m*l*
            omega*omega*
            Math.sin(theta);



        let det =
            a11*a22 -
            a12*a21;



        let alpha =
            (b1*a22 - a12*b2)
            /
            det;



        let acceleration =
            (a11*b2 - b1*a21)
            /
            det;



        return [

            omega,
            alpha,
            r[3],
            acceleration

        ];

    }



    // ===========================
    // RK4
    // ===========================

    RK4(a, b, N, initial) {


        let h = (b-a)/N;


        let r = [...initial];


        let t = [];

        let theta = [];
        let omega = [];

        let x = [];
        let v = [];



        for(let i=0; i<=N; i++) {


            let time = a+i*h;


            t.push(time);

            theta.push(r[0]);
            omega.push(r[1]);

            x.push(r[2]);
            v.push(r[3]);



            if(i < N) {


                let k1 =
                    this.f(r,time)
                    .map(k => h*k);



                let k2 =
                    this.f(
                        r.map(
                            (value,j)=>
                            value+k1[j]/2
                        ),
                        time+h/2
                    )
                    .map(k=>h*k);



                let k3 =
                    this.f(
                        r.map(
                            (value,j)=>
                            value+k2[j]/2
                        ),
                        time+h/2
                    )
                    .map(k=>h*k);



                let k4 =
                    this.f(
                        r.map(
                            (value,j)=>
                            value+k3[j]
                        ),
                        time+h
                    )
                    .map(k=>h*k);



                for(let j=0;j<4;j++) {

                    r[j] +=
                    (
                        k1[j]
                        +
                        2*k2[j]
                        +
                        2*k3[j]
                        +
                        k4[j]

                    )/6;

                }

            }

        }


        return {
            t,
            theta,
            omega,
            x,
            v
        };

    }



    // ===========================
    // SOLVER
    // ===========================

    solve(time = 10, steps = 1500) {


        let result =
            this.RK4(

                0,
                time,
                steps,

                [
                    this.params.theta0,
                    0,
                    0,
                    0
                ]

            );



        this.t = result.t;

        this.theta = result.theta;
        this.omega = result.omega;

        this.x = result.x;
        this.v = result.v;



        this.xMass = [];
        this.yMass = [];



        for(let i=0;i<this.t.length;i++) {


            let xm =
                this.x[i]
                +
                this.params.l *
                Math.sin(this.theta[i]);



            let ym =
                0.3
                +
                this.params.l *
                Math.cos(this.theta[i]);



            this.xMass.push(xm);
            this.yMass.push(ym);

        }



        return {

            t:this.t,

            theta:this.theta,
            omega:this.omega,

            x:this.x,
            v:this.v,

            xMass:this.xMass,
            yMass:this.yMass

        };

    }



    // ===========================
    // ALTERAR PARÂMETROS
    // ===========================

    updateParams(params) {

        Object.assign(
            this.params,
            params
        );

    }



    // ===========================
    // ESTADO
    // ===========================

    getState(i) {

        return {

            t:this.t[i],

            theta:this.theta[i],
            omega:this.omega[i],

            x:this.x[i],
            v:this.v[i],

            xMass:this.xMass[i],
            yMass:this.yMass[i]

        };

    }

}
