const optionsMiddleware = (req, res) => {
    console.info(
        `Got OPTIONS req from origin :: ${req.headers.origin} @ ${req.headers.host}${req.url}`
    );
    return res.status(200).end();
};

/*
 * For open endpoins no auth required
 * (Rate limiting would be applied)
 */
const httpMiddleware = (authFn, mainFn, method) => {
    return (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Allow", `${method}`);

        if (req.method === "OPTIONS") return optionsMiddleware(req, res);
        else if (req.method !== method)
            return res.status(405).json({
                error: "Method Not Allowed",
                message: `Method other then ${method}, OPTIONS are not allowed`,
            });

        //* auth routes are used internally
        if (authFn !== null) {
            const isAuth = authFn(req, res);
            if (!isAuth) return;
        }
        return mainFn(req, res);
    };
};

/*
 * Requests from internal traffic would be adding 'x-api-key' in headers for security
 */
const authMiddleware = (req, res) => {
    if (
        !req.headers["x-api-key"] ||
        req.headers["x-api-key"] !== process.env.INTERNAL_X_API_KEY
    ) {
        res.status(401).json({
            error: "Can't access the endpoint directly!",
            message: "Only requests from internal services are accepted.",
        });
        return false;
    }
    return true;
};

export { httpMiddleware, authMiddleware };
