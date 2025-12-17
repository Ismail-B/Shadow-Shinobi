/**
 * Repräsentiert den spielbaren Charakter (Ninja).
 * Steuert Bewegung, Angriffe, Schaden und Animationen.
 * @extends MovableObject
 */
class Character extends MovableObject {
    width = 100;
    speed = 10;

    offset = {
        x: 10,
        y: 0,
        width: 27,
        height: 0
    };

    /**
     * Wieviel Schaden der Charakter pro Treffer erleidet.
     * @type {number}
     */
    DAMAGE_PER_HIT = 20;

    // Death-Anim Steuerung
    deathIndex = 0;
    deathFrozen = false;
    deathTimer = null;
    deathFrameDuration = 180;

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

    // --- Angriff-Status (Nahkampf + Kunai) ---
    isAttacking = false;
    attackFrameIndex = 0;
    attackFrameMs = 10;
    attackCooldownMs = 250;
    lastAttackAt = 0;
    _lastAttackTick = 0;
    attackType = null; // 'melee' | 'kunai' | null

    _hasDealtDamageThisAttack = false;

    // Sound-Flags
    _hitSoundPlayed = false;
    _jumpSoundPlayed = false;
    _deathSoundPlayed = false;

    world;
    walking_sound     = new Audio('audio/running.mp3');
    kunai_throw_sound = new Audio('audio/throw_kunai.mp3');
    hit_sound         = new Audio('audio/ninja-hit.wav');
    jump_sound        = new Audio('audio/jump.mp3');
    hurt_sound        = new Audio('audio/ninja-hurt.mp3');
    death_sound       = new Audio('audio/ninja-dying.mp3');

    /**
     * Erzeugt den Charakter, lädt alle Bilder und startet die Animation.
     * @constructor
     */
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


    /* =========================================================
       >>> HORIZONTALBEWEGUNG MIT BOSS-BLOCK <<<
       ========================================================= */

    /**
     * Prüft, ob der Charakter bei testX mit dem Endboss kollidiert.
     * @param {number} testX - Testposition auf der X-Achse.
     * @returns {boolean} true, wenn eine Kollision mit dem Endboss vorliegt.
     */
    collidesWithEndbossAtX(testX) {
        if (!this.world?.level?.enemies) return false;

        const enemies = this.world.level.enemies;
        const oldX = this.x;
        this.x = testX;

        const hit = enemies.some(
            enemy =>
                enemy &&
                enemy.isEndboss &&
                enemy.collidable &&
                this.isColliding(enemy)
        );

        this.x = oldX;
        return hit;
    }


    /**
     * Bewegt den Charakter nach rechts und stoppt vor dem Endboss.
     * @returns {void}
     */
    moveRight() {
        const oldX = this.x;
        this.x = this.findLastFreeXToRight(oldX);
        this.otherDirection = false;
    }


    /**
     * Bestimmt die letzte freie X-Position nach rechts.
     * @param {number} startX - Ausgangsposition.
     * @returns {number} Letzte freie X-Position.
     */
    findLastFreeXToRight(startX) {
        let lastFreeX = startX;

        for (let s = 1; s <= this.speed; s++) {
            const testX = startX + s;
            if (this.collidesWithEndbossAtX(testX)) break;
            lastFreeX = testX;
        }

        return lastFreeX;
    }


    /**
     * Bewegt den Charakter nach links.
     * @returns {void}
     */
    moveLeft() {
        this.otherDirection = true;
        this.x -= this.speed;
    }


    /* ===================== ANGRIFFS-LOGIK ===================== */

