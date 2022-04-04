import { SOCKET_EVENT } from "./constants.js";
import * as socket from "./socket.js";

export function setup() {
    if (socket.getSocket() == null) socket.init();
}

/**
 * Sets the glove's thumb motor force
 * @param {number} force The motor's force (-1 - 1)
 */
 function setThumbForce(force) {
    socket.getSocket().emit(SOCKET_EVENT.SET_INDEX_FORCE, force);
}

/**
 * Sets the glove's thumb motor force
 * @param {number} force The motor's force (-1 - 1)
 */
function setIndexForce(force) {
    socket.getSocket().emit(SOCKET_EVENT.SET_THUMB_FORCE, force);
}