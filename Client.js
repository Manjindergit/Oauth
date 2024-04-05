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


app.get('/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        console.log(state);
        console.log(req.session);
        const response = await axios.post('https://localhost:3000/token', { code, state, code_verifier: codeVerifier }, { httpsAgent });
        const { access_token: accessToken, expires_in: expiresIn } = response.data;

        //if got data successfully, create a session for the user and store the access token, expires in and state in the session and create a button that would redirec to /data route to get the data
        req.session.accessToken = accessToken;
        req.session.expiresIn = expiresIn;
        req.session.state = state;
        req.session.save();

        fetchData(accessToken, state, codeVerifier);
        
       




    } catch (error) {
        console.error(`Error in POST request: ${error}`);
        res.status(500).send('An error occurred.');
    }
})

//create a function that would get the data from the server

async function fetchData(accessToken, state, codeVerifier) {
    try {
        const response = await axios.get('https://localhost:3000/data', {
            httpsAgent,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        //display the data in the console and in the client app
        console.log(response.data);
        

    } catch (error) {
        console.error(`Error in GET request: ${error}`);
    }
}




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