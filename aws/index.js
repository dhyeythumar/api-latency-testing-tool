import axios from "axios";
const isValidReq = request("../src/utils");

//! right now only working for get requests
const handler = async (event, context) => {
    const prevUptime = process.uptime();
    try {
        console.log(event);
        console.log(context);

        if (!event.queryStringParameters)
            throw new Error("No query parameters provided");

        const req = {
            url: event.queryStringParameters.url || undefined,
            xApiKey: event.queryStringParameters.xApiKey || "",
        };
        isValidReq(req);

        let numOfTests = 5;
        const latencyArray = [];
        const avgLatency = 0;

        const axiosPromises = [];
        let p;
        while (numOfTests--) {
            p = axios({
                method: "GET",
                url: req.url,
                timeout: 8000,
                maxRedirects: 4,
                headers: {
                    "x-api-key": req.xApiKey,
                },
            });
            axiosPromises.push(p);
        }

        const resolvedPromises = await Promise.allSettled(axiosPromises);

        resolvedPromises.forEach((res) => {
            console.log(res);
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=31536000, immutable",
                "server-timing": `${(process.uptime() - prevUptime).toFixed(
                    4
                )} sec`,
            },
            body: JSON.stringify({
                latency: avgLatency,
                "num-of-tests": numOfTests,
            }),
        };
    } catch (err) {
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "server-timing": `${(process.uptime() - prevUptime).toFixed(
                    4
                )} sec`,
            },
            body: JSON.stringify({
                error: err.message,
            }),
        };
    }
};

export default handler;
