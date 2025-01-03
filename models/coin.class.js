class Coin extends MovableObject {
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
        this.loadImage('img/8_coin/ninja-coin.png');
        this.x = x;
        this.y = y;
    }
}