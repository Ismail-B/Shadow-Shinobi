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

    /**
     * Erstellt eine neue Kunai-Münze.
     * @param {number} x - X-Position.
     * @param {number} y - Y-Position.
     */
    constructor(x, y) {
        super();
        this.loadImage('img/8_coin/kunai-coin.png');
        this.x = x;
        this.y = y;
    }
}
