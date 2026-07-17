const appContainer = document.getElementById('app-container');
const startBtn = document.getElementById('start-btn');
const btnText = startBtn.querySelector('.btn-text');
const statusText = document.getElementById('status-text');
const liveValue = document.getElementById('live-value');
const liveUnit = document.getElementById('live-unit');
const spinner = document.getElementById('spinner');

const resPing = document.getElementById('res-ping');
const resDown = document.getElementById('res-down');
const resUp = document.getElementById('res-up');

const unitRadios = document.querySelectorAll('input[name="unit"]');
const gridUnits = document.querySelectorAll('.result-box .unit'); 

function getSelectedUnit() {
    return document.querySelector('input[name="unit"]:checked').value;
}

function formatSpeed(speedInMbps) {
    if (isNaN(speedInMbps) || speedInMbps === 0) return speedInMbps;
    if (getSelectedUnit() === 'MBps') return (speedInMbps / 8).toFixed(1);
    return speedInMbps; 
}

function updateLiveUI(value) {
    liveValue.innerText = formatSpeed(value);
}

function updateLabels() {
    const unitText = getSelectedUnit() === 'MBps' ? 'MB/s' : 'Mbps';
    if (liveUnit.innerText !== 'ms') liveUnit.innerText = unitText;
    gridUnits[1].innerText = unitText;
    gridUnits[2].innerText = unitText;
}

unitRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        updateLabels();
        if (resDown.innerText !== '--') {
            resDown.innerText = formatSpeed(resDown.getAttribute('data-raw-mbps'));
            resUp.innerText = formatSpeed(resUp.getAttribute('data-raw-mbps'));
            liveValue.innerText = formatSpeed(liveValue.getAttribute('data-raw-mbps'));
        }
    });
});

async function runSpeedTest() {
    startBtn.disabled = true;
    btnText.innerText = 'Testing...';
    spinner.classList.remove('hidden');
    appContainer.classList.add('is-testing'); 
    
    resPing.innerText = '--';
    resDown.innerText = '--';
    resUp.innerText = '--';
    updateLabels(); 

    try {
        // Latency
        statusText.innerText = 'Testing Latency...';
        liveUnit.innerText = 'ms';
        liveValue.innerText = '...';
        const ping = await measurePing();
        liveValue.innerText = ping;
        resPing.innerText = ping; 

        await new Promise(r => setTimeout(r, 600)); 

        // Download
        statusText.innerText = 'Testing Download...';
        updateLabels(); 
        const downloadMbps = await measureDownloadStream(updateLiveUI);
        updateLiveUI(downloadMbps);
        resDown.innerText = formatSpeed(downloadMbps);
        resDown.setAttribute('data-raw-mbps', downloadMbps);
        liveValue.setAttribute('data-raw-mbps', downloadMbps);

        await new Promise(r => setTimeout(r, 600));

        // Upload
        statusText.innerText = 'Testing Upload...';
        const uploadMbps = await measureUploadStream(updateLiveUI);
        updateLiveUI(uploadMbps);
        resUp.innerText = formatSpeed(uploadMbps);
        resUp.setAttribute('data-raw-mbps', uploadMbps);
        liveValue.setAttribute('data-raw-mbps', uploadMbps);

        statusText.innerText = 'Test Complete';
        
    } catch (error) {
        console.error(error);
        statusText.innerText = 'Connection Error';
    } finally {
        startBtn.disabled = false;
        btnText.innerText = 'Test Again';
        spinner.classList.add('hidden');
        appContainer.classList.remove('is-testing'); 
    }
}

startBtn.addEventListener('click', runSpeedTest);