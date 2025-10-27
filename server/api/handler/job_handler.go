package handler

import (
	"encoding/json"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

func NewJob(w http.ResponseWriter, r *http.Request) {
	var job respository.Job

	ctx := r.Context()
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

func GetListOfJobs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	jobs, err := repo.ListJobs(ctx)

	if err != nil {
		panic(err)
	}

	jobsData, err := json.Marshal(jobs)

	if err != nil {
		panic(err)
	}

	w.WriteHeader(200)
	w.Write(jobsData)
}

func UpdateJob(w http.ResponseWriter, r *http.Request) {
	var job respository.Job

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&job); err != nil {
		panic(err)
	}

	updateJob := respository.UpdateJobParams(job)

	ctx := r.Context()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	err := repo.UpdateJob(ctx, updateJob)

	if err != nil {
		panic(err)
	}

	w.WriteHeader(200)
	w.Write([]byte("Job has been updated"))
}
