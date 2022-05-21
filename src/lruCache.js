import LRU from "lru-cache";

/*
 * Leveraging In-Memory cache to save server's info given by 3rd party service so I am not exausting my free tier limit.
 * This cache remains until server dies out.
 * Also note - caching won't work for local testing but for prod deployment it works !!
 */

const cacheOptions = {
    max: 5000, // maximum number of items allowed in the cache
    ttl: 15 * 60 * 1000, // maximum life of a cached item in ms (15 min)
};

export default class LruCache {
    cache;
    constructor(customOptions = {}) {
        const options = {
            ...cacheOptions,
            ...customOptions,
        };
        this.cache = new LRU(options);
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, data) {
        this.cache.set(key, data);
    }
}
