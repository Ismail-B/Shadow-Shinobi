class World {
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];
    clouds = [
        new Cloud()
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
        //this.ctx.drawImage(this.background.cloud.img, this.background.x, this.background.y, this.background.width, this.background.height);
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y, this.character.width, this.character.height);
        this.enemies.forEach(enemy => {
            this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
        })
        this.clouds.forEach(cloud => {
            this.ctx.drawImage(cloud.img, cloud.x, cloud.y, cloud.width, cloud.height);
        })
        
        //draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });

        // for (let i = 0; i < enemies.length; i++) {
        //     this.ctx.drawImage(this.enemies.img, this.enemies.x, this.enemies.y, this.enemies.width, this.enemies.height);

        // }

    }
}