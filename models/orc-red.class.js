class OrcRed extends Orc {
    y = 240;
    constructor() {
        super();
        this.height = 120; // Höhe für OrcRed
        this.width = 80;  // Breite für OrcRed
        this.IMAGES_WALKING = [
            'img/3_enemies_orcs/orc_red/1_walk/Walk_1.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_2.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_3.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_4.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_5.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_6.png',
            'img/3_enemies_orcs/orc_red/1_walk/Walk_7.png',
        ];
        this.loadImages(this.IMAGES_WALKING);
    }
}