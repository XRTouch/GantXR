import Engine from "./modules/engine.js";
import Physic from "./modules/physic.js";
import * as Loader from "./modules/3DLoader.js";
import Hands from "./modules/hands.js";
import Logger from "./modules/logger.js";
import * as socket from "./modules/socket.js";
import * as Glove from "./modules/glove.js";

socket.init();
Logger.info("Intializing graphic engine ...");
try {
    Engine.init();
    Loader.setScene(Engine.getScene());
    Logger.success("Graphic engine initialized");
} catch(e) {Logger.error(e);}

Logger.info("Intializing physic engine ...");
try {
    Physic.init().then(() => {Logger.success("Physic engine initialized");});
} catch(e) {Logger.error(e);}

Logger.info("Intializing glove ...");
try {
    Glove.setup();
    Logger.success("Glove initialized");
} catch(e) {Logger.error(e);}

Logger.info("Loading map model ...");
Loader.loadModel("./model/map.glb").then(m => {
    Logger.success("Map model loaded");
}).catch(e => Logger.error(e));

const fpsCounter = document.createElement("p");
fpsCounter.classList.add("fps-counter");
document.body.appendChild(fpsCounter);
let _fps = 60;

let player = Engine.getPlayer();
Hands.setModelContainer(player);

Engine.setRenderCallback(dt => {
    if (dt > 2) dt = 0;
    _fps += (1/dt - _fps) * dt;
    fpsCounter.innerHTML = "FPS: " + Math.round(_fps);

    Physic.update(dt);
    Hands.update(dt);
});