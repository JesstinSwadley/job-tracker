# Go React Job Tracker
## Description
**Managing job applications is chaotic; I built this to centralize the process with a focus on speed, security and data integrity**

This platform isn't just a CRUD app, it's a production-ready app designed to handle authenticated state transitions, secure credential management, and containerized deployment.

## Installation
### Prerequisites
- [Docker](https://www.docker.com/)

### Quick Start
1. **Clone the repository:**
```Bash
git clone https://github.com/JesstinSwadley/job-tracker.git
cd job-tracker
```

2. **Configure Environment Varibles:**
Create a .env file in the root directory (see Environment Variables below).

3. Spin up the containers:
```bash
docker compose up -d --build
```

## System Architecture 
### Tech Stack
- **Backend:** [Go](https://go.dev/) (Stateless REST API)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) + [React Router](https://reactrouter.com/)
- **Validation:** [Zod](https://zod.dev/) (Client-side)
- **Styling:** [Tailwind CSS 4.x](https://tailwindcss.com/)
- **Storage:** [PostgreSQL 16](https://www.postgresql.org/)
- **Infrastructure:** [Nginx](https://nginx.org/), [Docker](https://www.docker.com/), [AWS EC2](https://aws.amazon.com/)

## Configuration
### Environment Variables
Create a .env file in the root directory and populate it with the following:
| Name        | Type   | Notes                                      |
| ----------- | ------ | ------------------------------------------ |
| DB_NAME     | string | The name of the Postgres Database          |
| DB_USER     | string | The username for the Postgres Database     |
| DB_PASSWORD | string | The password for the Postgres Database     |
| DB_PORT     | number | Port Postgres listens for                  |
| JWT_SECRET  | string | A randomly generated string for JWT Secret |

## Roadmap
- [x] **Phase 1:** Go API & Database Schema
- [x] **Phase 2:** React Frontend & Auth Integration
- [x] **Phase 3:** Containerization (Docker & Nginx) & EC2 Deployment
- [x] **Phase 4:** Auth Hardening (Toast Notifications, OpenAPI/Swagger, Zod, JWT, Context)
- [x] **Phase 5:** Job Dashboard ("Authenticated Fetch", Job CRUD Logic, Vitest Test Suite)
- [ ] **Phase 6:** Quality Improvements (Design Polish, Loading State Component, Component Extraction & Integration Testing Suite)
- [ ] **Phase 7**: Additional Features (Dynamic status tracking, analytics, & E2E Testing)
- [ ] **Phase 8:** Production Deployment (Terraform Provisioning, CI/CD, AWS EC2/RDS, AWS EC2 ASG, AWS Elasticache, AWS ALB, Route53 DNS)
- [ ] **Phase 9:** Platform Evolution (Architectural Scaling: Factory Clients, Microservices prep, and Performance profiling.)