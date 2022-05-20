import { postMiddleware } from "../src/middlewares.js";
import { isValidReqBody } from "../src/utils.js";
import axios from "../src/axios_setup.js";
import https from "https";
import ServerInfo from "../src/serverInfo.js";

const serverInfo_obj = new ServerInfo();

const handler = async (req, res) => {
    const prevUptime = process.uptime();
    try {
        isValidReqBody(req);

        let connection = "close";
        // by default keepAlive will be used unless specified
        if (req.body.keepAlive === undefined || req.body.keepAlive === true) {
            connection = "keep-alive";
            const httpsAgent = new https.Agent({
                keepAlive: true,
            });
            axios.defaults.httpsAgent = httpsAgent;
        }

        let numOfTests = 5;
        const promiseArray = [];
        let p;
        while (numOfTests--) {
            p = axios({
                url: `${req.body.url}`,
                method: `${req.body.method.toUpperCase()}`,
                headers: {
                    "x-api-key": `${req.body.xApiKey}` || "",
                    Connection: connection,
                },
            });
            promiseArray.push(p);
        }

        const latencyArray = [];
        let avgLatency = 0;
        const resolvedPromises = await Promise.allSettled(promiseArray);
        resolvedPromises.forEach((res) => {
            if (res.status === "fulfilled") {
                res = res.value;
                //* Origin server's IP address
                //* console.log(res.request.socket.remoteAddress);
                if (res && res.status === 200 && res.data) {
                    latencyArray.push(`${res.responseTime} ms`);
                    avgLatency += res.responseTime;
                }
            } else {
                console.log(`Axios request failed! Reason :: ${res.reason}`);
            }
        });
        avgLatency /= latencyArray.length;

        // const hostIPs = await dnsLookup(`${req.headers.host}`);
        const serverInfo = await serverInfo_obj.run();

        res.setHeader(
            "server-timing",
            `${(process.uptime() - prevUptime).toFixed(4)} sec`
        );
        // res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.status(200).json({
            "average-latency": `${avgLatency} ms`,
            "latency-array": latencyArray,
            "total-successful-tests": latencyArray.length,
            "total-failed-tests": promiseArray.length - latencyArray.length,
            "server-info": serverInfo,
        });
    } catch (err) {
        console.error(err);
        const statusCode = err.statusCode || 400;

        res.status(statusCode).json({
            error: err.name,
            message: err.message,
            // stack: err.stack,
        });
    }
};

export default postMiddleware(handler);

/*  * :: Note ::
    ! Axios doesn't provide timings info so we have used interceptors to record timing info but dont know how much accurate it would be.
    * But request lib is providing a extensive timing related details, check this - 
    * https://github.com/axios/axios/issues/695#issuecomment-375590932
*/
