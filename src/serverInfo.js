import axios from "./axiosSetup.js";
import LruCache from "./lruCache.js";

export class NetworkInfo {
    static imageUrl =
        "https://api-latency-testing-tool.vercel.app/test_image.jpg";
    static chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]{}|;':,./<>?";

    static async calDownloadSpeed() {
        try {
            const res = await axios({
                url: this.imageUrl,
                method: "GET",
            });
            if (res && res.status === 200 && res.data) {
                const duration = res.responseTime / 1000;
                const bps =
                    (parseInt(res.headers["content-length"]) * 8) / duration;
                const mbps = (bps / 1000000).toFixed(2);
                return { "download-speed": `${mbps} Mbps` };
            }
            return {
                "download-speed":
                    "Not able to calculate server's download speed.",
            };
        } catch (err) {
            throw new Error(`Error in calDownloadSpeed function :: ${err}`);
        }
    }

    static _generateTestData(sizeInBytes) {
        const iterations = sizeInBytes;
        let result = "";
        for (let index = 0; index < iterations; index++) {
            result += this.chars.charAt(
                Math.floor(Math.random() * this.chars.length)
            );
        }
        return result;
    }

    // testing for file size of 100 KB
    static async calUploadSpeed(fileSizeInBytes = 100000) {
        try {
            const defaultData = this._generateTestData(fileSizeInBytes);
            const data = JSON.stringify({ defaultData });
            const res = await axios({
                url: `${process.env.HOST}/upload`,
                method: "POST",
                headers: {
                    "x-api-key": `${process.env.INTERNAL_X_API_KEY}`,
                },
                data: data,
            });
            if (res && res.status === 200 && res.data) {
                const duration = res.responseTime / 1000;
                const bps = (fileSizeInBytes * 8) / duration;
                const mbps = (bps / 1000000).toFixed(2);
                return { "upload-speed": `${mbps} Mbps` };
            }
            return {
                "upload-speed": "Not able to calculate server's upload speed.",
            };
        } catch (err) {
            throw new Error(`Error in calUploadSpeed function :: ${err}`);
        }
    }
}

export default class ServerInfo {
    ipCache;
    constructor() {
        this.ipCache = new LruCache();
    }

    async _fetchServerIP() {
        const res = await axios({
            url: `${process.env.HOST}/whatismyipaddress`,
            method: "GET",
            headers: {
                "x-api-key": `${process.env.INTERNAL_X_API_KEY}`,
            },
        });
        if (res && res.status === 200 && res.data) return res.data.ip;
        return null;
    }

    async _fetchServerInfo(ip) {
        // send request to find server's information
        const serverInfo = await axios({
            url: `https://ipinfo.io/json?token=${process.env.IP_INFO_TOKEN}`,
            method: "GET",
        });
        if (serverInfo && serverInfo.status === 200 && serverInfo.data)
            return serverInfo.data;
        else {
            const res = {
                ip: ip,
                moreInfo: `https://whatismyipaddress.com/ip/${ip}`,
            };
            if (serverInfo.status === 429)
                res["error"] = {
                    name: "Too many requests",
                    message:
                        "You have hit the rate limit of 3rd party service. So click on the above link in moreInfo field to now more about the server.",
                };
            else
                res["error"] = {
                    message:
                        "Didn't find any server information using 3rd party service.",
                };
            return res;
        }
    }

    async _serverInfo() {
        try {
            let serverIP = await this._fetchServerIP();
            if (!serverIP)
                return {
                    message: "Can't find server's IP address",
                };

            const cachedServerInfo = this.ipCache.get(serverIP);
            if (cachedServerInfo) {
                cachedServerInfo["cached"] = "true";
                return cachedServerInfo;
            }

            const serverInfo = await this._fetchServerInfo(serverIP);
            if (serverIP !== serverInfo.ip) {
                serverInfo["conflicting-ip"] = serverIP;
                serverIP = serverInfo.ip;
            }
            // cache the server info
            this.ipCache.set(serverIP, serverInfo);
            return serverInfo;
        } catch (err) {
            throw new Error(`Error in _serverInfo function :: ${err}`);
        }
    }

    run() {
        return new Promise(async (resolve, reject) => {
            try {
                const promiseArray = [];
                if (process.env.NODE_ENV === "production")
                    promiseArray.push(this._serverInfo());

                promiseArray.push(NetworkInfo.calDownloadSpeed());
                promiseArray.push(NetworkInfo.calUploadSpeed());

                let serverDetails = {};
                const resolvedPromises = await Promise.allSettled(promiseArray);
                resolvedPromises.forEach((res) => {
                    if (res.status === "fulfilled") {
                        serverDetails = { ...serverDetails, ...res.value };
                    } else {
                        console.log(res); // promise rejected
                    }
                });
                resolve(serverDetails);
            } catch (err) {
                reject(err);
            }
        });
    }
}
