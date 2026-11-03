# Job Tracker
A lightweight, high-performance job application tracker and decision engine built with a product-first engineering mindset. Designed to eliminate spreadsheet fatigue, it features a zero-dependency Go standard library backend, a local SQLite datastore managed via Goose and sqlc, and a React/Vite frontend developed strictly through Test-Driven Development (TDD).

Beyond standard CRUD tracking, the application features a built-in **Opportunity Assessment Engine** that quantitatively scores job postings against a weighted 100-point rubric to generate actionable recommendations (`Apply - Priority`, `Apply - Target`, `Apply - Stretch`, or `Do Not Apply`).

## Tech Stack
- **Backend:** Go 1.22+ (net/http standard library routing with method matching)
- **Database:** SQLite (CGO-free via `modernc.org/sqlite`)
- **Data Tooling:** Goose (schema migrations) and sqlc (type-safe SQL-to-Go generation)
- **API Documentation:** Swagger / OpenAPI 2.0 via *swag*
- **Backend Testing:** Go standard library *testing* and *net/http/httptest*
- **Frontend:** React 18+, Typescript, Vite
- **Frontend Testing:** Vitest and *@testing-library/react*

## Features
- **Persistent Storage:** Zero-maintenance, self-hosted SQLite database with schema versioning via migrations and cascade deletion integrity.
- **Job Lifecycle Management:** Track applications through pipeline stages (`Search`, `Applied`, `Interview 1`, etc.) and statuses (`Active`, `Interviewing`, `Rejected`, `Offer`) with rich metadata (work arrangement, salary/location, notes).
- **Opportunity Assessment Engine:** Evaluates roles across 7 weighted rubric criteria (up to 100 points) and automatically computes recommendation tiers.
- **Modular Domain Architecture:** Decoupled Go architecture separating core server lifecycle, job pipeline management, and assessment calculation logic.
- **Interactive API Docs:** Living OpenAPI 2.0 / Swagger documentation generated directly from Go annotations.

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
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # CreateJobForm, JobList, UpdateJobForm
│   │   ├── App.tsx             # Main application container & API client
│   │   └── ...
│   └── vite.config.ts
├── server/                     # Go backend
│   ├── cmd/
│   │   └── main.go             # Application entry point
│   ├── docs/                   # Auto-generated Swagger documentation
│   ├── internal/
│   │   ├── database/           # sqlc queries, generated Go models, and Goose migrations
│   │   │   ├── migrations/
│   │   │   └── queries/
│   │   └── server/             # Modular HTTP handlers & TDD test suites
│   │       ├── server.go       # Server initialization, mux, and health check
│   │       ├── jobs.go         # Job CRUD handlers, DTOs, and lifecycle logic
│   │       ├── assessments.go  # Assessment handlers, DTOs, and scoring engine
│   │       ├── server_test.go  # Job CRUD integration test suite
│   │       └── assessment_test.go # Assessment scoring & cascade test suite
│   ├── sqlc.yaml               # sqlc configuration
│   └── jobtracker.db           # SQLite database file (created on migration)
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
|  Method   |  Endpoint               |  Description                                           | Status Codes         |
|  -------- |  ---------------------- |  ----------------------------------------------------  | -------------------  |
|  GET      |  /health                |  Server health check                                   |  200                 |
|  GET      |  /jobs                  |  Retrieve all tracked jobs                             |  200, 500            | 
|  POST     |  /jobs                  |  Create a new job appliaction                          |  201, 400, 500       |
|  PUT      |  /jobs/{id}             |  Update job details or status                          |  200, 400, 404, 500  |
|  DELETE   |  /jobs/{id}             |  Delete a tracked job                                  |  204, 400, 404, 500  |
|  GET      |  /jobs/{id}/assessment  |  Retrieve score and recommendation for a job           |  200, 400, 404, 500  |
|  PUT      |  /jobs/{id}/assessment  |  Upsert scores, compute total, and set recommendation  |  200, 400, 404, 500  |

## Assessment Scoring Rubric
|  Category              |  Max Score   |  Description                                           |
|  --------------------  |  ----------- |  ----------------------------------------------------  | 
|  Career Alignment      |  25          |  Alignment with long-term professional trajectory      |
|  Experience Match      |	20	        |  Match between candidate background and role scope     |
|  Technical Alignment   |	15	        |  Tech stack overlap and tool familiarity               |
|  Compensation Score    |	15	        |  Competitiveness vs. target market rate                |
|  Work Arrangement      |	10	        |  Remote / Hybrid / Onsite fit                          |
|  Geographic Alignment  |	5	        |  Time zone or office commute feasibility               |
|  Growth Value          | 10	        |  Upskill potential and team mentorship                 |

### Recommendation Thresholds
- 85 – 100: Apply - Priority (Immediate priority; submit application promptly)
- 75 – 84: Apply - Target (Solid match within target ballpark; apply when ready)
- 50 – 74: Apply - Stretch (Moderate overlap with on-the-job learning curve)
- < 50: Do Not Apply (Below qualification threshold)

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