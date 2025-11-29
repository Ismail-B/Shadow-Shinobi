/**
 * Repräsentiert eine Glühwürmchen-Hintergrundebene,
 * die sich kontinuierlich nach links bewegt.
 * @extends MovableObject
 */
class Firefly extends MovableObject {
    y = 0;
    height = 480;
    width = 720;

    /**
     * Erstellt eine neue Firefly-Ebene an der gegebenen X-Position.
     * @param {number} x - Startposition auf der X-Achse.
     */
    constructor(x) {
        super().loadImage('img/5_background/layers/4_fireflys/fireflys.png');
        this.x = x;
        this.animate();
    }

    /**
     * Startet die Bewegung der Glühwürmchen nach links.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }
}
