class Endboss extends MovableObject {
    width = 380;
    height = 280;
    x = 3850;
    y = 110;
    speed = 2;
    offset = {
        x: 50,
        y: 15,
        width: 260,
        height: 50,
    };
    attackHitbox = { 
        x: 0, 
        y: 0, 
        width: 380,
        height: 180
    };

    // Skalierung
    scaleIdle   = 1.0;
    scaleHurt   = 1.15;
    scaleDead   = 1.15;
    scaleAttack = 1.5;

    // Y-Offsets
    hurtYOffset = -10;
    deadYOffset = 60;

    // Kollisionslogik
    collidable = true;
    isDying = false;

    // Leben
    energy = 100;
    isDeadFlag = false;

    // Hurt / Death
    hurtPlaying = false;
    hurtFrameIndex = 0;
    deathPlaying = false;
    deathFrameIndex = 0;

    // Treffer-Cooldown von Spieler → Boss
    minHitInterval = 350;
    lastHitAt = 0;

    // Attack / Hitbox
    attacking = false;
    attackFrameIndex = 0;
    currentAttackFrame = 0; // aktuell angezeigtes Attack-Frame
    isMoving = false;

    // Boss → Character Schaden-Cooldown
    damageInterval = 600; 
    lastDamageDealtAt = 0;

    // Cooldown zwischen zwei Attack-Starts
    attackCooldown = 900;
    lastAttackStartedAt = 0;

    // Spawn / Aktivierung
    activated = false;        // wird erst aktiv, wenn der Spieler ihn „sieht“
    activationTime = 0;       // lassen wir drin, aber brauchen es nicht mehr direkt
    viewDistance = 720;       // wie weit der Spieler „sehen“ kann

    // --- Audio ---
    attack_sound = new Audio('audio/endboss-attack.mp3');
    dying_sound  = new Audio('audio/endboss-dying.mp3');
    hurt_sounds  = [
        new Audio('audio/endboss-hurt.mp3'),
        new Audio('audio/endboss-hurt2.mp3')
    ];
    nextHurtIndex = 0;       // 0 / 1 → wechselt zwischen hurt und hurt2
    _deathSoundPlayed = false;

    // Animationen
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

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.baseY = this.y;

