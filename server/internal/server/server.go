package server

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/database"

	_ "modernc.org/sqlite"
)

type CreateJobRequest struct {
	Company         string `json:"company"`
	Title           string `json:"title"`
	Location        string `json:"location"`
	WorkArrangement string `json:"work_arrangement"`
	URL             string `json:"url"`
	Stage           string `json:"stage"`
	Status          string `json:"status"`
	Notes           string `json:"notes"`
}

type UpdateJobRequest struct {
	Company         string `json:"company"`
	Title           string `json:"title"`
	Location        string `json:"location"`
	WorkArrangement string `json:"work_arrangement"`
	URL             string `json:"url"`
	Stage           string `json:"stage"`
	Status          string `json:"status"`
	Notes           string `json:"notes"`
}

type JobResponse struct {
	ID              int64  `json:"id"`
	Company         string `json:"company"`
	Title           string `json:"title"`
	Location        string `json:"location"`
	WorkArrangement string `json:"work_arrangement"`
	URL             string `json:"url"`
	Stage           string `json:"stage"`
	Status          string `json:"status"`
	Notes           string `json:"notes"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"company and position are required"`
}

type Server struct {
	db      *sql.DB
	queries *database.Queries
}

func New(dbPath string) *Server {
	db, err := sql.Open("sqlite", dbPath)

	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		log.Fatalf("failed to enable foreign keys: %v", err)
	}

	queries := database.New(db)

	s := &Server{
		db:      db,
		queries: queries,
	}

	return s
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", s.handleHealth)

	mux.HandleFunc("POST /jobs", s.handleCreateJob)
	mux.HandleFunc("GET /jobs", s.handleGetJobs)
	mux.HandleFunc("PUT /jobs/{id}", s.handleUpdateJob)
	mux.HandleFunc("DELETE /jobs/{id}", s.handleDeleteJob)

	return mux
}

// handleHealth godoc
// @Summary     Health Check
// @Description Verify that the API server is up and running
// @Tags        health
// @Produce     plain
// @Success     200 {string} string "OK"
// @Router      /health [get]
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// handleCreateJob godoc
// @Summary Create a new job
// @Description Submit a new job application to track
// @Tags jobs
// @Accept json
// @Produce json
// @Param request body CreateJobRequest true "Job details"
// @Success 201 {object} JobResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs [post]
func (s *Server) handleCreateJob(w http.ResponseWriter, r *http.Request) {
	var req CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	if strings.TrimSpace(req.Company) == "" || strings.TrimSpace(req.Title) == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "company and title are required"})
		return
	}

	if req.Stage == "" {
		req.Stage = "Search"
	}

	if req.Status == "" {
		req.Status = "Active"
	}

	params := database.CreateJobParams{
		Company: req.Company,
		Title:   req.Title,
		Location: sql.NullString{
			String: req.Location,
			Valid:  req.Location != "",
		},
		WorkArrangement: sql.NullString{
			String: req.WorkArrangement,
			Valid:  req.WorkArrangement != "",
		},
		Url: sql.NullString{
			String: req.URL,
			Valid:  req.URL != "",
		},
		Stage:  req.Stage,
		Status: req.Status,
		Notes: sql.NullString{
			String: req.Notes,
			Valid:  req.Notes != "",
		},
	}

	job, err := s.queries.CreateJob(r.Context(), params)

	if err != nil {
		log.Printf("failed to insert job: %v", err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to create job in database"})
		return
	}

	res := JobResponse{
		ID:              job.ID,
		Company:         job.Company,
		Title:           job.Title,
		Location:        job.Location.String,
		WorkArrangement: job.WorkArrangement.String,
		URL:             job.Url.String,
		Stage:           job.Stage,
		Status:          job.Status,
		Notes:           job.Notes.String,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(res)
}

// @Summary Get all jobs
// @Description Retrieve a list of all tracked jobs
// @Tags jobs
// @Produce json
// @Success 200 {array} JobResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs [get]
func (s *Server) handleGetJobs(w http.ResponseWriter, r *http.Request) {
	dbJobs, err := s.queries.ListJobs(r.Context())

	if err != nil {
		log.Printf("failed to list jobs: %v", err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to retrieve jobs"})
		return
	}

	res := make([]JobResponse, len(dbJobs))

	for i, job := range dbJobs {
		res[i] = JobResponse{
			ID:              job.ID,
			Company:         job.Company,
			Title:           job.Title,
			Location:        job.Location.String,
			WorkArrangement: job.WorkArrangement.String,
			URL:             job.Url.String,
			Stage:           job.Stage,
			Status:          job.Status,
			Notes:           job.Notes.String,
		}
	}

	if len(res) == 0 {
		res = []JobResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(res)
}

// @Summary Update a job
// @Description Update an existing job by ID
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param job body UpdateJobRequest true "Update job data"
// @Success 200 {object} JobResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id} [put]
func (s *Server) handleUpdateJob(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid job id"})
		return
	}

	var req UpdateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	if strings.TrimSpace(req.Company) == "" || strings.TrimSpace(req.Title) == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "company and title are required"})
		return
	}

	existingJob, err := s.queries.GetJob(r.Context(), id)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")

		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "job not found"})
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "database error"})
		}

		return
	}

	params := database.UpdateJobParams{
		ID:              id,
		Company:         req.Company,
		Title:           req.Title,
		Location:        sql.NullString{String: req.Location, Valid: req.Location != ""},
		WorkArrangement: sql.NullString{String: req.WorkArrangement, Valid: req.WorkArrangement != ""},
		Url:             sql.NullString{String: req.URL, Valid: req.URL != ""},
		Stage:           req.Stage,
		Status:          req.Status,
		Notes:           sql.NullString{String: req.Notes, Valid: req.Notes != ""},
		DatePosted:      existingJob.DatePosted,
		DateAssessed:    existingJob.DateAssessed,
		DateApplied:     existingJob.DateApplied,
	}

	updatedJob, err := s.queries.UpdateJob(r.Context(), params)

	if err != nil {
		log.Printf("failed to update job: %v", err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to update job in database"})
		return
	}

	res := JobResponse{
		ID:              updatedJob.ID,
		Company:         updatedJob.Company,
		Title:           updatedJob.Title,
		Location:        updatedJob.Location.String,
		WorkArrangement: updatedJob.WorkArrangement.String,
		URL:             updatedJob.Url.String,
		Stage:           updatedJob.Stage,
		Status:          updatedJob.Status,
		Notes:           updatedJob.Notes.String,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(res)
}

// @Summary Delete a job
// @Description Remove a tracked job by ID
// @Tags jobs
// @Param id path int true "Job ID"
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id} [delete]
func (s *Server) handleDeleteJob(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid job id"})
		return
	}

	// Check if the job exists in SQLite
	_, err = s.queries.GetJob(r.Context(), id)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "job not found"})
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "database error"})
		}
		return
	}

	err = s.queries.DeleteJob(r.Context(), id)

	if err != nil {
		log.Printf("failed to delete job: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to delete job in database"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
