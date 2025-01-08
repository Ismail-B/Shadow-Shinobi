class Level {
    enemies;
    fireflys;
    backgroundObjects;
    coins;
    kunais;
    level_end_x = 3600;

    constructor(enemies, fireflys, backgroundObjects, coins, kunais){
        this.enemies = enemies;
        this.endbossLoaded = false;
        this.fireflys = fireflys;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.kunais = kunais;
    }
}