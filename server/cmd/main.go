package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/rs/cors"

	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

func main() {
	port, ok := os.LookupEnv("PORT")

	if !ok {
		panic("There is no server port defined")
	}

	db, ok := os.LookupEnv("DB_URL")

	if !ok {
		panic("There is no Database URL")
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

		if err := decoder.Decode(&job); err != nil {
			panic(err)
		}

		j, err := repo.InsertJob(ctx, respository.InsertJobParams{
			Position: job.Position,
			Company:  job.Company,
		})

		if err != nil {
			panic(err)
		}

		w.WriteHeader(201)
		w.Write([]byte(j.Position + " at " + j.Company + " added."))
	})

	log.Println("server listening on PORT:" + port)

	handler := cors.Default().Handler(mux)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
