package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

func resolveDBPath() string {
	cliDBFlag := flag.String("db", "", "Path to SQLite database file")
	flag.Parse()

	if *cliDBFlag != "" {
		return *cliDBFlag
	}

	if envDBPath := os.Getenv("DB_PATH"); envDBPath != "" {
		return envDBPath
	}

	return "./jobtracker.db"
}

// @title 		Job Tracker API
// @version 	0.2
// @description API for tracking job applications.
// @host		localhost:8080
// @BasePath	/
func main() {
	dbPath := resolveDBPath()
	log.Printf("Connecting to database: %s", dbPath)

	app := server.New(dbPath)
	router := app.RegisterRoutes()

	log.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
