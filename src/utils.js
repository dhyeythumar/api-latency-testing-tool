import axios from "axios";
import dns from "dns";

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

// TODO :: create an endpoint which will return the IP address
const getServerIP = async () => {
    const ip = await axios({
        url: "https://icanhazip.com/",
        method: "GET",
    });
    if (ip && ip.status === 200 && ip.data) return ip.data.trim();
    return null;
};

// TODO :: cache the ip info ??
const getServerInfo = async () => {
    // make request to find server's details
    const serverInfo = await axios({
        url: `https://ipinfo.io/json?token=${process.env.token}`,
        method: "GET",
    });
    if (serverInfo && serverInfo.status === 200 && serverInfo.data)
        return serverInfo.data;
    else {
        const ip = await getServerIP();
        if (ip === null) return "Server info not found!";

        const resObj = {
            ip: ip,
            moreInfo: `https://whatismyipaddress.com/ip/${ip}`,
        };
        if (serverInfo.status === 429)
            resObj["error"] = {
                name: "Too many requests",
                message:
                    "You have hit the rate limit of 3rd party service. So click on the above link in moreInfo field to now more about the server.",
            };
        else
            resObj["error"] = {
                message:
                    "Didn't find any server information using 3rd party service.",
            };
        return resObj;
    }
};

/*  Note
 * DNS lookup will give IP addresses of "services" used in front of the actual server executing the code.
 * These services could be:
 * API gateway || (Application) Load balancer || NAT server || Reverse Proxy || any custom proprietary service || ISP || etc...
 */
const dnsLookup = (domainName) => {
    // avoid dns Lookup on localhost
    if (
        domainName.indexOf("127.0.0.1") !== -1 ||
        domainName.indexOf("::ffff:127.0.0.1") !== -1 ||
        domainName.indexOf("::1") !== -1 ||
        domainName.indexOf("localhost") !== -1
    )
        return Promise.resolve("localhost");

    return new Promise((resolve, reject) => {
        dns.resolve4(domainName, (err, addresses) => {
            if (err) {
                const e = new Error(
                    `Error while finding testing server's IP address :: ${err}`
                );
                e.name = "DNS query resolution error";
                reject(e);
            } else {
                const serverIPs = [];
                addresses.forEach((ip) => [
                    serverIPs.push(`https://whatismyipaddress.com/ip/${ip}`),
                ]);
                resolve(serverIPs);
            }
        });
    });
};

export { isValidReqBody, getServerInfo, dnsLookup };
