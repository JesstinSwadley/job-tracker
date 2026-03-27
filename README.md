# Go React Job Tracker
A job tracking app that allows users to manage job applications

## Description
Managing job applications is chaotic; I built this to centralize the process with a focus on speed and data integrity

## Installation
### Quick Start
Use the containerization tool Docker to package and run the application, Docker can be installed on the docker website [docker](https://www.docker.com/).

Run the following command once you have Docker installed:
```bash
docker compose up -d --build
```

## System Architecture 
### Tech Stack
- Nginx: Acts as a reverse proxy, serving static frontend assets and routing /api requests to the backend.
- PostgreSQL: Persistent data storage for users and job applications, isolated within a private Docker network.
- Go API: A stateless REST service handling business logic and JWT authentication.
- React (Vite): A modern frontend library using React Router for client-side navigation and Tailwind CSS for responsive, utility-first styling.

## Usage
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
- [x] **Phase 3:** Containerization (Docker) & EC2 Deployment
- [ ] **Phase 4:** UX Hardening (Toasts, OpenAPI/Swagger, Error Handling)
- [ ] **Phase 5:** Cloud Scaling (Migrating to AWS RDS & S3/CloudFront)