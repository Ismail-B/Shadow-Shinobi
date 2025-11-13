class MovableObject extends DrawableObject{

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    energy = 100;
    lastHit = 0;
    lastX = 0;
    offset = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    walkingSound;
    collidable = true;

    getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  overlapsRect(rect) {
    const a = this.getBounds();
    return a.x < rect.x + rect.w && a.x + a.w > rect.x &&
           a.y < rect.y + rect.h && a.y + a.h > rect.y;
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
    }}, 1000/70);
    }

    isAboveGround(){
        if(!this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 200;
        }
    }

    isNotMoving(){
        const isStationary = this.x === this.lastX; // Prüfen, ob der x-Wert sich nicht verändert hat
        this.lastX = this.x; // Den aktuellen x-Wert speichern
        return isStationary;
    }

    jump() {
        this.speedY = 20;
    }

    isColliding(mo) {
        return this.x + this.offset.x + this.width - this.offset.width > mo.x + mo.offset.x &&
            this.y + this.offset.y + this.height - this.offset.height > mo.y + mo.offset.y &&
            this.x + this.offset.x < mo.x+ mo.offset.x  + mo.width - mo.offset.width &&
            this.y + this.offset.y < mo.y + mo.offset.y + mo.height - mo.offset.height;
    }

    hit(){
        if (this.isDead()) return;
        if (this.isHurt()) return;

        this.energy -= 10;
        if(this.energy < 0){
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();;
        }
    }

    isDead() {
        return this.energy <= 20;
    }

    isHurt(){
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 0.5;
    }
}