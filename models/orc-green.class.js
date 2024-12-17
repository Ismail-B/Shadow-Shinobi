class OrcGreen extends Orc {
    constructor() {
        super();
        this.height = 100; // Höhe für OrcGreen
        this.width = 70;  // Breite für OrcGreen
        this.IMAGES_WALKING = [
            'img/3_enemies_orcs/orc_green/1_walk/Walk_1.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_2.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_3.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_4.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_5.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_6.png',
            'img/3_enemies_orcs/orc_green/1_walk/Walk_7.png',
        ];
        this.loadImages(this.IMAGES_WALKING);
    }
}