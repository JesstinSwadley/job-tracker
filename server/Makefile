# Variables
BINARY_NAME=go-job-tracker

# Docker Variables
IMAGE_NAME ?= job-tracker-api
TAG ?= v1

# --- Go build & Testing commands ---
build:
	@go build -o bin/$(BINARY_NAME) cmd/main.go

run: build
	@./bin/$(BINARY_NAME)

build-prod:
	@CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/app ./cmd/main.go

dev:
	@go run cmd/main.go

test:
	@go test ./... -v -cover -shuffle=on -race -vet=all -failfast

# --- Tools ---
sqlgen:
	@sqlc generate

clean:
	@rm -rf bin/


# --- Docker Commands ---
docker-image-build: 
	@echo "Building Docker image $(IMAGE_NAME):$(TAG)"
	@docker build -t $(IMAGE_NAME):$(TAG)

docker-compose-up:
	@echo "Spinning up the full stack..."
	@docker-compose up --build

docker-compose-down:
	@echo "Shutting down..."
	@docker-compose down

docker-compose-logs:
	@docker-compose logs -f