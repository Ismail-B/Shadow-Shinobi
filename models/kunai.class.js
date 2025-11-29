/**
 * Repräsentiert ein einzelnes geworfenes Kunai-Projektil.
 * Wird von World erzeugt, wenn der Charakter wirft.
 * @extends MovableObject
 */
class Kunai extends MovableObject {
    /**
     * Breite des Kunai-Sprites.
     * @type {number}
     */
    width = 150;

    /**
     * Referenz auf die Welt (wird von World gesetzt).
     * @type {World|undefined}
     */
    world;

    /**
     * Hitbox-Offset des Kunai-Projektils.
     * @type {{x:number, y:number, width:number, height:number}}
     */
    offset = {
        x: 55,
        y: 55,
        width: 110,
        height: 110
    };

    /**
     * Erstellt ein neues Kunai-Projektil.
     * @param {number} x - X-Position beim Abwurf.
     * @param {number} y - Y-Position beim Abwurf.
     */
    constructor(x, y) {
        super();
        this.loadImage('img/8_coin/kunai-coin.png');
        this.x = x;
        this.y = y;
    }
}
