class Firefly extends MovableObject{
    y = 0;
    height = 480;
    width = 720;

    constructor(x){
        super().loadImage('img/5_background/layers/4_fireflys/fireflys.png');

        // this.x = Math.random()*500; 
        this.animate();
        this.x = x;


    }

    animate(){
        setInterval(() => {
            this.moveLeft();
        }, 1000/60);
    }
}