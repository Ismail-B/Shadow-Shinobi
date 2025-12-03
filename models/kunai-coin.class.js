/**
 * Repräsentiert eine sammelbare Kunai-Münze im Level.
 * @extends MovableObject
 */
class KunaiCoin extends MovableObject {
    /**
     * Breite der Kunai-Münze.
     * @type {number}
     */
    width = 150;

    /**
     * Kollisionsoffset der Münze.
     * @type {{x:number, y:number, width:number, height:number}}
     */
    offset = { x: 55, y: 55, width: 110, height: 110 };

    /** Basis-Y-Position, um die gewippt wird. */
    baseY = 0;

    /** Maximale Auslenkung nach oben/unten. */
    bobAmplitude = 4;

    /** Geschwindigkeit der Wipp-Bewegung (Radiant pro Sekunde). */
    bobSpeed =  2;

    /** Zufällige Phasenverschiebung, damit nicht alle gleich wippen. */
    bobPhase = Math.random() * Math.PI * 2;

    /**
     * Erstellt eine neue Kunai-Münze.
     * @param {number} x - X-Position.
     * @param {number} y - Y-Position.
     */
    constructor(x, y) {
        super();
        this.loadImage('img/8_coin/kunai-coin.png');
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
