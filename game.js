import * as THREE from "three";

import {
    PointerLockControls
} from "https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/PointerLockControls.js";

import {
    weapons
} from "./weapons.js";

import {
    enemies,
    createEnemy,
    updateEnemies,
    updateProjectiles
} from "./enemies.js";

import {
    initShop,
    updateShop,
    checkShopInteraction,
    interactShop,
    addBlood,
    isShopOpen
} from "./shop.js";


/* ============================================================
   SCENE
============================================================ */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x040408
    );

scene.fog =
    new THREE.FogExp2(
        0x040408,
        .024
    );


/* ============================================================
   CAMERA
============================================================ */

const camera =
    new THREE.PerspectiveCamera(
        90,
        innerWidth / innerHeight,
        .05,
        500
    );

camera.position.set(
    0,
    2,
    15
);


/* ============================================================
   RENDERER
============================================================ */

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            "high-performance"

    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(
        devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled =
    true;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("game")
    .appendChild(
        renderer.domElement
    );


/* ============================================================
   CONTROLS
============================================================ */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


/* ============================================================
   LIGHTING
============================================================ */

scene.add(
    new THREE.HemisphereLight(
        0x6688ff,
        0x080808,
        1.5
    )
);

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    10,
    25,
    10
);

sun.castShadow =
    true;

scene.add(
    sun
);


/* ============================================================
   FLOOR
============================================================ */

const floor =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            80,
            1,
            80
        ),

        new THREE.MeshStandardMaterial({

            color: 0x101018,

            roughness: .6,

            metalness: .5

        })

    );

floor.position.y =
    -.5;

floor.receiveShadow =
    true;

scene.add(
    floor
);


/* ============================================================
   LEVEL BLOCKS
============================================================ */

function block(
    x,
    y,
    z,
    w,
    h,
    d
) {

    const mesh =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                w,
                h,
                d
            ),

            new THREE.MeshStandardMaterial({

                color: 0x202030,

                roughness: .35,

                metalness: .8

            })

        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow =
        true;

    mesh.receiveShadow =
        true;

    scene.add(
        mesh
    );

}


block(
    0,
    5,
    -40,
    80,
    10,
    2
);

block(
    0,
    5,
    40,
    80,
    10,
    2
);

block(
    -40,
    5,
    0,
    2,
    10,
    80
);

block(
    40,
    5,
    0,
    2,
    10,
    80
);

block(
    -13,
    3,
    -10,
    8,
    6,
    8
);

block(
    13,
    3,
    -14,
    8,
    6,
    8
);

block(
    -15,
    2,
    13,
    10,
    4,
    6
);

block(
    15,
    4,
    14,
    8,
    8,
    8
);


/* ============================================================
   GRID
============================================================ */

const grid =
    new THREE.GridHelper(
        80,
        80,
        0x00ffff,
        0x202030
    );

grid.position.y =
    .01;

scene.add(
    grid
);


/* ============================================================
   BROKER PORTAL
============================================================ */

const brokerPortal =
    new THREE.Group();

brokerPortal.position.set(
    0,
    0,
    -34
);

scene.add(
    brokerPortal
);


const portalFrame =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            3,
            .18,
            8,
            32
        ),

        new THREE.MeshBasicMaterial({
            color: 0xff174f
        })

    );

portalFrame.rotation.x =
    Math.PI / 2;

portalFrame.position.y =
    3;

brokerPortal.add(
    portalFrame
);


const portalCore =
    new THREE.Mesh(

        new THREE.CircleGeometry(
            2.7,
            32
        ),

        new THREE.MeshBasicMaterial({

            color: 0x09000a,

            transparent: true,

            opacity: .8,

            side: THREE.DoubleSide

        })

    );

portalCore.position.set(
    0,
    3,
    0
);

portalCore.rotation.x =
    Math.PI / 2;

brokerPortal.add(
    portalCore
);


const portalLight =
    new THREE.PointLight(
        0xff174f,
        15,
        12
    );

portalLight.position.set(
    0,
    3,
    0
);

brokerPortal.add(
    portalLight
);


/* ============================================================
   PLAYER
============================================================ */

