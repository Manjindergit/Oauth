require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');

// For CORS in browser during demo
const cors = require('cors');
const corsOptions = {
    origin: 'https://localhost:4000',
  };
  
  app.use(cors(corsOptions));

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true
}));

let authCode = process.env.AUTH_CODE;
let codeChallenge = null;
let validScopes = ['read', 'write', 'delete'];


const validRedirectUris = process.env.VALID_REDIRECT_URIS;


app.get('/authorize', (req, res) => {
    
    codeChallenge = req.query.code_challenge;
    const redirectUri = req.query.redirect_uri;
    let requestedScopes = req.query.scope.split(' ');

    if (!validRedirectUris.includes(redirectUri)) {
        res.status(400).json({ error: 'Invalid redirect URI' });
        return;
    }

    if (!requestedScopes.every(scope => validScopes.includes(scope))) {
        res.status(400).json({ error: 'Invalid scope' });
        return;
    }

    req.session.scope = requestedScopes;
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
        const expiresIn = 60*60; // Token expires in 1 hour
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;

        req.session.expire = expiration; 

        res.json({ access_token: 'sdf', expires_in: expiresIn, expiration, scope: req.session.scope });
    } else {
        res.status(400).send('Invalid authorization code or state');
    }
});

app.get('/data', (req, res) => {
    console.log('it came her');
    // Check if the session exists and if the token has not expired
    if (Date.now() < req.session.expire){
        // The session exists and the token has not expired, proceed with fetching the data
        // Fetch the data from your data source here. This is just a placeholder.
        const data = { message: 'Here is your data!' };

        // Send the data to the client
        res.json(data);
    } else {
        // No session or the token has expired, send an appropriate response
        res.status(401).send('Not logged in or session expired');
    }
});

//This is for general error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}, app);

sslServer.listen(3000, () => console.log('Server app started on port 3000'));



function generateCodeChallenge(clientCodeVerifier) {
    const hash = crypto.createHash('sha256');
    hash.update(clientCodeVerifier);
    return hash.digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
