import * as THREE from "three";

/* ============================================================
   THE BROKER SHOP
============================================================ */

let scene;
let camera;

let brokerRoom = null;
let broker = null;
let shopOpen = false;

let blood = Number(
    localStorage.getItem("blood") || 0
);

const purchases = JSON.parse(
    localStorage.getItem("brokerPurchases") || "{}"
);


/* ============================================================
   INITIALIZE
============================================================ */

export function initShop(
    gameScene,
    gameCamera
) {

    scene = gameScene;
    camera = gameCamera;

    createBrokerRoom();
    createBroker();
    createShopUI();

    updateBloodHUD();

}


/* ============================================================
   BLOOD
============================================================ */

export function addBlood(amount) {

    blood += Math.max(0, Math.floor(amount));

    localStorage.setItem(
        "blood",
        blood
    );

    updateBloodHUD();

}


export function getBlood() {

    return blood;

}


/* ============================================================
   SHOP ROOM
============================================================ */

function createBrokerRoom() {

    brokerRoom =
        new THREE.Group();

    brokerRoom.visible = true;

    /*
        The shop is placed far away from
        the main arena.
    */

    const roomX = 0;
    const roomZ = -70;

    brokerRoom.position.set(
        roomX,
        0,
        roomZ
    );

    scene.add(
        brokerRoom
    );


    const wallMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x09090e,

            roughness: .25,

            metalness: .8

        });


    const floorMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x16161d,

            roughness: .35,

            metalness: .65

        });


    // Floor

    const floor =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                .5,
                24
            ),

            floorMaterial

        );


    floor.position.y =
        -.25;


    floor.receiveShadow =
        true;


    brokerRoom.add(
        floor
    );


    // Back wall

    const back =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                10,
                .5
            ),

            wallMaterial

        );


    back.position.set(
        0,
        5,
        -12
    );


    brokerRoom.add(
        back
    );


    // Side walls

    const left =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .5,
                10,
                24
            ),

            wallMaterial

        );


    left.position.set(
        -12,
        5,
        0
    );


    brokerRoom.add(
        left
    );


    const right =
        left.clone();


    right.position.x =
        12;


    brokerRoom.add(
        right
    );


    // Ceiling

    const ceiling =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                24,
                .5,
                24
            ),

            wallMaterial

        );


    ceiling.position.y =
        10;


    brokerRoom.add(
        ceiling
    );


    // Red lights

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const light =
            new THREE.PointLight(
                0xff003c,
                8,
                10
            );


        light.position.set(
            i * 7,
            7,
            -8
        );


        brokerRoom.add(
            light
        );

    }


    // Strange cyan light behind Broker

    const cyanLight =
        new THREE.PointLight(
            0x00ffff,
            12,
            12
        );


    cyanLight.position.set(
        0,
        5,
        -8
    );


    brokerRoom.add(
        cyanLight
    );

}


/* ============================================================
   BROKER MODEL
============================================================ */

function createBroker() {

    broker =
        new THREE.Group();


    broker.position.set(
        0,
        0,
        -8
    );


    brokerRoom.add(
        broker
    );


    const black =
        new THREE.MeshStandardMaterial({

            color: 0x020204,

            roughness: .15,

            metalness: .8

        });


    const body =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                1.1,
                1.5,
                4.5,
                12
            ),

            black

        );


    body.position.y =
        2.3;


    body.castShadow =
        true;


    broker.add(
        body
    );


    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                1.05,
                16,
                16
            ),

            black

        );


    head.position.y =
        5.1;


    broker.add(
        head
    );


    /*
        The Broker has no visible mouth.
        Only two glowing eyes.
    */

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff174f
        });


    for (
        const x of [-.34, .34]
    ) {

        const eye =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .13,
                    8,
                    8
                ),

                eyeMaterial

            );


        eye.position.set(
            x,
            5.2,
            -.95
        );


        broker.add(
            eye
        );

    }


    // Counter

    const counter =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                8,
                1.2,
                2
            ),

            new THREE.MeshStandardMaterial({

                color: 0x12121a,

                metalness: .8,

                roughness: .25

            })

        );


    counter.position.set(
        0,
        1,
        -5.5
    );


    brokerRoom.add(
        counter
    );


    // Floating symbol

    const symbol =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                1.5,
                .08,
                8,
                32
            ),

            new THREE.MeshBasicMaterial({
                color: 0xff003c
            })

        );


    symbol.position.set(
        0,
        6.5,
        -8
    );


    brokerRoom.add(
        symbol
    );


    broker.userData.symbol =
        symbol;

}


/* ============================================================
   BROKER ANIMATION
============================================================ */

export function updateShop(
    delta
) {

    if (!broker) {

        return;

    }


    const time =
        performance.now() *
        .001;


    broker.position.y =
        Math.sin(time * 1.5) *
        .04;


    if (
        broker.userData.symbol
    ) {

        broker.userData.symbol.rotation.z +=
            delta * .8;

    }

}


/* ============================================================
   INTERACTION
============================================================ */

