package main

import (
	"log"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

// @title 		Job Tracker API
// @version 	0.1
// @description API for tracking job applications.
// @host		localhost:8080
// @BasePath	/
func main() {
	router := server.New()

	log.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
