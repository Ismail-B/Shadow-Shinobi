/**
 * Repräsentiert ein Spiellevel mit Gegnern, Hintergrund
 * und sammelbaren Objekten.
 */
class Level {
    /**
     * Alle Gegner im Level (Orcs + Endboss).
     * @type {MovableObject[]}
     */
    enemies;

    /**
     * Glühwürmchen-Hintergrundebenen.
     * @type {Firefly[]}
     */
    fireflys;

    /**
     * Hintergrund-Objekte/Layer.
     * @type {BackgroundObject[]}
     */
    backgroundObjects;

    /**
     * Ninja-Münzen im Level.
     * @type {Coin[]}
     */
    coins;

    /**
     * Kunai-Münzen im Level.
     * @type {KunaiCoin[]}
     */
    kunais;

    /**
     * X-Position, ab der das Level endet.
     * @type {number}
     */
    level_end_x = 3600;

    /**
     * Flag, ob der Endboss bereits gespawnt wurde.
     * @type {boolean}
     */
    endbossLoaded = false;

    /**
     * Referenz auf den Endboss (nach dem Laden).
     * @type {Endboss|undefined}
     */
    endboss;

    /**
     * Erstellt ein neues Level.
     * @param {MovableObject[]} enemies
     * @param {Firefly[]} fireflys
     * @param {BackgroundObject[]} backgroundObjects
     * @param {Coin[]} [coins=[]]
     * @param {KunaiCoin[]} [kunais=[]]
     */
    constructor(enemies, fireflys, backgroundObjects, coins, kunais) {
        this.enemies = enemies;
        this.fireflys = fireflys;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins || [];
        this.kunais = kunais || [];
    }
}
