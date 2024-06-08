Sure, here is the README in markdown format:

```markdown
# OAuth Demo README

## Overview

This project demonstrates a basic implementation of an OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange). The system consists of two main components:

1. **Authorization Server** (running on port 3000)
2. **Client Application** (running on port 4000)

The Authorization Server handles user authentication and session management, while the Client Application interacts with the Authorization Server to obtain access tokens and access protected resources.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on default port)
- SSL certificates (`key.pem` and `cert.pem`)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/oauth-demo.git
   cd oauth-demo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory of the project with the following content:

   ```plaintext
   AUTH_CODE=your_auth_code
   VALID_REDIRECT_URIS=https://localhost:4000/callback
   CLIENT_ID=your_client_id
   ```

4. Ensure that MongoDB is running locally.

5. Place your SSL certificates (`key.pem` and `cert.pem`) in the root directory of the project.

## Running the Authorization Server

1. Start the Authorization Server:

   ```bash
   node authServer.js
   ```

   This will start the server on `https://localhost:3000`.

## Running the Client Application

1. Start the Client Application:

   ```bash
   node clientApp.js
   ```

   This will start the client on `https://localhost:4000`.

## Usage

1. Open a browser and navigate to `https://localhost:4000`.
2. Click the **Login** button to start the authorization process.
3. The client will redirect you to the Authorization Server where you will authorize the client.
4. After authorization, you will be redirected back to the client with an authorization code.
5. The client will exchange the authorization code for an access token.
6. Use the **Fetch Data** button to request protected resources using the access token.
7. Use the **Logout** button to end the session.

## Authorization Server Endpoints

- `GET /authorize`: Handles authorization requests.
- `POST /token`: Handles token requests.
- `GET /data`: Returns protected data if the request is authorized.
- `GET /logout`: Clears the session and logs the user out.

## Client Application Endpoints

- `GET /login`: Initiates the authorization process.
- `GET /callback`: Handles the callback from the authorization server and exchanges the authorization code for an access token.
- `GET /data`: Requests protected data from the authorization server.
- `GET /logout`: Logs the user out and clears the session.

## Security

- Sessions are stored in MongoDB using `connect-mongodb-session`.
- HTTPS is used to secure communications between the client and the server.
- PKCE is used to enhance security during the authorization code exchange.

## Error Handling

- Errors are logged to the console.
- The authorization server has middleware to handle errors and respond with a 500 status code if something goes wrong.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Express
- MongoDB
- Node.js
- PKCE

For any issues or contributions, please create an issue or pull request on the project's GitHub repository.
```
