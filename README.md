# Job Tracker
A lightweight, high-performance job application tracker and decision engine built with a product-first engineering mindset. Designed to eliminate spreadsheet fatigue, it features a zero-dependency Go standard library backend, a local SQLite datastore managed via Goose and sqlc, and a React/Vite frontend developed strictly through Test-Driven Development (TDD).

Beyond standard CRUD tracking, the application features a built-in **Opportunity Assessment Engine** that quantitatively scores job postings against a weighted 100-point rubric to generate actionable recommendations (`Apply - Priority`, `Apply - Target`, `Apply - Stretch`, or `Do Not Apply`), alongside structured, sectioned note-taking for interview logs and role research.

## Tech Stack
- **Backend:** Go 1.22+ (`net/http` standard library routing with method matching)
- **Database:** SQLite (CGO-free via `modernc.org/sqlite`, WAL mode, foreign key enforcement)
- **Data Tooling:** Goose (schema migrations) and sqlc (type-safe SQL-to-Go generation)
- **API Documentation:** Swagger / OpenAPI 2.0 via `swag`
- **Backend Testing:** Go standard library `testing` and `net/http/httptest`
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Frontend Testing:** Vitest, `happy-dom`, and `@testing-library/react` (sub-second execution, zero `jest-dom` bloat)
- **Automation:** GNU Make

