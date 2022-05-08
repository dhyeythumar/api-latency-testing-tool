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
                const e = new Error(
                    `Error while finding testing server's IP address :: ${err}`
                );
                e.name = "DNS query resolution error";
                reject(e);
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

export { isValidReqBody, dnsLookup };
