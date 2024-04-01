const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

let authCode = null;

app.get('/authorize', (req, res) => {
   authCode = '123456'; // In a real application, generate a new code for each authorization request
   const redirectUri = req.query.redirect_uri;
   res.redirect(`${redirectUri}?code=${authCode}`);
});

app.post('/token', express.json(), (req, res) => {
    const {code} = req.body;
    if (code === authCode) {
        res.json({access_token: 'sdf'});
    } else {
        res.status(400).send('Invalid authorization code');
    }
 });

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
},app);

sslServer.listen(3000, () => console.log('Server app started on port 3000'));
