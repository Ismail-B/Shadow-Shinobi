/**
 * Repräsentiert ein statisches Hintergrundobjekt im Level,
 * das sich mit der Kamera verschiebt (Parallax/Scrolling).
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {
    /**
     * Breite des Hintergrundbildes in Pixeln.
     * @type {number}
     */
    width = 720;

    /**
     * Höhe des Hintergrundbildes in Pixeln.
     * @type {number}
     */
    height = 480;

    /**
     * Erstellt ein neues Hintergrundobjekt.
     * @param {string} imagePath - Pfad zum Hintergrundbild.
     * @param {number} x - X-Position im Level.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height; // Hintergrund unten abschließen
    }
}
