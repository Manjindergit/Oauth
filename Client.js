const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');

app.get('/login', (req, res) => {
   const clientId = 'your-client-id';
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
    try {
        const response = await axios.post('https://localhost:3000/token', {code}, {httpsAgent});
        const accessToken = response.data.access_token;
        res.send(`Logged in with access token: ${accessToken}`);
    } catch (error) {
        console.error(`Error in POST request: ${error}`); // Add this line
        res.status(500).send('An error occurred.');
    }
 });

const sslServer = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app);

sslServer.listen(4000, () => console.log('Client app started on port 4000'));
