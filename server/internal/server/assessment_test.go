package server_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

func TestJobAssessment(t *testing.T) {
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	defaultJobPayload := `{"company":"Acme Corp","title":"Business Systems Manager"}`

	t.Run("returns 404 when fetching an assessment for an unassessed job", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/assessment", job.ID), nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("creates assessment, calculates total score and recommendation", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		assessmentPayload := `{
			"career_alignment": 25,
			"experience_match": 16,
			"technical_alignment": 12,
			"compensation_score": 11,
			"work_arrangement_score": 10,
			"geographic_alignment": 5,
			"growth_value": 8
		}`

		req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(assessmentPayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("failed to save assessment: got status %d", rec.Code)
		}

		var res map[string]any
		_ = json.NewDecoder(rec.Body).Decode(&res)

		if int(res["total_score"].(float64)) != 87 {
			t.Errorf("expected total_score 87, got %v", res["total_score"])
		}

		if res["recommendation"] != "Apply - Priority" {
			t.Errorf("expected recommendation 'Apply - Priority', got %v", res["recommendation"])
		}
	})

	t.Run("marks parent job as assessed and advances stage from Search to Assessment", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)
		if job.Stage != "Search" {
			t.Fatalf("expected initial stage 'Search', got %q", job.Stage)
		}

		assessmentPayload := `{"career_alignment": 22, "experience_match": 16, "technical_alignment": 12, "compensation_score": 11, "work_arrangement_score": 8, "geographic_alignment": 4, "growth_value": 8}`
		putReq := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(assessmentPayload)))
		putReq.Header.Set("Content-Type", "application/json")
		putRec := httptest.NewRecorder()
		handler.ServeHTTP(putRec, putReq)

		if putRec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", putRec.Code)
		}

		getReq := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		getRec := httptest.NewRecorder()
		handler.ServeHTTP(getRec, getReq)

		var jobs []server.JobResponse
		if err := json.NewDecoder(getRec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode jobs: %v", err)
		}

		for _, j := range jobs {
			if j.ID == job.ID {
				if j.Stage != "Assessment" {
					t.Errorf("expected stage to advance to 'Assessment', got %q", j.Stage)
				}
				if j.DateAssessed == "" {
					t.Errorf("expected date_assessed to be populated after saving assessment")
				}
				if j.AssessmentTotalScore == nil || *j.AssessmentTotalScore != 81 {
					t.Errorf("expected joined assessment_total_score 81, got %v", j.AssessmentTotalScore)
				}
				if j.AssessmentRecommendation != "Apply - Target" {
					t.Errorf("expected joined assessment_recommendation 'Apply - Target', got %q", j.AssessmentRecommendation)
				}
				return
			}
		}

		t.Fatalf("seeded job ID %d not found in GET /jobs response", job.ID)
	})

	t.Run("retrieves previously saved assessment", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		assessmentPayload := `{
			"career_alignment": 20,
			"experience_match": 12,
			"technical_alignment": 9,
			"compensation_score": 7,
			"work_arrangement_score": 6,
			"geographic_alignment": 4,
			"growth_value": 6
		}`

		putReq := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(assessmentPayload)))
		putReq.Header.Set("Content-Type", "application/json")
		putRec := httptest.NewRecorder()
		handler.ServeHTTP(putRec, putReq)

		getReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/assessment", job.ID), nil)
		getRec := httptest.NewRecorder()
		handler.ServeHTTP(getRec, getReq)

		var res map[string]any
		_ = json.NewDecoder(getRec.Body).Decode(&res)

		if int(res["total_score"].(float64)) != 64 {
			t.Errorf("expected total_score 64, got %v", res["total_score"])
		}

		if res["recommendation"] != "Apply - Stretch" {
			t.Errorf("expected recommendation 'Apply - Stretch', got %v", res["recommendation"])
		}
	})

	t.Run("evaluates target tier correctly (75-84)", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		targetPayload := `{
			"career_alignment": 22,
			"experience_match": 15,
			"technical_alignment": 11,
			"compensation_score": 10,
			"work_arrangement_score": 8,
			"geographic_alignment": 4,
			"growth_value": 8
		}`

		req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(targetPayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200 OK, got %d", rec.Code)
		}

		var res map[string]any
		_ = json.NewDecoder(rec.Body).Decode(&res)

		if int(res["total_score"].(float64)) != 78 {
			t.Errorf("expected total_score 78, got %v", res["total_score"])
		}

		if res["recommendation"] != "Apply - Target" {
			t.Errorf("expected recommendation 'Apply - Target', got %v", res["recommendation"])
		}
	})

	t.Run("updates existing assessment and recalculates scores", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		initialPayload := `{"career_alignment":25,"experience_match":16,"technical_alignment":12,"compensation_score":11,"work_arrangement_score":10,"geographic_alignment":5,"growth_value":8}`
		req1 := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(initialPayload)))
		req1.Header.Set("Content-Type", "application/json")
		rec1 := httptest.NewRecorder()
		handler.ServeHTTP(rec1, req1)

		updatedPayload := `{"career_alignment":10,"experience_match":8,"technical_alignment":6,"compensation_score":0,"work_arrangement_score":6,"geographic_alignment":3,"growth_value":2}`
		req2 := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(updatedPayload)))
		req2.Header.Set("Content-Type", "application/json")
		rec2 := httptest.NewRecorder()
		handler.ServeHTTP(rec2, req2)

		if rec2.Code != http.StatusOK {
			t.Fatalf("expected status 200 OK, got %d", rec2.Code)
		}

		var res map[string]any
		if err := json.NewDecoder(rec2.Body).Decode(&res); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if int(res["total_score"].(float64)) != 35 {
			t.Errorf("expected total_score 35, got %v", res["total_score"])
		}

		if res["recommendation"] != "Do Not Apply" {
			t.Errorf("expected recommendation 'Do Not Apply', got %v", res["recommendation"])
		}
	})

	t.Run("returns 404 when assessing a non-existent job", func(t *testing.T) {
		payload := `{"career_alignment":25}`
		req := httptest.NewRequest(http.MethodPut, "/jobs/999999/assessment", bytes.NewReader([]byte(payload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("returns 400 for score values exceeding category maximums", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		invalidPayload := `{"career_alignment": 30}`
		req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(invalidPayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", rec.Code)
		}
	})

	t.Run("deleting a job cascades and removes its assessment", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		assessmentPayload := `{"career_alignment":20,"experience_match":16}`
		putReq := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/assessment", job.ID), bytes.NewReader([]byte(assessmentPayload)))
		putReq.Header.Set("Content-Type", "application/json")
		putRec := httptest.NewRecorder()
		handler.ServeHTTP(putRec, putReq)

		delReq := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d", job.ID), nil)
		delRec := httptest.NewRecorder()
		handler.ServeHTTP(delRec, delReq)

		if delRec.Code != http.StatusNoContent {
			t.Fatalf("expected 204 No Content, got %d", delRec.Code)
		}

		getReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/assessment", job.ID), nil)
		getRec := httptest.NewRecorder()
		handler.ServeHTTP(getRec, getReq)

		if getRec.Code != http.StatusNotFound {
			t.Errorf("expected 404 Not Found after cascade delete, got %d", getRec.Code)
		}
	})
}
