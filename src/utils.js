const isValidReqBody = (req) => {
    if (!req.body) {
        const e = new Error("Request body is empty!");
        e.name = "Bad request format";
        throw e;
    }

    if (!req.body.url || !req.body.method) {
        const e = new Error("Missing url/method in request body!");
        e.name = "Bad request format";
        throw e;
    }
};

export { isValidReqBody };
