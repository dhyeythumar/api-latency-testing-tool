import dns from "dns";

class httpErrorRes extends Error {
    error;
    statusCode;
    //* By default error code is 400 (bad request)
    constructor(error, message, statusCode = 400) {
        super(message);
        this.error = error;
        this.statusCode = statusCode;
    }
}

const isValidReqBody = (req) => {
    if (!req.body) {
        throw new httpErrorRes("Bad request format", "Request body is empty!");
    }

    if (!req.body.url || !req.body.method) {
        throw new httpErrorRes(
            "Bad request format",
            "Missing url/method in request body!"
        );
    }
};

/*  Note
 * DNS lookup will give IP addresses of "services" used in front of the actual server executing the code.
 * These services could be:
 * API gateway || (Application) Load balancer || NAT server || Reverse Proxy || any custom proprietary service || ISP || etc...
 */
const dnsLookup = (hostname) => {
    // avoid dns Lookup on localhost
    if (
        hostname.indexOf("127.0.0.1") !== -1 ||
        hostname.indexOf("::ffff:127.0.0.1") !== -1 ||
        hostname.indexOf("::1") !== -1 ||
        hostname.indexOf("localhost") !== -1
    )
        return Promise.resolve("localhost");

    return new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
            if (err) {
                reject(
                    new httpErrorRes(
                        "DNS query resolution error",
                        `Error while finding testing server's IP address :: ${err}`
                    )
                );
            } else {
                const serverIPs = [];
                addresses.forEach((ip) =>
                    serverIPs.push(`https://whatismyipaddress.com/ip/${ip}`)
                );
                resolve(serverIPs);
            }
        });
    });
};

export { httpErrorRes, isValidReqBody, dnsLookup };
