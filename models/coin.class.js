/**
 * Repräsentiert eine sammelbare Ninja-Münze im Level.
 * @extends MovableObject
 */
class Coin extends MovableObject {
    /**
     * Breite der Coin-Sprite in Pixeln.
     * @type {number}
     */
    width = 150;

    /**
     * Referenz auf die aktuelle Welt.
     * Wird von außen gesetzt, z.B. durch World.
     * @type {World|undefined}
     */
    world;

    /**
     * Kollisions-Offset der Coin-Hitbox.
     * @type {{x:number,y:number,width:number,height:number}}
     */
    offset = {
        x: 55,
        y: 55,
        width: 110,
        height: 110
    };

    /** Basis-Y-Position, um die gewippt wird. */
    baseY = 0;

    /** Maximale Auslenkung nach oben/unten. */
    bobAmplitude = 4;

    /** Geschwindigkeit der Wipp-Bewegung (Radiant pro Sekunde). */
    bobSpeed = 2;

    /** Zufällige Phasenverschiebung, damit nicht alle Coins gleich wippen. */
    bobPhase = Math.random() * Math.PI * 2;

    /**
     * Erzeugt eine neue Coin an der angegebenen Position.
     * @param {number} x - X-Position der Coin.
     * @param {number} y - Y-Position der Coin.
     */
    constructor(x, y) {
        super();
        this.loadImage('img/8_coin/ninja-coin.png');
        this.x = x;
        this.baseY = y;
        this.y = y;
    }

    /**
     * Aktualisiert die Wipp-Animation.
     * @param {number} timeSeconds - aktuelle Zeit in Sekunden.
     */
    updateBobbing(timeSeconds) {
        const angle = timeSeconds * this.bobSpeed + this.bobPhase;
        this.y = this.baseY + Math.sin(angle) * this.bobAmplitude;
    }
}
