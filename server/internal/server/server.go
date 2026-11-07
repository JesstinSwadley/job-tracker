package server

import (
	"database/sql"
	"log"
	"net/http"

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

type AssessmentRequest struct {
	CareerAlignment      int `json:"career_alignment"`
	ExperienceMatch      int `json:"experience_match"`
	TechnicalAlignment   int `json:"technical_alignment"`
	CompensationScore    int `json:"compensation_score"`
	WorkArrangementScore int `json:"work_arrangement_score"`
	GeographicAlignment  int `json:"geographic_alignment"`
	GrowthValue          int `json:"growth_value"`
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

type AssessmentResponse struct {
	JobID                int64  `json:"job_id"`
	CareerAlignment      int    `json:"career_alignment"`
	ExperienceMatch      int    `json:"experience_match"`
	TechnicalAlignment   int    `json:"technical_alignment"`
	CompensationScore    int    `json:"compensation_score"`
	WorkArrangementScore int    `json:"work_arrangement_score"`
	GeographicAlignment  int    `json:"geographic_alignment"`
	GrowthValue          int    `json:"growth_value"`
	TotalScore           int    `json:"total_score"`
	Recommendation       string `json:"recommendation"`
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

	// Jobs Endpoints
	mux.HandleFunc("POST /jobs", s.handleCreateJob)
	mux.HandleFunc("GET /jobs", s.handleGetJobs)
	mux.HandleFunc("PUT /jobs/{id}", s.handleUpdateJob)
	mux.HandleFunc("DELETE /jobs/{id}", s.handleDeleteJob)

	// Assessment Endpoints
	mux.HandleFunc("GET /jobs/{id}/assessment", s.handleGetAssessment)
	mux.HandleFunc("PUT /jobs/{id}/assessment", s.handleSaveAssessment)

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
