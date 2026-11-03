# Job Tracker
A lightweight, fast job application tracker built with a product-first engineering mindset—starting with a minimal, zero-dependency Go backend and a React/Vite frontend, strictly driven by Test-Driven Development (TDD).

## Tech Stack
- **Backend:** Go 1.22+ (net/http standard library routing with method matching)
- **Database:** SQLite (CGO-free via `modernc.org/sqlite`)
- **Data Tooling:** Goose (schema migrations) and sqlc (type-safe SQL-to-Go generation)
- **API Documentation:** Swagger / OpenAPI 2.0 via *swag*
- **Backend Testing:** Go standard library *testing* and *net/http/httptest*
- **Frontend:** React 18+, Typescript, Vite
- **Frontend Testing:** Vitest and *@testing-library/react*

## Features
- **Persistent Storage**: Fully local, self-hosted SQLite database with automated schema migrations.
- **Job Creation**: Submit new job applications with company, title, location, work arrangement, stage, status, and notes.
- **Job Listing**: View tracked applications in descending order (newest first) with an empty-state fallback.
- **Job Updates**: Edit existing application details with immediate UI sync and backend persistence.
- **Job Deletion**: Remove tracked applications safely using a confirmation modal and complete backend removal.
- **Interactive API Docs**: Auto-generated Swagger documentation and schema definitions.

## Prerequisites
- **Go:** 1.22 or higher
- **Node.js:** v18+ and *npm*
- **CLI Tools:** Install required Go binaries:
```bash
go install [github.com/swaggo/swag/cmd/swag@latest](https://github.com/swaggo/swag/cmd/swag@latest)
go install [github.com/pressly/goose/v3/cmd/goose@latest](https://github.com/pressly/goose/v3/cmd/goose@latest)
go install [github.com/sqlc-dev/sqlc/cmd/sqlc@latest](https://github.com/sqlc-dev/sqlc/cmd/sqlc@latest)
```

## Project Structure
```Plaintext
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # CreateJobForm, JobList, UpdateJobForm
│   │   ├── App.tsx         # Main application container & API client
│   │   └── ...
│   └── vite.config.ts
├── server/                 # Go backend
│   ├── cmd/
│   │   └── main.go         # Entry point
│   ├── docs/               # Auto-generated Swagger docs
│   ├── internal/
│   │   ├── database/       # sqlc generated code, SQL queries, and Goose migrations
│   │   └── server/         # Mux, handlers, models, and server tests
│   ├── sqlc.yaml           # sqlc configuration
│   └── jobtracker.db       # SQLite database (generated at runtime)
└── README.md
```

## Getting Started
### 1. Initialize the Database
Before running the backend, apply the schema migrations to create the SQLite database:
```Bash
cd server
goose -dir internal/database/migrations sqlite3 ./jobtracker.db up
```

### 2. Run the Backend
From the server directory:
```Bash
go run ./cmd/main.go
```
The server starts on *http://localhost:8080*

### 3. Run the Frontend
In a separate terminal:
```Bash
cd client
npm install
npm run dev
```
Open *http://localhost:5173* in a browser to acccess the application

## Running Test
### Backend Go
Runs unit and integration tests across all packages
```Bash
cd server
go test -v ./...
```

### Frontend (Vitest)
Runs component test suites in watch mode:
```Bash
cd client
npm test
```

To run once with coverage:
```Bash
npm test -- --run
```

## API Specification
### Endpoints
|  Method   |  Endpoint    |  Description                   | Status Codes    |
|  -------- |  ----------- |  ----------------------------  | --------------  |
|  GET      |  /health     |  Server health check           |  200            |
|  GET      |  /jobs       |  Retrieve all tracked jobs     |  200, 500       | 
|  POST     |  /jobs       |  Create a new job appliaction  |  201, 400, 500  |
|  PUT      |  /jobs/{id}  |  Update job details or status  |  200, 400, 404  |
|  DELETE   |  /jobs/{id}  |  Delete a tracked job          |  204, 400, 404  |

### Regenerating Backend Code
If you modify SQL queries in internal/database/queries:
```Bash
cd server
sqlc generate
```

### Regenerating Swagger Documentation
Whenever handler annotations change, regenerate the documentation:
```Bash
cd server
swag init -g cmd/main.go -o ./docs
```