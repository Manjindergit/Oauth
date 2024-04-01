require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


app.get('/login', (req, res) => {
   
   console.log(clientId);
   const redirectUri = 'https://localhost:4000/callback';
   res.redirect(`https://localhost:3000/authorize?response_type=code&casdaslient_id=${clientId}&redirect_uri=${redirectUri}`);
});

//This for self signed certificate
const httpsAgent = new https.Agent({  
    rejectUnauthorized: false
  });

 

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
   
    try {
        const response = await axios.post('https://localhost:3000/token', {code, state}, {httpsAgent});
        const accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;
        const expiration = Date.now() + expiresIn * 1000;

    
        req.session = {accessToken, expiration};
        res.send(`Logged in with access token: ${accessToken}`);
    } catch (error) {
        console.error(`Error in POST request: ${error}`); // Add this line for debugging
        res.status(500).send('An error occurred.');
    }
 });

 app.use((req, res, next) => {
    if ( Date.now() + 10000000 > req.session.expiration){
        console.log('redirect');
        // Token expired, redirect user to login
        res.redirect('/logged-out');
    } else {
        console.log('next');
        // Token not expired or no session, proceed to next middleware or route handler
        next();
    }
});


 app.get('/logged-out', (req, res) => {
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
