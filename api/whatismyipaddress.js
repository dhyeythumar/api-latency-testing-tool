import { httpMiddleware } from "../src/middlewares.js";

//* GET endpoint for getting server's IP
//* usage: /whatismyipaddress
const handler = async (req, res) => {
    // req.socket.remoteAddress will mostly give local/private IP address
    res.status(200).json({
        ip: req.headers["x-real-ip"] || req.socket.remoteAddress,
    });
};

export default httpMiddleware(handler, "GET");
