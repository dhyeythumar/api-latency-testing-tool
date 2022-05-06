const optionsMiddleware = (req, res) => {
    console.info(
        `Got OPTIONS req from origin :: ${req.headers.origin} @ ${req.headers.host}${req.url}`
    );
    return res.status(200).end();
};

const getMiddleware = (fn) => {
    return (req, res) => {
        if (req.method === "OPTIONS") return optionsMiddleware(req, res);
        // return if not GET method
        else if (req.method !== "GET") {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Allow", "GET");
            return res.status(405).json({
                error: "Method other then GET is not allowed",
            });
        }

        return fn(req, res);
    };
};

export { getMiddleware };
