const optionsMiddleware = (req, res) => {
    console.info(
        `Got OPTIONS req from origin :: ${req.headers.origin} @ ${req.headers.host}${req.url}`
    );
    return res.status(200).end();
};

const getMiddleware = (fn) => {
    return (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Allow", "GET");

        if (req.method === "OPTIONS") return optionsMiddleware(req, res);
        // return if not GET method
        else if (req.method !== "GET") {
            return res.status(405).json({
                error: "Method Not Allowed",
                message: "Method other then GET, OPTIONS are not allowed",
            });
        } else {
            if (req.headers["x-api-key"] !== process.env.X_API_KEY)
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "You are not authorized to use this service",
                });
            return fn(req, res);
        }
    };
};

const postMiddleware = (fn) => {
    return (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Allow", "POST");

        if (req.method === "OPTIONS") return optionsMiddleware(req, res);
        // return if not POST method
        else if (req.method !== "POST") {
            return res.status(405).json({
                error: "Method Not Allowed",
                message: "Method other then POST, OPTIONS are not allowed",
            });
        } else {
            if (req.headers["x-api-key"] !== process.env.X_API_KEY)
                return res.status(401).json({
                    error: "Unauthorized",
                    message: "You are not authorized to use this service",
                });
            return fn(req, res);
        }
    };
};

export { getMiddleware, postMiddleware };
