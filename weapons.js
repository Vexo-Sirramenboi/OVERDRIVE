export const weapons = {

    revolver: {

        name: "REVOLVER",

        damage: 70,

        pellets: 1,

        spread: 0,

        fireRate: 0.35,

        magazine: 12,

        ammo: 12,

        reserve: 60,

        reloadTime: 1.2,

        recoil: 1,

        color: 0x00ffff,

        model: "revolver"

    },


    shotgun: {

        name: "SHOTGUN",

        damage: 22,

        pellets: 8,

        spread: 0.055,

        fireRate: 0.8,

        magazine: 6,

        ammo: 6,

        reserve: 36,

        reloadTime: 1.5,

        recoil: 2,

        color: 0xffaa00,

        model: "shotgun"

    },


    rocket: {

        name: "ROCKET LAUNCHER",

        damage: 100,

        pellets: 1,

        spread: 0,

        fireRate: 1,

        magazine: 4,

        ammo: 4,

        reserve: 20,

        reloadTime: 1.8,

        recoil: 2.5,

        color: 0xff174f,

        explosive: true,

        explosionRadius: 5,

        model: "rocket"

    }

};
