class Endboss extends MovableObject {
    width = 420;
    height = 340;
    x = 3850;
    y = 70;
    speed = 2;
    offset = {
        x: 50,
        y: 15,
        width: 260,
        height: 50,
    }

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

    IMAGES_ALERT = [
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
    ]


    constructor(){
        
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.animate();
    }

    animate(){
            setInterval(() => {
                this.playAnimation(this.IMAGES_ALERT);
            },200);
            setInterval(() => {
                // this.moveLeft();
                this.otherDirection = true;
            }, 1000/60);
    }
 }
