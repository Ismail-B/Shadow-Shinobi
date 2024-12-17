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
    walking_sound = new Audio('audio/running.mp3');







    constructor(){
        super().loadImage('img/2_character_shinobi/2_walk/Run_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.animateCharacter();
    }

    animateCharacter(){

        setInterval(() => {
            this.walking_sound.pause();
            if(this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.x += this.speed;
                this.otherDirection = false;
                this.walking_sound.play();
                this.walking_sound.playbackRate = 2.5;
                this.walking_sound.volume = 0.2;

            }
            if(this.world.keyboard.LEFT && this.x > -670) {
                this.x -= this.speed;
                this.otherDirection = true;
                this.walking_sound.play();
                this.walking_sound.playbackRate = 2.5;
                this.walking_sound.volume = 0.2;
            }
            this.world.camera_x = -this.x + 50;
        }, 1000/60);

        setInterval(() => {

            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        },100);
    }

    jump(){

    }
}