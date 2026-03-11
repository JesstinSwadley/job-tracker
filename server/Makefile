build:
	@go build -o bin/go-job-tracker cmd/main.go

build-prod:
	@CGO-ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bin/app ./main.go

run: build
	@./bin/go-job-tracker

dev:
	@go run cmd/main.go

test:
	@go test ./... -v -cover -shuffle=on -race -vet=all -failfast

sqlgen:
	@sqlc generate

clean:
	@rm -rf bin/