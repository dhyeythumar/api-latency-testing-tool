import axios from "axios";
import https from "https";

((axios) => {
    const httpsAgent = new https.Agent({
        keepAlive: true,
    });
    axios.defaults.httpsAgent = httpsAgent;
    axios.defaults.timeout = 8000;
    axios.defaults.maxRedirects = 0;

    axios.interceptors.request.use((x) => {
        x.meta = x.meta || {};
        x.meta.requestStartedAt = new Date().getTime(); // in ms
        return x;
    });

    axios.interceptors.response.use(
        (x) => {
            x.responseTime =
                new Date().getTime() - x.config.meta.requestStartedAt; // in ms
            return x;
        },
        // handle 4xx & 5xx responses
        (x) => {
            x.responseTime =
                new Date().getTime() - x.config.meta.requestStartedAt;
            throw x;
        }
    );
})(axios);

export default axios;
