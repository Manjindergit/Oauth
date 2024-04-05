# Lab Guide: OAuth 2.0 with Node.js

## 1. Introduction
In this lab, we will explore the OAuth 2.0 authorization framework using Node.js. We will learn about the OAuth 2.0 flow, how to implement an OAuth 2.0 server and client, and much more.

### Objectives of the Lab
- Understand the basics of OAuth 2.0.
- Learn how to implement an OAuth 2.0 server and client using Node.js.

## 2. Background
OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. It works by delegating user authentication to the service that hosts the user account and authorizing third-party applications to access the user account.

## 3. Pre-Lab Knowledge Check
Before we begin, let's ensure we understand the following concepts:
1. **OAuth 2.0**: It's an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service.
2. **Node.js**: It's a JavaScript runtime built on Chrome's V8 JavaScript engine.

## 4. Safety and Ethics 
Remember, with great power comes great responsibility. This lab is for educational purposes only. Always respect privacy and consent when using these skills. It's crucial to understand that misuse of these skills can lead to serious consequences. Therefore, let's ensure we use our knowledge ethically and responsibly, promoting a safer digital world.

## 5. Submission Requirements
Please submit the following upon completion of the lab:
- Screenshots of your work
- This completed .md file
- Any configuration files used or modified
- All the source code

## 6. Procedure
### 6.1 Installation and Minimum Requirements
1. **Update your package list**: Open your terminal and run the following command to make sure your system is up-to-date:
    
    `sudo apt-get update`

2. **Install Node.js**: Kali Linux comes with Node.js in its repositories. You can install it by running:

    `sudo apt-get install nodejs`

3. **Verify the installation**: Check the installed version of Node.js by running:
  
    `node -v`
  
4. **Install npm (Node Package Manager)**: npm is the package manager for Node.js and is necessary for installing Node.js modules. You can install it by running:

    `sudo apt-get install npm`
    
5. **Verify npm installation**: Check the installed version of npm by running:
    
    `npm -v`

For the local development environment, the recommended settings are:
- **Operating System**: Kali Linux
- **RAM**: At least 4 GB
- **Hard Disk Space**: At least 20 GB
- **Software**: Node.js and npm installed

Remember to replace `apt-get` with `apt` if you are using a newer version of Kali Linux. Also, you might need to use `nodejs -v` instead of `node -v` to check the Node.js version, depending on your Kali Linux version. If you want to use `node -v`, you can create a symbolic link between `node` and `nodejs` by running `sudo ln -s /usr/bin/nodejs /usr/bin/node`. This is because, in some versions of Linux, the binary is named `nodejs` instead of `node` due to a naming conflict.


### 6.2 Implementing OAuth 2.0 Server

#### Step 1: Create a new Node.js project
Create a new directory for your project and initialize it with npm:

`mkdir oauth-server`

`cd oauth-server`

`npm init -y`

#### Step 2: Install the necessary packages
Install the necessary packages (express, crypto, axios etc.):

`npm install express dotenv https fs path crypto express-session`

#### Step 3: Create a .env file
Create a .env file in your project root directory to store environment variables:

`touch .env`

Open the .env file and add the following lines:

`AUTH_CODE=your_auth_code`


Replace your_auth_code with your actual values.

#### Step 4: Generate SSL Certificate for HTTPS
To set up HTTPS, you need to generate a self-signed SSL certificate. Run the following command:

`openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes`

>This will create two files in your directory, key.pem (the private key) and cert.pem (the certificate).Make sure to give proper authorization to all the files and directories. You can set the permissions of the key file to be read and write only by the owner with the following command:

`sudo chmod 600 key.pem`

Handle Self-Signed Certificate Error
If you’re using axios, you might receive an error for the self-signed certificate. To handle this, you can set rejectUnauthorized to false. Here’s how you can do it:

`const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});`

#### Step 5: Create two separate servers, for client and one for authorising server


```js
//Server.js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```
```js
//Client.js
const axios = require('axios');

axios.get('http://localhost:3000')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });
```
Please make sure to install the necessary npm packages (express for the server and axios for the client) by running npm install express axios in your project directory. Also, you should run the server

```js
sslServer.listen(4000, () => console.log('Client app started on port 4000'));
```

Now your basic Client and Server are running, you have to implement Authorization Code Flow with PKCE, Access Token Issuance, Authorization Server to demonstrate a simplified implementation of Oauth.

### 6.3 Implementing Authorization Code Flow with PKCE
#### Step 1: Generate Code Verifier and Code Challenge
The code verifier is a cryptographically random string generated by the client, which is hashed (SHA256) and then URL-encoded to create the code challenge. This process ensures that the code verifier can’t be guessed from the code challenge.
```js
function generateCodeVerifier() {
    return crypto.randomBytes(64).toString('hex');
}

function generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256');
    hash.update(codeVerifier);
    return hash.digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
```

