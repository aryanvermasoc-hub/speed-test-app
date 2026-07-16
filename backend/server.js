const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Allow the frontend to communicate with this backend
app.use(cors()); 

// Serve the large dummy file for the download test from the 'public' folder
app.use(express.static(path.join(__dirname, 'public'))); 

// Ping Endpoint: A tiny response to measure latency
app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
});

// Upload Endpoint: Accepts a large chunk of data but discards it immediately
app.post('/api/upload', express.raw({ type: '*/*', limit: '100mb' }), (req, res) => {
    res.status(200).send('uploaded');
});

app.listen(PORT, () => {
    console.log(`🚀 Speed test backend running on http://localhost:${PORT}`);
});