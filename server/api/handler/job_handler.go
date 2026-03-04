package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/middleware"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type JobRepo interface {
	InsertJob(ctx context.Context, position, company string, userID int32) (repository.Job, error)
	GetJobs(ctx context.Context, userID int32) ([]repository.Job, error)
	UpdateJob(ctx context.Context, id, userID int32, position, company string) (repository.Job, error)
	DeleteJob(ctx context.Context, id, userID int32) error
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

type JobRequest struct {
	Position string `json:"position"`
	Company  string `json:"company"`
}

func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody JobRequest

	userID, err := middleware.GetUserID(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Unauthorized")

		return
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	if strings.TrimSpace(reqBody.Position) == "" || strings.TrimSpace(reqBody.Company) == "" {
		h.errorResponse(w, http.StatusBadRequest, "Position and Company are required")
		return
	}

	job, err := h.Repo.InsertJob(r.Context(), reqBody.Position, reqBody.Company, userID)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to create job")

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

func (h *JobHandler) GetJobs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, err := middleware.GetUserID(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Unauthorized")

		return
	}

	jobs, err := h.Repo.GetJobs(r.Context(), userID)

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

	userID, err := middleware.GetUserID(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Unauthorized")

		return
	}

	idStr := r.PathValue("id")
	parsedID, err := strconv.ParseInt(idStr, 10, 32)

	if err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid job ID")

		return
	}

	var reqBody JobRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	if strings.TrimSpace(reqBody.Position) == "" || strings.TrimSpace(reqBody.Company) == "" {
		h.errorResponse(w, http.StatusBadRequest, "Position and Company are required")

		return
	}

	job, err := h.Repo.UpdateJob(r.Context(), int32(parsedID), userID, reqBody.Position, reqBody.Company)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to update job")

		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(job)
}

func (h *JobHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, err := middleware.GetUserID(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Unauthorized")

		return
	}

	idStr := r.PathValue("id")

	parsedID, err := strconv.ParseInt(idStr, 10, 32)

	if err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid job ID")

		return
	}

	err = h.Repo.DeleteJob(r.Context(), int32(parsedID), userID)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to delete job")
	}

	w.WriteHeader(http.StatusNoContent)
}
