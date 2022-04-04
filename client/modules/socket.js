let socket = null;

function init() {
    socket = io();
}

function setSocket(s) {
    socket = s;
}

function getSocket() {
    return socket;
}

export {setSocket, getSocket, init};