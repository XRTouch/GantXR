const addon = require("./build/Release/GloveInterface")

/**
 * Initializes the glove interface.
 * @param {number} port Glove's com port (default=COM6)
 */
function init(port="COM6") {
    addon.init(port);
}

/**
 * Sets the glove's motors' amplitude
 * @param {number} amplitude The motors' amplitude (0 - 64)
 */
function setAmplitude(amplitude) {
    addon.setAmplitude(amplitude);
}

/**
 * Sets the glove's thumb motor force
 * @param {number} force The motor's force (-1 - 1)
 */
function setThumbForce(force) {
    addon.setThumbForce(force);
}

/**
 * Sets the glove's thumb motor force
 * @param {number} force The motor's force (-1 - 1)
 */
function setIndexForce(force) {
    addon.setIndexForce(force);
}

/**
 * Closes the glove interface.
 */
function close() {
    addon.close();
}

module.exports = {
    init: init,
    setAmplitude: setAmplitude,
    setThumbForce: setThumbForce,
    setIndexForce: setIndexForce,
    close: close
};