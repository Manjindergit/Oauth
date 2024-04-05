require('dotenv').config();

const express = require('express');
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
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    SameSite: 'None'

}));


let authCode = process.env.AUTH_CODE;
let state = null;
let codeChallenge = null;

const validRedirectUris = process.env.VALID_REDIRECT_URIS;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.get('/authorize', (req, res) => {
    state = generateState();
    codeChallenge = req.query.code_challenge;
    const redirectUri = req.query.redirect_uri;
    if (!validRedirectUris.includes(redirectUri)) {
        res.status(400).json({ error: 'Invalid redirect URI' });
        return;
    }
    res.redirect(`${redirectUri}?code=${authCode}&state=${state}`);
});

app.post('/token', express.json(), (req, res) => {
    const { code, state: clientState, code_verifier: clientCodeVerifier } = req.body;

    const clientCodeChallenge = generateCodeChallenge(clientCodeVerifier);

    if (clientCodeChallenge !== codeChallenge) {
        res.status(400).send('Invalid code verifier');
        return;
    }

    if (code === authCode && clientState === state) {
        const expiresIn = 60 * 60;
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        req.session.expire = expiration;
        req.session.accessToken = 'sdf'; 
        req.session.save();
        res.json({ access_token: 'sdf', expires_in: expiresIn, expiration });
    } else {
        res.status(400).send('Invalid authorization code or state');
    }
});

app.get('/data', (req, res) => {
    console.log('it came here');
    console.log('Expiration time:', req.session.expire);
    if (Date.now() < req.session.expire) {
        const data = { message: 'Here is your data!' };
        res.json(data);
    } else {
        res.status(401).send('Not logged in or session expired');
    }
});

app.get('/test', (req, res) => {
    req.session.test = 'Hello, world!';
    res.send('Test value set in session');
});

app.get('/check', (req, res) => {
    res.send('Test value from session: ' + req.session.test);
});

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}, app);

sslServer.listen(3000, () => console.log('Server app started on port 3000'));

function generateState() {
    return Math.random().toString(36).substring(7);
}

function generateCodeChallenge(clientCodeVerifier) {
    const hash = crypto.createHash('sha256');
    hash.update(clientCodeVerifier);
    return hash.digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
