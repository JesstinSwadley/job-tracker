# Job Tracker
A lightweight, fast job application tracker. This project is built with a product-first engineering mindset—starting with a minimal, zero-dependency Go backend and a React/Vite frontend, introducing abstractions and infrastructure only as complexity demands.

## Getting Started
### Prerequisites
- Go 1.22+
- swag CLI

### Running the Backend Server
The backend currently uses an in-memory data store for rapid development and testing.
```
cd server
go run ./cmd/main.go
```

### Running Tests
```
cd server
go test -v ./...
```