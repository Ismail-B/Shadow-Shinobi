class ThrowableObject extends MovableObject {

    width = 50;
    height = 15;
    

    constructor(x, y){
        super().loadImage('img/6_kunai/kunai.png');
        this.x = 100;
        this.y = 380;
        this.throw(x,y);
    }

    throw(x,y){
        this.x = x;
        this.y = y;
        this.speedY = 1;
        this.applyGravity();
        setInterval(() => {
            this.x += 10;
        }, 15);
    }
}