# Oauth

For https

`openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes`

`sudo chmod 600`

Note: Make sure give proper authorization to all the files and directoryu


If using axios , errror will be recieved for self signed certificate, for that set rejectUnauthorized: false


Create dotenv file for client info, as if we use a separate system for it would get too complicated