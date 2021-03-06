import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js';
import Engine from "./engine.js";
const loader = new GLTFLoader();
let scene = null;

export function setScene(s) {
    scene = s;
}

export function loadModel(path) {
    const promise = new Promise((resolve, reject) => {
        if (scene == null) reject("Scene is null");
        loader.load(path, glb => {
            resolve(glb.scene);
            glb.scene.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.material = Engine.createMaterial({
                        color: node.material.color
                    });
                }
            });
            scene.add(glb.scene);
        }, undefined, function (error) {
            reject(error);
        });
    });
    return promise;
}