package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/JesstinSwadley/job-tracker/internal/database"
)

type CreateJobRequest struct {
	Company             string `json:"company"`
	Title               string `json:"title"`
	Location            string `json:"location"`
	WorkArrangement     string `json:"work_arrangement"`
	Source              string `json:"source"`
	ApplicationPlatform string `json:"application_platform"`
	URL                 string `json:"url"`
	Stage               string `json:"stage"`
	InterviewRound      int64  `json:"interview_round"`
	Status              string `json:"status"`
	DatePosted          string `json:"date_posted"`
	DateFound           string `json:"date_found"`
	DateAssessed        string `json:"date_assessed"`
	DateApplied         string `json:"date_applied"`
	ResumeURL           string `json:"resume_url"`
	CoverLetterURL      string `json:"cover_letter_url"`
	Notes               string `json:"notes"`
}

type UpdateJobRequest struct {
	Company             string `json:"company"`
	Title               string `json:"title"`
	Location            string `json:"location"`
	WorkArrangement     string `json:"work_arrangement"`
	Source              string `json:"source"`
	ApplicationPlatform string `json:"application_platform"`
	URL                 string `json:"url"`
	Stage               string `json:"stage"`
	InterviewRound      int64  `json:"interview_round"`
	Status              string `json:"status"`
	DatePosted          string `json:"date_posted"`
	DateFound           string `json:"date_found"`
	DateAssessed        string `json:"date_assessed"`
	DateApplied         string `json:"date_applied"`
	ResumeURL           string `json:"resume_url"`
	CoverLetterURL      string `json:"cover_letter_url"`
	Notes               string `json:"notes"`
}

type JobResponse struct {
	ID                       int64  `json:"id"`
	Company                  string `json:"company"`
	Title                    string `json:"title"`
	Location                 string `json:"location"`
	WorkArrangement          string `json:"work_arrangement"`
	Source                   string `json:"source"`
	ApplicationPlatform      string `json:"application_platform"`
	URL                      string `json:"url"`
	Stage                    string `json:"stage"`
	InterviewRound           int64  `json:"interview_round"`
	Status                   string `json:"status"`
	DatePosted               string `json:"date_posted"`
	DateFound                string `json:"date_found"`
	DateAssessed             string `json:"date_assessed"`
	DateApplied              string `json:"date_applied"`
	ResumeURL                string `json:"resume_url"`
	CoverLetterURL           string `json:"cover_letter_url"`
	Notes                    string `json:"notes"`
	AssessmentTotalScore     *int64 `json:"assessment_total_score,omitempty"`
	AssessmentRecommendation string `json:"assessment_recommendation,omitempty"`
	NotesCount               int64  `json:"notes_count"`
	CreatedAt                string `json:"created_at,omitempty"`
	UpdatedAt                string `json:"updated_at,omitempty"`
}

func mapJobToResponse(job database.Job) JobResponse {
	return JobResponse{
		ID:                  job.ID,
		Company:             job.Company,
		Title:               job.Title,
		Location:            fromNullString(job.Location),
		WorkArrangement:     fromNullString(job.WorkArrangement),
		Source:              fromNullString(job.Source),
		ApplicationPlatform: fromNullString(job.ApplicationPlatform),
		URL:                 fromNullString(job.Url),
		Stage:               job.Stage,
		InterviewRound:      fromNullInt64(job.InterviewRound),
		Status:              job.Status,
		DatePosted:          formatNullDate(job.DatePosted),
		DateFound:           formatNullDate(job.DateFound),
		DateAssessed:        formatNullDate(job.DateAssessed),
		DateApplied:         formatNullDate(job.DateApplied),
		ResumeURL:           fromNullString(job.ResumeUrl),
		CoverLetterURL:      fromNullString(job.CoverLetterUrl),
		Notes:               fromNullString(job.Notes),
		CreatedAt:           formatNullTimestamp(job.CreatedAt),
		UpdatedAt:           formatNullTimestamp(job.UpdatedAt),
	}
}

