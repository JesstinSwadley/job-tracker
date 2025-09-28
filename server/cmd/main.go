package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"

	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

func main() {
	port, ok := os.LookupEnv("PORT")

	if !ok {
		log.Fatal("There is no server port defined")
		os.Exit(1)
	}

	db, ok := os.LookupEnv("DB_URL")

	if !ok {
		log.Fatal("There is no Database URL")
		os.Exit(1)
	}

	ctx := context.Background()

	conn, err := pgx.Connect(context.Background(), db)

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	defer conn.Close(ctx)

	repo := respository.New(conn)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)

		var job respository.Job

		err := decoder.Decode(&job)

		if err != nil {
			panic(err)
		}

		err = repo.InsertJob(ctx, respository.InsertJobParams{
			Position: job.Position,
			Company:  job.Company,
		})

		if err != nil {
			panic(err)
		}

		w.WriteHeader(201)
		w.Write([]byte(job.Position + " at " + job.Company + " added."))
	})

	log.Println("server listening on PORT:" + port)

	err = http.ListenAndServe(":"+port, mux)

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
