import { getMiddleware } from "../src/middlewares.js";

const handler = async (req, res) => {
    // req.socket.remoteAddress will mostly give local/private IP address
    res.status(200).json({
        ip: req.headers["x-real-ip"] || req.socket.remoteAddress,
    });
};

export default getMiddleware(handler);

/** Example headers fields in req object
"headers": {
    "host": "api-latency-testing-tool.vercel.app",
    "x-vercel-deployment-url": "api-latency-testing-tool-nd5a2jou4-dhyeythumar.vercel.app",
    "x-api-key": "<x-api-key>",
    "forwarded": "for=115.96.219.110;host=api-latency-testing-tool.vercel.app;proto=https;sig=0QmVhcmVyIGIzZTUxMDQ2N2FlYmZhZjA3OGJhYzRjMGNhZTU4NGY2YzBhM2IyYTk5MmI3ZTg5ZjhhZTZlNDkxMzVhYmMwYzk=;exp=1651984692",
    "x-forwarded-for": "115.96.219.110",
    "x-forwarded-proto": "https",
    "x-forwarded-host": "api-latency-testing-tool.vercel.app",
    "accept": "*\/*",
    "connection": "keep-alive",
    "access-control-allow-origin": "*",
    "access-control-max-age": "86400",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    "access-control-allow-methods": "GET, OPTIONS"
    "accept-encoding": "gzip, deflate, br",
    "user-agent": "PostmanRuntime/7.28.4",
    "x-real-ip": "115.96.219.110",
    "x-vercel-ip-country": "IN",
    "x-vercel-ip-city": "Mumbai",
    "x-vercel-ip-country-region": "MH",   
    "x-vercel-proxy-signature-ts": "1651984692",
    "x-vercel-forwarded-for": "115.96.219.110",
    "x-vercel-id": "<id>",
    "x-vercel-proxy-signature": "Bearer <token>",
},
*/
