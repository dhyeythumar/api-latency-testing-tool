import { postMiddleware } from "../src/middlewares.js";

// dummy endpoint for calculating server's upload speed
const handler = async (_, res) => {
    res.status(200).json({
        message: "success",
    });
};

export default postMiddleware(handler);