    /**
     * Startet einen Nahkampfangriff (Taste B), falls möglich.
     * @returns {void}
     */
    tryStartAttack() {
        const now = performance.now();
        if (this.isAttackBlocked(now)) return;

        this.isAttacking = true;
        this.attackType = 'melee';
        this.attackFrameIndex = 0;
        this.attackFrameMs = 60;
        this._lastAttackTick = now;
        this.lastAttackAt = now;

        this._hasDealtDamageThisAttack = false;
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];
    }


    /**
     * Prüft, ob ein Angriff aktuell blockiert ist.
     * @param {number} now - Aktuelle Zeit in ms.
     * @returns {boolean} true, wenn Angriff blockiert ist.
     */
    isAttackBlocked(now) {
        if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) {
            return true;
        }

        if (this.isDead() || this.isAttacking) {
            return true;
        }

        return now - this.lastAttackAt < this.attackCooldownMs;
    }


    /**
     * Startet einen Kunai-Wurf mit Attack-Animation.
    * Nur möglich, wenn Charakter nach rechts schaut.
    * @returns {boolean}
    */
    tryStartKunaiThrow() {
        const now = performance.now();

       // Keine Würfe bei Intro/GameOver
       if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return false;

       // Keine Ammo?
       if (!this.world || this.world.kunaiAmmo <= 0) return false;

       // 🔥 WICHTIG: Nur werfen, wenn nach rechts geschaut wird
       if (this.otherDirection === true) return false;

       if (this.isDead() || this.isAttacking) return false;

       this.isAttacking = true;
       this.attackType = 'kunai';
       this.attackFrameIndex = 0;
       this.attackFrameMs = 60;
       this._lastAttackTick = now;
       this._hasDealtDamageThisAttack = false;

       this.img = this.imageCache[this.IMAGES_ATTACK[0]];

       return true;
}



    /**
     * Prüft, ob Kunai-Wurf aktuell blockiert ist.
     * @returns {boolean} true, wenn Kunai-Wurf blockiert ist.
     */
    isKunaiThrowBlocked() {
        if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) {
            return true;
        }

        if (!this.world || this.world.kunaiAmmo <= 0) {
            return true;
        }

        return this.isDead() || this.isAttacking;
    }


    /**
     * Aktualisiert die aktuelle Angriffs-Animation.
     * @returns {void}
     */
    updateAttack() {
        if (!this.isAttacking) return;

        const now = performance.now();
        if (!this.isNextAttackFrameDue(now)) return;

        this.attackFrameIndex++;
        if (this.isAttackFinished()) {
            this.resetAttackState();
            return;
        }

        this.updateAttackFrameImage();
        this.handleAttackEffects();
    }


    /**
     * Prüft, ob das nächste Angriffs-Frame fällig ist.
     * @param {number} now - Aktuelle Zeit in ms.
     * @returns {boolean} true, wenn das nächste Frame angezeigt werden soll.
     */
    isNextAttackFrameDue(now) {
        if (now - this._lastAttackTick < this.attackFrameMs) {
            return false;
        }

        this._lastAttackTick = now;
        return true;
    }


    /**
     * Prüft, ob die Angriffs-Animation zu Ende ist.
     * @returns {boolean} true, wenn Angriff fertig ist.
     */
    isAttackFinished() {
        return this.attackFrameIndex >= this.IMAGES_ATTACK.length;
    }


    /**
     * Setzt den Angriffsstatus nach Ende der Animation zurück.
     * @returns {void}
     */
    resetAttackState() {
        this.isAttacking = false;
        this.attackType = null;
        this._hitSoundPlayed = false;
        this._hasDealtDamageThisAttack = false;
    }


    /**
     * Aktualisiert das aktuell angezeigte Angriffsbild.
     * @returns {void}
     */
    updateAttackFrameImage() {
        const key = this.IMAGES_ATTACK[this.attackFrameIndex];
        this.img = this.imageCache[key];
    }


    /**
     * Führt Effekte für Nahkampf oder Kunai beim passenden Frame aus.
     * @returns {void}
     */
    handleAttackEffects() {
        if (this.attackType === 'melee') {
            this.handleMeleeAttackFrame();
        }

        if (this.attackType === 'kunai') {
            this.handleKunaiAttackFrame();
        }
    }


    /**
     * Behandelt das Trefffenster beim Nahkampf.
     * @returns {void}
     */
    handleMeleeAttackFrame() {
        if (this.attackFrameIndex !== 2 && this.attackFrameIndex !== 3) {
            return;
        }

        this.applyMeleeHit();
        this.playMeleeHitSoundOnce();
    }


    /**
     * Spielt den Nahkampf-Sound genau einmal pro Angriff.
     * @returns {void}
     */
    playMeleeHitSoundOnce() {
        if (this._hitSoundPlayed) return;

        this.playHitSound();
        this._hitSoundPlayed = true;
    }


    /**
     * Behandelt das Wurf-Frame beim Kunai-Angriff.
     * @returns {void}
     */
    handleKunaiAttackFrame() {
        if (this.attackFrameIndex !== 3) return;

        if (this.world && typeof this.world.onCharacterKunaiRelease === 'function') {
            this.world.onCharacterKunaiRelease();
        }

        this.playKunaiThrowSound();
    }


    /**
     * Nahkampftreffer auf Gegner (Orcs & Endboss).
     * Pro Attacke nur ein getroffener Gegner.
     * @returns {void}
     */
    applyMeleeHit() {
        if (!this.world?.level?.enemies) return;
        if (this._hasDealtDamageThisAttack) return;

        const hitbox = this.createMeleeHitbox();
        const enemies = this.world.level.enemies;

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (this.isInvalidMeleeTarget(enemy, hitbox)) continue;

            this.applyMeleeDamageToEnemy(enemy);
            this._hasDealtDamageThisAttack = true;
            break;
        }
    }


    /**
     * Erzeugt die Nahkampf-Hitbox vor dem Charakter.
     * @returns {{x:number,y:number,w:number,h:number}} Hitbox-Objekt.
     */
    createMeleeHitbox() {
        const range = 0;
        const height = this.height * 0.6;
        const y = this.y + this.height * 0.2;
        const facingRight = !this.otherDirection;
        const x = facingRight ? this.x + this.width : this.x - range;

        return { x, y, w: range, h: height };
    }


    /**
     * Prüft, ob ein Gegner für Nahkampftreffer ungeeignet ist.
     * @param {Object} enemy - Der zu prüfende Gegner.
     * @param {Object} hitbox - Hitbox des Angriffs.
     * @returns {boolean} true, wenn kein gültiges Ziel.
     */
    isInvalidMeleeTarget(enemy, hitbox) {
        if (!enemy || !enemy.collidable || enemy.isDying) {
            return true;
        }

        if (typeof enemy.overlapsRect !== 'function') {
            return true;
        }

        return !enemy.overlapsRect(hitbox);
    }


    /**
     * Wendet Nahkampfschaden auf einen Gegner an.
     * @param {Object} enemy - Getroffener Gegner.
     * @returns {void}
     */
    applyMeleeDamageToEnemy(enemy) {
        if (enemy.isEndboss && typeof enemy.hit === 'function') {
            enemy.hit();
            return;
        }

        if (!enemy.isEndboss && typeof enemy.die === 'function') {
            enemy.die();
        }
    }


    /* ===================== SCHADEN / TOD ===================== */

    /**
     * Verarbeitet Schaden am Charakter.
     * @param {number} [dmg=this.DAMAGE_PER_HIT] - Schaden je Treffer.
     * @returns {void}
     */
    hit(dmg = this.DAMAGE_PER_HIT) {
        if (this.isDead()) return;

        const wasDeadBefore = this.isDead();
        const oldEnergy = this.energy;

        this.energy -= dmg;
        if (this.energy < 0) this.energy = 0;

        this.updateLastHitTime(oldEnergy);
        this.handleHitSounds(wasDeadBefore, oldEnergy);
    }


    /**
     * Aktualisiert den Zeitpunkt des letzten Treffers.
     * @param {number} oldEnergy - Energie vor dem Treffer.
     * @returns {void}
     */
    updateLastHitTime(oldEnergy) {
        if (this.energy < oldEnergy && this.energy > 0) {
            this.lastHit = new Date().getTime();
        }
    }


    /**
     * Spielt bei Bedarf Hurt- oder Death-Sounds ab.
     * @param {boolean} wasDeadBefore - War der Charakter vorher schon tot?
     * @param {number} oldEnergy - Energie vor dem Treffer.
     * @returns {void}
     */
    handleHitSounds(wasDeadBefore, oldEnergy) {
        const deadNow = this.isDead();
        if (wasDeadBefore) return;

        if (!wasDeadBefore && deadNow) {
            this.playDeathSound();
            return;
        }

        if (!deadNow && this.energy < oldEnergy) {
            this.playHurtSound();
        }
    }


    /**
     * Prüft, ob der Charakter tot ist.
     * @returns {boolean} true, wenn Energie <= 0.
     */
    isDead() {
        return this.energy <= 0;
    }


    /**
     * Prüft, ob der Charakter vor kurzem Schaden erlitten hat.
     * @returns {boolean} true, wenn kürzlich getroffen.
     */
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return this.energy > 0 && timepassed < 1;
    }


    /**
     * Spielt die Death-Animation genau einmal ab.
     * @returns {void}
     */
    playDeathOnce() {
        if (this.deathFrozen || this.deathTimer) return;

        const seq = this.IMAGES_DEAD;
        this.img = this.imageCache[seq[this.deathIndex]];
        this.startDeathInterval(seq);
    }


    /**
     * Startet den Death-Animation-Interval.
     * @param {string[]} seq - Death-Frames.
     * @returns {void}
     */
    startDeathInterval(seq) {
        this.deathTimer = setInterval(() => {
            this.advanceDeathFrame(seq);
        }, this.deathFrameDuration);
    }


    /**
     * Schaltet auf das nächste Death-Frame um.
     * @param {string[]} seq - Death-Frames.
     * @returns {void}
     */
    advanceDeathFrame(seq) {
        this.deathIndex = Math.min(this.deathIndex + 1, seq.length - 1);
        this.img = this.imageCache[seq[this.deathIndex]];

        if (this.deathIndex >= seq.length - 1) {
            clearInterval(this.deathTimer);
            this.deathTimer = null;
            this.deathFrozen = true;
        }
    }


    /**
     * Setzt die Death-Animation zurück (z.B. bei Restart).
     * @returns {void}
     */
    resetDeathAnim() {
        this.deathIndex = 0;
        this.deathFrozen = false;

        if (this.deathTimer) {
            clearInterval(this.deathTimer);
            this.deathTimer = null;
        }

        this._deathSoundPlayed = false;
        this.loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
    }


    /* ===================== ANIMATION / BEWEGUNG ===================== */

    /**
     * Startet die Bewegungs- und Animations-Loops.
     * @returns {void}
     */
    animateCharacter() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }


    /**
     * Startet den Bewegungs-Loop (Physik, Input, Kamera).
     * @returns {void}
     */
    startMovementLoop() {
        setInterval(() => {
            this.updateMovement();
        }, 1000 / 60);
    }


    /**
     * Startet den Animations-Loop (Sprites, Angriffe).
     * @returns {void}
     */
    startAnimationLoop() {
        setInterval(() => {
            this.updateAnimation();
        }, 100);
    }


    /**
     * Aktualisiert Bewegung und Eingaben innerhalb des Movement-Loops.
     * @returns {void}
     */
    updateMovement() {
        if (this.isMovementFrozen()) {
            this.walking_sound.pause();
            return;
        }

        this.walking_sound.pause();
        const onGround = !this.isAboveGround();

        this.handleHorizontalMovement();
        this.handleJump(onGround);
        this.world.camera_x = -this.x + 50;
    }


    /**
     * Prüft, ob der Charakter wegen Boss-Intro oder GameEnd eingefroren ist.
     * @returns {boolean} true, wenn Bewegung gesperrt.
     */
    isMovementFrozen() {
        if (!this.world) return false;

        if (this.world.bossIntroActive) {
            return true;
        }

        return this.world.gameEnded;
    }


    /**
     * Verarbeitet horizontale Eingaben (Links/Rechts).
     * @returns {void}
     */
    handleHorizontalMovement() {
        if (this.canMoveRight()) {
            this.moveRight();
            this.soundEffects(0.3, 2.5);
        }

        if (this.canMoveLeft()) {
            this.moveLeft();
            this.soundEffects(0.3, 2.5);
        }
    }


    /**
     * Prüft, ob eine Rechtsbewegung erlaubt ist.
     * @returns {boolean} true, wenn Bewegung nach rechts möglich.
     */
    canMoveRight() {
        if (!this.world || !this.world.keyboard.RIGHT) return false;
        if (this.isDead() || this.isAttacking) return false;

        return this.x < this.world.level.level_end_x;
    }


    /**
     * Prüft, ob eine Linksbewegung erlaubt ist.
     * @returns {boolean} true, wenn Bewegung nach links möglich.
     */
    canMoveLeft() {
        if (!this.world || !this.world.keyboard.LEFT) return false;
        if (this.isDead() || this.isAttacking) return false;

        return this.x > -670;
    }


    /**
     * Verarbeitet Sprung-Eingaben.
     * @param {boolean} onGround - true, wenn Charakter am Boden ist.
     * @returns {void}
     */
    handleJump(onGround) {
        if (this.canStartJump(onGround)) {
            this.playJumpSoundOnce();
            this.jump();
        }

        if (onGround && !this.world.keyboard.SPACE) {
            this._jumpSoundPlayed = false;
        }
    }


    /**
     * Prüft, ob ein Sprung gestartet werden kann.
     * @param {boolean} onGround - true, wenn Charakter am Boden ist.
     * @returns {boolean} true, wenn Sprung möglich.
     */
    canStartJump(onGround) {
        if (!this.world || !this.world.keyboard.SPACE) return false;
        if (!onGround) return false;

        return !this.isDead() && !this.isAttacking;
    }


    /**
     * Spielt den Sprung-Sound genau einmal pro Sprung.
     * @returns {void}
     */
    playJumpSoundOnce() {
        if (this._jumpSoundPlayed) return;

        this.playJumpSound();
        this._jumpSoundPlayed = true;
    }


