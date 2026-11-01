# Job Tracker
A lightweight, fast job application tracker built with a product-first engineering mindset—starting with a minimal, zero-dependency Go backend and a React/Vite frontend, strictly driven by Test-Driven Development (TDD).

## Tech Stack
- **Backend:** Go 1.22+ (net/http standard library routing with method matching, thread safe *sync.Mutex* in-memeory store)
- **API Documentation:** Swagger / OpenAPI 2.0 via *swag*
- **Backend Testing:** Go standard library *testing* and *net/http/httptest*
- **Frontend:** React 18+, Typescript, Vite
- **Frontend Testing:** Vitest and *@testing-library/react*

## Features
- **Job Creation**: Submit new job applications with company, position, and status.
- **Job Listing**: View tracked applications in ascending order with an empty-state fallback.
- **Job Updates**: Edit existing application details (company, position, lifecycle status) with immediate UI sync and backend persistence.
- **Interactive API Docs**: Auto-generated Swagger documentation and schema definitions.

## Prerequisites
- **Go:** 1.22 or higher
- **Node.js:** v18+ and *npm*
- **swag CLI:** Install via:
```bash
go install github.com/swaggo/swag/cmd/swag@latest
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
│   └── internal/
│       └── server/         # Mux, handlers, models, and server tests
└── README.md
```

## Getting Started
### 1. Run the Backend
From the repository root:
```Bash
cd server
go run ./cmd/main.go
```
The server starts on *http://localhost:8080*

### 2. Run the Frontend
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

### Running Tests
```
cd server
go test -v ./...
```

## API Specification
### Endpoints
|  Method   |  Endpoint    |  Description                   | Status Codes    |
|  -------- |  ----------- |  ----------------------------  | --------------  |
|  GET      |  /health     |  Server health check           |  200            |
|  GET      |  /jobs       |  Retrieve all tracked jobs     |  200            | 
|  POST     |  /jobs       |  Create a new job appliaction  |  201, 400       |
|  PUT      |  /jobs/{id}  |  Update job details or status  |  200, 400, 404  |

### Regenerating Swagger Documentation
Whenever handler annotations change, regenerate the documentation:
```Bash
cd server
swag init -g cmd/main.go -o ./docs
```