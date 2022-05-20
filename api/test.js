import { httpMiddleware } from "../src/middlewares.js";
import { NetworkInfo } from "../src/serverInfo.js";
import axios from "axios";

const handler = async (_, res) => {
    const myIPService = await axios({
        url: `${process.env.HOST}/whatismyipaddress`,
        method: "GET",
        headers: {
            "x-api-key": `${process.env.X_API_KEY}`,
        },
    });
    const otherIPService = await axios({
        url: "https://icanhazip.com/",
        method: "GET",
    });

    const download = await NetworkInfo.calDownloadSpeed();
    const upload = await NetworkInfo.calUploadSpeed();

    res.status(200).json({
        myIPService: myIPService.data.ip,
        otherIPService: otherIPService.data.trim(),
        ...download,
        ...upload,
        vercel_region: process.env.VERCEL_REGION,
    });
};

export default httpMiddleware(handler, "GET");
