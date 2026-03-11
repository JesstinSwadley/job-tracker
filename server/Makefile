# Database Variables
DB_USER ?= postgres
DB_PASS ?= postgres
DB_NAME ?= job_tracker
DB_PORT ?= 5432
JWT_SECRET ?= dev-secret-key-123

# Docker Variables
IMAGE_NAME ?= job-tracker-api
TAG ?= v1

# Determine Host IP for Docker
ifeq ($(OS),Windows_NT)
    HOST_INTERNAL = host.docker.internal
else
    UNAME_S := $(shell uname -s)
    ifeq ($(UNAME_S),Darwin)
        HOST_INTERNAL = host.docker.internal
    else
        HOST_INTERNAL = 172.17.0.1
    endif
endif

# --- Go build & Testing commands ---
build:
	@go build -o bin/go-job-tracker cmd/main.go

build-prod:
	@CGO-ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/app ./cmd/main.go

run: build
	@./bin/go-job-tracker

dev:
	@go run cmd/main.go

test:
	@go test ./... -v -cover -shuffle=on -race -vet=all -failfast

# --- SQLC & Goose Commands ---
sqlgen:
	@sqlc generate

# --- Cleanup ---
clean:
	@rm -rf bin/


# --- Docker Commands ---

docker-build: 
	@echo "Building Docker iamge $(IMAGE_NAME):$(TAG)"
	@docker build -t $(IMAGE_NAME):$(TAG)

docker-run-solo:
	@docker run --rm -p 8080:8080 \
		-e DB_URL="postgress://$(DB_USER):$(DB_PASS)@$(HOST_INTERNAL):$(DB_PORT)/$(DB_NAME)?sslmode=disable" \
		-e JWT_SECRET=$(JWT_SECRET) \
		$(IMAGE_NAME):$(TAG)