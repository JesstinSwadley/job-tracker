package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rs/cors"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

func main() {
	// Server Port Lookup
	port, ok := os.LookupEnv("PORT")
	if !ok {
		panic("There is no server port defined")
	}

	// Connect To Database
	dbPool := database.DatabasePool()
	defer dbPool.Close()

	if os.Getenv("SKIP_DB_PING") != "1" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := dbPool.Ping(ctx); err != nil {
			log.Fatalf("failed to ping database: %v", err)
		}
	}

	sqlcRepo := respository.New(dbPool)
	jobRepo := &handler.SQLCJobRepo{Queries: sqlcRepo}

	// API Router
	apiHandler := api.ApiRouter(jobRepo)

	// CORS Handler
	handler := cors.AllowAll().Handler(apiHandler)

	// Server
	log.Println("server listening on PORT:" + port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
