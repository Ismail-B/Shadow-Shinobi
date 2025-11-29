/**
 * Repräsentiert den aktuellen Zustand der Tastatureingaben
 * für die Spielsteuerung.
 */
class Keyboard {
    /** @type {boolean} */ LEFT  = false;
    /** @type {boolean} */ RIGHT = false;
    /** @type {boolean} */ UP    = false;
    /** @type {boolean} */ D     = false;
    /** @type {boolean} */ SPACE = false;
    /** @type {boolean} */ ATTACK = false;

    /**
     * Erstellt eine neue Keyboard-Input-Struktur.
     * Wird von game.js mit Event-Listenern befüllt.
     */
    constructor() {}
}
