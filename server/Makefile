build:
	@go build -o bin/go-job-tracker cmd/main.go

run: build
	@./bin/go-job-tracker

dev:
	@go run cmd/main.go

test:
	@go test ./... -v -cover -shuffle=on -race -vet=all -failfast

sqlgen:
	@sqlc generate