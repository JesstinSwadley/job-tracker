package server

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/JesstinSwadley/job-tracker/internal/database"
)

// @Summary Save or update job assessment
// @Description Calculate weighted score and save assessment for a job
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
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid job id"})
		return
	}

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

	var req AssessmentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	if req.CareerAlignment < 0 || req.CareerAlignment > 25 ||
		req.ExperienceMatch < 0 || req.ExperienceMatch > 20 ||
		req.TechnicalAlignment < 0 || req.TechnicalAlignment > 15 ||
		req.CompensationScore < 0 || req.CompensationScore > 15 ||
		req.WorkArrangementScore < 0 || req.WorkArrangementScore > 10 ||
		req.GeographicAlignment < 0 || req.GeographicAlignment > 5 ||
		req.GrowthValue < 0 || req.GrowthValue > 10 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "score exceeds category maximum"})
		return
	}

	totalScore := req.CareerAlignment + req.ExperienceMatch + req.TechnicalAlignment +
		req.CompensationScore + req.WorkArrangementScore + req.GeographicAlignment + req.GrowthValue
	recommendation := calculateRecommendation(totalScore)

	params := database.CreateOrUpdateAssessmentParams{
		JobID: id,
		CareerAlignment: sql.NullInt64{
			Int64: int64(req.CareerAlignment),
			Valid: true,
		},
		ExperienceMatch: sql.NullInt64{
			Int64: int64(req.ExperienceMatch),
			Valid: true,
		},
		TechnicalAlignment: sql.NullInt64{
			Int64: int64(req.TechnicalAlignment),
			Valid: true,
		},
		CompensationScore: sql.NullInt64{
			Int64: int64(req.CompensationScore),
			Valid: true,
		},
		WorkArrangementScore: sql.NullInt64{
			Int64: int64(req.WorkArrangementScore),
			Valid: true,
		},
		GeographicAlignment: sql.NullInt64{
			Int64: int64(req.GeographicAlignment),
			Valid: true,
		},
		GrowthValue: sql.NullInt64{
			Int64: int64(req.GrowthValue),
			Valid: true,
		},
		TotalScore: sql.NullInt64{
			Int64: int64(totalScore),
			Valid: true,
		},
		Recommendation: sql.NullString{
			String: recommendation,
			Valid:  true,
		},
	}

	if err := s.queries.CreateOrUpdateAssessment(r.Context(), params); err != nil {
		log.Printf("failed to save assessment: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to save assessment"})
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(res)
}

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
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid job id"})
		return
	}

	assessment, err := s.queries.GetAssessmentByJobID(r.Context(), id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "assessment not found"})
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "database error"})
		}
		return
	}

	res := AssessmentResponse{
		JobID:                assessment.JobID,
		CareerAlignment:      int(assessment.CareerAlignment.Int64),
		ExperienceMatch:      int(assessment.ExperienceMatch.Int64),
		TechnicalAlignment:   int(assessment.TechnicalAlignment.Int64),
		CompensationScore:    int(assessment.CompensationScore.Int64),
		WorkArrangementScore: int(assessment.WorkArrangementScore.Int64),
		GeographicAlignment:  int(assessment.GeographicAlignment.Int64),
		GrowthValue:          int(assessment.GrowthValue.Int64),
		TotalScore:           int(assessment.TotalScore.Int64),
		Recommendation:       assessment.Recommendation.String,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(res)
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
