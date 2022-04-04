import Engine from "./modules/engine.js";
import * as Loader from "./3DLoader.js";
import Hands from "./modules/hands.js";
import Logger from "./modules/logger.js";
import * as socket from "./modules/socket.js";

socket.init();
Logger.info("Intializing engine ...");
try {
    Engine.init();
    Loader.setScene(Engine.getScene());
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
    _fps += (1/dt - _fps) * dt;
    fpsCounter.innerHTML = "FPS: " + Math.round(_fps);

    Hands.update(dt);
});