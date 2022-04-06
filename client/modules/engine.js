import * as THREE from 'https://unpkg.com/three@0.126.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.126.0/examples/jsm/webxr/VRButton.js';
import {RGBELoader} from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/RGBELoader.js';
import Logger from './logger.js';

class Engine {
    static scene = null
    static camera = null;
    static renderer = null;
    static lastFrameTime = 0;
    static initialized = false;
    static startupDone = false;
    static renderCallback = () => {};

    static XRSession = null;
    static XRSpace = null;
    static XRFrame = null;
    static player = null;

    static lastError = null;

    static init() {
        if (this.initialized) return;
        this.initialized = true;
        
        /** Renderer **/
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 6;
        this.renderer.xr.enabled = true;

        this.renderer.setAnimationLoop(this.renderScene);
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton.createButton(this.renderer));
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        
        /** Scene **/
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x4c6e63);
        if (false) // hdr background doesn't work in vr (don't know why)
            new RGBELoader().load("./model/background.hdr", (rect, data) => {
                let cube = pmremGenerator.fromEquirectangular(rect);
                pmremGenerator.compileCubemapShader();
                this.scene.background = cube.texture;
                // this.scene.environment = cube.texture;
                pmremGenerator.dispose();
            });

        /** Camera **/
        this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.8, 0);
        this.camera.lookAt(0, 1.3, -1);

        /** Lights **/
        var hemiLight = new THREE.HemisphereLight( 0x204680, 0x805340, 0.6 );
        hemiLight.position.set( 0, 500, 0 );
        
        var dirLight = new THREE.DirectionalLight( 0xffe796, 1 );
        dirLight.position.set( 10, 20, 13 );
        
        this.scene.add( hemiLight );
        this.scene.add( dirLight );

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024;

        dirLight.shadow.camera.top = 3;
        dirLight.shadow.camera.bottom = -3;
        dirLight.shadow.camera.left = -3;
        dirLight.shadow.camera.right = 5;
        dirLight.shadow.camera.near = 15;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.bias = -0.000001;

        this.player = new THREE.Group();
        this.player.add(this.camera);
        this.scene.add(this.player);

        /** Window resize **/
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    static startup() {
        this.startupDone = true;
        this.XRSession = this.renderer.xr.getSession();
        this.XRSession.requestReferenceSpace('bounded-floor').then((refSpace) => {
            Engine.XRSpace = refSpace;
        });
        this.player.position.set(0, 0, -1.4);
    }

    static renderScene(time, frame) {
        Engine.XRFrame = frame;
        if (!Engine.startupDone && Engine.isInVR()) {
            Engine.startup();
        }

        let dt = (time - Engine.lastFrameTime)/1000;
        Engine.lastFrameTime = time;

        try {Engine.renderCallback(dt, frame);}
        catch(e) {
            const errstr = e.toString();
            if (Engine.lastError != errstr) {
                Engine.lastError = errstr;
                Logger.error(e);
            }
        }

        Engine.renderer.render(Engine.scene, Engine.camera);
    }

    static setRenderCallback(callback) {
        this.renderCallback = callback;
    }

    static getCamera() {
        return this.camera;
    }

    static getScene() {
        return this.scene;
    }

    static getXRSpace() {
        return this.XRSpace;
    }

    static getXRSession() {
        return this.XRSession;
    }

    static getXRFrame() {
        return this.XRFrame;
    }

    static getPlayer() {
        return this.player;
    }

    static isInVR() {
        return this.renderer.xr.isPresenting;
    }

    static createCube(pos, size, color) {
        const obj = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            Engine.createMaterial({color: color})
        );
        obj.position.set(pos.x, pos.y, pos.z);
        obj.castShadow = true; obj.receiveShadow = true;
        return obj;
    }

    static createMaterial(properties) {
        return new THREE.MeshPhongMaterial(properties);
    }
}

export default Engine;