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
    IMAGES_JUMPING = [
        'img/2_character_shinobi/3_jump/Jump_1.png',
        'img/2_character_shinobi/3_jump/Jump_2.png',
        'img/2_character_shinobi/3_jump/Jump_3.png',
        'img/2_character_shinobi/3_jump/Jump_4.png',
        'img/2_character_shinobi/3_jump/Jump_5.png',
        'img/2_character_shinobi/3_jump/Jump_6.png',
        'img/2_character_shinobi/3_jump/Jump_7.png',
        'img/2_character_shinobi/3_jump/Jump_8.png',
        'img/2_character_shinobi/3_jump/Jump_9.png',
        'img/2_character_shinobi/3_jump/Jump_10.png',
        'img/2_character_shinobi/3_jump/Jump_11.png',
        'img/2_character_shinobi/3_jump/Jump_12.png'
    ];

    IMAGES_DEAD = [
        'img/2_character_shinobi/5_dead/Dead_1.png',
        'img/2_character_shinobi/5_dead/Dead_2.png',
        'img/2_character_shinobi/5_dead/Dead_3.png',
        'img/2_character_shinobi/5_dead/Dead_4.png'
    ];

    IMAGES_HURT = [
        'img/2_character_shinobi/4_hurt/Hurt_1.png',
        'img/2_character_shinobi/4_hurt/Hurt_2.png'
    ];
    world;
    walking_sound = new Audio('audio/running.mp3');


    constructor(){
        super().loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.animateCharacter();
    }

    animateCharacter(){

        setInterval(() => {
            this.walking_sound.pause();
            if(this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                this.moveRight();
                this.soundEffects(0.3, 2.5);
            }                
            if(this.world.keyboard.LEFT && this.x > -670) {
                this.moveLeft();
                this.soundEffects(0.3, 2.5);
            }   
            
            if(this.world.keyboard.SPACE && !this.isAboveGround()) {
                this.jump();
            }
            this.world.camera_x = -this.x + 50;
        }, 1000/60);

        setInterval(() => {

            if(this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            }
            else if(this.isHurt()){
                this.playAnimation(this.IMAGES_HURT);
            }

            else if(this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            }else{

            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }
        },100);
    }

    soundEffects(volume, playbackRate){
        this.walking_sound.play();
        this.walking_sound.playbackRate = playbackRate;
        this.walking_sound.volume = volume;
    }
}