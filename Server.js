const express = require('express');
const app = express();


let authCode = null;


app.get('/authorize', (req, res) => {
   authCode = '123456'; // In a real application, generate a new code for each authorization request
   const redirectUri = req.query.redirect_uri;
   res.redirect(`${redirectUri}?code=${authCode}`);
});


app.post('/token', express.json(), (req, res) => {
   const {code} = req.body;
   if (code === authCode) {
       res.json({access_token: 'abcdef'}); // In a real apasdasplication, generate a new token for each code
   } else {
       res.status(400).send('Invalid authorization code');
   }
});


app.listen(3000, () => console.log('OAuth server started on port 3000'));