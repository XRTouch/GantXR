const process = require("process");
const Logger = require("./logger");
const GloveInterface = require("../../gant/interface/GloveInterface");
const { SOCKET_EVENT } = require("./constants");

function setup(server) {
    const io = require("socket.io")(server);

    if (process.argv[2] != undefined) GloveInterface.init(process.argv[2]);
    else GloveInterface.init();

    GloveInterface.setAmplitude(10);
    io.on("connection", socket => {
        Logger.socket("Client connected", socket);
        socket.on("disconnect", () => {
            Logger.socket("Client disconnected", socket);
        });

        socket.on(SOCKET_EVENT.SET_INDEX_FORCE, force => {
            Logger.info("Index force: "+force);
            // GloveInterface.setIndexForce(force);
        });
        socket.on(SOCKET_EVENT.SET_THUMB_FORCE, force => {
            Logger.info("Thumb force: "+force);
            // GloveInterface.setThumbForce(force);
        });
        socket.on(SOCKET_EVENT.LOG_MSG, msg => {
            Logger.socket(msg, socket);
        });
    });
}

function shutdown() {
    //GloveInterface.close();
}

module.exports = {setup, shutdown};