const player = {

    velocity:
        new THREE.Vector3(),

    height: 2,

    speed: 22,

    sprintSpeed: 34,

    jump: 12,

    dash: 48,

    health: 100,

    stamina: 100,

    grounded: true,

    canDash: true,

    alive: true

};

camera.position.y =
    player.height;


/* ============================================================
   INPUT
============================================================ */

const keys = {};

addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


        if (
            event.code === "Space" &&
            player.grounded
        ) {

            player.velocity.y =
                player.jump;

            player.grounded =
                false;

        }


        if (
            event.code === "KeyQ"
        ) {

            dash();

        }


        if (
            event.code === "KeyE"
        ) {

            interactShop();

        }


        if (
            event.code === "Digit1"
        ) {

            equip(
                "revolver"
            );

        }


        if (
            event.code === "Digit2"
        ) {

            equip(
                "shotgun"
            );

        }


        if (
            event.code === "Digit3"
        ) {

            equip(
                "rocket"
            );

        }


        if (
            event.code === "KeyR"
        ) {

            reload();

        }

    }
);

addEventListener(
    "keyup",
    event => {

        keys[event.code] =
            false;

    }
);


/* ============================================================
   3D WEAPON SYSTEM
============================================================ */

const weaponView =
    new THREE.Group();

camera.add(
    weaponView
);

scene.add(
    camera
);

weaponView.position.set(
    .55,
    -.45,
    -1
);

let currentGun =
    null;

let currentWeapon =
    "revolver";

let weapon =
    weapons[currentWeapon];

let canFire =
    true;

let reloading =
    false;

let gunKick =
    0;

let gunKickVelocity =
    0;

let gunBobTime =
    0;


/* ============================================================
   MATERIAL HELPERS
============================================================ */

function metal(
    color
) {

    return new THREE.MeshStandardMaterial({

        color,

        metalness: .9,

        roughness: .25

    });

}

function glow(
    color
) {

    return new THREE.MeshBasicMaterial({

        color

    });

}


/* ============================================================
   REVOLVER
============================================================ */

function createRevolver() {

    const gun =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .55,
                .35,
                .9
            ),

            metal(
                0x292932
            )

        );

    gun.add(
        body
    );


    const barrel =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .075,
                .075,
                1.2,
                12
            ),

            metal(
                0x111116
            )

        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -.85;

    gun.add(
        barrel
    );


    const cylinder =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .25,
                .25,
                .32,
                12
            ),

            metal(
                0x15151b
            )

        );

    cylinder.rotation.z =
        Math.PI / 2;

    cylinder.position.z =
        -.15;

    gun.add(
        cylinder
    );


    const energy =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .08,
                .08,
                .75
            ),

            glow(
                0x00ffff
            )

        );

    energy.position.set(
        0,
        .19,
        -.15
    );

    gun.add(
        energy
    );


    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .3,
                .75,
                .3
            ),

            metal(
                0x101016
            )

        );

    grip.position.set(
        0,
        -.45,
        .2
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(
            -12
        );

    gun.add(
        grip
    );


    return gun;

}


/* ============================================================
   SHOTGUN
============================================================ */

function createShotgun() {

    const gun =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .65,
                .45,
                1.25
            ),

            metal(
                0x28282f
            )

        );

    gun.add(
        body
    );


    for (
        let i = 0;
        i < 2;
        i++
    ) {

        const barrel =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    .095,
                    .095,
                    1.7,
                    12
                ),

                metal(
                    0x111116
                )

            );

        barrel.rotation.x =
            Math.PI / 2;

        barrel.position.set(
            i === 0
                ? -.16
                : .16,

            .08,

            -1.25
        );

        gun.add(
            barrel
        );

    }


    const pump =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .72,
                .2,
                .55
            ),

            metal(
                0x111116
            )

        );

    pump.position.set(
        0,
        -.05,
        -.8
    );

    gun.add(
        pump
    );


    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .35,
                .8,
                .35
            ),

            metal(
                0x101016
            )

        );

    grip.position.set(
        0,
        -.55,
        .3
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(
            -10
        );

    gun.add(
        grip
    );


    const glowBar =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .08,
                .08,
                .7
            ),

            glow(
                0xffaa00
            )

        );

    glowBar.position.set(
        0,
        .25,
        -.35
    );

    gun.add(
        glowBar
    );


    return gun;

}


