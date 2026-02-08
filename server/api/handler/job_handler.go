package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type JobRepo interface {
	InsertJob(ctx context.Context, position, company string) (repository.Job, error)
}

type JobHandler struct {
	Repo JobRepo
}

func NewJobHandler(repo JobRepo) *JobHandler {
	return &JobHandler{Repo: repo}
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method Not Allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Position string `json:"position"`
		Company  string `json:"company"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	job, err := h.Repo.InsertJob(r.Context(), payload.Position, payload.Company)

	if err != nil {
		http.Error(w, `{"error":"Failed to insert job"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(struct {
		ID       int32  `json:"id"`
		Position string `json:"position"`
		Company  string `json:"company"`
	}{
		ID:       job.ID,
		Position: job.Position,
		Company:  job.Company,
	})
}

// func GetListOfJobs(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	dbConn := database.DatabaseConnection()
// 	repo := respository.New(dbConn)

// 	jobs, err := repo.ListJobs(ctx)

// 	if err != nil {
// 		panic(err)
// 	}

// 	jobsData, err := json.Marshal(jobs)

// 	if err != nil {
// 		panic(err)
// 	}

// 	w.WriteHeader(200)
// 	w.Write(jobsData)
// }

// func UpdateJob(w http.ResponseWriter, r *http.Request) {
// 	var job respository.Job

// 	decoder := json.NewDecoder(r.Body)

// 	if err := decoder.Decode(&job); err != nil {
// 		panic(err)
// 	}

// 	updateJob := respository.UpdateJobParams(job)

// 	ctx := r.Context()
// 	dbConn := database.DatabaseConnection()
// 	repo := respository.New(dbConn)

// 	err := repo.UpdateJob(ctx, updateJob)

// 	if err != nil {
// 		panic(err)
// 	}

// 	w.WriteHeader(200)
// 	w.Write([]byte("Job has been updated"))
// }

// func DeleteJob(w http.ResponseWriter, r *http.Request) {
// 	var job respository.Job

// 	decoder := json.NewDecoder(r.Body)

// 	if err := decoder.Decode(&job); err != nil {
// 		panic(err)
// 	}

// 	ctx := r.Context()
// 	dbConn := database.DatabaseConnection()
// 	repo := respository.New(dbConn)

// 	if err := repo.DeleteJob(ctx, job.ID); err != nil {
// 		panic(err)
// 	}

// 	w.WriteHeader(200)
// 	w.Header().Add("Content-Type", "application/json")
// 	w.Write([]byte("Job has been deleted"))
// }
