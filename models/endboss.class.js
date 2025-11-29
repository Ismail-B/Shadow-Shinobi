/**
 * Repräsentiert den Endboss des Levels.
 * Steuert Leben, Animationen, Angriffe und einfache AI.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
    width = 380;
    height = 280;
    x = 3850;
    y = 110;
    speed = 2;

    offset = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
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
    currentAttackFrame = 0;
    isMoving = false;

    // Boss → Character Schaden-Cooldown
    damageInterval = 600;
    lastDamageDealtAt = 0;

    // Cooldown zwischen zwei Attack-Starts
    attackCooldown = 900;
    lastAttackStartedAt = 0;

    // Spawn / Aktivierung
    activated = false;
    activationTime = 0;
    viewDistance = 720;

    // --- Audio ---
    attack_sound = new Audio('audio/endboss-attack.mp3');
    dying_sound  = new Audio('audio/endboss-dying.mp3');
    hurt_sounds  = [
        new Audio('audio/endboss-hurt.mp3'),
        new Audio('audio/endboss-hurt2.mp3')
    ];
    nextHurtIndex = 0;
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

    /**
     * Erzeugt den Endboss, lädt alle Animationen
     * und startet die Animations-/AI-Loops.
     */
    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);

        this.baseY = this.y;
        this.isEndboss = true;

        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);

        this.otherDirection = true;
        this.initSoundVolumes();
        this.animate();
    }


    /**
     * Setzt die Grundlautstärke der Boss-Sounds.
     * @returns {void}
     */
    initSoundVolumes() {
        if (this.attack_sound) this.attack_sound.volume = 0.5;
        if (this.dying_sound) this.dying_sound.volume = 0.6;

        this.hurt_sounds.forEach(sound => {
            sound.volume = 0.55;
        });
    }


    /**
     * Boss bekommt Schaden vom Spieler (Nahkampf/Kunai).
     * @param {number} [damage=10] - ungenutzt, Logik zieht feste 20 ab.
     * @returns {void}
     */
    hit(damage = 10) {
        if (this.isDeadFlag) return;

        const now = performance.now();
        if (now - this.lastHitAt < this.minHitInterval) return;

        this.lastHitAt = now;
        this.applyBossDamage();
    }


    /**
     * Wendet Schaden auf den Boss an und setzt States.
     * @returns {void}
     */
    applyBossDamage() {
        this.energy -= 20;
        if (this.energy < 0) this.energy = 0;

        this.updateBossLifebar();
        this.setHurtState();
        this.playHurtSound();

        if (this.energy === 0) {
            this.handleBossDeath();
        }
    }


    /**
     * Aktualisiert die Lebensleiste des Bosses.
     * @returns {void}
     */
    updateBossLifebar() {
        if (!this.world || !this.world.statusBarEndboss) return;

        this.world.statusBarEndboss.setPercentage(this.energy);
    }


    /**
     * Versetzt den Boss in den Hurt-State.
     * @returns {void}
     */
    setHurtState() {
        this.isMoving = false;
        this.hurtPlaying = true;
        this.hurtFrameIndex = 0;
        this.img = this.imageCache[this.IMAGES_HURT[0]];
    }


    /**
     * Behandelt den Übergang in den Death-State.
     * @returns {void}
     */
    handleBossDeath() {
        this.isDeadFlag = true;
        this.collidable = false;
        this.isDying = true;
        this.deathPlaying = true;
        this.deathFrameIndex = 0;
        this.attacking = false;
        this.isMoving = false;

        this.y = this.baseY + this.deadYOffset;
        this.img = this.imageCache[this.IMAGES_DEAD[0]];
        this.playDeathSound();
    }


    /**
     * Prüft, ob der Boss tot ist.
     * @returns {boolean}
     */
    isDead() {
        return this.isDeadFlag;
    }


    /**
     * Prüft, ob der Boss den Spieler aktuell schädigen darf.
     * @returns {boolean}
     */
    canDamagePlayer() {
        if (this.isDamageBlocked()) return false;

        const now = performance.now();
        if (now - this.lastDamageDealtAt < this.damageInterval) {
            return false;
        }

        this.lastDamageDealtAt = now;
        return true;
    }


    /**
     * Prüft Blocker für Boss → Player-Schaden.
     * @returns {boolean}
     */
    isDamageBlocked() {
        if (!this.attacking || this.isDeadFlag) return true;
        if (this.hurtPlaying || this.deathPlaying) return true;

        const frame = this.currentAttackFrame;
        return frame !== 4 && frame !== 5;
    }


    /**
     * Startet einen Angriff, falls Cooldown abgelaufen ist.
     * @returns {boolean} true, wenn Angriff gestartet wurde.
     */
    startAttack() {
        const now = performance.now();
        if (now - this.lastAttackStartedAt < this.attackCooldown) {
            return false;
        }

        this.beginAttack(now);
        return true;
    }


    /**
     * Setzt die Attack-States und spielt Sound.
     * @param {number} now - aktuelle Zeit.
     * @returns {void}
     */
    beginAttack(now) {
        this.lastAttackStartedAt = now;
        this.attacking = true;
        this.attackFrameIndex = 0;
        this.currentAttackFrame = 0;
        this.isMoving = false;

        this.otherDirection = true;
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];
        this.playAttackSound();
    }


    /**
     * Zeichnet den Boss skaliert (Idle/Hurt/Dead/Attack).
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     * @returns {void}
     */
    draw(ctx) {
        const scale = this.getCurrentScale();
        const w = this.width * scale;
        const h = this.height * scale;

        const dx = this.x - (w - this.width) / 2;
        const dy = this.y - (h - this.height);

        ctx.drawImage(this.img, dx, dy, w, h);
    }


    /**
     * Liefert den aktuellen Skalierungsfaktor je nach State.
     * @returns {number}
     */
    getCurrentScale() {
        if (this.hurtPlaying) return this.scaleHurt;
        if (this.deathPlaying) return this.scaleDead;
        if (this.attacking) return this.scaleAttack;

        return this.scaleIdle;
    }


    /**
     * Startet Animations- und AI-Schleifen.
     * @returns {void}
     */
    animate() {
        this.startMainAnimationLoop();
        this.startAiLoop();
    }


    /**
     * Steuert die reinen Grafik-Animationen.
     * @returns {void}
     */
    startMainAnimationLoop() {
        setInterval(() => {
            this.updateAnimation();
        }, 100);
    }


    /**
     * Aktualisiert die Animation je nach State.
     * @returns {void}
     */
    updateAnimation() {
        if (this.deathPlaying) {
            this.playDeathOnce();
            return;
        }

        if (this.hurtPlaying) {
            this.playHurtOnce();
            return;
        }

        if (this.attacking) {
            this.playAttackOnce();
            return;
        }

        this.updateIdleOrWalkAnimation();
    }


    /**
     * Spielt Alert- oder Walk-Animation ab.
     * @returns {void}
     */
    updateIdleOrWalkAnimation() {
        if (this.isMoving) {
            this.playAnimation(this.IMAGES_WALKING);
        } else {
            this.playAnimation(this.IMAGES_ALERT);
        }
    }


    /**
     * Startet die AI-/Bewegungs-Logik.
     * @returns {void}
     */
    startAiLoop() {
        setInterval(() => {
            this.updateBossAi();
        }, 1000 / 60);
    }


    /**
     * Aktualisiert AI: Aktivierung, Intro, Bewegung, Angriff.
     * @returns {void}
     */
    updateBossAi() {
        if (!this.activated) {
            this.tryActivateByPlayer();
            return;
        }

        if (this.isInIntroPhase()) {
            this.isMoving = false;
            this.attacking = false;
            return;
        }

        if (this.hurtPlaying || this.deathPlaying || this.attacking) {
            this.isMoving = false;
            return;
        }

        this.updateActiveAi();
    }


    /**
     * Versucht den Boss zu aktivieren, wenn der Spieler nah genug ist.
     * @returns {void}
     */
    tryActivateByPlayer() {
        if (!this.world || !this.world.character) return;

        const char = this.world.character;
        if (char.x + this.viewDistance < this.x) return;

        this.activated = true;
        this.activationTime = performance.now();
        this.isMoving = false;
        this.attacking = false;

        if (typeof this.world.startBossIntro === 'function') {
            this.world.startBossIntro();
        }
    }


    /**
     * Prüft, ob sich der Boss im Intro befindet.
     * @returns {boolean}
     */
    isInIntroPhase() {
        if (!this.world) return false;
        return !!this.world.bossIntroActive;
    }


    /**
     * AI-Logik im aktiven Kampfzustand.
     * @returns {void}
     */
    updateActiveAi() {
        this.otherDirection = true;

        if (!this.world || !this.world.character) {
            this.moveLeft();
            this.isMoving = true;
            return;
        }

        const char = this.world.character;
        const dx = this.x - char.x;
        const attackRange = 40;

        if (dx <= attackRange) {
            this.handleInRangeAttack();
        } else {
            this.handleOutOfRangeMovement();
        }
    }


    /**
     * Verhalten, wenn Spieler in Angriffsreichweite ist.
     * @returns {void}
     */
    handleInRangeAttack() {
        this.isMoving = false;
        this.startAttack();
    }


    /**
     * Verhalten, wenn Spieler außerhalb der Reichweite ist.
     * @returns {void}
     */
    handleOutOfRangeMovement() {
        this.attacking = false;
        this.isMoving = true;
        this.moveLeft();
    }


    /**
     * Spielt einmal die Hurt-Animation ab.
     * @returns {void}
     */
    playHurtOnce() {
        this.y = this.baseY + this.hurtYOffset;

        if (this.hurtFrameIndex >= this.IMAGES_HURT.length) {
            this.resetHurtState();
            return;
        }

        this.img = this.imageCache[this.IMAGES_HURT[this.hurtFrameIndex++]];
    }


    /**
     * Setzt Hurt-State zurück.
     * @returns {void}
     */
    resetHurtState() {
        this.hurtPlaying = false;
        this.hurtFrameIndex = 0;
        this.y = this.baseY;
    }


    /**
     * Spielt einmal die Death-Animation ab.
     * @returns {void}
     */
    playDeathOnce() {
        this.y = this.baseY + this.deadYOffset;

        if (this.deathFrameIndex >= this.IMAGES_DEAD.length) {
            const lastIndex = this.IMAGES_DEAD.length - 1;
            this.img = this.imageCache[this.IMAGES_DEAD[lastIndex]];
            return;
        }

        this.img = this.imageCache[this.IMAGES_DEAD[this.deathFrameIndex++]];
    }


    /**
     * Spielt einmal die Attack-Animation ab.
     * @returns {void}
     */
    playAttackOnce() {
        const frame = this.attackFrameIndex;

        if (frame >= this.IMAGES_ATTACK.length) {
            this.resetAttackState();
            return;
        }

        this.updateAttackFrame(frame);
        this.updateAttackHitbox();
    }


    /**
     * Setzt Attack-Status zurück.
     * @returns {void}
     */
    resetAttackState() {
        this.attackFrameIndex = 0;
        this.currentAttackFrame = 0;
        this.attacking = false;
    }


    /**
     * Aktualisiert Bild und Frameindex der Attack-Animation.
     * @param {number} frame - aktueller Frameindex.
     * @returns {void}
     */
    updateAttackFrame(frame) {
        const path = this.IMAGES_ATTACK[frame];
        this.img = this.imageCache[path];

        this.currentAttackFrame = frame;
        this.attackFrameIndex++;
    }


    /**
     * Positioniert die Angriff-Hitbox.
     * @returns {void}
     */
    updateAttackHitbox() {
        this.attackHitbox.x = this.x - 60;
        this.attackHitbox.y = this.y + 40;
    }


    /* =====================
       SOUND-HILFSMETHODEN
       ===================== */

    /**
     * Zentrale Soundsteuerung, berücksichtigt Mute-Status.
     * @param {HTMLAudioElement} audio - Audioinstanz.
     * @returns {void}
     */
    playBossSound(audio) {
        if (!audio) return;

        if (this.world && this.world.isMuted) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        audio.currentTime = 0;
        audio.play();
    }


    /**
     * Spielt den Angriffssound des Bosses ab.
     * @returns {void}
     */
    playAttackSound() {
        this.playBossSound(this.attack_sound);
    }


    /**
     * Spielt einen der Hurt-Sounds ab (abwechselnd).
     * @returns {void}
     */
    playHurtSound() {
        const sound = this.hurt_sounds[this.nextHurtIndex];
        this.nextHurtIndex = (this.nextHurtIndex + 1) % this.hurt_sounds.length;
        this.playBossSound(sound);
    }


    /**
     * Spielt den Death-Sound einmalig ab.
     * @returns {void}
     */
    playDeathSound() {
        if (this._deathSoundPlayed) return;

        this._deathSoundPlayed = true;
        this.playBossSound(this.dying_sound);
    }
}
