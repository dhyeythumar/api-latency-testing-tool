import { httpMiddleware, authMiddleware } from "../src/middlewares.js";

//! internal GET endpoint for getting server's IP
//* usage: /whatismyipaddress
const handler = async (req, res) => {
    // req.socket.remoteAddress will mostly give local/private IP address
    return res.status(200).json({
        ip: req.headers["x-real-ip"] || req.socket.remoteAddress,
    });
};

export default httpMiddleware(authMiddleware, handler, "GET");
