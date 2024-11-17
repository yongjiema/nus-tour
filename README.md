# NUS Tour

NUS Tour

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org) installed on your machine or set up a [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) in Visual Studio Code.

## Environment Variables

Environment variables are required to configure the backend and frontend. Sample files are provided for your convenience.

### Backend `.env`

```sh
# Database Configuration
DB_HOST=<host>
DB_PORT=<port>
DB_NAME=<database>
DB_USER=<user>
DB_PASSWORD=<password>

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_HEADERS=Content-Type,Authorization
```

### Frontend `.env`

```sh
VITE_API_BASE_URL=http://localhost:3000
```

## Run the Web Application

To set up and run the web application locally, follow these steps:

1. **Set Up Environment Variables**: Ensure `.env` files are correctly configured in both the backend and frontend directories.
2. **Navigate to the project directory**: `cd nus-tour`
3. **Install dependencies**: `npm run install:all`
4. **Start the application**: `npm run start:dev:all`

The application will be running at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

