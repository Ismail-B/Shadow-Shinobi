class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 10;
    y = 0;
    height = 150;
    width = 100;


    loadImage(path){
        this.img = new Image();
        this.img.src = path;
    }

    draw(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
    
    drawFrame(ctx){
        if(this instanceof Character || this instanceof Orc || this instanceof Endboss || this instanceof Coin){
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = "red";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        }
    }

    drawOffsetFrame(ctx) {
        if (this instanceof Character || this instanceof Orc || this instanceof Endboss || this instanceof Coin || this instanceof Kunai) {
            ctx.beginPath();
            ctx.lineWidth = '2';
            ctx.strokeStyle = 'transparent';  //==> hitbox visibility
            ctx.rect(this.x + this.offset.x, 
                this.y + this.offset.y, 
                this.width - this.offset.width, 
                this.height - this.offset.height);
            ctx.stroke();
        }
    }

    loadImages(arr){
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            // img.style = 'transform: scaleX(-1)'; ================> Im video irgendwann nicht mehr drin
            this.imageCache[path] = img;
        });
    }
}