/* ============================================================
   ROCKET LAUNCHER
============================================================ */

function createRocketLauncher() {

    const gun =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .8,
                .7,
                1.5
            ),

            metal(
                0x25252e
            )

        );

    gun.add(
        body
    );


    const barrel =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .32,
                .28,
                1.5,
                16
            ),

            metal(
                0x111116
            )

        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -1.35;

    gun.add(
        barrel
    );


    const inner =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .21,
                .21,
                .05,
                16
            ),

            glow(
                0xff174f
            )

        );

    inner.rotation.x =
        Math.PI / 2;

    inner.position.z =
        -2.1;

    gun.add(
        inner
    );


    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .4,
                .85,
                .4
            ),

            metal(
                0x101016
            )

        );

    grip.position.set(
        0,
        -.65,
        .3
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(
            -8
        );

    gun.add(
        grip
    );


    const energy =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .1,
                .1,
                1
            ),

            glow(
                0xff174f
            )

        );

    energy.position.y =
        .38;

    energy.position.z =
        -.2;

    gun.add(
        energy
    );


    return gun;

}


/* ============================================================
   CREATE WEAPON
============================================================ */

function createWeaponModel(
    name
) {

    if (
        name === "revolver"
    ) {

        return createRevolver();

    }

    if (
        name === "shotgun"
    ) {

        return createShotgun();

    }

    if (
        name === "rocket"
    ) {

        return createRocketLauncher();

    }

}


/* ============================================================
   EQUIP
============================================================ */

function equip(
    name
) {

    if (
        !weapons[name]
    ) {

        return;

    }


    if (
        currentGun
    ) {

        weaponView.remove(
            currentGun
        );

    }


    currentWeapon =
        name;

    weapon =
        weapons[name];


    /*
        Apply Broker upgrades.
    */

    const revolverBonus =
        Number(
            localStorage.getItem(
                "revolverDamageBonus"
            ) || 0
        );


    const shotgunBonus =
        Number(
            localStorage.getItem(
                "shotgunDamageBonus"
            ) || 0
        );


    if (
        name === "revolver"
    ) {

        weapon.damage =
            weapons[name].damage +
            revolverBonus;

    }


    if (
        name === "shotgun"
    ) {

        weapon.damage =
            weapons[name].damage +
            shotgunBonus;

    }


    currentGun =
        createWeaponModel(
            weapon.model
        );


    weaponView.add(
        currentGun
    );


    updateWeaponHUD();


    weaponView.position.z =
        -.65;

}


/* ============================================================
   WEAPON HUD
============================================================ */

function updateWeaponHUD() {

    const weaponName =
        document.getElementById(
            "weaponName"
        );

    const ammo =
        document.getElementById(
            "ammo"
        );


    if (weaponName) {

        weaponName.textContent =
            weapon.name;

    }


    if (ammo) {

        ammo.textContent =
            `${weapon.ammo} / ${weapon.reserve}`;

    }

}


/* ============================================================
   RELOAD
============================================================ */

function reload() {

    if (
        reloading ||
        weapon.ammo >=
        weapon.magazine ||
        weapon.reserve <= 0
    ) {

        return;

    }


    reloading =
        true;


    const name =
        weapon.name;


    const weaponBeforeReload =
        weapon;


    const weaponReloadTime =
        weapon.reloadTime;


    const weaponMagazine =
        weapon.magazine;


    document
        .getElementById(
            "weaponName"
        )
        .textContent =
        "RELOADING...";


    setTimeout(
        () => {

            if (
                weapon !==
                weaponBeforeReload
            ) {

                reloading =
                    false;

                updateWeaponHUD();

                return;

            }


            const needed =
                weaponMagazine -
                weapon.ammo;


            const amount =
                Math.min(
                    needed,
                    weapon.reserve
                );


            weapon.ammo +=
                amount;

            weapon.reserve -=
                amount;


            reloading =
                false;


            updateWeaponHUD();

        },
        weaponReloadTime *
        1000
    );

}


