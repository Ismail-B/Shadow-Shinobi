/**
 * Represents a static background object in the level
 * that moves with the camera (parallax/scrolling).
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {
    /**
     * Width of the background image in pixels.
     * @type {number}
     */
    width = 720;

    /**
     * Height of the background image in pixels.
     * @type {number}
     */
    height = 480;

    /**
     * Creates a new background object.
     * @param {string} imagePath - Path to the background image.
     * @param {number} x - X position within the level.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height; // Align background to the bottom
    }
}
