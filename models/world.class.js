class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBarLife = new StatusBarLife();
    statusBarCoin = new StatusBarCoin();
    statusBarKunai = new StatusBarKunai();
    statusBarEndboss = new StatusBarEndboss();
    throwableObjects = [];
    background_sound = new Audio('audio/forest-background.mp3');
    music = new Audio('audio/music.mp3');
    ninjaCoinsCollected = 0; // für 'Coin' (ninja-coin.png)
    kunaiCoinsCollected = 0; // für 'KunaiCoin' (kunai-coin.png)    


    constructor(canvas, keyboard){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setWorld();
        this.run();
    }

    setWorld(){
        this.background_sound.play();
        this.background_sound.volume = 0.4;
        this.music.play();
        this.music.volume = 0.4;
        this.character.world = this;
    }
// intervall anpassen und zweites Intervall für checkThrowObjects()
    run(){
        setInterval(() => {
            this.checkCollisions();
            this.checkCollectibles();
            this.checkThrowObjects();
            this.checkForEndboss();
        }, 200);
    }

    checkCollisions(){
        this.level.enemies.forEach((enemy) => {
            if(this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBarLife.setPercentage(this.character.energy);
            };
        })
    }

    // checkCollisions() {
    //     this.level.enemies.forEach((enemy, index) => {
    //         if (this.character.isColliding(enemy)) {
    //             if (this.character.isAboveGround() && this.character.speedY <= 0) {
    //                 if (enemy instanceof Chicken || enemy instanceof ChickenSmall) {
    //                     if (!isMuted) {
    //                         this.chickenCrushSound.play();
    //                     }
    //                     this.chickenCrushSound.volume = 0.1;
    //                     this.level.enemies.splice(index, 1);
    //                 }
    //             } else if (enemy instanceof Endboss) {
    //                 this.character.x -= 30;
    //                 this.character.hit();
    //                 this.statusBarHealth.setPercentage(this.character.energy);
    //             } else {
    //                 this.character.hit();
    //                 this.statusBarHealth.setPercentage(this.character.energy);
    //             }
    //         }
    //     });
    // }

    checkThrowObjects(){
        if(this.keyboard.D){
            let kunai = new ThrowableObject(this.character.x, this.character.y + 60);
            this.throwableObjects.push(kunai);
        }
    }

    checkForEndboss() {
        if (this.character.x > 3500 && !this.level.endbossLoaded) {
            // Füge den Endboss hinzu
            const endboss = new Endboss();
            this.level.enemies.push(endboss);
    
            // Setze eine Markierung, dass der Endboss geladen wurde
            this.level.endbossLoaded = true;
    
            console.log("Endboss wurde geladen!");
        }
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
        this.addObjectsToMap(this.throwableObjects);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.kunais);
        this.addObjectsToMap(this.level.enemies);

        this.addToMap(this.character);

        this.ctx.translate(-this.camera_x, 0);

        //=========SPACE FOR FIXED OBJECTS===========
        this.addToMap(this.statusBarLife);
        this.addToMap(this.statusBarCoin);
        this.addToMap(this.statusBarKunai);
        this.addToMap(this.statusBarEndboss);
        this.ctx.translate(this.camera_x, 0);

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

        // mo.drawFrame(this.ctx);

        mo.drawOffsetFrame(this.ctx);

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

    loadEndpage(){
        if (this.energy == 0) {
            
        }
    }

checkCollectibles() {
  // Ninja-Coins
  for (let i = this.level.coins.length - 1; i >= 0; i--) {
    const c = this.level.coins[i];
    if (this.character.isColliding(c)) {
      this.level.coins.splice(i, 1);
      this.ninjaCoinsCollected++;
      this.statusBarCoin.setPercentage(Math.min(100, this.ninjaCoinsCollected * 20));
    }
  }
  // Kunai-Coins
  for (let i = this.level.kunais.length - 1; i >= 0; i--) {
    const kc = this.level.kunais[i];
    if (this.character.isColliding(kc)) {
      this.level.kunais.splice(i, 1);
      this.kunaiCoinsCollected++;
      this.statusBarKunai.setPercentage(Math.min(100, this.kunaiCoinsCollected * 20));
    }
  }
}
}