/* ============================================================
   SHOOT
============================================================ */

addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0 &&
            controls.isLocked &&
            player.alive &&
            !isShopOpen()
        ) {

            shoot();

        }

    }
);


function shoot() {

    if (
        !canFire ||
        reloading ||
        isShopOpen()
    ) {

        return;

    }


    if (
        weapon.ammo <= 0
    ) {

        reload();

        return;

    }


    weapon.ammo--;

    updateWeaponHUD();


    canFire =
        false;


    setTimeout(
        () => {

            canFire =
                true;

        },
        weapon.fireRate *
        1000
    );


    gunKick =
        .08 +
        weapon.recoil *
        .045;


    gunKickVelocity =
        weapon.recoil *
        .12;


    muzzleFlash();


    for (
        let i = 0;
        i < weapon.pellets;
        i++
    ) {

        fireRay();

    }


    if (
        weapon.ammo === 0
    ) {

        setTimeout(
            reload,
            200
        );

    }

}


/* ============================================================
   RAYCAST
============================================================ */

function fireRay() {

    const direction =
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );


    direction.x +=
        (
            Math.random() -
            .5
        ) *
        weapon.spread;


    direction.y +=
        (
            Math.random() -
            .5
        ) *
        weapon.spread;


    direction.z +=
        (
            Math.random() -
            .5
        ) *
        weapon.spread;


    direction.normalize();


    const ray =
        new THREE.Raycaster(
            camera.position,
            direction,
            0,
            120
        );


    const targets = [];


    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) {

            continue;

        }


        enemy.mesh.traverse(
            object => {

                if (
                    object.isMesh
                ) {

                    targets.push(
                        object
                    );

                }

            }
        );

    }


    const hits =
        ray.intersectObjects(
            targets,
            false
        );


    if (
        hits.length > 0
    ) {

        const object =
            hits[0].object;


        const enemy =
            object.userData.enemy;


        if (
            enemy
        ) {

            damageEnemy(
                enemy,
                weapon.damage,
                hits[0].point
            );


            hitmarker();

        }

    }

}


/* ============================================================
   ENEMY DAMAGE
============================================================ */

function damageEnemy(
    enemy,
    amount,
    position
) {

    if (
        !enemy.alive
    ) {

        return;

    }


    enemy.health -=
        amount;


    const push =
        new THREE.Vector3();


    push.subVectors(
        enemy.mesh.position,
        camera.position
    );


    push.y =
        0;


    if (
        push.lengthSq() > 0
    ) {

        push.normalize();

        enemy.mesh.position.addScaledVector(
            push,
            weapon.explosive
                ? 2
                : .5
        );

    }


    blood(
        position
    );


    if (
        weapon.explosive
    ) {

        explosion(
            position
        );

        explosionDamage(
            position
        );

    }


    if (
        enemy.health <= 0
    ) {

        kill(
            enemy
        );

    }

}


/* ============================================================
   EXPLOSION DAMAGE
============================================================ */

function explosionDamage(
    position
) {

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) {

            continue;

        }


        const distance =
            enemy.mesh.position
                .distanceTo(
                    position
                );


        if (
            distance <
            weapon.explosionRadius
        ) {

            const damage =
                100 *
                (
                    1 -
                    distance /
                    weapon.explosionRadius
                );


            enemy.health -=
                damage;


            if (
                enemy.health <= 0
            ) {

                kill(
                    enemy
                );

            }

        }

    }

}


/* ============================================================
   KILLS
============================================================ */

let kills =
    0;


function kill(
    enemy
) {

    if (
        !enemy.alive
    ) {

        return;

    }


    enemy.alive =
        false;


    kills++;


    /*
        BLOOD REWARD
    */

    addBlood(
        100
    );


    const killHUD =
        document.getElementById(
            "kills"
        );


    if (killHUD) {

        killHUD.textContent =
            "KILLS: " +
            kills;

    }


    explosion(
        enemy.mesh.position
            .clone()
            .add(
                new THREE.Vector3(
                    0,
                    1.5,
                    0
                )
            )
    );


    scene.remove(
        enemy.mesh
    );


    setTimeout(
        spawnEnemy,
        1000
    );

}


