# --- Variables ---
BINARY_NAME=go-job-tracker
IMAGE_API=job-tracker-api
IMAGE_FE=job-tracker-ui
TAG=v1
DB_URL_LOCAL=postgres://devuser:devpassword@localhost:5432/jobtracker?sslmode=disable

# --- Docker Compose Controls ---
.PHONY: up down logs
up:
	@echo "Starting Full Stack (DB, API, UI)..."
	@docker compose up --build

down:
	@echo "Stopping and removing containers..."
	@docker compose down

logs:
	@docker compose logs -f

# --- Local Development (No Docker) ---
.PHONY: dev-backend dev-frontend
dev-backend:
	@echo "Running Go backend locally..."
	@cd server && go run cmd/main.go

dev-frontend:
	@echo "Starting Frontend dev server..."
	@cd client && npm install && npm run dev

# --- Build & Generation Tools ---
.PHONY: sqlgen build-fe build-go-prod
sqlgen:
	@echo "Generating SQLC code..."
	@cd server && sqlc generate

build-fe:
	@echo "Building Frontend static files..."
	@cd client && npm install && npm run build

build-go-prod:
	@echo "Building Production Go binary (Static/Linux)..."
	@cd server && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/app ./cmd/main.go

# --- Individual Docker Image Builds ---
.PHONY: docker-image-backend docker-image-frontend
docker-image-backend:
	@echo "Building Backend Docker Image..."
	@docker build -t $(IMAGE_API):$(TAG) ./server

docker-image-frontend:
	@echo "Building Frontend Docker Image..."
	@docker build -t $(IMAGE_FE):$(TAG) ./client

# --- Database Migrations ---
.PHONY: migrate-up migrate-down
migrate-up:
	@echo "Running database migrations..."
	@goose -dir ./server/db/migrations postgres "$(DB_URL_LOCAL)" up

migrate-down:
	@echo "Rolling back migrations..."
	@goose -dir ./server/db/migrations postgres "$(DB_URL_LOCAL)" down

# --- Quality Control ---
.PHONY: test clean
test:
	@echo "Running backend tests..."
	@cd server && go test ./... -v -cover -shuffle=on -race -vet=all -failfast

clean:
	@echo "🧹 Cleaning up binaries and build artifacts..."
	@rm -rf ./server/bin
	@rm -rf ./client/dist