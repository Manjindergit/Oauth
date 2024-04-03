require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');


const clientId = process.env.CLIENT_ID;
const codeVerifier = crypto.randomBytes(64).toString('hex');


app.get('/login', async (req, res) => {

    const codeChallenge = generateCodeChallenge(codeVerifier);


    const redirectUri = 'https://localhost:4000/callback';
    res.redirect(`https://localhost:3000/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256`);
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
        res.send(`
    You are logged in. 
    <button id="myButton">Get Data</button>
    <script>
        document.getElementById('myButton').addEventListener('click', function() {
            fetch('https://localhost:3000/data')
                .then(response => response.json())
                .then(data => {
                    // Do something with the data
                    console.log(data);
                })
                .catch(error => console.error('Error:', error));
        });
    </script>
`);

    } catch (error) {
        console.error(`Error in POST request: ${error}`);
        res.status(500).send('An error occurred.');
    }
})

// app.get('/get-token', (req, res) => {
//     if (req.session && req.session.accessToken) {
//         res.json({ accessToken: req.session.accessToken });
//     } else {
//         res.status(401).send('Not logged in');
//     }
// });



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