/* ============================================================
   EXPLOSION
============================================================ */

function explosion(
    position
) {

    const geometry =
        new THREE.SphereGeometry(
            .3,
            8,
            8
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffaa00,

            transparent: true

        });


    const sphere =
        new THREE.Mesh(
            geometry,
            material
        );


    sphere.position.copy(
        position
    );


    scene.add(
        sphere
    );


    const light =
        new THREE.PointLight(
            0xff5500,
            40,
            12
        );


    light.position.copy(
        position
    );


    scene.add(
        light
    );


    const start =
        performance.now();


    function animateExplosion() {

        const t =
            (
                performance.now() -
                start
            ) / 300;


        sphere.scale.setScalar(
            1 + t * 8
        );


        material.opacity =
            1 - t;


        light.intensity =
            40 *
            (1 - t);


        if (
            t >= 1
        ) {

            scene.remove(
                sphere
            );

            scene.remove(
                light
            );

            return;

        }


        requestAnimationFrame(
            animateExplosion
        );

    }


    animateExplosion();

}


/* ============================================================
   BLOOD PARTICLES
============================================================ */

function blood(
    position
) {

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const particle =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .05,
                    5,
                    5
                ),

                new THREE.MeshBasicMaterial({

                    color: 0xff174f

                })

            );


        particle.position.copy(
            position
        );


        scene.add(
            particle
        );


        const velocity =
            new THREE.Vector3(

                (
                    Math.random() -
                    .5
                ) * 6,

                Math.random() * 5,

                (
                    Math.random() -
                    .5
                ) * 6

            );


        const start =
            performance.now();


        function update() {

            const t =
                (
                    performance.now() -
                    start
                ) / 500;


            particle.position.add(
                velocity
                    .clone()
                    .multiplyScalar(
                        .016
                    )
            );


            velocity.y -=
                .3;


            if (
                t >= 1
            ) {

                scene.remove(
                    particle
                );

                return;

            }


            requestAnimationFrame(
                update
            );

        }


        update();

    }

}


/* ============================================================
   MUZZLE FLASH
============================================================ */

function muzzleFlash() {

    if (
        !currentGun
    ) {

        return;

    }


    const light =
        new THREE.PointLight(
            weapon.color,
            30,
            8
        );


    light.position.set(
        0,
        0,
        -1.8
    );


    currentGun.add(
        light
    );


    setTimeout(
        () => {

            currentGun?.remove(
                light
            );

        },
        60
    );

}


/* ============================================================
   HITMARKER
============================================================ */

function hitmarker() {

    const element =
        document.getElementById(
            "hitmarker"
        );


    if (!element) {

        return;

    }


    element.style.transform =
        "translate(-50%,-50%) scale(1)";


    element.style.opacity =
        "1";


    setTimeout(
        () => {

            element.style.transform =
                "translate(-50%,-50%) scale(0)";


            element.style.opacity =
                "0";

        },
        100
    );

}


/* ============================================================
   GUN ANIMATION
============================================================ */

function updateGun(
    delta
) {

    if (
        !currentGun
    ) {

        return;

    }


    gunKick =
        THREE.MathUtils.lerp(
            gunKick,
            0,
            14 * delta
        );


    gunKickVelocity =
        THREE.MathUtils.lerp(
            gunKickVelocity,
            0,
            10 * delta
        );


    const moving =
        keys["KeyW"] ||
        keys["KeyA"] ||
        keys["KeyS"] ||
        keys["KeyD"];


    if (
        moving &&
        controls.isLocked
    ) {

        gunBobTime +=
            delta * 10;

    } else {

        gunBobTime =
            THREE.MathUtils.lerp(
                gunBobTime,
                0,
                5 * delta
            );

    }


    const bobX =
        Math.sin(
            gunBobTime
        ) * .018;


    const bobY =
        Math.abs(
            Math.cos(
                gunBobTime
            )
        ) * .018;


    weaponView.position.x =
        .55 +
        bobX;


    weaponView.position.y =
        -.45 +
        bobY;


    weaponView.position.z =
        -.9 +
        gunKick;


    weaponView.rotation.x =
        gunKick *
        1.8;


    weaponView.rotation.z =
        bobX *
        1.5;

}


