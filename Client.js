require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');

app.use(cors({
    origin: 'https://localhost:4000', // Allow the client origin
    credentials: true // Allow credentials (cookies)
}));

app.use(session({
    secret: 'password',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    SameSite: 'lax',
    maxAge: 60000
   
}));

let state = null;
const clientId = process.env.CLIENT_ID;
const codeVerifier = crypto.randomBytes(64).toString('hex');

app.get('/login', async (req, res) => {
    state = generateState();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const redirectUri = 'https://localhost:4000/callback';
    res.redirect(`https://localhost:3000/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`);
});


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
        console.log(state);
        console.log(req.session);
        const response = await axios.post('https://localhost:3000/token', { code, state, code_verifier: codeVerifier }, { httpsAgent });
        const { access_token: accessToken, expires_in: expiresIn } = response.data;
        const expiration = Date.now() + expiresIn * 1000;
       // req.session.accessToken = accessToken; // Store the access token in the session
       // req.session.expiration = expiration; // Store the expiration time in the session
        console.log(req.session.accessToken);
        res.send(`
        You are logged in with access token: ${accessToken}
        
`);

    } catch (error) {
        console.error(`Error in POST request: ${error}`);
        res.status(500).send('An error occurred.');
    }
})

app.get('/logged-out', (req, res) => {
    console.log('it comes here');
    req.session = null;
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