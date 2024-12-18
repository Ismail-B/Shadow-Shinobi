class Endboss extends MovableObject {

    width = 420;
    height = 340;
    x = 3850;
    y = 40;
    speed = 2;

    IMAGES_WALKING = [
        'img/4_enemie_boss_orc/1_walk/Walk_000.png',
        'img/4_enemie_boss_orc/1_walk/Walk_001.png',
        'img/4_enemie_boss_orc/1_walk/Walk_002.png',
        'img/4_enemie_boss_orc/1_walk/Walk_003.png',
        'img/4_enemie_boss_orc/1_walk/Walk_004.png',
        'img/4_enemie_boss_orc/1_walk/Walk_005.png',
        'img/4_enemie_boss_orc/1_walk/Walk_006.png',
        'img/4_enemie_boss_orc/1_walk/Walk_007.png',
        'img/4_enemie_boss_orc/1_walk/Walk_008.png',
        'img/4_enemie_boss_orc/1_walk/Walk_009.png'

    ];


    constructor(){
        
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.animate();

    }

    animate(){
            setInterval(() => {
                this.playAnimation(this.IMAGES_WALKING);
            },200);
            setInterval(() => {
                this.moveLeft();
                this.otherDirection = false;

            }, 1000/60);
    }


}