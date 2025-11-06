class Character extends MovableObject {
    width = 100;
    speed = 10;

    // Death-Anim Steuerung
    deathIndex = 0;         // aktuelles Frame der Sterbeanimation
    deathFrozen = false;    // am letzten Frame eingefroren
    deathTimer = null;      // eigener Timer für langsame Death-Anim
    deathFrameDuration = 180; // ms pro Frame (größer = langsamer)

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

    IMAGES_IDLE = [
        'img/2_character_shinobi/1_idle/idle/Idle_1.png',
        'img/2_character_shinobi/1_idle/idle/Idle_2.png',
        'img/2_character_shinobi/1_idle/idle/Idle_3.png',
        'img/2_character_shinobi/1_idle/idle/Idle_4.png',
        'img/2_character_shinobi/1_idle/idle/Idle_5.png',
        'img/2_character_shinobi/1_idle/idle/Idle_6.png'
    ];

    IMAGES_ATTACK = [
        'img/2_character_shinobi/6_attack/Attack_1.png',
        'img/2_character_shinobi/6_attack/Attack_2.png',
        'img/2_character_shinobi/6_attack/Attack_3.png',
        'img/2_character_shinobi/6_attack/Attack_4.png',
        'img/2_character_shinobi/6_attack/Attack_5.png'
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

    constructor() {
        super().loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_ATTACK);
        this.applyGravity();
        this.animateCharacter();
    }

    /**
     * Sterbeanimation: langsam, nur einmal, am Ende einfrieren.
     */
    playDeathOnce() {
        if (this.deathFrozen) return;           // bereits eingefroren
        if (this.deathTimer) return;            // Timer läuft schon

        const seq = this.IMAGES_DEAD;

        // Sofort erstes Frame setzen
        this.img = this.imageCache[seq[this.deathIndex]];

        this.deathTimer = setInterval(() => {
            // nächstes Bild setzen
            this.deathIndex = Math.min(this.deathIndex + 1, seq.length - 1);
            this.img = this.imageCache[seq[this.deathIndex]];

            // am Ende: einfrieren & Timer stoppen
            if (this.deathIndex >= seq.length - 1) {
                clearInterval(this.deathTimer);
                this.deathTimer = null;
                this.deathFrozen = true;
            }
        }, this.deathFrameDuration);
    }

    /**
     * Reset für Respawn/Neustart.
     */
    resetDeathAnim() {
        this.deathIndex = 0;
        this.deathFrozen = false;
        if (this.deathTimer) {
            clearInterval(this.deathTimer);
            this.deathTimer = null;
        }
        // optional: sofort erstes Idle-Bild laden
        this.loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
    }

    animateCharacter() {

        // Bewegung / Physik
        setInterval(() => {
            this.walking_sound.pause();

            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x && !this.isDead()) {
                this.moveRight();
                this.soundEffects(0.3, 2.5);
            }

            if (this.world.keyboard.LEFT && this.x > -670 && !this.isDead()) {
                this.moveLeft();
                this.soundEffects(0.3, 2.5);
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround() && !this.isDead()) {
                this.jump();
            }

            this.world.camera_x = -this.x + 50;
        }, 1000 / 60);

        // Animationen
        setInterval(() => {
            if (this.isDead()) {
                this.playDeathOnce(); // eigene, langsamere Death-Anim
                return;               // nichts anderes mehr animieren
            }

            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.isNotMoving()) {
                this.playAnimation(this.IMAGES_IDLE);
            } else if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 100);
    }

    soundEffects(volume, playbackRate) {
        this.walking_sound.play();
        this.walking_sound.playbackRate = playbackRate;
        this.walking_sound.volume = volume;
    }
}
