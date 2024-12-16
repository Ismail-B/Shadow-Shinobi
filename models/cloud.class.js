class Cloud extends MovableObject{
    y = 10;
    height = 350;

    constructor(){
        super().loadImage('img/5_background/layers/4_clouds/1.png');

        this.x = -50 + Math.random()*500; 

        this.width = 500;
        this.height = 350;
    }
}