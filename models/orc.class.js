class Orc extends MovableObject{
    height = 100;
    width = 70;
    y = 265;
    IMAGES_WALKING = [
        'img/3_enemies_orcs/orc_green/1_walk/Walk_1.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_2.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_3.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_4.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_5.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_6.png',
        'img/3_enemies_orcs/orc_green/1_walk/Walk_7.png',
    ];
    constructor(){
        super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = 200 + Math.random()*500; 
        this.speed = 0.15 + Math.random()* 0.5;

        this.animate();
    }


    animate(){
        this.moveLeft();
        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALKING.length;
            let path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        },200);
    }
}