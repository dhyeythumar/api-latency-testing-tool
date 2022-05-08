
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
                    "x-api-key": `${process.env.X_API_KEY}`,
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