#### Step 2: Implement Authorization Request
The client redirects the user to the authorization server with the code challenge, client ID, and redirect URI.
```js
app.get('/authorize', (req, res) => {
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const authorizationUrl = `https://localhost:3000/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    res.redirect(authorizationUrl);
});
```
#### Step 3: Implement Token Request
The client exchanges the authorization code for an access token at the token endpoint of the authorization server. The client authenticates itself and sends the code verifier along with the authorization code.
```js
app.post('/token', (req, res) => {
    const { code, code_verifier: codeVerifier } = req.body;
    // Verify code and code verifier, and issue access token
});
```
#### 6.4 Implementing Access Token Issuance
The authorization server verifies the code and code verifier. If they are valid, the server issues an access token to the client.
```js
app.post('/token', (req, res) => {
    const { code, code_verifier: codeVerifier } = req.body;
    // Verify code and code verifier
    if (isValidCodeAndVerifier(code, codeVerifier)) {
        const accessToken = generateAccessToken();
        res.json({ access_token: accessToken });
    } else {
        res.status(400).send('Invalid code or code verifier');
    }
});
```
## 7. Implementing MongoDB
MongoDB is a source-available cross-platform document-oriented database program. It is classified as a NoSQL database program, which means it does not rely on the traditional table-based relational database structure. Instead, it uses JSON-like documents with optional schemas. MongoDB is developed by MongoDB Inc.

In the context of this lab, MongoDB can be used to store and manage user information and tokens in a secure and efficient manner. Here are the steps to install and use MongoDB:

#### Step 1: Install MongoDB
You can install MongoDB on your machine by following the instructions on the official MongoDB website. Here is the command to install MongoDB on Ubuntu:

`sudo apt-get install -y mongodb`

#### Step 2: Start MongoDB
After installing MongoDB, you can start the MongoDB service with the following command:

`sudo service mongodb start`

#### Step 3: Use MongoDB in your Node.js project
First, you need to install the MongoDB Node.js driver. You can do this with npm:

`npm install mongodb`

Use official documentation to implement mongodb in your code.

```js
var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
});
```

#### Step 4: Try to implement a GUI for login and logout

## 8. Troubleshooting Guide
This section provides solutions for common errors or issues you may encounter.
| Error | Issue | Solution |
| --- | --- | --- |
| EACCES: permission denied | This error occurs when Node.js does not have the necessary permissions to access a file or directory. | Run the command with sudo or change the permissions of the file or directory. |
| Error: Cannot find module 'express' | This error occurs when the ‘express’ module is not installed in your project. | Run `npm install express` in your project directory. |
| Error: Cannot find module 'axios' | This error occurs when the ‘axios’ module is not installed in your project. | Run `npm install axios` in your project directory. |
| Error: self signed certificate | This error occurs when using axios with a self-signed SSL certificate. | Create a new https agent with `rejectUnauthorized` set to false and use it in your axios request. |
| Error: listen EADDRINUSE: address already in use :::3000 | This error occurs when the port you are trying to use is already in use. | Change the port number or stop the process that is using the port. You can find the process using the port with the command `lsof -i :3000` and stop it with `kill -9 <PID>`. |
| Error: ENOENT: no such file or directory, open '.env' | This error occurs when the ‘.env’ file does not exist in your project directory. | Create a ‘.env’ file in your project directory with the command `touch .env`. |


## Reflection Question

1. How has your understanding of OAuth 2.0 and its flow improved after completing this lab? What were the most challenging concepts to grasp?
2. What were some challenges you faced while implementing the OAuth 2.0 flow in Node.js? How did you overcome these challenges?
3. How did this lab help you understand the importance of security in handling user data and authentication? Can you identify potential security risks and ways to mitigate them in your implementation?
4. How can the knowledge gained from this lab be applied to real-world applications? Can you think of any scenarios where implementing OAuth 2.0 would be beneficial?
5. What are some areas related to OAuth 2.0 and authentication that you’re interested in exploring further? 


## Rubric for Evaluation

| Criteria | Excellent | Good | Satisfactory | Needs Improvement | Unsatisfactory |
|----------|-----------|------|--------------|-------------------|----------------|
| Understanding of OAuth 2.0 | Demonstrates excellent understanding | Demonstrates good understanding | Demonstrates satisfactory understanding | Demonstrates a need for improvement in understanding | Demonstrates unsatisfactory understanding |
| Correct Implementation of OAuth 2.0 Flow | Excellent implementation | Good implementation | Satisfactory implementation | Implementation needs improvement | Unsatisfactory implementation |
| Lab Report Completion | All sections of the lab report are excellently completed | Most sections of the lab report are well completed | Lab report is satisfactorily completed | Lab report completion needs improvement | Lab report is unsatisfactorily completed |
| Reflection | Provides excellent reflection on the lab experience | Provides good reflection on the lab experience | Provides satisfactory reflection on the lab experience | Reflection on the lab experience needs improvement | Provides unsatisfactory reflection on the lab experience |
| Ethical Considerations | Demonstrates excellent understanding of ethical considerations | Demonstrates good understanding of ethical considerations | Demonstrates satisfactory understanding of ethical considerations | Understanding of ethical considerations needs improvement | Demonstrates unsatisfactory understanding of ethical considerations |

**References**

https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl

https://www.npmjs.com/package/mongodb

https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors

https://codeculturepro.medium.com/implementing-authentication-in-nodejs-app-using-oauth2-0-59fee8f63798

https://merlino.agency/blog/step-by-step-how-to-implement-oauth2-server-in-expressjs

https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce

https://stackoverflow.com/questions/11744975/enabling-https-on-express-js

https://dev.to/fredabod/building-an-express-app-with-an-https-server-2mbj

https://expressjs.com/en/guide/using-middleware.html

https://thriveread.com/nodejs-https-server-with-express-and-createserver/