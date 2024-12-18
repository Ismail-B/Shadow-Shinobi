class Orc extends MovableObject{
    height = 100;
    width = 70;
    y = 265;
    IMAGES_WALKING = [];
    walking_sound = new Audio('audio/running.mp3');
    orc_sound = new Audio('audio/orc.mp3');

    constructor(){
        super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.x = 2000 + Math.random()*5000; 
        this.speed = 0.15 + Math.random()* 3.5;

        this.animate();
    }


    animate(){
        setInterval(() => {
            this.moveLeft();
            this.otherDirection = false;
        }, 1000/60);
        setInterval(() => {
            // this.walking_sound.play();
            // this.walking_sound.volume = 0.02;
            // this.walking_sound.playbackRate = 2;
            this.playAnimation(this.IMAGES_WALKING);
        },200);
        setInterval(() =>{
            // this.orc_sound.play();
            // this.orc_sound.volume = 0.2;
            // this.orc_sound.playbackRate = 0.8;
        }, Math.random()*100000);
    }
}