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


/* ============================================================
   SCENE
============================================================ */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x040408);

scene.fog =
    new THREE.FogExp2(
        0x040408,
        0.024
    );


/* ============================================================
   CAMERA
============================================================ */

const camera =
    new THREE.PerspectiveCamera(
        90,
        innerWidth / innerHeight,
        0.05,
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
        powerPreference: "high-performance"
    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


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

sun.castShadow = true;

scene.add(sun);


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
            roughness: 0.6,
            metalness: 0.5
        })

    );

floor.position.y = -0.5;

floor.receiveShadow = true;

scene.add(floor);


/* ============================================================
   LEVEL
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
                roughness: 0.35,
                metalness: 0.8
            })

        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
}


block(0, 5, -40, 80, 10, 2);
block(0, 5, 40, 80, 10, 2);
block(-40, 5, 0, 2, 10, 80);
block(40, 5, 0, 2, 10, 80);

block(-13, 3, -10, 8, 6, 8);
block(13, 3, -14, 8, 6, 8);
block(-15, 2, 13, 10, 4, 6);
block(15, 4, 14, 8, 8, 8);


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

grid.position.y = 0.01;

scene.add(grid);


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

        keys[event.code] = true;

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
            event.code === "Digit1"
        ) {

            equip("revolver");
        }

        if (
            event.code === "Digit2"
        ) {

            equip("shotgun");
        }

        if (
            event.code === "Digit3"
        ) {

            equip("rocket");
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

        keys[event.code] = false;

    }
);


/* ============================================================
   WEAPON VIEW
============================================================ */

const weaponView =
    new THREE.Group();

camera.add(
    weaponView
);


/*
    IMPORTANT:

    Camera looks down -Z.

    Therefore the gun barrel points
    toward negative Z.
*/

weaponView.position.set(
    0.58,
    -0.48,
    -0.85
);


let currentGun = null;

let currentWeapon =
    "revolver";

let weapon =
    weapons[currentWeapon];

let canFire = true;

let reloading = false;

let gunKick = 0;

let gunBobTime = 0;


/* ============================================================
   MATERIALS
============================================================ */

function metal(color) {

    return new THREE.MeshStandardMaterial({

        color,

        metalness: 0.9,

        roughness: 0.25

    });

}


function glow(color) {

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


    /*
        BODY
    */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.65,
                0.38,
                0.85
            ),

            metal(0x292932)

        );

    gun.add(body);


    /*
        BARREL

        Cylinder starts along Y.

        Rotate X 90° so it points along Z.
    */

    const barrel =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.09,
                0.09,
                1.35,
                16
            ),

            metal(0x111116)

        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.set(
        0,
        0.02,
        -1.0
    );

    gun.add(barrel);


    /*
        MUZZLE
    */

    const muzzle =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.12,
                0.12,
                0.08,
                16
            ),

            metal(0x08080c)

        );

    muzzle.rotation.x =
        Math.PI / 2;

    muzzle.position.z =
        -1.68;

    gun.add(muzzle);


    /*
        CYLINDER
    */

    const cylinder =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.28,
                0.28,
                0.34,
                16
            ),

            metal(0x15151b)

        );

    cylinder.rotation.z =
        Math.PI / 2;

    cylinder.position.z =
        -0.15;

    gun.add(cylinder);


    /*
        ENERGY STRIP
    */

    const energy =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.09,
                0.09,
                0.75
            ),

            glow(0x00ffff)

        );

    energy.position.set(
        0,
        0.22,
        -0.25
    );

    gun.add(energy);


    /*
        GRIP
    */

    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.34,
                0.82,
                0.34
            ),

            metal(0x101016)

        );

    grip.position.set(
        0,
        -0.5,
        0.22
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(-12);

    gun.add(grip);


    /*
        TRIGGER GUARD
    */

    const trigger =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                0.12,
                0.025,
                6,
                16,
                Math.PI
            ),

            metal(0x111116)

        );

    trigger.rotation.x =
        Math.PI / 2;

    trigger.position.set(
        0,
        -0.17,
        0.15
    );

    gun.add(trigger);


    return gun;
}


/* ============================================================
   SHOTGUN
============================================================ */

