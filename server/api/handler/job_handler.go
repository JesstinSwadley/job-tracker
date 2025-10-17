package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

func NewJob(w http.ResponseWriter, r *http.Request) {
	var job respository.Job

	ctx := context.Background()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	decoder := json.NewDecoder(r.Body)

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
}
