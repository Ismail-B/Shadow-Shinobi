/**
 * Repräsentiert ein geworfenes Kunai-Projektil.
 * Bewegt sich nach rechts und fällt durch die Schwerkraft.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {

    width = 50;
    height = 15;

    /**
     * Erzeugt ein neues Kunai.
     * @param {number} x - Startposition X.
     * @param {number} y - Startposition Y.
     */
    constructor(x, y) {
        super();
        this.loadImage('img/6_kunai/kunai.png');
        this.throw(x, y);
    }

    /**
     * Startet den Wurf des Kunai.
     * @param {number} x
     * @param {number} y
     */
    throw(x, y) {
        this.x = x;
        this.y = y;
        this.speedY = 1;

        this.applyGravity();

        setInterval(() => {
            this.x += 10;
        }, 15);
    }
}
