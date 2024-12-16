class MovableObject {
    x = 10;
    y = 300;
    img;
    height = 150;
    width = 100;



    loadImage(path){
        this.img = new Image();
        this.img.src = path;
    }

    moveRight() {
        console.log('Moving Right');
        
    }

    moveLeft(){

    }
}