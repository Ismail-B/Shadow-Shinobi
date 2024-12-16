class Character extends MovableObject{
    width = 100;
    speed = 10;
    IMAGES_WALKING = [
        'img/2_character_shinobi/2_walk/Run_1.png',
        'img/2_character_shinobi/2_walk/Run_2.png',
        'img/2_character_shinobi/2_walk/Run_3.png',
        'img/2_character_shinobi/2_walk/Run_4.png',
        'img/2_character_shinobi/2_walk/Run_5.png',
        'img/2_character_shinobi/2_walk/Run_6.png',
        'img/2_character_shinobi/2_walk/Run_7.png',
        'img/2_character_shinobi/2_walk/Run_8.png'
    ];
    world;
    constructor(){
        super().loadImage('img/2_character_shinobi/2_walk/Run_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.animateCharacter();
    }

    animateCharacter(){

        setInterval(() => {
            if(this.world.keyboard.RIGHT) {
                this.x += this.speed
                this.otherDirection = false;

            }
            if(this.world.keyboard.LEFT) {
                this.x -= this.speed
                this.otherDirection = true;
            }
            this.world.camera_x = -this.x;
        }, 1000/60);

        setInterval(() => {

            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                
                this.x += this.speed;

                //walkanimation
                let i = this.currentImage % this.IMAGES_WALKING.length;
                let path = this.IMAGES_WALKING[i];
                this.img = this.imageCache[path];
                this.currentImage++;
            }
        },100);
    }

    jump(){

    }
}