require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');

app.use(session({
    secret  : 'mySecret',   
    resave : false,
    saveUninitialized : true
}));

//This is for pkce
const clientId = process.env.CLIENT_ID;
const codeVerifier = crypto.randomBytes(64).toString('hex');
let state = null;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/login', async (req, res) => {
    let requestedScopes = 'read write';
    const codeChallenge = generateCodeChallenge(codeVerifier);
    state = generateState();
    const redirectUri = 'https://localhost:4000/callback';
    res.redirect(`https://localhost:3000/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=${requestedScopes}`);
});

//This for self signed certificate
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});


// app.use((req, res, next) => {
//     // If there's no session or the token has expired, redirect the user to /logged-out
//     if (Date.now() > req.session.expiration) {
//         console.log('Session expired due to token expiration, redirecting...');
//         res.redirect('/logged-out');
//         res.end();

//     } else {
//         next();
//     }
// });




app.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        const response = await axios.post('https://localhost:3000/token', { code, state, code_verifier: codeVerifier }, { httpsAgent });
        const { access_token: accessToken, expires_in: expiresIn } = response.data;
        const expiration = Date.now() + expiresIn * 1000;
        req.session = { accessToken, expiration };
        console.log(req.session);
        // Redirect to a new route to fetch and display data
        res.redirect('/data');

    } catch (error) {
        console.error(`Error in POST request: ${error}`);
        res.status(500).send('An error occurred.');
    }
});

app.get('/data', async (req, res) => {
    try {
        const accessToken = req.session.accessToken;
        const response = await axios.get('https://localhost:3000/data', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        res.status(500).send('An error occurred.');
    }
});

app.get('/logged-out', (req, res) => {
    console.log('it comes here');
    // Destroy the session or clear the access token and expiration
    req.session = null;
    // Send a response to the user
    res.send('You have been logged out.');
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