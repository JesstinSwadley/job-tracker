package server

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/database"

	_ "modernc.org/sqlite"
)

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

	//Notes Endpoints
	mux.HandleFunc("POST /jobs/{id}/notes", s.handleCreateJobNote)
	mux.HandleFunc("GET /jobs/{id}/notes", s.handleGetJobNotes)
	mux.HandleFunc("PUT /jobs/{id}/notes/{noteId}", s.handleUpdateJobNote)
	mux.HandleFunc("DELETE /jobs/{id}/notes/{noteId}", s.handleDeleteJobNote)

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
