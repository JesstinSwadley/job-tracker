package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/JesstinSwadley/job-tracker/internal/middleware"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/jackc/pgx/v5/pgtype"
)

type JobRepo interface {
	InsertJob(ctx context.Context, arg repository.InsertJobParams) (repository.Job, error)
	GetJobs(ctx context.Context, userID int32) ([]repository.Job, error)
	UpdateJob(ctx context.Context, arg repository.UpdateJobParams) (repository.Job, error)
	DeleteJob(ctx context.Context, arg repository.DeleteJobParams) error
}

type JobHandler struct {
	Repo JobRepo
}

func NewJobHandler(repo JobRepo) *JobHandler {
	return &JobHandler{Repo: repo}
}

func (h *JobHandler) errorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

type JobRequest struct {
	Position      string     `json:"position"`
	Company       string     `json:"company"`
	Status        string     `json:"status"`
	Salary        *string    `json:"salary"`
	JobUrl        *string    `json:"job_url"`
	Notes         *string    `json:"notes"`
	Source        *string    `json:"source"`
	LocationType  *string    `json:"location_type"`
	AppliedAt     *time.Time `json:"applied_at"`
	InterviewedAt *time.Time `json:"interviewed_at"`
}

type JobResponse struct {
	Position      string     `json:"position"`
	Company       string     `json:"company"`
	Status        string     `json:"status"`
	Salary        *string    `json:"salary"`
	JobUrl        *string    `json:"job_url"`
	Notes         *string    `json:"notes"`
	Source        *string    `json:"source"`
	LocationType  *string    `json:"location_type"`
	AppliedAt     *time.Time `json:"applied_at"`
	InterviewedAt *time.Time `json:"interviewed_at"`
}

func toTimestamptz(t *time.Time) pgtype.Timestamptz {
	if t == nil {
		return pgtype.Timestamptz{Valid: false}
	}

	return pgtype.Timestamptz{Time: *t, Valid: true}
}

// CreateJob godoc
// @Summary      Create a new job
// @Tags         jobs
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request  body      JobRequest  true  "Job Details"
// @Success      201      {object}  JobResponse
// @Router       /jobs [post]
func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, err := middleware.GetUserID(r.Context())

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Unauthorized")

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

	if reqBody.Status == "" {
		reqBody.Status = "Applied"
	}

	job, err := h.Repo.InsertJob(r.Context(), repository.InsertJobParams{
		Position:      reqBody.Position,
		Company:       reqBody.Company,
		UserID:        userID,
		Status:        reqBody.Status,
		Salary:        reqBody.Salary,
		JobUrl:        reqBody.JobUrl,
		Notes:         reqBody.Notes,
		Source:        reqBody.Source,
		LocationType:  reqBody.LocationType,
		AppliedAt:     toTimestamptz(reqBody.AppliedAt),
		InterviewedAt: toTimestamptz(reqBody.InterviewedAt),
	})

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to create job")

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(job)
}

// GetJobs godoc
// @Summary      Get all jobs
// @Description  Retrieve a list of all job applications for the logged-in user
// @Tags         jobs
// @Security     BearerAuth
// @Produce      json
// @Success      200  {array}   JobResponse
// @Failure      401  {object}  map[string]string
// @Router       /jobs [get]
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

// UpdateJob godoc
// @Summary      Update a job
// @Tags         jobs
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id       path      int         true  "Job ID"
// @Param        request  body      JobRequest  true  "Updated Job Details"
// @Success      200      {object}  JobResponse
// @Router       /jobs/{id} [put]
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

	job, err := h.Repo.UpdateJob(r.Context(), repository.UpdateJobParams{
		ID:            int32(parsedID),
		Position:      reqBody.Position,
		Company:       reqBody.Company,
		Status:        reqBody.Status,
		Salary:        reqBody.Salary,
		JobUrl:        reqBody.JobUrl,
		Notes:         reqBody.Notes,
		Source:        reqBody.Source,
		LocationType:  reqBody.LocationType,
		AppliedAt:     toTimestamptz(reqBody.AppliedAt),
		InterviewedAt: toTimestamptz(reqBody.InterviewedAt),
		UserID:        userID,
	})

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to update job")

		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(job)
}

// DeleteJob godoc
// @Summary      Delete a job
// @Tags         jobs
// @Security     BearerAuth
// @Param        id   path      int  true  "Job ID"
// @Success      204  "No Content"
// @Router       /jobs/{id} [delete]
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

	err = h.Repo.DeleteJob(r.Context(), repository.DeleteJobParams{
		ID:     int32(parsedID),
		UserID: userID,
	})

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to delete job")

		return
	}

	w.WriteHeader(http.StatusNoContent)
}