function createShotgun() {

    const gun =
        new THREE.Group();


    /*
        BODY
    */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                0.48,
                1.15
            ),

            metal(0x28282f)

        );

    gun.add(body);


    /*
        DOUBLE BARREL
    */

    for (
        let i = 0;
        i < 2;
        i++
    ) {

        const barrel =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.11,
                    0.11,
                    1.8,
                    16
                ),

                metal(0x101015)

            );

        barrel.rotation.x =
            Math.PI / 2;

        barrel.position.set(
            i === 0
                ? -0.18
                : 0.18,

            0.08,

            -1.25
        );

        gun.add(barrel);


        const muzzle =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.13,
                    0.13,
                    0.08,
                    16
                ),

                metal(0x08080c)

            );

        muzzle.rotation.x =
            Math.PI / 2;

        muzzle.position.set(
            i === 0
                ? -0.18
                : 0.18,

            0.08,

            -2.16
        );

        gun.add(muzzle);

    }


    /*
        PUMP
    */

    const pump =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.75,
                0.22,
                0.55
            ),

            metal(0x111116)

        );

    pump.position.set(
        0,
        -0.03,
        -0.75
    );

    gun.add(pump);


    /*
        GRIP
    */

    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.38,
                0.85,
                0.38
            ),

            metal(0x101016)

        );

    grip.position.set(
        0,
        -0.58,
        0.3
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(-10);

    gun.add(grip);


    /*
        ENERGY
    */

    const energy =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.09,
                0.09,
                0.7
            ),

            glow(0xffaa00)

        );

    energy.position.set(
        0,
        0.27,
        -0.3
    );

    gun.add(energy);


    return gun;
}


/* ============================================================
   ROCKET LAUNCHER
============================================================ */

function createRocketLauncher() {

    const gun =
        new THREE.Group();


    /*
        BODY
    */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.85,
                0.72,
                1.35
            ),

            metal(0x25252e)

        );

    gun.add(body);


    /*
        BARREL
    */

    const barrel =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.33,
                0.29,
                1.6,
                20
            ),

            metal(0x101015)

        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -1.4;

    gun.add(barrel);


    /*
        RED INNER BARREL
    */

    const inner =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.22,
                0.22,
                0.08,
                20
            ),

            glow(0xff174f)

        );

    inner.rotation.x =
        Math.PI / 2;

    inner.position.z =
        -2.2;

    gun.add(inner);


    /*
        GRIP
    */

    const grip =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.42,
                0.9,
                0.42
            ),

            metal(0x101016)

        );

    grip.position.set(
        0,
        -0.67,
        0.28
    );

    grip.rotation.z =
        THREE.MathUtils.degToRad(-8);

    gun.add(grip);


    /*
        ENERGY STRIP
    */

    const energy =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.1,
                0.1,
                1
            ),

            glow(0xff174f)

        );

    energy.position.set(
        0,
        0.4,
        -0.25
    );

    gun.add(energy);


    return gun;
}


/* ============================================================
   WEAPON FACTORY
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

    return createRevolver();
}


/* ============================================================
   EQUIP
============================================================ */

function equip(name) {

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


    currentGun =
        createWeaponModel(
            weapon.model
        );


    /*
        Make the weapon clearly visible.
    */

    currentGun.scale.set(
        1.15,
        1.15,
        1.15
    );


    weaponView.add(
        currentGun
    );


    updateWeaponHUD();

}


/* ============================================================
   HUD
============================================================ */

function updateWeaponHUD() {

    document
        .getElementById("weaponName")
        .textContent =
        weapon.name;


    document
        .getElementById("ammo")
        .textContent =
        `${weapon.ammo} / ${weapon.reserve}`;

}


/* ============================================================
   RELOAD
============================================================ */

function reload() {

    if (
        reloading ||
        weapon.ammo >= weapon.magazine ||
        weapon.reserve <= 0
    ) {

        return;

    }


    reloading = true;


    document
        .getElementById("weaponName")
        .textContent =
        "RELOADING";


    setTimeout(
        () => {

            const needed =
                weapon.magazine -
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
        weapon.reloadTime * 1000
    );

}


/* ============================================================
   SHOOTING
============================================================ */

addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0 &&
            controls.isLocked &&
            player.alive
        ) {

            shoot();

        }

    }
);


function shoot() {

    if (
        !canFire ||
        reloading
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


    canFire = false;


    setTimeout(
        () => {

            canFire = true;

        },
        weapon.fireRate * 1000
    );


    /*
        VISUAL RECOIL ONLY
    */

    gunKick =
        0.10 +
        weapon.recoil * 0.06;


    muzzleFlash();


    for (
        let i = 0;
        i < weapon.pellets;
        i++
    ) {

        fireRay();

    }


    if (
        weapon.ammo <= 0
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
            0.5
        ) *
        weapon.spread;


    direction.y +=
        (
            Math.random() -
            0.5
        ) *
        weapon.spread;


    direction.z +=
        (
            Math.random() -
            0.5
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
        hits.length === 0
    ) {

        return;

    }


    const enemy =
        hits[0]
            .object
            .userData
            .enemy;


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


    blood(position);


    if (
        weapon.explosive
    ) {

        explosion(position);

        explosionDamage(position);

    }


    if (
        enemy.health <= 0
    ) {

        kill(enemy);

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

            enemy.health -=
                100 *
                (
                    1 -
                    distance /
                    weapon.explosionRadius
                );


            if (
                enemy.health <= 0
            ) {

                kill(enemy);

            }

        }

    }

}


