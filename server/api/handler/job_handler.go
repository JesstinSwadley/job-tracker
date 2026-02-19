package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type JobRepo interface {
	InsertJob(ctx context.Context, position, company string) (repository.Job, error)
	GetJobs(ctx context.Context) ([]repository.Job, error)
	UpdateJob(ctx context.Context, id int32, position, company string) (repository.Job, error)
}

type JobHandler struct {
	Repo JobRepo
}

func NewJobHandler(repo JobRepo) *JobHandler {
	return &JobHandler{Repo: repo}
}

func (h *JobHandler) errorResponse(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

type CreateJobRequest struct {
	Position string `json:"position"`
	Company  string `json:"company"`
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	if strings.TrimSpace(reqBody.Position) == "" || strings.TrimSpace(reqBody.Company) == "" {
		h.errorResponse(w, http.StatusBadRequest, "Position and Company are required")
		return
	}

	job, err := h.Repo.InsertJob(r.Context(), reqBody.Position, reqBody.Company)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to create job")

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	jobs, err := h.Repo.GetJobs(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to fetch jobs")

		return
	}

	if jobs == nil {
		jobs = []repository.Job{}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jobs)
}

func (h *JobHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := r.PathValue("id")

	parsedID, err := strconv.ParseInt(idStr, 10, 32)

	if err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid job ID")

		return
	}

	id := int32(parsedID)

	var reqBody CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	if strings.TrimSpace(reqBody.Position) == "" || strings.TrimSpace(reqBody.Company) == "" {
		h.errorResponse(w, http.StatusBadRequest, "Position and Company are required")

		return
	}

	job, err := h.Repo.UpdateJob(r.Context(), id, reqBody.Position, reqBody.Company)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to update job")

		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(job)
}

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
