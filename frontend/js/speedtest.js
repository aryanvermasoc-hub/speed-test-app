const BACKEND_URL = 'https://speed-test-app-d78z.onrender.com';

async function measurePing() {
    const start = performance.now();
    await fetch(`${BACKEND_URL}/api/ping?_=${Math.random()}`);
    const end = performance.now();
    return Math.round(end - start);
}

async function measureDownloadStream(onProgress) {
    const start = performance.now();
    try {
        const response = await fetch(`${BACKEND_URL}/dummy-50mb.bin?_=${Math.random()}`);
        if (!response.ok) throw new Error("Network error");

        const reader = response.body.getReader();
        let receivedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            receivedBytes += value.length;
            const durationInSeconds = (performance.now() - start) / 1000;

            if (durationInSeconds > 0.1) {
                const speedMbps = ((receivedBytes * 8) / durationInSeconds) / (1024 * 1024);
                onProgress(speedMbps.toFixed(1));
            }
        }

        const totalDuration = (performance.now() - start) / 1000;
        return (((receivedBytes * 8) / totalDuration) / (1024 * 1024)).toFixed(1);
    } catch (error) {
        console.error("Download failed:", error);
        return 0;
    }
}

function measureUploadStream(onProgress) {
    return new Promise((resolve, reject) => {
        const payloadSize = 20 * 1024 * 1024; 
        const payload = new Uint8Array(payloadSize);
        for (let i = 0; i < payloadSize; i++) payload[i] = Math.random() * 255;

        const xhr = new XMLHttpRequest();
        let startTime = performance.now();

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const durationInSeconds = (performance.now() - startTime) / 1000;
                if (durationInSeconds > 0.1) {
                    const speedMbps = ((event.loaded * 8) / durationInSeconds) / (1024 * 1024);
                    onProgress(speedMbps.toFixed(1));
                }
            }
        };

        xhr.onload = () => {
            const totalDuration = (performance.now() - startTime) / 1000;
            const finalSpeed = (((payloadSize * 8) / totalDuration) / (1024 * 1024)).toFixed(1);
            resolve(finalSpeed);
        };

        xhr.onerror = () => reject("Upload failed");

        xhr.open("POST", `${BACKEND_URL}/api/upload?_=${Math.random()}`);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(payload);
    });
}