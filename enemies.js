import * as THREE from "three";


export const enemies = [];

export const projectiles = [];


/* =====================================
   CREATE ENEMY
===================================== */

export function createEnemy(
    scene,
    position
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.5,
                2.4,
                1.2
            ),

            new THREE.MeshStandardMaterial({

                color: 0x6d0d1d,

                roughness: .4,

                metalness: .7

            })

        );


    body.position.y =
        1.2;

    body.castShadow =
        true;

    group.add(body);


    const head =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1,
                .8,
                .9
            ),

            new THREE.MeshStandardMaterial({

                color: 0x350912,

                emissive: 0x330008

            })

        );


    head.position.y =
        2.75;

    group.add(head);


    const eye =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .65,
                .12,
                .05
            ),

            new THREE.MeshBasicMaterial({

                color: 0xff174f

            })

        );


    eye.position.set(
        0,
        2.75,
        -.46
    );

    group.add(eye);


    const light =
        new THREE.PointLight(
            0xff003c,
            4,
            7
        );


    light.position.y =
        2.5;

    group.add(light);


    group.position.copy(
        position
    );

    scene.add(group);


    const enemy = {

        mesh: group,

        health: 100,

        speed:
            4.5 +
            Math.random() * 2,

        shootTimer:
            1 +
            Math.random() * 2,

        alive: true

    };


    group.traverse(
        object => {

            if (
                object.isMesh
            ) {

                object.userData.enemy =
                    enemy;

            }

        }
    );


    enemies.push(enemy);

    return enemy;
}


/* =====================================
   UPDATE ENEMIES
===================================== */

export function updateEnemies(
    delta,
    camera,
    scene,
    damagePlayer
) {

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.alive
        ) {
            continue;
        }


        const direction =
            new THREE.Vector3();


        direction.subVectors(
            camera.position,
            enemy.mesh.position
        );


        direction.y = 0;


        const distance =
            direction.length();


        direction.normalize();


        if (
            distance > 5
        ) {

            enemy.mesh.position.add(
                direction.multiplyScalar(
                    enemy.speed * delta
                )
            );

        }


        enemy.mesh.lookAt(
            camera.position.x,
            enemy.mesh.position.y,
            camera.position.z
        );


        enemy.shootTimer -=
            delta;


        if (
            enemy.shootTimer <= 0 &&
            distance < 30
        ) {

            enemy.shootTimer =
                1.2 +
                Math.random() * 1.5;

            enemyShoot(
                enemy,
                camera,
                scene
            );

        }


        if (
            distance < 2.2
        ) {

            damagePlayer(
                20 * delta
            );

        }

    }

}


/* =====================================
   ENEMY PROJECTILE
===================================== */

function enemyShoot(
    enemy,
    camera,
    scene
) {

    const projectile =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .18,
                10,
                10
            ),

            new THREE.MeshBasicMaterial({

                color: 0xff174f

            })

        );


    projectile.position.copy(
        enemy.mesh.position
    );


    projectile.position.y +=
        1.6;


    const direction =
        new THREE.Vector3();


    direction.subVectors(
        camera.position,
        projectile.position
    );


    direction.normalize();


    scene.add(
        projectile
    );


    projectiles.push({

        mesh: projectile,

        velocity:
            direction.multiplyScalar(
                16
            ),

        life: 4

    });

}


/* =====================================
   UPDATE PROJECTILES
===================================== */

export function updateProjectiles(
    delta,
    camera,
    scene,
    damagePlayer
) {

    for (
        let i =
            projectiles.length - 1;

        i >= 0;

        i--
    ) {

        const projectile =
            projectiles[i];


        projectile.mesh.position.add(
            projectile.velocity
                .clone()
                .multiplyScalar(
                    delta
                )
        );


        projectile.life -=
            delta;


        if (
            projectile.mesh.position
                .distanceTo(
                    camera.position
                ) < .8
        ) {

            damagePlayer(15);


            scene.remove(
                projectile.mesh
            );


            projectiles.splice(
                i,
                1
            );

            continue;
        }


        if (
            projectile.life <= 0
        ) {

            scene.remove(
                projectile.mesh
            );


            projectiles.splice(
                i,
                1
            );

        }

    }

}