func mapListRowToResponse(row database.ListJobsRow) JobResponse {
	var totalScore *int64
	if row.AssessmentTotalScore.Valid {
		v := row.AssessmentTotalScore.Int64
		totalScore = &v
	}

	return JobResponse{
		ID:                       row.ID,
		Company:                  row.Company,
		Title:                    row.Title,
		Location:                 fromNullString(row.Location),
		WorkArrangement:          fromNullString(row.WorkArrangement),
		Source:                   fromNullString(row.Source),
		ApplicationPlatform:      fromNullString(row.ApplicationPlatform),
		URL:                      fromNullString(row.Url),
		Stage:                    row.Stage,
		InterviewRound:           fromNullInt64(row.InterviewRound),
		Status:                   row.Status,
		DatePosted:               formatNullDate(row.DatePosted),
		DateFound:                formatNullDate(row.DateFound),
		DateAssessed:             formatNullDate(row.DateAssessed),
		DateApplied:              formatNullDate(row.DateApplied),
		ResumeURL:                fromNullString(row.ResumeUrl),
		CoverLetterURL:           fromNullString(row.CoverLetterUrl),
		Notes:                    fromNullString(row.Notes),
		AssessmentTotalScore:     totalScore,
		AssessmentRecommendation: fromNullString(row.AssessmentRecommendation),
		NotesCount:               row.NotesCount,
		CreatedAt:                formatNullTimestamp(row.CreatedAt),
		UpdatedAt:                formatNullTimestamp(row.UpdatedAt),
	}
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
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Company) == "" || strings.TrimSpace(req.Title) == "" {
		writeError(w, http.StatusBadRequest, "company and title are required")
		return
	}

	if strings.TrimSpace(req.Stage) == "" {
		req.Stage = "Search"
	}

	if strings.TrimSpace(req.Status) == "" {
		req.Status = "Active"
	}

	datePosted, err := parseNullDate(req.DatePosted)

	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	dateFound, err := parseNullDate(req.DateFound)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !dateFound.Valid {
		dateFound = sql.NullTime{Time: time.Now().UTC(), Valid: true}
	}
	dateAssessed, err := parseNullDate(req.DateAssessed)

	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	dateApplied, err := parseNullDate(req.DateApplied)

	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	params := database.CreateJobParams{
		Company:             strings.TrimSpace(req.Company),
		Title:               strings.TrimSpace(req.Title),
		Location:            toNullString(req.Location),
		WorkArrangement:     toNullString(req.WorkArrangement),
		Source:              toNullString(req.Source),
		ApplicationPlatform: toNullString(req.ApplicationPlatform),
		Url:                 toNullString(req.URL),
		Stage:               strings.TrimSpace(req.Stage),
		InterviewRound:      toNullInt64(req.InterviewRound),
		Status:              strings.TrimSpace(req.Status),
		DatePosted:          datePosted,
		DateFound:           dateFound,
		DateAssessed:        dateAssessed,
		DateApplied:         dateApplied,
		ResumeUrl:           toNullString(req.ResumeURL),
		CoverLetterUrl:      toNullString(req.CoverLetterURL),
		Notes:               toNullString(req.Notes),
	}

	job, err := s.queries.CreateJob(r.Context(), params)

	if err != nil {
		log.Printf("failed to insert job: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create job in database")
		return
	}

	writeJSON(w, http.StatusCreated, mapJobToResponse(job))
}

// handleGetJobs godoc
// @Summary Get all jobs
// @Description Retrieve a list of all tracked jobs with assessment summaries and note counts
// @Tags jobs
// @Produce json
// @Success 200 {array} JobResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs [get]
func (s *Server) handleGetJobs(w http.ResponseWriter, r *http.Request) {
	dbJobs, err := s.queries.ListJobs(r.Context())

	if err != nil {
		log.Printf("failed to list jobs: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to retrieve jobs")
		return
	}

	res := make([]JobResponse, len(dbJobs))

	for i, row := range dbJobs {
		res[i] = mapListRowToResponse(row)
	}

	writeJSON(w, http.StatusOK, res)
}

// handleUpdateJob godoc
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
	id, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	var req UpdateJobRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if strings.TrimSpace(req.Company) == "" || strings.TrimSpace(req.Title) == "" {
		writeError(w, http.StatusBadRequest, "company and title are required")
		return
	}

	existingJob, err := s.queries.GetJob(r.Context(), id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "job not found")
		} else {
			log.Printf("failed to fetch existing job %d: %v", id, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}

		return
	}

	stage := strings.TrimSpace(req.Stage)

	if stage == "" {
		stage = existingJob.Stage
	}

	status := strings.TrimSpace(req.Status)

	if status == "" {
		status = existingJob.Status
	}

	datePosted := existingJob.DatePosted

	if strings.TrimSpace(req.DatePosted) != "" {
		datePosted, err = parseNullDate(req.DatePosted)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	dateFound := existingJob.DateFound

	if strings.TrimSpace(req.DateFound) != "" {
		dateFound, err = parseNullDate(req.DateFound)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	dateAssessed := existingJob.DateAssessed

	if strings.TrimSpace(req.DateAssessed) != "" {
		dateAssessed, err = parseNullDate(req.DateAssessed)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	dateApplied := existingJob.DateApplied

	if strings.TrimSpace(req.DateApplied) != "" {
		dateApplied, err = parseNullDate(req.DateApplied)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	params := database.UpdateJobParams{
		ID:                  id,
		Company:             strings.TrimSpace(req.Company),
		Title:               strings.TrimSpace(req.Title),
		Location:            toNullString(req.Location),
		WorkArrangement:     toNullString(req.WorkArrangement),
		Source:              toNullString(req.Source),
		ApplicationPlatform: toNullString(req.ApplicationPlatform),
		Url:                 toNullString(req.URL),
		Stage:               stage,
		InterviewRound:      toNullInt64(req.InterviewRound),
		Status:              status,
		DatePosted:          datePosted,
		DateFound:           dateFound,
		DateAssessed:        dateAssessed,
		DateApplied:         dateApplied,
		ResumeUrl:           toNullString(req.ResumeURL),
		CoverLetterUrl:      toNullString(req.CoverLetterURL),
		Notes:               toNullString(req.Notes),
	}

	updatedJob, err := s.queries.UpdateJob(r.Context(), params)

	if err != nil {
		log.Printf("failed to update job: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to update job in database")
		return
	}

	res := mapJobToResponse(updatedJob)

	if existingJob.AssessmentTotalScore.Valid {
		v := existingJob.AssessmentTotalScore.Int64
		res.AssessmentTotalScore = &v
	}
	res.AssessmentRecommendation = fromNullString(existingJob.AssessmentRecommendation)
	res.NotesCount = existingJob.NotesCount

	writeJSON(w, http.StatusOK, res)
}

// handleDeleteJob godoc
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
	id, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	if _, err := s.queries.GetJob(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "job not found")
		} else {
			log.Printf("failed to verify job %d before delete: %v", id, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}
		return
	}

	if err := s.queries.DeleteJob(r.Context(), id); err != nil {
		log.Printf("failed to delete job: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to delete job in database")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