export function checkShopInteraction() {

    if (!camera) {

        return;

    }


    const brokerPosition =
        new THREE.Vector3();


    broker.getWorldPosition(
        brokerPosition
    );


    const distance =
        camera.position.distanceTo(
            brokerPosition
        );


    if (
        distance < 8 &&
        !shopOpen
    ) {

        showInteraction();

    } else {

        hideInteraction();

    }

}


function showInteraction() {

    const prompt =
        document.getElementById(
            "shopPrompt"
        );

    if (!prompt) {

        return;

    }


    prompt.style.display =
        "block";

}


function hideInteraction() {

    const prompt =
        document.getElementById(
            "shopPrompt"
        );

    if (!prompt) {

        return;

    }


    prompt.style.display =
        "none";

}


/* ============================================================
   OPEN / CLOSE
============================================================ */

export function interactShop() {

    if (shopOpen) {

        closeShop();

        return;

    }


    const brokerPosition =
        new THREE.Vector3();


    broker.getWorldPosition(
        brokerPosition
    );


    if (
        camera.position.distanceTo(
            brokerPosition
        ) > 8
    ) {

        return;

    }


    openShop();

}


function openShop() {

    shopOpen =
        true;


    const menu =
        document.getElementById(
            "shopMenu"
        );


    if (!menu) {

        return;

    }


    menu.style.display =
        "flex";


    updateShopUI();

}


function closeShop() {

    shopOpen =
        false;


    const menu =
        document.getElementById(
            "shopMenu"
        );


    if (menu) {

        menu.style.display =
            "none";

    }

}


/* ============================================================
   SHOP UI
============================================================ */

function createShopUI() {

    /*
        Interaction prompt
    */

    const prompt =
        document.createElement(
            "div"
        );


    prompt.id =
        "shopPrompt";


    prompt.innerHTML =
        "PRESS <b>E</b> TO SPEAK WITH THE BROKER";


    prompt.style.cssText = `

        position:fixed;
        left:50%;
        bottom:14%;
        transform:translateX(-50%);
        color:#ffffff;
        font-family:monospace;
        font-size:16px;
        letter-spacing:2px;
        background:rgba(0,0,0,.75);
        padding:12px 20px;
        border:1px solid #ff174f;
        display:none;
        z-index:100;

    `;


    document.body.appendChild(
        prompt
    );


    /*
        Shop menu
    */

    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "shopMenu";


    menu.style.cssText = `

        position:fixed;
        inset:0;
        display:none;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.82);
        z-index:200;
        font-family:monospace;
        color:white;

    `;


    menu.innerHTML = `

        <div id="shopPanel"

            style="
                width:min(850px,90vw);
                max-height:85vh;
                overflow:auto;
                background:#08080d;
                border:2px solid #ff174f;
                box-shadow:
                    0 0 40px rgba(255,0,60,.25);
                padding:30px;
            "

        >

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <div style="
                        color:#ff174f;
                        font-size:28px;
                        font-weight:bold;
                    ">
                        THE BROKER
                    </div>

                    <div style="
                        color:#666;
                        margin-top:6px;
                    ">
                        BUY. SELL. TRADE.
                    </div>

                </div>

                <div style="
                    color:#ff174f;
                    font-size:22px;
                ">
                    🩸 <span id="shopBlood">0</span>
                </div>

            </div>


            <div id="brokerDialogue"

                style="
                    margin:25px 0;
                    padding:15px;
                    background:#101016;
                    border-left:3px solid #ff174f;
                    color:#bbb;
                    line-height:1.6;
                "

            ></div>


            <div id="shopItems"></div>


            <button id="closeShop"

                style="
                    width:100%;
                    margin-top:20px;
                    padding:14px;
                    background:#111118;
                    color:white;
                    border:1px solid #444;
                    cursor:pointer;
                    font-family:monospace;
                    font-size:16px;
                "

            >
                LEAVE
            </button>

        </div>

    `;


    document.body.appendChild(
        menu
    );


    document
        .getElementById(
            "closeShop"
        )
        .onclick =
        closeShop;


    /*
        Blood HUD
    */

    const bloodHUD =
        document.createElement(
            "div"
        );


    bloodHUD.id =
        "bloodHUD";


    bloodHUD.innerHTML =
        `🩸 BLOOD: <span id="bloodAmount">${blood}</span>`;


    bloodHUD.style.cssText = `

        position:fixed;
        left:30px;
        top:120px;
        color:#ff174f;
        font-family:monospace;
        font-weight:bold;
        font-size:16px;
        z-index:20;
        text-shadow:0 0 8px #ff174f;

    `;


    document.body.appendChild(
        bloodHUD
    );

}


/* ============================================================
   SHOP ITEMS
============================================================ */

