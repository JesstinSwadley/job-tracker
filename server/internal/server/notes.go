package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/database"
)

type CreateJobNoteRequest struct {
	Section        string `json:"section"`
	InterviewRound int64  `json:"interview_round"`
	Content        string `json:"content"`
}

type UpdateJobNoteRequest struct {
	Section        string `json:"section"`
	InterviewRound int64  `json:"interview_round"`
	Content        string `json:"content"`
}

type JobNoteResponse struct {
	ID             int64  `json:"id"`
	JobID          int64  `json:"job_id"`
	Section        string `json:"section"`
	InterviewRound int64  `json:"interview_round"`
	Content        string `json:"content"`
	CreatedAt      string `json:"created_at,omitempty"`
	UpdatedAt      string `json:"updated_at,omitempty"`
}

func mapNoteToResponse(note database.JobNote) JobNoteResponse {
	return JobNoteResponse{
		ID:             note.ID,
		JobID:          note.JobID,
		Section:        note.Section,
		InterviewRound: fromNullInt64(note.InterviewRound),
		Content:        note.Content,
		CreatedAt:      formatNullTimestamp(note.CreatedAt),
		UpdatedAt:      formatNullTimestamp(note.UpdatedAt),
	}
}

// handleGetJobNotes godoc
// @Summary List notes for a job
// @Description Retrieve all sectioned notes associated with a specific job
// @Tags notes
// @Produce json
// @Param id path int true "Job ID"
// @Success 200 {array} JobNoteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/notes [get]
func (s *Server) handleGetJobNotes(w http.ResponseWriter, r *http.Request) {
	jobID, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	if _, err := s.queries.GetJob(r.Context(), jobID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "job not found")
		} else {
			log.Printf("failed to verify job %d before listing notes: %v", jobID, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}
		return
	}

	dbNotes, err := s.queries.ListJobNotesByJobID(r.Context(), jobID)

	if err != nil {
		log.Printf("failed to list notes for job %d: %v", jobID, err)
		writeError(w, http.StatusInternalServerError, "failed to retrieve notes")
		return
	}

	res := make([]JobNoteResponse, len(dbNotes))

	for i, n := range dbNotes {
		res[i] = mapNoteToResponse(n)
	}

	writeJSON(w, http.StatusOK, res)
}

// handleCreateJobNote godoc
// @Summary Create a note for a job
// @Description Add a new sectioned note to a tracked job
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param request body CreateJobNoteRequest true "Note details"
// @Success 201 {object} JobNoteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/notes [post]
func (s *Server) handleCreateJobNote(w http.ResponseWriter, r *http.Request) {
	jobID, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	if _, err := s.queries.GetJob(r.Context(), jobID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "job not found")
		} else {
			log.Printf("failed to verify job %d before creating note: %v", jobID, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}
		return
	}

	var req CreateJobNoteRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	content := strings.TrimSpace(req.Content)

	if content == "" {
		writeError(w, http.StatusBadRequest, "content is required")
		return
	}

	if req.InterviewRound < 0 {
		writeError(w, http.StatusBadRequest, "interview_round cannot be negative")
		return
	}

	section := strings.TrimSpace(req.Section)

	if section == "" {
		section = "General"
	}

	params := database.CreateJobNoteParams{
		JobID:          jobID,
		Section:        section,
		InterviewRound: toNullInt64(req.InterviewRound),
		Content:        content,
	}

	note, err := s.queries.CreateJobNote(r.Context(), params)

	if err != nil {
		log.Printf("failed to create note for job %d: %v", jobID, err)
		writeError(w, http.StatusInternalServerError, "failed to create note")
		return
	}

	writeJSON(w, http.StatusCreated, mapNoteToResponse(note))
}

// handleUpdateJobNote godoc
// @Summary Update a job note
// @Description Update an existing note belonging to a specific job
// @Tags notes
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param noteId path int true "Note ID"
// @Param request body UpdateJobNoteRequest true "Updated note details"
// @Success 200 {object} JobNoteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/notes/{noteId} [put]
func (s *Server) handleUpdateJobNote(w http.ResponseWriter, r *http.Request) {
	jobID, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	noteID, err := parsePathID(r, "noteId")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid note id")
		return
	}

	var req UpdateJobNoteRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	content := strings.TrimSpace(req.Content)

	if content == "" {
		writeError(w, http.StatusBadRequest, "content is required")
		return
	}

	if req.InterviewRound < 0 {
		writeError(w, http.StatusBadRequest, "interview_round cannot be negative")
		return
	}

	section := strings.TrimSpace(req.Section)

	if section == "" {
		section = "General"
	}

	params := database.UpdateJobNoteParams{
		Section:        section,
		InterviewRound: toNullInt64(req.InterviewRound),
		Content:        content,
		ID:             noteID,
		JobID:          jobID,
	}

	updatedNote, err := s.queries.UpdateJobNote(r.Context(), params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "note not found")
		} else {
			log.Printf("failed to update note %d for job %d: %v", noteID, jobID, err)
			writeError(w, http.StatusInternalServerError, "failed to update note")
		}
		return
	}

	writeJSON(w, http.StatusOK, mapNoteToResponse(updatedNote))
}

// handleDeleteJobNote godoc
// @Summary Delete a job note
// @Description Remove a note belonging to a specific job
// @Tags notes
// @Param id path int true "Job ID"
// @Param noteId path int true "Note ID"
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/notes/{noteId} [delete]
func (s *Server) handleDeleteJobNote(w http.ResponseWriter, r *http.Request) {
	jobID, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	noteID, err := parsePathID(r, "noteId")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid note id")
		return
	}

	notes, err := s.queries.ListJobNotesByJobID(r.Context(), jobID)

	if err != nil {
		log.Printf("failed to verify note %d for job %d: %v", noteID, jobID, err)
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	exists := false
	for _, n := range notes {
		if n.ID == noteID {
			exists = true
			break
		}
	}

	if !exists {
		writeError(w, http.StatusNotFound, "note not found")
		return
	}

	params := database.DeleteJobNoteParams{
		ID:    noteID,
		JobID: jobID,
	}

	if err := s.queries.DeleteJobNote(r.Context(), params); err != nil {
		log.Printf("failed to delete note %d for job %d: %v", noteID, jobID, err)
		writeError(w, http.StatusInternalServerError, "failed to delete note")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
