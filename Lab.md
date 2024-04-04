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

## 7. Troubleshooting Guide
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
