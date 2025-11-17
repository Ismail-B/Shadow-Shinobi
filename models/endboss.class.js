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
    };

    // für Kollisionslogik in World
    collidable = true;
    isDying = false;

    // === Animation-Arrays ===
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
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_orc/5_dead/Dead_000.png',
        'img/4_enemie_boss_orc/5_dead/Dead_001.png',
        'img/4_enemie_boss_orc/5_dead/Dead_002.png',
        'img/4_enemie_boss_orc/5_dead/Dead_003.png',
        'img/4_enemie_boss_orc/5_dead/Dead_004.png',
        'img/4_enemie_boss_orc/5_dead/Dead_005.png',
        'img/4_enemie_boss_orc/5_dead/Dead_006.png',
        'img/4_enemie_boss_orc/5_dead/Dead_007.png',
        'img/4_enemie_boss_orc/5_dead/Dead_008.png',
        'img/4_enemie_boss_orc/5_dead/Dead_009.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_orc/4_hurt/Hurt_000.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_001.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_002.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_003.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_004.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_005.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_006.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_007.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_008.png',
        'img/4_enemie_boss_orc/4_hurt/Hurt_009.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_orc/3_attack/Attack_000.png',
        'img/4_enemie_boss_orc/3_attack/Attack_001.png',
        'img/4_enemie_boss_orc/3_attack/Attack_002.png',
        'img/4_enemie_boss_orc/3_attack/Attack_003.png',
        'img/4_enemie_boss_orc/3_attack/Attack_004.png',
        'img/4_enemie_boss_orc/3_attack/Attack_005.png',
        'img/4_enemie_boss_orc/3_attack/Attack_006.png',
        'img/4_enemie_boss_orc/3_attack/Attack_007.png',
        'img/4_enemie_boss_orc/3_attack/Attack_008.png',
        'img/4_enemie_boss_orc/3_attack/Attack_009.png'
    ];

    // === Lebens- und Animations-Status ===
    energy = 100;            // 0–100, wird für die Statusbar genutzt
    isDeadFlag = false;

    hurtPlaying = false;
    hurtFrameIndex = 0;

    deathPlaying = false;
    deathFrameIndex = 0;

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);

        this.isEndboss = true;

        // alle Sprites in Cache laden
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);

        this.animate();
    }

    /**
     * wird von außen aufgerufen, z.B. bei Schlag oder Kunai-Treffer
     * damage = wie viel Prozent Leben abgezogen werden sollen
     */
    hit(damage = 10) {
        if (this.isDeadFlag) return;

        this.energy -= damage;
        if (this.energy < 0) this.energy = 0;

        // Hurt-Animation EINMAL anspielen
        if (!this.deathPlaying) {
            this.hurtPlaying = true;
            this.hurtFrameIndex = 0;
        }

        // Tod checken
        if (this.energy === 0) {
            this.isDeadFlag = true;
            this.collidable = false;
            this.isDying = true;
            this.deathPlaying = true;
            this.deathFrameIndex = 0;
        }
    }

    isDead() {
        return this.isDeadFlag;
    }

    animate() {
        // Animationssteuerung
        setInterval(() => {
            if (this.deathPlaying) {
                this.playDeathOnce();
            } else if (this.hurtPlaying) {
                this.playHurtOnce();
            } else {
                // solange nichts Besonderes ist, bleibt er in ALERT/Idle
                this.playAnimation(this.IMAGES_ALERT);
            }
        }, 120);

        // Bewegung (falls du später was machen willst)
        setInterval(() => {
            if (!this.isDeadFlag) {
                // Beispiel: Blickrichtung nach rechts
                this.otherDirection = true;
                // this.moveLeft(); // falls er laufen soll
            }
        }, 1000 / 60);
    }

    /** Hurt-Animation EINMAL komplett durchspielen */
    playHurtOnce() {
        if (this.hurtFrameIndex >= this.IMAGES_HURT.length) {
            this.hurtPlaying = false;
            this.hurtFrameIndex = 0;
            return;
        }
        let path = this.IMAGES_HURT[this.hurtFrameIndex];
        this.img = this.imageCache[path];
        this.hurtFrameIndex++;
    }

    /**
     * Death-Animation EINMAL durchspielen und im letzten Bild einfrieren
     */
    playDeathOnce() {
        if (this.deathFrameIndex >= this.IMAGES_DEAD.length) {
            let lastIndex = this.IMAGES_DEAD.length - 1;
            let path = this.IMAGES_DEAD[lastIndex];
            this.img = this.imageCache[path];
            // bleibt im letzten Frame eingefroren
            return;
        }
        let path = this.IMAGES_DEAD[this.deathFrameIndex];
        this.img = this.imageCache[path];
        this.deathFrameIndex++;
    }
}
