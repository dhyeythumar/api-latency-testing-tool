import { httpMiddleware, authMiddleware } from "../src/middlewares.js";

//! internal POST endpoint for calculating server's upload speed
//* usage: /upload
const handler = async (_, res) => {
    return res.status(200).json({
        message: "success",
    });
};

export default httpMiddleware(authMiddleware, handler, "POST");
