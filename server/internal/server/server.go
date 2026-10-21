package server

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
)

type createJobRequest struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
}

type jobResponse struct {
	ID       int    `json:"id"`
	Company  string `json:"company"`
	Position string `json:"position"`
	Status   string `json:"status"`
}

type Server struct {
	mu     sync.Mutex
	nextID int
	jobs   map[int]jobResponse
	mux    *http.ServeMux
}

func New() *Server {
	s := &Server{
		nextID: 1,
		jobs:   make(map[int]jobResponse),
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
}

func (s *Server) handleCreateJob(w http.ResponseWriter, r *http.Request) {
	var req createJobRequest

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

	newJob := jobResponse{
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