## Features
- **Persistent Relational Storage:** Zero-maintenance, self-hosted SQLite database with schema versioning via migrations and cascade deletion integrity (`ON DELETE CASCADE` for assessments and notes).
- **Full Lifecycle Pipeline & Sourcing:** Track applications across linear pipeline stages (`Search`, `Assessment`, `Interviewing` with an `interview_round` counter, `Offer`, `Archived`) and outcome statuses (`Active`, `Rejected`, `Withdrawn`, `Ghosted`), complete with discovery source, application platform, lifecycle dates (`date_posted`, `date_found`, `date_assessed`, `date_applied`), and direct Google Docs links for tailored resumes and cover letters.
- **Opportunity Assessment Engine:** Evaluates roles across 7 weighted rubric criteria (totaling 100 points) with a live-updating score meter, automated recommendation tiers, automatic `date_assessed` stamping, and joined summary badges.
- **Sectioned Notes & Interview Logs:** Attach multiple timestamped notes to any job categorized by section (`General`, `Role`, `Interview`, `Compensation`) and optional interview round.
- **Search & Status Filtering:** Filter applications on the fly by status tabs or execute real-time substring searches across company names, job titles, and locations.
- **Metric Summaries:** Instant dashboard counters tracking total tracked roles, in-flight interviews, and high-priority opportunities.
- **Destructive Action Confirmation:** Accessible confirmation dialog safeguard preventing accidental application deletions.
- **Strict TDD & Modular Architecture:** Comprehensive test coverage across isolated domain modules (`jobs`, `assessments`, and `notes`), guaranteeing rapid sub-second test runs across both frontend and backend suites.
- **Interactive API Documentation:** Living OpenAPI 2.0 / Swagger documentation generated directly from Go annotations.

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
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── assessments/       # AssessmentBadge, AssessmentModal & test suites
│   │   │   └── jobs/              # CreateJobForm, JobList, UpdateJobForm, DeleteJobModal & tests
│   │   ├── App.tsx                # Main dashboard, filter pipeline, & API client
│   │   ├── index.css              # Tailwind CSS v4 root import
│   │   ├── main.tsx               # React application root
│   │   └── setupTests.ts          # Test environment configuration
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts             # Vite configuration with @tailwindcss/vite & Vitest happy-dom
├── server/                        # Go backend
│   ├── cmd/
│   │   └── main.go                # Application entry point
│   ├── docs/                      # Auto-generated Swagger documentation
│   ├── internal/
│   │   ├── database/              # sqlc queries, generated Go models, and Goose migrations
│   │   │   ├── migrations/
│   │   │   └── queries/
│   │   └── server/                # Modular HTTP handlers & TDD test suites
│   │       ├── server.go          # Server initialization, mux, and health check
│   │       ├── helpers.go         # Shared JSON responders, path parsers, and sql.Null* converters
│   │       ├── jobs.go            # Job CRUD handlers, DTOs, and lifecycle logic
│   │       ├── assessments.go     # Assessment handlers, DTOs, and scoring engine
│   │       ├── notes.go           # Sectioned job notes CRUD handlers and DTOs
│   │       ├── testhelpers_test.go # Shared isolated test DB setup and seeding helpers
│   │       ├── server_test.go     # Health check & routing tests
│   │       ├── jobs_test.go       # Job CRUD integration test suite
│   │       ├── assessment_test.go # Assessment scoring, stage transition & cascade test suite
│   │       └── notes_test.go      # Sectioned notes CRUD, ownership & cascade test suite
│   ├── sqlc.yaml                  # sqlc configuration
│   ├── jobtracker.db              # SQLite development database
│   └── jobtracker_test.db         # SQLite isolated test database
├── Makefile                       # Root automation for dev, test, migration, and codegen tasks
└── README.md
```

## Getting Started
### 1. Initialize the Database
Apply migrations to create or update the local development database:
```Bash
make migrate-up
```

*Manual equivalent: (from project root)*
```Bash
cd server
goose -dir server/internal/database/migrations sqlite3 server/jobtracker.db up
```

### 2. Run the Backend
Start the Go API server:
```Bash
make dev-server
```

*Manual equivalent:*
```Bash
go run ./cmd/main.go
```

The server starts on http://localhost:8080. You can override the database path at runtime via -db flag or DB_PATH environment variable:
```Bash
go run ./cmd/main.go -db=/custom/path/jobtracker.db
```
The server starts on *http://localhost:8080*

### 3. Run the Frontend
In a separate terminal:
```Bash
make dev-client
```

*Manual equivalent:*
```Bash
cd client
npm install
npm run dev
```
Open *http://localhost:5173* in a browser to access the application

## Running Test
### All Suites (Backend + Frontend)
```Bash
make test
```

### Backend Go
Runs unit and integration tests across all packages
```Bash
make test-backend
```

Manual equivalent:
```Bash
cd server && TEST_DB_PATH="$(pwd)/jobtracker_test.db" go test -v ./...
```

### Frontend (Vitest)
Runs component test suites once (CI mode):
```Bash
make test-frontend
```

Runs component test suites in interactive watch mode:
```Bash
make test-frontend-watch
```

## API Specification
### Endpoints
| Method | Endpoint                  | Description                                                            | Status Codes        |
| ------ | ------------------------- | ---------------------------------------------------------------------- | ------------------- |
| GET    | /health                   | Server health check                                                    | 200                 |
| GET    | /jobs                     | Retrieve all tracked jobs with assessment summaries and note counts    | 200, 500            |
| POST   | /jobs                     | Create a new job application                                           | 201, 400, 500       |
| PUT    | /jobs/{id}                | Update job details, dates, links, stage, or status                     | 200, 400, 404, 500  |
| DELETE | /jobs/{id}                | Delete a tracked job (cascades to assessments and notes)               | 204, 400, 404, 500  |
| GET    | /jobs/{id}/assessment     | Retrieve score and recommendation for a job                            | 200, 400, 404, 500  |
| PUT    | /jobs/{id}/assessment     | Upsert scores, compute total, and mark job as assessed                 | 200, 400, 404, 500  |
| GET    | /jobs/{id}/notes          | Retrieve all sectioned notes for a job                                 | 200, 400, 404, 500  |
| POST   | /jobs/{id}/notes          | Add a new sectioned note to a job                                      | 201, 400, 404, 500  |
| PUT    | /jobs/{id}/notes/{noteId} | Update an existing note belonging to a job                             | 200, 400, 404, 500  |
| DELETE | /jobs/{id}/notes/{noteId} | Delete a note belonging to a job                                       | 204, 400, 404, 500  |

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