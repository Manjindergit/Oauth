require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


let authCode = null;
let state = null;

app.get('/authorize', (req, res) => {
    authCode = '123456'; // In a real application, generate a new code for each authorization request
    state = Math.random().toString(36).substring(7); // Generate a new state parameter for each authorization request
    const redirectUri = req.query.redirect_uri;
    res.redirect(`${redirectUri}?code=${authCode}&state=${state}`);
 });

app.post('/token', express.json(), (req, res) => {
    const {code, state: clientState} = req.body;
    if (code === authCode && clientState === state) {
        res.json({access_token: 'sdf'});
    } else {
        res.status(400).send('Invalid authorization code or state');
    }
});

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
},app);

sslServer.listen(3000, () => console.log('Server app started on port 3000'));
