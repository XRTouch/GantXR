import * as THREE from 'https://unpkg.com/three@0.126.0/build/three.module.js';
let keys = {z: 0, q: 0, s: 0, d: 0};
let mouseDelta = {x: 0, y: 0};

function updateKey(code, state) {
    keys[code] = state;
}

window.addEventListener("keydown", ev => {
    let k = ev.key.toLowerCase();
    switch (k) {
        case "z":
        case "q":
        case "s":
        case "d":
            updateKey(ev.key, 1);
            break;
        default: break;
    }
});

window.addEventListener("keyup", ev => {
    let k = ev.key.toLowerCase();
    switch (k) {
        case "z":
        case "q":
        case "s":
        case "d":
            updateKey(ev.key, 0);
            break;
        default: break;
    }
});

window.addEventListener("mousemove", ev => {
    mouseDelta.x += ev.movementX;
    mouseDelta.y += ev.movementY;
});

export class Player {
    constructor() {
        this.group = new THREE.Group();
        this.camRot = {x: 0, y: 0};
        this.camera = null;
        this.speed = 2;
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    setRotation(x, y, z) {
        this.group.rotation.set(x, y, z);
    }

    getLookPos() {
        // TODO
        return  {
            x : 0,
            y : 0,
            z : 0
        };
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    attachCamera(camera) {
        if (this.camera != null) this.detachCamera();
        this.camera = camera;
        this.group.add(camera);
    }

    detachCamera() {
        if (this.camera == null) return;
        this.group.remove(this.camera);
        this.camera = null;
    }

    update(dt) {
        // change camera and player orientation
        this.camRot.x += mouseDelta.x * 0.01;
        this.camRot.y += mouseDelta.y * 0.01;
        mouseDelta = {x: 0, y: 0};
        this.camera.lookAt(1, 1, 1);
        this.camera.rotation.set(-this.camRot.y, 0, 0)
        this.group.rotation.set(0, -this.camRot.x, 0);
        
        const moveX = keys["d"] - keys["q"];
        const moveY = keys["s"] - keys["z"];
        this.group.translateX(moveX * this.speed * dt);
        this.group.translateZ(moveY * this.speed * dt);
    }
}