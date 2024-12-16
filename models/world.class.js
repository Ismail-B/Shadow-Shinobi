class World {
    character = new Character();
    enemies = [
        new Orc(),
        new Orc(),
        new Orc(),
    ];
    fireflys = [
        new Firefly()
    ]
    backgroundObjects = [
        new BackgroundObject('img/5_background/layers/sky.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),


    ]
    canvas;
    ctx;

    constructor(canvas){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw();
    }

    draw(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        
        this.addObjectsToMap(this.backgroundObjects);
        
        this.backgroundObjects.forEach((bgo) => {
            this.addToMap(bgo);
        });
        
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
        
        this.addObjectsToMap(this.fireflys);
        this.addObjectsToMap(this.enemies);
        this.addToMap(this.character);
    }

    addObjectsToMap(objects){
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo){
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    }
}