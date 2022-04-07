const path = require("path");
const https = require('https');
const app = require('express')();
const fs = require("fs");
const process = require("process");
const Logger = require("./modules/logger");
const Glove = require("./modules/glove");

/** HTTP -> HTTPS redirection **/
Logger.info("Creating http -> https redirection ...")
require("http").createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(80).on("listening", () => {Logger.success("Redirection listening on port 80");});

/** HTTPS credentials loading **/
Logger.info("Loading credentials ...");
const credentials = {
    key: fs.readFileSync(__dirname+"/credentials/key.pem", "utf-8"),
    cert: fs.readFileSync(__dirname+"/credentials/cert.pem", "utf-8")
}

/** Server creation **/
Logger.info("Creating server ...");
const server = https.createServer(credentials, app);
server.on("listening", () => {
    Logger.success("Server listening on port "+server.address().port);
});
server.listen(443);

/** Default server route **/
app.get('/*', (req, res) => {
    let route = req.url;
    if (req.url == "/") route = "/index.html";
    route = route.split("?")[0];
    route = path.resolve(__dirname+"/../client"+route);
    res.sendFile(route);
});

/** Glove interface setup **/
Logger.info("Setting up Glove Interface ...");
Glove.setup(server);
Logger.success("Glove Interface successfully set up");

/** CTRL+C Signal handling **/
// process.on("SIGINT", (signal) => {
//     Logger.info("Received signal "+signal+", Shutting down ...");
//     server.close(() => {
//         Logger.success("Server closed");
//         Logger.info("Closing glove interface ...");
//         Glove.shutdown();
//         Logger.success("Glove interface closed");
//         process.exit(0);
//     });
//     Logger.info("Closing server ...");
// });