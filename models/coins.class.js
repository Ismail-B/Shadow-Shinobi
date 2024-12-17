class Coin extends MovableObject {
    y = 0;
    x = 0;
    height = 480;
    width = 720;

    constructor(){
        super().loadImage('img/8_coin/coin_1.png');

        // this.x = Math.random()*500; 
        this.animate();
        this.x = 0;


    }

    animate(){
        this.moveLeft();
    }
}