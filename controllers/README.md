# Controllers for File Manager

This directory contains the controllers used in the File Manager project. Controllers are responsible for handling incoming requests and returning responses to the client.

## [AppController](./AppController.js)

> Manages application-wide operations.

**Key Methods:**

- `getStatus(req, res)`: Checks if Redis and MongoDB servers are alive and returns their status.
- `getStats(req, res)`: Fetches and returns statistics about users and files from the database.

## [AuthController](./AuthController.js)

> Handles authentication-related operations.

**Key Methods:**

- `getConnect(req, res)`: Authenticates a user using Basic Auth, generates a token, and stores it in Redis.
- `getDisconnect(req, res)`: Invalidates a user's authentication token.

## [UserController](./UserController.js)

> Manages user-specific operations.

**Key Methods:**

- `postNew(req, res)`: Registers a new user in the database.
- `getMe(req, res)`: Retrieves the profile of the currently authenticated user based on the provided token.

Each controller is designed to interact with the Redis and MongoDB clients defined in the utilities folder, ensuring a separation of concerns and making the codebase easier to maintain and extend.