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
DB_SSL=<true/false>

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE
CORS_HEADERS=Content-Type,Authorization

# JWT
JWT_SECRET=your_secret_key
```

### Frontend `.env`

```sh
VITE_API_BASE_URL=http://localhost:3000
```

## Running the Web Application Locally

To set up and run the web application locally, follow these steps:

1. **Set Up Environment Variables**: Ensure `.env` files are correctly configured in both the backend and frontend directories.
2. **Navigate to the project directory**: `cd nus-tour`
3. **Install dependencies**: `npm run install`
4. **Start the application**: `npm run start:dev`

The application will be running at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Running the Backend with Docker

If you'd like to run the backend inside a Docker container, follow these steps:

- **Build the Docker Image**:
  - Unix-like: `docker build -t nus-tour-backend -f ./backend/Dockerfile ./backend`
  - Windows: `docker build -t nus-tour-backend -f .\backend\Dockerfile .\backend`
- **Run the Docker Container**:
  - Unix-like: `docker run -it -p 0.0.0.0:3000:3000 --env-file ./backend/.env nus-tour-backend`
  - Windows: `docker run -it -p 0.0.0.0:3000:3000 --env-file .\backend\.env nus-tour-backend`

The backend will be running at: http://localhost:3000