/* ============================================================
   KILLS
============================================================ */

let kills = 0;


function kill(enemy) {

    if (
        !enemy.alive
    ) {

        return;

    }


    enemy.alive = false;

    kills++;


    document
        .getElementById("kills")
        .textContent =
        `KILLS: ${kills}`;


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
   EXPLOSION EFFECT
============================================================ */

function explosion(
    position
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true
        });


    const sphere =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.3,
                8,
                8
            ),
            material
        );


    sphere.position.copy(
        position
    );


    scene.add(sphere);


    const light =
        new THREE.PointLight(
            0xff5500,
            40,
            12
        );


    light.position.copy(
        position
    );


    scene.add(light);


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
            40 * (1 - t);


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
   BLOOD
============================================================ */

function blood(position) {

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const particle =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.05,
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
                    0.5
                ) * 6,

                Math.random() * 5,

                (
                    Math.random() -
                    0.5
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
                        0.016
                    )
            );


            velocity.y -=
                0.3;


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
            35,
            8
        );


    light.position.set(
        0,
        0,
        -2
    );


    currentGun.add(
        light
    );


    setTimeout(
        () => {

            if (
                currentGun
            ) {

                currentGun.remove(
                    light
                );

            }

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


    element.style.transform =
        "translate(-50%, -50%) scale(1)";


    element.style.opacity =
        "1";


    setTimeout(
        () => {

            element.style.transform =
                "translate(-50%, -50%) scale(0)";


            element.style.opacity =
                "0";

        },
        100
    );

}


/* ============================================================
   WEAPON ANIMATION
============================================================ */

function updateGun(
    delta
) {

    if (
        !currentGun
    ) {

        return;

    }


    /*
        Smooth recoil recovery.
    */

    gunKick =
        THREE.MathUtils.lerp(
            gunKick,
            0,
            16 * delta
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
            delta * 11;

    }


    const bobX =
        moving
            ? Math.sin(
                gunBobTime
            ) * 0.025
            : 0;


    const bobY =
        moving
            ? Math.abs(
                Math.cos(
                    gunBobTime
                )
            ) * 0.02
            : 0;


    /*
        Weapon position.

        Recoil pushes it toward camera
        by increasing Z.
    */

    weaponView.position.x =
        0.58 +
        bobX;


    weaponView.position.y =
        -0.48 +
        bobY;


    weaponView.position.z =
        -0.85 +
        gunKick;


    /*
        Weapon itself tilts.

        Camera DOES NOT tilt.
    */

    weaponView.rotation.x =
        gunKick * 1.8;


    weaponView.rotation.z =
        bobX * 1.5;

}


/* ============================================================
   DASH
============================================================ */

function dash() {

    if (
        !controls.isLocked ||
        !player.canDash
    ) {

        return;

    }


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    direction.y = 0;


    if (
        direction.lengthSq() > 0
    ) {

        direction.normalize();

    }


    player.velocity.addScaledVector(
        direction,
        player.dash
    );


    player.canDash = false;


    setTimeout(
        () => {

            player.canDash = true;

        },
        600
    );

}


/* ============================================================
   MOVEMENT
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

    let forward = 0;

    let right = 0;


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
            100
        );


    const forwardVector =
        new THREE.Vector3();


    camera.getWorldDirection(
        forwardVector
    );


    forwardVector.y = 0;


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


    document
        .getElementById(
            "staminaBar"
        )
        .style.width =
        `${player.stamina}%`;

}


/* ============================================================
   ENEMY SPAWNING
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


    document
        .getElementById(
            "health"
        )
        .textContent =
        Math.ceil(
            player.health
        );


    const flash =
        document.getElementById(
            "damageFlash"
        );


    flash.style.background =
        "rgba(255,0,0,.3)";


    setTimeout(
        () => {

            flash.style.background =
                "rgba(255,0,0,0)";

        },
        100
    );


    if (
        player.health <= 0
    ) {

        player.alive = false;

        controls.unlock();

        document
            .getElementById(
                "deathScreen"
            )
            .style.display =
            "flex";

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


startScreen.onclick =
    () => {

        controls.lock();

    };


pauseScreen.onclick =
    () => {

        controls.lock();

    };


deathScreen.onclick =
    () => {

        location.reload();

    };


controls.addEventListener(
    "lock",
    () => {

        startScreen.style.display =
            "none";

        pauseScreen.style.display =
            "none";

    }
);


controls.addEventListener(
    "unlock",
    () => {

        if (
            player.alive
        ) {

            pauseScreen.style.display =
                "flex";

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
   START WEAPON
============================================================ */

equip(
    "revolver"
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
            0.05
        );


    if (
        controls.isLocked &&
        player.alive
    ) {

        updatePlayer(delta);

        updateGun(delta);

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

        updateGun(delta);

    }


    renderer.render(
        scene,
        camera
    );

}


updateWeaponHUD();

animate();
