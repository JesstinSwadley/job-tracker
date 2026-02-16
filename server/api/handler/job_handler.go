package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type JobRepo interface {
	InsertJob(ctx context.Context, position, company string) (repository.Job, error)
	GetJobs(ctx context.Context) ([]repository.Job, error)
}

type JobHandler struct {
	Repo JobRepo
}

func NewJobHandler(repo JobRepo) *JobHandler {
	return &JobHandler{Repo: repo}
}

type CreateJobRequest struct {
	Position string `json:"position"`
	Company  string `json:"company"`
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Method Not Allowed",
		})

		return
	}

	var reqBody CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid request body",
		})

		return

	}

	job, err := h.Repo.InsertJob(r.Context(), reqBody.Position, reqBody.Company)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to create job",
		})

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Method Not Allowed",
		})

		return
	}

	jobs, err := h.Repo.GetJobs(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to fetch jobs",
		})

		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jobs)
}

// // func UpdateJob(w http.ResponseWriter, r *http.Request) {
// // 	var job respository.Job

// // 	decoder := json.NewDecoder(r.Body)

// // 	if err := decoder.Decode(&job); err != nil {
// // 		panic(err)
// // 	}

// // 	updateJob := respository.UpdateJobParams(job)

// // 	ctx := r.Context()
// // 	dbConn := database.DatabaseConnection()
// // 	repo := respository.New(dbConn)

// // 	err := repo.UpdateJob(ctx, updateJob)

// // 	if err != nil {
// // 		panic(err)
// // 	}

// // 	w.WriteHeader(200)
// // 	w.Write([]byte("Job has been updated"))
// // }

// // func DeleteJob(w http.ResponseWriter, r *http.Request) {
// // 	var job respository.Job

// // 	decoder := json.NewDecoder(r.Body)

// // 	if err := decoder.Decode(&job); err != nil {
// // 		panic(err)
// // 	}

// // 	ctx := r.Context()
// // 	dbConn := database.DatabaseConnection()
// // 	repo := respository.New(dbConn)

// // 	if err := repo.DeleteJob(ctx, job.ID); err != nil {
// // 		panic(err)
// // 	}

// // 	w.WriteHeader(200)
// // 	w.Header().Add("Content-Type", "application/json")
// // 	w.Write([]byte("Job has been deleted"))
// // }