const items = [

    {
        id: "revolverDamage",
        name: "DEAD EYE",
        description:
            "Increase revolver damage.",
        price: 500
    },

    {
        id: "shotgunDamage",
        name: "HEAVIER SHELLS",
        description:
            "Increase shotgun damage.",
        price: 750
    },

    {
        id: "dash",
        name: "OVERCLOCKED NERVES",
        description:
            "Dash cooldown becomes shorter.",
        price: 1000
    },

    {
        id: "health",
        name: "SECOND HEART",
        description:
            "Increase maximum health by 25.",
        price: 1200
    },

    {
        id: "stamina",
        name: "ADRENAL SYSTEM",
        description:
            "Increase maximum stamina.",
        price: 900
    },

    {
        id: "unknown",
        name: "UNKNOWN",
        description:
            "The Broker refuses to explain this.",
        price: 5000
    }

];


/* ============================================================
   DRAW ITEMS
============================================================ */

function updateShopUI() {

    updateBloodHUD();


    const container =
        document.getElementById(
            "shopItems"
        );


    const dialogue =
        document.getElementById(
            "brokerDialogue"
        );


    if (!container) {

        return;

    }


    dialogue.textContent =
        getBrokerDialogue();


    container.innerHTML =
        "";


    for (
        const item of items
    ) {

        const purchased =
            purchases[item.id];


        const button =
            document.createElement(
                "button"
            );


        button.style.cssText = `

            width:100%;
            text-align:left;
            padding:18px;
            margin:7px 0;
            background:
                ${purchased
                    ? "#17171d"
                    : "#0d0d13"};
            color:white;
            border:
                1px solid
                ${purchased
                    ? "#333"
                    : "#292933"};
            cursor:
                ${purchased
                    ? "default"
                    : "pointer"};
            font-family:monospace;

        `;


        button.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
            ">

                <span style="
                    color:
                    ${purchased
                        ? "#555"
                        : "#ff174f"};
                    font-size:17px;
                    font-weight:bold;
                ">
                    ${item.name}
                </span>

                <span>
                    ${purchased
                        ? "PURCHASED"
                        : "🩸 " + item.price}
                </span>

            </div>

            <div style="
                color:#777;
                margin-top:7px;
            ">
                ${item.description}
            </div>

        `;


        if (!purchased) {

            button.onclick =
                () => {

                    buyItem(
                        item
                    );

                };

        }


        container.appendChild(
            button
        );

    }

}


/* ============================================================
   BUY
============================================================ */

function buyItem(
    item
) {

    if (
        purchases[item.id]
    ) {

        return;

    }


    if (
        blood < item.price
    ) {

        setDialogue(
            "You cannot afford it."
        );

        return;

    }


    blood -=
        item.price;


    purchases[item.id] =
        true;


    localStorage.setItem(
        "blood",
        blood
    );


    localStorage.setItem(
        "brokerPurchases",
        JSON.stringify(
            purchases
        )
    );


    applyUpgrade(
        item.id
    );


    setDialogue(
        getPurchaseDialogue(
            item
        )
    );


    updateShopUI();

}


/* ============================================================
   UPGRADES
============================================================ */

function applyUpgrade(
    id
) {

    /*
        These values are read by game.js
        through localStorage.
    */

    if (
        id === "revolverDamage"
    ) {

        localStorage.setItem(
            "revolverDamageBonus",
            "15"
        );

    }


    if (
        id === "shotgunDamage"
    ) {

        localStorage.setItem(
            "shotgunDamageBonus",
            "12"
        );

    }


    if (
        id === "dash"
    ) {

        localStorage.setItem(
            "dashCooldown",
            "350"
        );

    }


    if (
        id === "health"
    ) {

        localStorage.setItem(
            "maxHealthBonus",
            "25"
        );

    }


    if (
        id === "stamina"
    ) {

        localStorage.setItem(
            "maxStaminaBonus",
            "50"
        );

    }

}


/* ============================================================
   DIALOGUE
============================================================ */

function getBrokerDialogue() {

    const count =
        Object.keys(
            purchases
        ).length;


    if (count === 0) {

        return "You have blood on you. Good.";

    }


    if (
        purchases.unknown
    ) {

        return "You bought the thing you were not supposed to buy.";

    }


    if (count >= 4) {

        return "You are spending blood very quickly.";

    }


    return "Choose carefully. Everything has a price.";

}


function getPurchaseDialogue(
    item
) {

    if (
        item.id === "unknown"
    ) {

        return "The Broker stares at you. Something behind its eyes moves.";

    }


    return "A wise investment. Probably.";

}


function setDialogue(
    text
) {

    const dialogue =
        document.getElementById(
            "brokerDialogue"
        );


    if (dialogue) {

        dialogue.textContent =
            text;

    }

}


/* ============================================================
   BLOOD HUD
============================================================ */

function updateBloodHUD() {

    const amount =
        document.getElementById(
            "bloodAmount"
        );


    const shopAmount =
        document.getElementById(
            "shopBlood"
        );


    if (amount) {

        amount.textContent =
            blood;

    }


    if (shopAmount) {

        shopAmount.textContent =
            blood;

    }

}


/* ============================================================
   SHOP STATE
============================================================ */

export function isShopOpen() {

    return shopOpen;

}
