class Level {
    enemies;
    fireflys;
    backgroundObjects;
    level_end_x = 3600;

    constructor(enemies, fireflys, backgroundObjects){
        this.enemies = enemies;
        this.fireflys = fireflys;
        this.backgroundObjects = backgroundObjects;
    }
}