const optionsMiddleware = (req, res) => {
    console.info(
        `Got OPTIONS req from origin :: ${req.headers.origin} @ ${req.headers.host}${req.url}`
    );
    return res.status(200).end();
};

/*
 * 1. Requests from external world are only allowed from RapidAPI Gateway.
 * 2. Requests from internal traffic would be adding 'x-rapidapi-proxy-secret' in headers to bypass security
 */
const httpMiddleware = (fn, method) => {
    return (req, res) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Allow", `${method}`);

        if (req.method === "OPTIONS") return optionsMiddleware(req, res);
        else if (req.method !== method) {
            return res.status(405).json({
                error: "Method Not Allowed",
                message: `Method other then ${method}, OPTIONS are not allowed`,
            });
        }

        if (
            req.headers["x-rapidapi-proxy-secret"] !==
            process.env.X_RAPIDAPI_PROXY_SECRET
        )
            return res.status(401).json({
                error: "Can't access the endpoint directly!",
                message:
                    "Only requests from RapidAPI gateway are accepted (https://rapidapi.com/dhyeythumar/api/apis-latency-testing).",
            });
        return fn(req, res);
    };
};

export { httpMiddleware };
