class Character extends MovableObject {
    width = 100;
    speed = 10;

    // Wieviel Schaden pro Treffer durch Gegner
    DAMAGE_PER_HIT = 20;

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

    // --- Angriff-Status (Nahkampf + Kunai) ---
    isAttacking = false;
    attackFrameIndex = 0;
    attackFrameMs = 60;        // wird je nach Attack-Typ angepasst
    attackCooldownMs = 250;
    lastAttackAt = 0;
    _lastAttackTick = 0;
    attackType = null;         // 'melee' | 'kunai' | null

    // Sound-Flags
    _hitSoundPlayed = false;
    _jumpSoundPlayed = false;
    _deathSoundPlayed = false;

    world;
    walking_sound     = new Audio('audio/running.mp3');
    kunai_throw_sound = new Audio('audio/throw_kunai.mp3');   // Kunai-Wurf-Sound
    hit_sound         = new Audio('audio/ninja-hit.wav');     // Nahkampf-Sound
    jump_sound        = new Audio('audio/jump.mp3');          // Jump-Sound
    hurt_sound        = new Audio('audio/ninja-hurt.mp3');    // Hurt-Sound
    death_sound       = new Audio('audio/ninja-dying.mp3');   // Death-Sound

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

    collidesWithEndbossAtX(testX) {
        if (!this.world || !this.world.level || !this.world.level.enemies) return false;

        const enemies = this.world.level.enemies;
        const oldX = this.x;
        this.x = testX; // temporär verschieben

        let hit = false;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy || !enemy.isEndboss || !enemy.collidable) continue;

