// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const MongoDBStore = require('connect-mongodb-session')(session);

// Initialize Express app
const app = express();

// Create a new MongoDB store
var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
});

// Log errors from the MongoDB store
store.on('error', function (error) {
    console.error(error);
});

// Use express-session middleware with MongoDB store
app.use(session({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));

// Use CORS middleware to allow requests from the client origin
app.use(cors({
    origin: 'https://localhost:4000', // Allow the client origin
    credentials: true // Allow credentials (cookies)
}));

// Define variables for authorization code and code challenge
let authCode = process.env.AUTH_CODE;
let codeChallenge = null;

// Get valid redirect URIs from environment variables
const validRedirectUris = process.env.VALID_REDIRECT_URIS;

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Route to handle authorization requests
app.get('/authorize', (req, res) => {
    // Clear all the data stored in MongoDB
    store.clear(function (error) {
        if (error) {
            console.error('Error clearing MongoDB:', error);
        }
    });

    // Get code challenge and redirect URI from request query
    codeChallenge = req.query.code_challenge;
    const redirectUri = req.query.redirect_uri;

    // Store state in session
    req.session.state = req.query.state;

    // Save session
    req.session.save((err) => {
        // Handle error if there is one
        if (err) {
            console.error('Error saving session:', err);
            res.status(506).send('Session could not be saved');
            return;
        }

        // Check if redirect URI is valid
        if (!validRedirectUris.includes(redirectUri) || !req.session.state) {
            res.status(400).json({ error: 'Invalid redirect URI' });
            return;
        }

        // Save session again
        req.session.save();

        // Redirect to the provided redirect URI with the authorization code and state
        res.redirect(`${redirectUri}?code=${authCode}&state=${req.session.state}`);
    });
});

// Route to handle token requests
app.post('/token', express.json(), async (req, res) => {
    const { code, state: clientState, code_verifier: clientCodeVerifier } = req.body;

    // Get state stored in session in MongoDB and store it in a variable
    let state = null;
    let sessionId = null;

    try {
        const sessions = await new Promise((resolve, reject) => {
            store.all(function (error, sessions) {
                if (error) {
                    reject(error);
                } else {
                    resolve(sessions);
                }
            });
        });

        state = sessions[0].session.state;
        sessionId = sessions[0]._id; // Get the session id

        const clientCodeChallenge = generateCodeChallenge(clientCodeVerifier);

        if (clientCodeChallenge !== codeChallenge) {
            res.status(400).send('Invalid code verifier');
            return;
        }

        if (code === authCode && state === clientState) {
            const expiresIn = 60 * 60;
            const expiration = Math.floor(Date.now() / 1000) + expiresIn;

            // Directly update the session in MongoDB with the new access token and expiration time in same session as the authorization code and state
            store.set(sessionId, { state, expire: expiration, accessToken: 'sdf' }, function(err) {
                if (err) {
                    console.error('Error updating session:', err);
                    res.status(500).send('An error occurred');
                    return;
                }

                console.log('Session updated');
                
                res.json({ access_token: 'sdf', expires_in: expiresIn, expiration });
            });
        } else {
            res.status(400).send('Invalid authorization code or state');
        }
    } catch (error) {
        console.error('Error in POST /token:', error);
        res.status(500).send('An error occurred');
    }
});


app.get('/data', (req, res) => {
   
    //get session data from mongodb and compare it with request, compare state, access token and check expiration time from mongodb and compare it with current time and send data if everything is correct , else send error, get data from request header for comparison

    store.all(function (error, sessions) {
        console.log('/data sessions');
        console.log(sessions[0].session.expire);
        console.log(`DAte now ${Math.floor(Date.now() / 1000)}`);
        if (error) {
            console.error(error);
            res.status(500).send('An error occurred');
            return;
        }

    
        const expiration = sessions[0].session.expire;
        const accessToken = sessions[0].session.accessToken;

//check if the access token is valid and not expired

        if (req.headers.authorization === `Bearer ${accessToken}` && Math.floor(Date.now() / 1000) < expiration) {
            //send data and timestamp in normal Time format humana readable
            res.json({ data: 'This is the secret data', timestamp: new Date().toLocaleString() });
        } else {
            res.status(401).send('Unauthorized');
        }


       
    });



});

// Route to handle logout requests
app.get('/logout', (req, res) => {
    // Clear all the data stored in MongoDB
    store.clear(function (error) {
        if (error) {
            console.error('Error clearing MongoDB:', error);
            res.status(500).send('An error occurred');
            return;
        }

        res.send('Logged out');
    });
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