/* ============================================================
   DASH
============================================================ */

function dash() {

    if (
        !controls.isLocked ||
        !player.canDash ||
        isShopOpen()
    ) {

        return;

    }


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    direction.y =
        0;


    if (
        direction.lengthSq() > 0
    ) {

        direction.normalize();

    }


    player.velocity.addScaledVector(
        direction,
        player.dash
    );


    player.canDash =
        false;


    const dashCooldown =
        Number(
            localStorage.getItem(
                "dashCooldown"
            ) || 600
        );


    setTimeout(
        () => {

            player.canDash =
                true;

        },
        dashCooldown
    );

}


/* ============================================================
   PLAYER MOVEMENT
============================================================ */

function moveToward(
    current,
    target,
    amount
) {

    if (
        Math.abs(
            target - current
        ) <= amount
    ) {

        return target;

    }


    return current +
        Math.sign(
            target - current
        ) *
        amount;

}


function updatePlayer(
    delta
) {

    let forward =
        0;


    let right =
        0;


    if (
        keys["KeyW"]
    ) forward++;


    if (
        keys["KeyS"]
    ) forward--;


    if (
        keys["KeyD"]
    ) right++;


    if (
        keys["KeyA"]
    ) right--;


    const moving =
        forward ||
        right;


    const sprint =
        keys["ShiftLeft"] ||
        keys["ShiftRight"];


    const maxStamina =
        100 +
        Number(
            localStorage.getItem(
                "maxStaminaBonus"
            ) || 0
        );


    const speed =
        sprint &&
        player.stamina > 0
            ? player.sprintSpeed
            : player.speed;


    if (
        sprint &&
        moving &&
        player.stamina > 0
    ) {

        player.stamina -=
            35 * delta;

    } else {

        player.stamina +=
            25 * delta;

    }


    player.stamina =
        THREE.MathUtils.clamp(
            player.stamina,
            0,
            maxStamina
        );


    const forwardVector =
        new THREE.Vector3();


    camera.getWorldDirection(
        forwardVector
    );


    forwardVector.y =
        0;


    if (
        forwardVector.lengthSq()
    ) {

        forwardVector.normalize();

    }


    const rightVector =
        new THREE.Vector3(
            -forwardVector.z,
            0,
            forwardVector.x
        );


    const desired =
        new THREE.Vector3();


    desired.addScaledVector(
        forwardVector,
        forward
    );


    desired.addScaledVector(
        rightVector,
        right
    );


    if (
        desired.lengthSq()
    ) {

        desired.normalize();

    }


    const acceleration =
        player.grounded
            ? 120
            : 45;


    player.velocity.x =
        moveToward(
            player.velocity.x,
            desired.x * speed,
            acceleration * delta
        );


    player.velocity.z =
        moveToward(
            player.velocity.z,
            desired.z * speed,
            acceleration * delta
        );


    if (
        !moving &&
        player.grounded
    ) {

        player.velocity.x =
            moveToward(
                player.velocity.x,
                0,
                100 * delta
            );


        player.velocity.z =
            moveToward(
                player.velocity.z,
                0,
                100 * delta
            );

    }


    player.velocity.y -=
        32 * delta;


    camera.position.add(
        player.velocity
            .clone()
            .multiplyScalar(
                delta
            )
    );


    if (
        camera.position.y <=
        player.height
    ) {

        camera.position.y =
            player.height;


        player.velocity.y =
            0;


        player.grounded =
            true;

    } else {

        player.grounded =
            false;

    }


    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -37,
            37
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -37,
            37
        );


    const staminaBar =
        document.getElementById(
            "staminaBar"
        );


    if (staminaBar) {

        staminaBar.style.width =
            (
                player.stamina /
                maxStamina *
                100
            ) + "%";

    }

}


/* ============================================================
   BROKER PORTAL TELEPORT
============================================================ */

