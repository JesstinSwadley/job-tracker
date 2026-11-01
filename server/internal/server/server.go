package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

type CreateJobRequest struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
}

type UpdateJobRequest struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
}

type JobResponse struct {
	ID       int    `json:"id"`
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"company and position are required"`
}

type Server struct {
	mu     sync.Mutex
	nextID int
	jobs   map[int]JobResponse
	mux    *http.ServeMux
}

func New() *Server {
	s := &Server{
		nextID: 1,
		jobs:   make(map[int]JobResponse),
		mux:    http.NewServeMux(),
	}

	s.routes()

	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

func (s *Server) routes() {
	s.mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	s.mux.HandleFunc("POST /jobs", s.handleCreateJob)
	s.mux.HandleFunc("GET /jobs", s.handleGetJobs)
	s.mux.HandleFunc("PUT /jobs/{id}", s.handleUpdateJob)
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
// @Router /jobs [post]
func (s *Server) handleCreateJob(w http.ResponseWriter, r *http.Request) {
	var req CreateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error" : "invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Company) == "" || strings.TrimSpace(req.Position) == "" {
		http.Error(w, `{"error":"company and position are required"}`, http.StatusBadRequest)

		return
	}

	if req.Status == "" {
		req.Status = "Applied"
	}

	s.mu.Lock()

	newJob := JobResponse{
		ID:       s.nextID,
		Company:  req.Company,
		Position: req.Position,
		Status:   req.Status,
	}

	s.jobs[s.nextID] = newJob
	s.nextID++

	s.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(newJob)
}

// @Summary Get all jobs
// @Description Retrieve a list of all tracked jobs
// @Tags jobs
// @Produce json
// @Success 200 {array} JobResponse
// @Router /jobs [get]
func (s *Server) handleGetJobs(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	jobs := make([]JobResponse, 0, len(s.jobs))

	for i := 1; i < s.nextID; i++ {
		if job, exists := s.jobs[i]; exists {
			jobs = append(jobs, job)
		}
	}

	_ = json.NewEncoder(w).Encode(jobs)
}

// @Summary Update a job
// @Description Update an existing job by ID
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param job body UpdateJobRequest true "Update job data"
// @Success 200 {object} JobResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /jobs/{id} [put]
func (s *Server) handleUpdateJob(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid job id"})
		return
	}

	var req UpdateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.Company == "" || req.Position == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "company and position are required"})
		return
	}

	if req.Status == "" {
		req.Status = "Applied"
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.jobs[id]; !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "job not found"})
		return
	}

	updated := JobResponse{
		ID:       id,
		Company:  req.Company,
		Position: req.Position,
		Status:   req.Status,
	}

	s.jobs[id] = updated

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(updated)
}
