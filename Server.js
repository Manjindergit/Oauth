require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let authCode = null;
let state = null;
let codeChallenge = null;

app.get('/authorize', (req, res) => {
    authCode = '123456'; // In a real application, generate a new code for each authorization request
    state = Math.random().toString(36).substring(7); // Generate a new state parameter for each authorization request
    codeChallenge =req.query.code_challenge;
    const redirectUri = req.query.redirect_uri;
    res.redirect(`${redirectUri}?code=${authCode}&state=${state}`);
 });

 app.post('/token', express.json(), (req, res) => {
    const {code, state: clientState, code_verifier: clientCodeVerifier} = req.body;

    

     // Generate the code challenge from the client's code verifier
     const hash = crypto.createHash('sha256');
     hash.update(clientCodeVerifier);
     const clientCodeChallenge = hash.digest('base64')
         .replace(/\+/g, '-')
         .replace(/\//g, '_')
         .replace(/=/g, '');

           // Verify the code challenge
    if (clientCodeChallenge !== codeChallenge) {
        console.log(clientCodeChallenge);
        console.log(codeChallenge);
        res.status(400).send('Invalid code verifier');
        console.log('it came here');
        return;
    }

    if (code === authCode && clientState === state) {
        const expiresIn = 60 * 60; // Token expires in 1 hour
        const expiration = Math.floor(Date.now() / 1000) + expiresIn; // Current timestamp in seconds + expiration time 
        res.json({access_token: 'a', expires_in: expiresIn, expiration});
    } else {
        res.status(400).send('Invalid authorization code or state');
    }
});

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
},app);

sslServer.listen(3000, () => console.log('Server app started on port 3000'));
