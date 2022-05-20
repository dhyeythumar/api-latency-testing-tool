import { httpMiddleware } from "../src/middlewares.js";
import { NetworkInfo } from "../src/serverInfo.js";
import axios from "axios";

//! internal GET endpoint for testing
//* usage: /test
const handler = async (req, res) => {
    const myIPService = await axios({
        url: `${process.env.HOST}/whatismyipaddress`,
        method: "GET",
        headers: {
            "x-rapidapi-proxy-secret": `${process.env.X_RAPIDAPI_PROXY_SECRET}`,
        },
    });
    const otherIPService = await axios({
        url: "https://icanhazip.com/",
        method: "GET",
    });

    const download = await NetworkInfo.calDownloadSpeed();
    const upload = await NetworkInfo.calUploadSpeed();

    res.status(200).json({
        reqHeaders: req.headers,
        myIPService: myIPService.data.ip,
        otherIPService: otherIPService.data.trim(),
        ...download,
        ...upload,
        vercel_region: process.env.VERCEL_REGION,
    });
};

export default httpMiddleware(handler, "GET");
