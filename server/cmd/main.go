package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type Job struct {
	Position string `json:"position"`
	Company  string `json:"company"`
}

func main() {
	port, ok := os.LookupEnv("PORT")

	if !ok {
		log.Fatal("There is no server port defined")
		os.Exit(1)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("POST /", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var job Job

		err := decoder.Decode(&job)

		if err != nil {
			panic(err)
		}

		fmt.Println("Job at " + job.Company + " for " + job.Position)
	})

	log.Println("server listening on PORT:" + port)

	err := http.ListenAndServe(":"+port, mux)

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
