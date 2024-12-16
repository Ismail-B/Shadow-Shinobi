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
        new BackgroundObject('img/5_background/layers/sky.png', -720),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -720),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', -720),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -720),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', -720),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -720),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', -720),
        new BackgroundObject('img/5_background/layers/sky.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/sky.png', 720),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720),
        new BackgroundObject('img/5_background/layers/sky.png', 720*2),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720*2),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720*2),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720*2),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720*2),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720*2),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 720*2),
        new BackgroundObject('img/5_background/layers/sky.png', 720*3),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720*3),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720*3),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720*3),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720*3),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720*3),
        new BackgroundObject('img/5_background/layers/sky.png', 720*4),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720*4),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720*4),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720*4),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720*4),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720*4),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 720*4),
        new BackgroundObject('img/5_background/layers/sky.png', 720*5),
        new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720*5),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720*5),
        new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720*5),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720*5),
        new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720*5),




    ]
    canvas;
    ctx;
    keyboard;
    camera_x = 0;


    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
    }

    setWorld(){
        this.character.world = this;
    }

    draw(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        
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
        this.ctx.translate(-this.camera_x, 0);

    }

    addObjectsToMap(objects){
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo){
        if(mo.otherDirection){
            this.ctx.save();
            this.ctx.translate(mo.width, 0);
            this.ctx.scale(-1, 1);
            mo.x = mo.x * -1;
        }
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
        if(mo.otherDirection) {
            mo.x = mo.x * -1;
            this.ctx.restore();
        }

    }
}