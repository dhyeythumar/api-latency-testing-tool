import LruCache from "./lruCache.js";
import httpErrorRes from "./utils.js";

/*
 * :: Imp Note ::
 ! The API rate limit implementation is loosely coupled as its using in-memory storage for rate limiting requests.
 ! So when new instance of the function is invoked user's limit will be renewed even if the user was throttled in the previous instance of the lambda.
 */

export default class RateLimit {
    rateLimit;
    static REQ_THRESHOLD = 5; // Rate Limit of - 30 req / min
    constructor() {
        this.rateLimit = new LruCache({
            ttl: 1 * 60 * 1000, // 1 min
        });
    }

    _set(ip) {
        const newClient = {
            remaining: RateLimit.REQ_THRESHOLD - 1,
        };
        this.rateLimit.set(ip, newClient);
        return newClient;
    }

    // _delete(ip) {}

    checkRateLimit(ip) {
        const oldClient = this.rateLimit.get(ip);
        console.log("oldClient :: ", oldClient);
        if (!oldClient) {
            return this._set(ip);
        }

        console.log(
            "getRemainingTTL() :: ",
            this.rateLimit.getRemainingTTL(ip)
        );

        if (oldClient.remaining > RateLimit.REQ_THRESHOLD) {
            throw new httpErrorRes(
                "Too Many Requests",
                "Your request is throttled because you have exausted your API invocation limit. (Please check header value of 'X-RateLimit-Remaining')",
                429
            );
        } else {
            oldClient.remaining -= 1;
            this.rateLimit.set(ip, oldClient);
            return oldClient;
        }
    }
}
