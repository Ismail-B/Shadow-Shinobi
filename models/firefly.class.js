class Firefly extends MovableObject{
    y = 0;
    x = 0;
    height = 480;
    width = 720;

    constructor(){
        super().loadImage('img/5_background/layers/4_fireflys/fireflys.png');

        // this.x = Math.random()*500; 
        this.animate();
        this.x = -680 + (Math.random()* 5000);


    }

    animate(){
        setInterval(() => {
            this.moveLeft();
        }, 1000/60);
    }
}