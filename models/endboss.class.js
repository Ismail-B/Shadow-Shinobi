class Endboss extends MovableObject {

    width = 350;
    height = 370;
    x = 3880;
    y = 0;

    IMAGES_WALKING = [
        'img/4_enemie_boss_orc/2_alert/Idle_000.png',
        'img/4_enemie_boss_orc/2_alert/Idle_001.png',
        'img/4_enemie_boss_orc/2_alert/Idle_002.png',
        'img/4_enemie_boss_orc/2_alert/Idle_003.png',
        'img/4_enemie_boss_orc/2_alert/Idle_004.png',
        'img/4_enemie_boss_orc/2_alert/Idle_005.png',
        'img/4_enemie_boss_orc/2_alert/Idle_006.png',
        'img/4_enemie_boss_orc/2_alert/Idle_007.png',
        'img/4_enemie_boss_orc/2_alert/Idle_008.png',
        'img/4_enemie_boss_orc/2_alert/Idle_009.png'
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
    }


}