class MovableObject {
    x = 10;
    y = 0;
    img;
    height = 150;
    width = 100;
    imageCache = {};
    currentImage = 0;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    energy = 100;
    lastHit = 0;

    loadImage(path){
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr){
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            // img.style = 'transform: scaleX(-1)'; ================> Im video irgendwann nicht mehr drin
            this.imageCache[path] = img;
        });
    }

    moveRight() {
        this.x += this.speed;
        this.otherDirection = false;

    }

    moveLeft(){
        this.x -= this.speed;
        this.otherDirection = true;
    }

    playAnimation(images){
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    applyGravity(){
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {            
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
    }}, 1000/25);
    }

    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx){


        if(this instanceof Character || this instanceof Orc || this instanceof Endboss){
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "red";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        }
    }

    isAboveGround(){
        return this.y < 200;
    }

    jump() {
        this.speedY = 20;
    }

    isColliding (mo) {
        return this.x + this.width > mo.x &&
            this.y + this.height > mo.y &&
            this.x < mo.x &&
            this.y < mo.y + mo.height;
    }

    hit(){

        this.energy -= 5;
        if(this.energy < 0){
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    isDead() {
        return this.energy == 0;
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 0.5;
    }
}