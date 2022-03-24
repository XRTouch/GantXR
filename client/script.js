import * as THREE from 'https://unpkg.com/three@0.126.0/build/three.module.js';
import * as Loader from "./3DLoader.js";
import { Player } from "./Player.js";



const scene = new THREE.Scene();
scene.background = new THREE.Color(0x59abba);
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer  = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.5;
document.body.appendChild(renderer.domElement);

camera.position.set(0, 1.8, 0);
camera.lookAt(-1, 1.4, 0);

renderer.setAnimationLoop(render);

//creation du joueur 
const player = new Player();
player.attachCamera(camera);

//load 3D models
Loader.setScene(scene);
Loader.loadModel("./model/map.glb");
Loader.loadModel("./model/porte.glb");


//light
const yo = new THREE.AmbientLight(0x404040, 5); // soft white light
scene.add(yo);
var light = new THREE.PointLight(0xffffff, 2.5, 100);
light.castShadow = true;
light.position.set(0, 5, 0);
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);
renderer.setAnimationLoop(render);

let last = 0;
function render(time){
    let dt = (time - last)/1000;
    last = time;
    renderer.render(scene, camera);

    player.update(dt);
    //let lookPos = player.getLookPos();
    //ciseaux.setPosition(lookPos.x, lookPos.y, lookPos.z);
    //ciseaux.setRotation(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    // ciseaux.setRotation(0, 1.05, 0)
    // ciseaux.modele.translateY(-0.2);
    // ciseaux.update(dt);
}