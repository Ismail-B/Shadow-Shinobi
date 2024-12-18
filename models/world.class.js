class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    background_sound = new Audio('audio/forest-background.mp3');
    music = new Audio('audio/music.mp3');


    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.checkCollisions();
    }

    setWorld(){
        this.background_sound.play();
        this.background_sound.volume = 0.4;
        this.music.play();
        this.music.volume = 0.4;
        this.character.world = this;
    }

    checkCollisions(){
        setInterval(() => {
            this.level.enemies.forEach((enemy) => {
                if(this.character.isColliding(enemy)) {
                    this.character.hit();
                    console.log('Collision with Character, energy:', this.character.energy);
                };
            })
        }, 200);
    }

    draw(){
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        
        this.addObjectsToMap(this.level.backgroundObjects);
        
        // this.backgroundObjects.forEach((bgo) => {
        //     this.addToMap(bgo);
        // });
        
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
        
        this.addObjectsToMap(this.level.fireflys);
        // this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.enemies);
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
            this.flipImage(mo);
        }
        mo.draw(this.ctx);

        mo.drawFrame(this.ctx);

        if(mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}