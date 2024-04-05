require('dotenv').config();

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const MongoDBStore = require('connect-mongodb-session')(session);

// Create a new MongoDB store
var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
  collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(require('express-session')({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));

app.use(cors({
    origin: 'https://localhost:4000', // Allow the client origin
    credentials: true // Allow credentials (cookies)
}));


let authCode = process.env.AUTH_CODE;

let codeChallenge = null;

const validRedirectUris = process.env.VALID_REDIRECT_URIS;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.get('/authorize', (req, res) => {


    //clear all the data stored in mongodb
    store.clear(function(error) {
        console.log('mongo function error');
    }
    );

    codeChallenge = req.query.code_challenge;
    const redirectUri = req.query.redirect_uri;
    req.session.state = req.query.state;

    req.session.save((err) => {
        // handle error if there is one
        if (err) {
            console.error(err);
            res.status(506).send('Session could not be saved');
            return;
        }

        // ... existing code ...
        if (!validRedirectUris.includes(redirectUri) || !req.session.state) {
            res.status(400).json({ error: 'Invalid redirect URI' });
            return;
        }

        //print all the data stored in mongodb
    store.all(function(error, sessions) {
        console.log('/authorize sessions');
        console.log(sessions);
    });

    req.session.save();

        res.redirect(`${redirectUri}?code=${authCode}&state=${req.session.state}`);
    });






});

app.post('/token', express.json(), (req, res) => {
    const { code, state: clientState, code_verifier: clientCodeVerifier } = req.body;

   //get state stored in session in mongodb

   store.all(function(error, sessions) {
    console.log(sessions[0].session.state);
});




    const clientCodeChallenge = generateCodeChallenge(clientCodeVerifier);

    if (clientCodeChallenge !== codeChallenge) {
        res.status(400).send('Invalid code verifier');
        return;
    }

    if (code === authCode) {
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
