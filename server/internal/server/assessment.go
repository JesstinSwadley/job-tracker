package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/database"
)

type AssessmentRequest struct {
	CareerAlignment      int `json:"career_alignment"`
	ExperienceMatch      int `json:"experience_match"`
	TechnicalAlignment   int `json:"technical_alignment"`
	CompensationScore    int `json:"compensation_score"`
	WorkArrangementScore int `json:"work_arrangement_score"`
	GeographicAlignment  int `json:"geographic_alignment"`
	GrowthValue          int `json:"growth_value"`
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

// handleSaveAssessment godoc
// @Summary Save or update job assessment
// @Description Calculate weighted score, save assessment for a job, and mark the job as assessed
// @Tags assessments
// @Accept json
// @Produce json
// @Param id path int true "Job ID"
// @Param request body AssessmentRequest true "Assessment scores"
// @Success 200 {object} AssessmentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/assessment [put]
func (s *Server) handleSaveAssessment(w http.ResponseWriter, r *http.Request) {
	id, err := parsePathID(r, "id")

	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	if _, err := s.queries.GetJob(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "job not found")
		} else {
			log.Printf("failed to verify job %d before assessment: %v", id, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}
		return
	}

	var req AssessmentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.CareerAlignment < 0 || req.CareerAlignment > 25 ||
		req.ExperienceMatch < 0 || req.ExperienceMatch > 20 ||
		req.TechnicalAlignment < 0 || req.TechnicalAlignment > 15 ||
		req.CompensationScore < 0 || req.CompensationScore > 15 ||
		req.WorkArrangementScore < 0 || req.WorkArrangementScore > 10 ||
		req.GeographicAlignment < 0 || req.GeographicAlignment > 5 ||
		req.GrowthValue < 0 || req.GrowthValue > 10 {
		writeError(w, http.StatusBadRequest, "score exceeds category maximum")
		return
	}

	totalScore := req.CareerAlignment + req.ExperienceMatch + req.TechnicalAlignment +
		req.CompensationScore + req.WorkArrangementScore + req.GeographicAlignment + req.GrowthValue
	recommendation := calculateRecommendation(totalScore)

	params := database.CreateOrUpdateAssessmentParams{
		JobID:                id,
		CareerAlignment:      toNullInt64(int64(req.CareerAlignment)),
		ExperienceMatch:      toNullInt64(int64(req.ExperienceMatch)),
		TechnicalAlignment:   toNullInt64(int64(req.TechnicalAlignment)),
		CompensationScore:    toNullInt64(int64(req.CompensationScore)),
		WorkArrangementScore: toNullInt64(int64(req.WorkArrangementScore)),
		GeographicAlignment:  toNullInt64(int64(req.GeographicAlignment)),
		GrowthValue:          toNullInt64(int64(req.GrowthValue)),
		TotalScore:           toNullInt64(int64(totalScore)),
		Recommendation:       toNullString(recommendation),
	}

	if err := s.queries.CreateOrUpdateAssessment(r.Context(), params); err != nil {
		log.Printf("failed to save assessment: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to save assessment")
		return
	}

	if err := s.queries.MarkJobAssessed(r.Context(), id); err != nil {
		log.Printf("failed to mark job %d as assessed: %v", id, err)
		writeError(w, http.StatusInternalServerError, "failed to update job assessment status")
		return
	}

	res := AssessmentResponse{
		JobID:                id,
		CareerAlignment:      req.CareerAlignment,
		ExperienceMatch:      req.ExperienceMatch,
		TechnicalAlignment:   req.TechnicalAlignment,
		CompensationScore:    req.CompensationScore,
		WorkArrangementScore: req.WorkArrangementScore,
		GeographicAlignment:  req.GeographicAlignment,
		GrowthValue:          req.GrowthValue,
		TotalScore:           totalScore,
		Recommendation:       recommendation,
	}

	writeJSON(w, http.StatusOK, res)
}

// handleGetAssessment godoc
// @Summary Get job assessment
// @Description Retrieve the assessment details and score for a job
// @Tags assessments
// @Produce json
// @Param id path int true "Job ID"
// @Success 200 {object} AssessmentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /jobs/{id}/assessment [get]
func (s *Server) handleGetAssessment(w http.ResponseWriter, r *http.Request) {
	id, err := parsePathID(r, "id")
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job id")
		return
	}

	assessment, err := s.queries.GetAssessmentByJobID(r.Context(), id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "assessment not found")
		} else {
			log.Printf("failed to fetch assessment for job %d: %v", id, err)
			writeError(w, http.StatusInternalServerError, "database error")
		}
		return
	}

	res := AssessmentResponse{
		JobID:                assessment.JobID,
		CareerAlignment:      int(fromNullInt64(assessment.CareerAlignment)),
		ExperienceMatch:      int(fromNullInt64(assessment.ExperienceMatch)),
		TechnicalAlignment:   int(fromNullInt64(assessment.TechnicalAlignment)),
		CompensationScore:    int(fromNullInt64(assessment.CompensationScore)),
		WorkArrangementScore: int(fromNullInt64(assessment.WorkArrangementScore)),
		GeographicAlignment:  int(fromNullInt64(assessment.GeographicAlignment)),
		GrowthValue:          int(fromNullInt64(assessment.GrowthValue)),
		TotalScore:           int(fromNullInt64(assessment.TotalScore)),
		Recommendation:       fromNullString(assessment.Recommendation),
	}

	writeJSON(w, http.StatusOK, res)
}

func calculateRecommendation(total int) string {
	switch {
	case total >= 85:
		return "Apply - Priority"
	case total >= 75:
		return "Apply - Target"
	case total >= 50:
		return "Apply - Stretch"
	default:
		return "Do Not Apply"
	}
}
