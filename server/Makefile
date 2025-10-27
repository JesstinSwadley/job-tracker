build:
	@go build -o bin/go-ecommerce cmd/main.go

run: build
	@./bin/go-ecommerce

dev:
	@go run cmd/main.go

test:
	@go test -v ./...

sqlgen:
	@sqlc generate