.PHONY: help dev-server dev-client test test-backend test-frontend test-frontend-watch migrate-create migrate-up migrate-down migrate-test sqlc swagger clean

# SQLite database paths
ROOT_DIR       := $(CURDIR)
DB_PATH        ?= $(ROOT_DIR)/server/jobtracker.db
TEST_DB_PATH   ?= $(ROOT_DIR)/server/jobtracker_test.db
MIGRATIONS_DIR := $(ROOT_DIR)/server/internal/database/migrations

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Development ---

dev-server: ## Run the Go backend server (use DB_PATH=<path> to override)
	@echo "Starting backend server..."
	@cd server && DB_PATH="$(DB_PATH)" go run ./cmd/main.go 

dev-client: ## Run the React Vite frontend
	@echo "Starting the React Vite frontend..."
	@cd client && npm run dev

# --- Database & Migrations ---

migrate-create: ## Create a new SQL migration (usage: make migrate-create name=<name>)
	@if [ -z "$(name)" ]; then \
		echo "Error: migration name is required."; \
		echo "Usage: make migrate-create name=<migration_name>"; \
		exit 1; \
	fi
	@goose -dir $(MIGRATIONS_DIR) create $(name) sql

migrate-up: ## Apply migrations to development database
	@echo "Applying migrations to development database..."
	@cd server && goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) up

migrate-down: ## Roll back last migration on development database
	@echo "Rolling back migration..."
	@cd server && goose -dir $(MIGRATIONS_DIR) sqlite3 $(DB_PATH) down

migrate-test: ## Apply migrations to isolated test database
	@echo "Applying migrations to test database..."
	@cd server && goose -dir $(MIGRATIONS_DIR) sqlite3 $(TEST_DB_PATH) up

# --- Testing ---

test: test-backend test-frontend ## Run all test suites (backend & frontend)

test-backend: migrate-test ## Run Go backend tests against isolated test database
	@echo "Running Go tests..."
	@cd server && TEST_DB_PATH="$(TEST_DB_PATH)" go test -v ./...

test-frontend: ## Run frontend Vitest suite once
	@echo "Running Vitest suite..."
	@cd client && npm test -- --run

test-frontend-watch: ## Run frontend Vitest suite in watch mode
	@cd client && npm test

# --- Code Generation ---

sqlc: ## Regenerate Go database models and query wrappers
	@echo "Running sqlc generate..."
	@cd server && sqlc generate

swagger: ## Regenerate Swagger / OpenAPI documentation
	@echo "Regenerating Swagger docs..."
	@cd server && swag init -g cmd/main.go -o ./docs

# --- Clean ---

clean: ## Remove temporary database and build artifacts
	@rm -f $(TEST_DB_PATH)
	@echo "Cleaned test database: $(TEST_DB_PATH)"