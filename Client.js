const express = require('express');
const axios = require('axios');
const app = express();


app.get('/login', (req, res) => {
   const clientId = 'your-client-id';
   const redirectUri = 'http://localhost:4000/callback';
   res.redirect(`http://localhost:3000/authorize?response_type=code&casdaslient_id=${clientId}&redirect_uri=${redirectUri}`);
});


app.get('/callback', async (req, res) => {
   const code = req.query.code;
   const response = await axios.post('http://localhost:3000/token', {code});
   const accessToken = response.data.access_token;
   res.send(`c in with access token: ${accessToken}`);
});


app.listen(4000, () => console.log('Client app started on port 4000'));
