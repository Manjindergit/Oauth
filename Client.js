// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();

// Use CORS middleware to allow requests from the client origin
app.use(cors({
    origin: 'https://localhost:4000', // Allow the client origin
    credentials: true // Allow credentials (cookies)
}));

// Use express-session middleware
app.use(session({
    secret: 'password',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    SameSite: 'lax',
    maxAge: 60000 // 1 minute
}));

// Define variables for state, client ID, and code verifier
let state = null;
const clientId = process.env.CLIENT_ID;
const codeVerifier = crypto.randomBytes(64).toString('hex');

// Route to handle login requests
app.get('/login', async (req, res) => {
    state = generateState();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const redirectUri = 'https://localhost:4000/callback';
    res.redirect(`https://localhost:3000/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`);
});

// Create a new HTTPS agent
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});



// Route to handle callback from authorization server
app.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log(state);
        console.log(req.session);
        const response = await axios.post('https://localhost:3000/token', { code, state, code_verifier: codeVerifier }, { httpsAgent });
        const { access_token: accessToken, expires_in: expiresIn } = response.data;

        // Store access token, expiration time, and state in session
        req.session.accessToken = accessToken;
        req.session.expiresIn = expiresIn;
        req.session.state = state;
        req.session.save();

        // Send a response with a button that redirects to /data and a logout button that redirects to /logout on the client app and is visible to the user
        res.send(`
        <button onclick="window.location.href='https://localhost:4000/data'">
        Fetch Data
    </button>
    <button onclick="window.location.href='https://localhost:4000/logout'">
        Logout
    </button>
    <div id="data"></div>

            

        `);
    } catch (error) {
        console.error(`Error in POST request: ${error}`);
        res.status(500).send('An error occurred.');
    }
});

// Route to handle data requests
app.get('/data', (req, res) => {
    if (!req.session.accessToken || !req.session.state || !req.session.expiresIn) {
        res.status(401).send('Unauthorized');
        return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <body>
    <button id="fetchDataButton">Fetch Data</button>
    <button onclick="window.location.href='https://localhost:4000/logout'">
        Logout
    </button>
    <div id="data"></div>
    <script>
    document.getElementById('fetchDataButton').addEventListener('click', function() {
        fetch('https://localhost:3000/data', {
            headers: {
                Authorization: 'Bearer ${req.session.accessToken}',
                state: '${req.session.state}',
            }
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('data').innerText = JSON.stringify(data, null, 2);
        })
        .catch(error => console.error(error));
    });
    </script>
    </body>
    </html>
    `;

    res.send(html);
});


// Route to handle logout requests
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('https://localhost:3000/logout');
});



const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app);

sslServer.listen(4000, () => console.log('Client app started on port 4000'));

function generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256');

    hash.update(codeVerifier);
    return hash.digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateState() {
    return Math.random().toString(36).substring(7);
}