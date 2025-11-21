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

    // --- Angriff-Status (Nahkampf + Kunai) ---
    isAttacking = false;
    attackFrameIndex = 0;
    attackFrameMs = 60;        // wird je nach Attack-Typ angepasst
    attackCooldownMs = 250;
    lastAttackAt = 0;
    _lastAttackTick = 0;
    attackType = null;         // 'melee' | 'kunai' | null

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

    /* =========================================================
       >>> HORIZONTALBEWEGUNG MIT BOSS-BLOCK <<<
       ========================================================= */

    /**
     * Prüft, ob der Character bei einem gegebenen x-Wert
     * mit einem Endboss kollidieren würde.
     */
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

    /**
     * Nach rechts laufen:
     * - in 1px-Schritten bis max. this.speed
     * - beim ersten Pixel, der zu einer Boss-Kollision führen würde,
     *   bleiben wir am letzten freien Pixel stehen.
     * - So kannst du NICHT durch den Boss durchlaufen, aber sauber "ankleben".
     */
    moveRight() {
        const oldX = this.x;
        const maxStep = this.speed;
        let lastFreeX = oldX;

        // Schrittweise prüfen
        for (let s = 1; s <= maxStep; s++) {
            const testX = oldX + s;

            if (this.collidesWithEndbossAtX(testX)) {
                // Beim ersten Kollisionspixel stoppen wir: auf letzter freie Position
                this.x = lastFreeX;
                this.otherDirection = false;
                return;
            } else {
                lastFreeX = testX;
            }
        }

        // Kein Boss im Weg → normal volle Geschwindigkeit
        this.x = lastFreeX;
        this.otherDirection = false;
    }

    /**
     * Nach links laufen:
     * - hier KEIN Boss-Block, damit du dich immer vom Boss lösen kannst.
     */
    moveLeft() {
        this.otherDirection = true;
        this.x -= this.speed;
    }

    /* ===================== ANGRIFFS-LOGIK ===================== */

    /** Von World bei Tastendruck 'B' aufgerufen: Nahkampfangriff */
    tryStartAttack() {
        const now = performance.now();
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
        if (this.isDead() || this.isAttacking) return false;

        this.isAttacking = true;
        this.attackType = 'kunai';
        this.attackFrameIndex = 0;

        // Kunai-Animation SCHNELLER als Nahkampf
        this.attackFrameMs = 60;

        this._lastAttackTick = now;
        // lastAttackAt benutzen wir nur für Nahkampf-Cooldown
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];

        return true;
    }

    /** Schlag-/Wurf-Update inkl. Hit-/Wurf-Fenster */
    updateAttack() {
        if (!this.isAttacking) return;

        const now = performance.now();
        if (now - this._lastAttackTick >= this.attackFrameMs) {
            this._lastAttackTick = now;
            this.attackFrameIndex++;

            if (this.attackFrameIndex >= this.IMAGES_ATTACK.length) {
                // Ende der Angriffanimation
                this.isAttacking = false;
                this.attackType = null;
                return;
            }

            const key = this.IMAGES_ATTACK[this.attackFrameIndex];
            this.img = this.imageCache[key];

            // --- Nahkampf-Trefffenster: Frame 3 & 4 ---
            if (this.attackType === 'melee') {
                if (this.attackFrameIndex === 2 || this.attackFrameIndex === 3) {
                    this.applyMeleeHit();
                }
            }

            // --- Kunai-Wurf: beim Frame Attack_4.png (Index 3) ---
            if (this.attackType === 'kunai') {
                if (this.attackFrameIndex === 3) {
                    if (this.world && typeof this.world.onCharacterKunaiRelease === 'function') {
                        this.world.onCharacterKunaiRelease();
                    }
                }
            }
        }
    }

    /** Rechteck vor dem Charakter; killt normale Orcs */
    applyMeleeHit() {
        if (!this.world || !this.world.level?.enemies) return;

        const range = 40;
        const height = this.height * 0.6;
        const y = this.y + this.height * 0.2;
        const facingRight = !this.otherDirection; // deine Blickrichtung
        const x = facingRight ? (this.x + this.width) : (this.x - range);
        const hitbox = { x, y, w: range, h: height };

        this.world.level.enemies.forEach(e => {
            if (!e || !e.collidable || e.isDying || e.isEndboss) return;
            if (typeof e.overlapsRect === 'function' && e.overlapsRect(hitbox)) {
                if (typeof e.die === 'function') e.die();
            }
        });
    }

    /**
     * Sterbeanimation: langsam, nur einmal, am Ende einfrieren.
     */
    playDeathOnce() {
        if (this.deathFrozen) return;
        if (this.deathTimer) return;

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
        this.loadImage('img/2_character_shinobi/1_idle/idle/Idle_1.png');
    }

    animateCharacter() {

        // Bewegung / Physik
        setInterval(() => {
            this.walking_sound.pause();

            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x && !this.isDead()) {
                this.moveRight();   // jetzt mit Boss-Block
                this.soundEffects(0.3, 2.5);
            }

            if (this.world.keyboard.LEFT && this.x > -670 && !this.isDead()) {
                this.moveLeft();    // immer frei nach links
                this.soundEffects(0.3, 2.5);
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround() && !this.isDead()) {
                this.jump();
            }

            this.world.camera_x = -this.x + 50;
        }, 1000 / 60);

        // Animationen + Attack-Takt
        setInterval(() => {
            // Angriff-Frames fortschalten, falls aktiv
            if (this.isAttacking) {
                this.updateAttack();
                return; // während des Angriffs nichts anderes animieren
            }

            if (this.isDead()) {
                this.playDeathOnce();
                return;
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