function checkBrokerPortal() {

    if (
        !controls.isLocked ||
        isShopOpen()
    ) {

        return;

    }


    const distance =
        camera.position.distanceTo(
            brokerPortal.position
        );


    if (
        distance < 4
    ) {

        camera.position.set(
            0,
            player.height,
            -62
        );


        player.velocity.set(
            0,
            0,
            0
        );

    }

}


/* ============================================================
   SPAWN
============================================================ */

function spawnEnemy() {

    const alive =
        enemies.filter(
            enemy =>
                enemy.alive
        ).length;


    if (
        alive >= 8
    ) {

        return;

    }


    let position;


    do {

        position =
            new THREE.Vector3(

                THREE.MathUtils.randFloat(
                    -30,
                    30
                ),

                0,

                THREE.MathUtils.randFloat(
                    -30,
                    30
                )

            );

    } while (
        position.distanceTo(
            camera.position
        ) < 12
    );


    createEnemy(
        scene,
        position
    );

}


for (
    let i = 0;
    i < 5;
    i++
) {

    spawnEnemy();

}


/* ============================================================
   PLAYER DAMAGE
============================================================ */

function damagePlayer(
    amount
) {

    if (
        !player.alive
    ) {

        return;

    }


    player.health -=
        amount;


    player.health =
        Math.max(
            0,
            player.health
        );


    const health =
        document.getElementById(
            "health"
        );


    if (health) {

        health.textContent =
            Math.ceil(
                player.health
            );

    }


    const flash =
        document.getElementById(
            "damageFlash"
        );


    if (flash) {

        flash.style.background =
            "rgba(255,0,0,.3)";


        setTimeout(
            () => {

                flash.style.background =
                    "rgba(255,0,0,0)";

            },
            100
        );

    }


    if (
        player.health <= 0
    ) {

        player.alive =
            false;


        controls.unlock();


        const deathScreen =
            document.getElementById(
                "deathScreen"
            );


        if (deathScreen) {

            deathScreen.style.display =
                "flex";

        }

    }

}


/* ============================================================
   START / PAUSE
============================================================ */

const startScreen =
    document.getElementById(
        "startScreen"
    );

const pauseScreen =
    document.getElementById(
        "pauseScreen"
    );

const deathScreen =
    document.getElementById(
        "deathScreen"
    );


if (startScreen) {

    startScreen.onclick =
        () => {

            controls.lock();

        };

}


if (pauseScreen) {

    pauseScreen.onclick =
        () => {

            controls.lock();

        };

}


if (deathScreen) {

    deathScreen.onclick =
        () => {

            location.reload();

        };

}


controls.addEventListener(
    "lock",
    () => {

        if (startScreen) {

            startScreen.style.display =
                "none";

        }


        if (pauseScreen) {

            pauseScreen.style.display =
                "none";

        }

    }
);


controls.addEventListener(
    "unlock",
    () => {

        if (
            player.alive &&
            !isShopOpen()
        ) {

            if (pauseScreen) {

                pauseScreen.style.display =
                    "flex";

            }

        }

    }
);


/* ============================================================
   RESIZE
============================================================ */

addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth /
            innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );

    }
);


/* ============================================================
   INITIALIZE
============================================================ */

equip(
    "revolver"
);


initShop(
    scene,
    camera
);


/* ============================================================
   GAME LOOP
============================================================ */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    if (
        controls.isLocked &&
        player.alive &&
        !isShopOpen()
    ) {

        updatePlayer(
            delta
        );


        updateGun(
            delta
        );


        updateEnemies(
            delta,
            camera,
            scene,
            damagePlayer
        );


        updateProjectiles(
            delta,
            camera,
            scene,
            damagePlayer
        );

    } else {

        updateGun(
            delta
        );

    }


    /*
        Broker systems
    */

    updateShop(
        delta
    );


    checkBrokerPortal();


    checkShopInteraction();


    /*
        Animate portal
    */

    const time =
        performance.now() *
        .001;


    portalFrame.rotation.z =
        time;


    portalFrame.scale.setScalar(
        1 +
        Math.sin(time * 3) *
        .08
    );


    portalLight.intensity =
        12 +
        Math.sin(time * 5) *
        4;


    renderer.render(
        scene,
        camera
    );

}


updateWeaponHUD();

animate();
