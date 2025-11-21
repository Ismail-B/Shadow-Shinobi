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
        width: 380,   // Länge der Keule
        height: 180   // Höhe der Keule
    };

    // Skalierung
    scaleIdle   = 1.0;
    scaleHurt   = 1.15;
    scaleDead   = 1.15;
    scaleAttack = 1.5;  // Attack jetzt groß wie Dead

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
    isMoving = false;

    // Boss → Character Schaden-Cooldown
    damageInterval = 600; 
    lastDamageDealtAt = 0;

    // Cooldown zwischen zwei Attack-Starts
    attackCooldown = 900;
    lastAttackStartedAt = 0;

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

        this.animate();
    }

    /** Boss bekommt Schaden vom Spieler */
    hit(damage = 10) {
        if (this.isDeadFlag) return;

        const now = performance.now();
        if (now - this.lastHitAt < this.minHitInterval) return;
        this.lastHitAt = now;

        this.energy -= damage;
        if (this.energy < 0) this.energy = 0;

        this.isMoving = false;
        this.hurtPlaying = true;
        this.hurtFrameIndex = 0;

        // direkt erstes HURT-Bild setzen, damit Scale+Pose zusammen wechseln
        this.img = this.imageCache[this.IMAGES_HURT[0]];

        if (this.energy === 0) {
            this.isDeadFlag = true;
            this.collidable = false;
            this.isDying = true;
            this.deathPlaying = true;
            this.deathFrameIndex = 0;
            this.attacking = false;
            this.isMoving = false;

            // direkt erstes DEAD-Bild + Y-Offset setzen
            this.y = this.baseY + this.deadYOffset;
            this.img = this.imageCache[this.IMAGES_DEAD[0]];
        }
    }

    isDead() {
        return this.isDeadFlag;
    }

    /** Boss → Player Damage Check */
    canDamagePlayer() {
        if (!this.attacking || this.isDeadFlag || this.hurtPlaying || this.deathPlaying) return false;

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
        this.isMoving = false;

        // Boss bleibt nach links gerichtet
        this.otherDirection = true;

        // direkt erstes ATTACK-Bild setzen
        this.img = this.imageCache[this.IMAGES_ATTACK[0]];

        return true;
    }

    /** Skalierte Darstellung */
    draw(ctx) {
        let scale = this.scaleIdle;

        if (this.hurtPlaying)      scale = this.scaleHurt;
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
            if (this.hurtPlaying || this.deathPlaying || this.attacking) {
                this.isMoving = false;
                return;
            }

            // Boss schaut IMMER nach links
            this.otherDirection = true;

            if (!this.world || !this.world.character) {
                // Fallback: einfach nach links laufen
                this.moveLeft();
                this.isMoving = true;
                return;
            }

            const char = this.world.character;
            const attackRange = 40;

            // Abstand in x-Richtung (Boss ist immer rechts vom Character)
            const dx = this.x - char.x;

            if (dx <= attackRange) {
                // Nah genug: stehen bleiben und angreifen
                this.isMoving = false;
                this.startAttack();
            } else {
                // Egal wo der Character ist → Boss läuft einfach nach links
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
        if (this.attackFrameIndex >= this.IMAGES_ATTACK.length) {
            this.attackFrameIndex = 0;
            this.attacking = false;
            return;
        }

        const path = this.IMAGES_ATTACK[this.attackFrameIndex];
        this.img = this.imageCache[path];
        this.attackFrameIndex++;

        // --- HITBOX POSITIONIEREN ---  
        // Boss schaut immer nach links (otherDirection = true)
        this.attackHitbox.x = this.x - 60; 
        this.attackHitbox.y = this.y + 40;
    }
}