        this.isEndboss = true;

        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);

        // Boss soll IMMER nach links schauen
        this.otherDirection = true;

        // Grundlautstärke der Boss-Sounds
        if (this.attack_sound) this.attack_sound.volume = 0.5;
        if (this.dying_sound)  this.dying_sound.volume  = 0.6;
        this.hurt_sounds.forEach(s => s.volume = 0.55);

        this.animate();
    }

    /** Boss bekommt Schaden vom Spieler (Nahkampf oder Kunai) */
    hit(damage = 10) {
        if (this.isDeadFlag) return;

        const now = performance.now();
        if (now - this.lastHitAt < this.minHitInterval) return;
        this.lastHitAt = now;

        // immer genau EINE "Lebenseinheit" (20) abziehen
        this.energy -= 20;
        if (this.energy < 0) this.energy = 0;

        if (this.world && this.world.statusBarEndboss) {
            this.world.statusBarEndboss.setPercentage(this.energy);
        }

        this.isMoving = false;
        this.hurtPlaying = true;
        this.hurtFrameIndex = 0;
        this.img = this.imageCache[this.IMAGES_HURT[0]];

        // Hurt-Sound (abwechselnd)
        this.playHurtSound();

        if (this.energy === 0) {
            this.isDeadFlag = true;
            this.collidable = false;
            this.isDying = true;
            this.deathPlaying = true;
            this.deathFrameIndex = 0;
            this.attacking = false;
            this.isMoving = false;

            this.y = this.baseY + this.deadYOffset;
            this.img = this.imageCache[this.IMAGES_DEAD[0]];

            // Todes-Sound nur einmal
            this.playDeathSound();
        }
    }

    isDead() {
        return this.isDeadFlag;
    }

    /** Boss → Player Damage Check */
    canDamagePlayer() {
        if (!this.attacking || this.isDeadFlag || this.hurtPlaying || this.deathPlaying) {
            return false;
        }

        // NUR in Attack-Frames 4 & 5 (→ Bilder 5 & 6) Schaden machen
        if (this.currentAttackFrame !== 4 && this.currentAttackFrame !== 5) {
            return false;
        }

        const now = performance.now();
        if (now - this.lastDamageDealtAt < this.damageInterval) return false;
        this.lastDamageDealtAt = now;

        return true;
    }

    /** Angriff starten (mit Cooldown) */
    startAttack() {
        const now = performance.now();

        if (now - this.lastAttackStartedAt < this.attackCooldown) {
            return false;
        }

        this.lastAttackStartedAt = now;
        this.attacking = true;
        this.attackFrameIndex = 0;
        this.currentAttackFrame = 0;
        this.isMoving = false;

        this.otherDirection = true;
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];

        // Angriff-Sound pro Schlag
        this.playAttackSound();

        return true;
    }

    /** Skalierte Darstellung */
    draw(ctx) {
        let scale = this.scaleIdle;

        if (this.hurtPlaying)       scale = this.scaleHurt;
        else if (this.deathPlaying) scale = this.scaleDead;
        else if (this.attacking)    scale = this.scaleAttack;

        const w = this.width * scale;
        const h = this.height * scale;

        const dx = this.x - (w - this.width) / 2;
        const dy = this.y - (h - this.height);

        ctx.drawImage(this.img, dx, dy, w, h);
    }

    animate() {
        // --- Animationslogik ---
        setInterval(() => {
            if (this.deathPlaying)  return this.playDeathOnce();
            if (this.hurtPlaying)   return this.playHurtOnce();
            if (this.attacking)     return this.playAttackOnce();
            if (this.isMoving)      return this.playAnimation(this.IMAGES_WALKING);
            this.playAnimation(this.IMAGES_ALERT);
        }, 100);

        // --- AI / Bewegung ---
        setInterval(() => {

            // 1) Noch NICHT aktiviert → prüfen, ob Spieler nah genug ist
            if (!this.activated) {
                if (this.world && this.world.character) {
                    const char = this.world.character;

                    if (char.x + this.viewDistance >= this.x) {
                        this.activated = true;
                        this.activationTime = performance.now();
                        this.isMoving = false;
                        this.attacking = false;

                        // → Boss-Intro in der World starten
                        if (this.world && typeof this.world.startBossIntro === 'function') {
                            this.world.startBossIntro();
                        }
                    }
                }
                // solange nicht aktiviert: keine Bewegung / kein Angriff
                return;
            }

            // 2) Während Boss-Intro: nichts machen (nur Alert-Anim läuft oben)
            if (this.world && this.world.bossIntroActive) {
                this.isMoving = false;
                this.attacking = false;
                return;
            }

            // 3) Normale AI
            if (this.hurtPlaying || this.deathPlaying || this.attacking) {
                this.isMoving = false;
                return;
            }

            // Boss schaut IMMER nach links
            this.otherDirection = true;

            if (!this.world || !this.world.character) {
                this.moveLeft();
                this.isMoving = true;
                return;
            }

            const char = this.world.character;
            const attackRange = 40;
            const dx = this.x - char.x;

            if (dx <= attackRange) {
                this.isMoving = false;
                this.startAttack();
            } else {
                this.attacking = false;
                this.isMoving = true;
                this.moveLeft();
            }

        }, 1000 / 60);
    }

    playHurtOnce() {
        this.y = this.baseY + this.hurtYOffset;

        if (this.hurtFrameIndex >= this.IMAGES_HURT.length) {
            this.hurtPlaying = false;
            this.hurtFrameIndex = 0;
            this.y = this.baseY;
            return;
        }
        this.img = this.imageCache[this.IMAGES_HURT[this.hurtFrameIndex++]];
    }

    playDeathOnce() {
        this.y = this.baseY + this.deadYOffset;

        if (this.deathFrameIndex >= this.IMAGES_DEAD.length) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
            return;
        }
        this.img = this.imageCache[this.IMAGES_DEAD[this.deathFrameIndex++]];
    }

    playAttackOnce() {
        const frame = this.attackFrameIndex;

        if (frame >= this.IMAGES_ATTACK.length) {
            this.attackFrameIndex = 0;
            this.currentAttackFrame = 0;
            this.attacking = false;
            return;
        }

        const path = this.IMAGES_ATTACK[frame];
        this.img = this.imageCache[path];

        this.currentAttackFrame = frame;
        this.attackFrameIndex++;

        // Hitbox ausrichten
        this.attackHitbox.x = this.x - 60; 
        this.attackHitbox.y = this.y + 40;
    }

    /* =====================
       SOUND-HILFSMETHODEN
       ===================== */

    /** zentraler Sound-Handler, berücksichtigt Mute */
    playBossSound(audio) {
        if (!audio) return;

        // Wenn die Welt gemuted ist → gar nicht abspielen
        if (this.world && this.world.isMuted) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        audio.currentTime = 0;
        audio.play();
    }

    playAttackSound() {
        this.playBossSound(this.attack_sound);
    }

    playHurtSound() {
        const sound = this.hurt_sounds[this.nextHurtIndex];
        this.nextHurtIndex = (this.nextHurtIndex + 1) % this.hurt_sounds.length;
        this.playBossSound(sound);
    }

    playDeathSound() {
        if (this._deathSoundPlayed) return;
        this._deathSoundPlayed = true;
        this.playBossSound(this.dying_sound);
    }
}
