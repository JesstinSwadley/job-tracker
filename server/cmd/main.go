package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/internal/database"
)

func main() {
	// Server Port Lookup
	port, ok := os.LookupEnv("PORT")
	if !ok {
		panic("There is no server port defined")
	}

	// Connect To Database
	ctx := context.Background()
	conn := database.DatabaseConnection()
	defer conn.Close(ctx)

	// API Router Handler
	apiHandler := api.ApiRouter()

	// CORS Handler
	handler := cors.Default().Handler(apiHandler)

	// Server
	log.Println("server listening on PORT:" + port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