            if (this.isColliding(enemy)) {
                hit = true;
                break;
            }
        }

        this.x = oldX; // Position zurücksetzen
        return hit;
    }

    moveRight() {
        const oldX = this.x;
        const maxStep = this.speed;
        let lastFreeX = oldX;

        for (let s = 1; s <= maxStep; s++) {
            const testX = oldX + s;

            if (this.collidesWithEndbossAtX(testX)) {
                this.x = lastFreeX;
                this.otherDirection = false;
                return;
            } else {
                lastFreeX = testX;
            }
        }

        this.x = lastFreeX;
        this.otherDirection = false;
    }

    moveLeft() {
        this.otherDirection = true;
        this.x -= this.speed;
    }

    /* ===================== ANGRIFFS-LOGIK ===================== */

    /** Von World bei Tastendruck 'B' aufgerufen: Nahkampfangriff */
    tryStartAttack() {
        const now = performance.now();

        // nach GameOver/Win keine Angriffe mehr
        if (this.world && this.world.gameEnded) return;

        if (this.isDead() || this.isAttacking) return;
        if (now - this.lastAttackAt < this.attackCooldownMs) return;

        this.isAttacking = true;
        this.attackType = 'melee';
        this.attackFrameIndex = 0;

        // Nahkampf etwas LANGSAMER
        this.attackFrameMs = 120;

        this._lastAttackTick = now;
        this.lastAttackAt = now;

        // erstes Frame sofort zeigen
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];
    }

    /** Von World bei Tastendruck 'V' aufgerufen: Kunai-Wurf mit Attack-Anim */
    tryStartKunaiThrow() {
        const now = performance.now();

        // nach GameOver/Win keine Kunai-Würfe mehr
        if (this.world && this.world.gameEnded) return false;

        if (this.isDead() || this.isAttacking) return false;

        this.isAttacking = true;
        this.attackType = 'kunai';
        this.attackFrameIndex = 0;

        // Kunai-Animation SCHNELLER als Nahkampf
        this.attackFrameMs = 60;

        this._lastAttackTick = now;
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];

        return true;
    }

    updateAttack() {
        if (!this.isAttacking) return;

        const now = performance.now();
        if (now - this._lastAttackTick >= this.attackFrameMs) {
            this._lastAttackTick = now;
            this.attackFrameIndex++;

            // Ende der Attack-Animation
            if (this.attackFrameIndex >= this.IMAGES_ATTACK.length) {
                this.isAttacking = false;
                this.attackType = null;
                this._hitSoundPlayed = false; // Reset für nächsten Schlag
                return;
            }

            const key = this.IMAGES_ATTACK[this.attackFrameIndex];
            this.img = this.imageCache[key];

            // Nahkampf-Trefffenster
            if (this.attackType === 'melee') {
                if (this.attackFrameIndex === 2 || this.attackFrameIndex === 3) {
                    this.applyMeleeHit();

                    // Schlag-Sound genau 1x pro Angriff
                    if (!this._hitSoundPlayed) {
                        this.playHitSound();
                        this._hitSoundPlayed = true;
                    }
                }
            }

            // Kunai-Wurf: beim Frame Attack_4.png (Index 3)
            if (this.attackType === 'kunai') {
                if (this.attackFrameIndex === 3) {
                    if (this.world && typeof this.world.onCharacterKunaiRelease === 'function') {
                        this.world.onCharacterKunaiRelease();   // Kunai spawnen
                    }
                    this.playKunaiThrowSound();                  // Sound genau 1x
                }
            }
        }
    }

    applyMeleeHit() {
        if (!this.world || !this.world.level?.enemies) return;

        const range = 40;
        const height = this.height * 0.6;
        const y = this.y + this.height * 0.2;
        const facingRight = !this.otherDirection;
        const x = facingRight ? (this.x + this.width) : (this.x - range);
        const hitbox = { x, y, w: range, h: height };

        this.world.level.enemies.forEach(e => {
            if (!e || !e.collidable || e.isDying || e.isEndboss) return;
            if (typeof e.overlapsRect === 'function' && e.overlapsRect(hitbox)) {
                if (typeof e.die === 'function') e.die();
            }
        });
    }

    /* ===================== SCHADEN / TOD ===================== */

    /**
     * Eigene Hit-Logik:
     * - immer fester Schaden (DAMAGE_PER_HIT)
     * - für jeden Treffer Hurt-Sound
     * - wenn dadurch Leben auf 0 fällt → nur Death-Sound
     */
    hit(dmg = this.DAMAGE_PER_HIT) {
        if (this.isDead()) return;

        const wasDeadBefore = this.isDead();
        const oldEnergy = this.energy;

        // festen Schaden anwenden
        this.energy -= dmg;
        if (this.energy < 0) this.energy = 0;

        // Hurt-Invincibility: Zeitstempel nur setzen, wenn wirklich Schaden passiert ist
        if (this.energy < oldEnergy && this.energy > 0) {
            this.lastHit = new Date().getTime();
        }

        const deadNow = this.isDead();

        // Wenn er vor dem Treffer schon tot war → nichts mehr abspielen
        if (wasDeadBefore) return;

        // gerade durch diesen Treffer gestorben → nur Death-Sound
        if (!wasDeadBefore && deadNow) {
            this.playDeathSound();
        }
        // lebt noch → Hurt-Sound für *jeden* Lebensverlust
        else if (!deadNow && this.energy < oldEnergy) {
            this.playHurtSound();
        }
    }

    // WICHTIG: Character stirbt erst bei 0, nicht bei 20
    isDead() {
        return this.energy <= 0;
    }

    // Hurt-Status (Invincibility-Window), aber nur solange er noch lebt
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return this.energy > 0 && timepassed < 1;
    }

    playDeathOnce() {
        if (this.deathFrozen) return;
        if (this.deathTimer) return;

        const seq = this.IMAGES_DEAD;

        this.img = this.imageCache[seq[this.deathIndex]];

        this.deathTimer = setInterval(() => {
            this.deathIndex = Math.min(this.deathIndex + 1, seq.length - 1);
            this.img = this.imageCache[seq[this.deathIndex]];

            if (this.deathIndex >= seq.length - 1) {
                clearInterval(this.deathTimer);
                this.deathTimer = null;
                this.deathFrozen = true;
            }
        }, this.deathFrameDuration);
    }

    resetDeathAnim() {
        this.deathIndex = 0;
        this.deathFrozen = false;
        if (this.deathTimer) {
            clearInterval(this.deathTimer);
            this.deathTimer = null;
        }
        this._deathSoundPlayed = false; // für Neustart/Respawn
        this.loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
    }

    /* ===================== ANIMATION / BEWEGUNG ===================== */

    animateCharacter() {

        // Bewegung / Physik
        setInterval(() => {

            // wenn Spiel beendet (Win/Loose) → komplette Bewegung sperren
            if (this.world && this.world.gameEnded) {
                this.walking_sound.pause();
                return;
            }

            this.walking_sound.pause();

            const onGround = !this.isAboveGround();

            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x && !this.isDead()) {
                this.moveRight();   // jetzt mit Boss-Block
                this.soundEffects(0.3, 2.5);
            }

            if (this.world.keyboard.LEFT && this.x > -670 && !this.isDead()) {
                this.moveLeft();    // immer frei nach links
                this.soundEffects(0.3, 2.5);
            }

            // SPRUNG + Jump-Sound (genau 1x pro Sprung)
            if (this.world.keyboard.SPACE && onGround && !this.isDead()) {

                if (!this._jumpSoundPlayed) {
                    this.playJumpSound();
                    this._jumpSoundPlayed = true;
                }

                this.jump();
            }

            // Flag zurücksetzen, wenn wieder auf dem Boden und SPACE nicht gedrückt
            if (onGround && !this.world.keyboard.SPACE) {
                this._jumpSoundPlayed = false;
            }

            this.world.camera_x = -this.x + 50;
        }, 1000 / 60);

        // Animationen + Attack-Takt
        setInterval(() => {
            // Angriff-Frames fortschalten, falls aktiv
            if (this.isAttacking) {
                this.updateAttack();
                return;
            }

            if (this.isDead()) {
                this.playDeathOnce();
                return;
            }

            if (this.isHurt()) {
                // NUR Animation, Sound kommt in hit()
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

    // Kunai-Wurf-Sound: immer von vorne, genau 1x pro Wurf
    playKunaiThrowSound() {
        if (!this.kunai_throw_sound) return;
        this.kunai_throw_sound.currentTime = 0;
        this.kunai_throw_sound.volume = 0.3; // Lautstärke nach Geschmack
        this.kunai_throw_sound.play();
    }

    // Nahkampf-Hit-Sound: genau 1x pro Nahkampfangriff
    playHitSound() {
        if (!this.hit_sound) return;
        this.hit_sound.currentTime = 0;
        this.hit_sound.volume = 0.3; // Lautstärke nach Geschmack
        this.hit_sound.play();
    }

    // Jump-Sound: genau 1x pro Sprung
    playJumpSound() {
        if (!this.jump_sound) return;
        this.jump_sound.currentTime = 0;
        this.jump_sound.volume = 0.35; // Lautstärke nach Geschmack
        this.jump_sound.play();
    }

    // Hurt-Sound: für jeden nicht-tödlichen Treffer (getriggert in hit())
    playHurtSound() {
        if (!this.hurt_sound) return;
        this.hurt_sound.currentTime = 0;
        this.hurt_sound.volume = 0.35; // Lautstärke nach Geschmack
        this.hurt_sound.play();
    }

    // Death-Sound: genau 1x beim Sterben
    playDeathSound() {
        if (this._deathSoundPlayed) return;
        this._deathSoundPlayed = true;

        if (!this.death_sound) return;
        this.death_sound.currentTime = 0;
        this.death_sound.volume = 0.4; // Lautstärke nach Geschmack
        this.death_sound.play();
    }
}
