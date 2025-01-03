class Kunai extends MovableObject {
    width = 150;
    world;
    offset = {
        x: 55,
        y: 55,
        width: 110,
        height: 110,
    }


    constructor(x,y){
        super()
        this.loadImage('img/8_coin/kunai-coin.png');
        this.x = x;
        this.y = y;
    }
}