/**
 * Aktualisiert Animation und Angriff innerhalb des Animation-Loops.
 * @returns {void}
 */
updateAnimation() {
    if (this.isDead()) {
        this.playDeathOnce();
        return;
    }

    if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
        return;
    }

    if (this.isAttacking) {
        this.updateAttack();
        return;
    }

    if (this.isMovementFrozen()) {
        this.playAnimation(this.IMAGES_IDLE);
        return;
    }

    this.handleMovementAnimation();
}



    /**
     * Behandelt Death- oder Hurt-Animation.
     * @returns {boolean} true, wenn Animation gesetzt wurde.
     */
    handleDeathOrHurtAnimation() {
        if (this.isDead()) {
            this.playDeathOnce();
            return true;
        }

        if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
            return true;
        }

        return false;
    }


/**
 * Schaltet zwischen Idle-, Jump- und Walk-Animation um.
 * @returns {void}
 */
handleMovementAnimation() {
    if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
        return;
    }

    if (this.world?.keyboard.RIGHT || this.world?.keyboard.LEFT) {
        this.playAnimation(this.IMAGES_WALKING);
        return;
    }

    if (this.isNotMoving()) {
        this.playAnimation(this.IMAGES_IDLE);
    }
}



    /**
     * Spielt die Lauf-Soundeffekte ab.
     * @param {number} volume - Lautstärke (0–1).
     * @param {number} playbackRate - Abspielgeschwindigkeit.
     * @returns {void}
     */
    soundEffects(volume, playbackRate) {
        this.walking_sound.play();
        this.walking_sound.playbackRate = playbackRate;
        this.walking_sound.volume = volume;
    }


    /**
     * Spielt den Kunai-Wurf-Sound ab.
     * @returns {void}
     */
    playKunaiThrowSound() {
        if (!this.kunai_throw_sound) return;

        this.kunai_throw_sound.currentTime = 0;
        this.kunai_throw_sound.volume = 0.3;
        this.kunai_throw_sound.play();
    }


    /**
     * Spielt den Nahkampf-Sound ab.
     * @returns {void}
     */
    playHitSound() {
        if (!this.hit_sound) return;

        this.hit_sound.currentTime = 0;
        this.hit_sound.volume = 0.3;
        this.hit_sound.play();
    }


    /**
     * Spielt den Sprung-Sound ab.
     * @returns {void}
     */
    playJumpSound() {
        if (!this.jump_sound) return;

        this.jump_sound.currentTime = 0;
        this.jump_sound.volume = 0.35;
        this.jump_sound.play();
    }


    /**
     * Spielt den Hurt-Sound ab.
     * @returns {void}
     */
    playHurtSound() {
        if (!this.hurt_sound) return;

        this.hurt_sound.currentTime = 0;
        this.hurt_sound.volume = 0.35;
        this.hurt_sound.play();
    }


    /**
     * Spielt den Death-Sound einmalig ab.
     * @returns {void}
     */
    playDeathSound() {
        if (this._deathSoundPlayed) return;
        this._deathSoundPlayed = true;

        if (!this.death_sound) return;

        this.death_sound.currentTime = 0;
        this.death_sound.volume = 0.4;
        this.death_sound.play();
    }
}
