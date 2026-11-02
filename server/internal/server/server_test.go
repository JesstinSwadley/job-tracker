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

func TestHealthCheck(t *testing.T) {
	router := server.New()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", rec.Code)
	}

	if rec.Body.String() != "OK" {
		t.Fatalf("expected body %q, got %q", "OK", rec.Body.String())
	}
}

func TestCreateJob(t *testing.T) {
	router := server.New()

	tests := []struct {
		name           string
		body           string
		expectedStatus int
		expectedID     int
	}{
		{
			name:           "create first job",
			body:           `{"company": "Acme", "position": "Web Developer", "status": "Applied"}`,
			expectedStatus: http.StatusCreated,
			expectedID:     1,
		},
		{
			name:           "create second job",
			body:           `{"company": "Tesla", "position": "Web Developer", "status": "Applied"}`,
			expectedStatus: http.StatusCreated,
			expectedID:     2,
		},
		{
			name:           "empty company",
			body:           `{"company": "", "position": "Web Developer", "status": "Applied"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "empty position",
			body:           `{"company": "Acme", "position": "", "status": "Applied"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "malformed JSON",
			body:           `{"company": "Acme", `,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/jobs", bytes.NewReader([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.expectedStatus == http.StatusCreated {
				var res map[string]any

				if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}

				if int(res["id"].(float64)) != tt.expectedID {
					t.Errorf("expected ID %d, got %v", tt.expectedID, res["id"])
				}
			}
		})
	}
}

func TestGetJobs(t *testing.T) {
	t.Run("returns an empty array when no jobs exist", func(t *testing.T) {
		router := server.New()

		req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var jobs []server.JobResponse

		if err := json.NewDecoder(rec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if len(jobs) != 0 {
			t.Errorf("expected 0 jobs, got %d", len(jobs))
		}
	})

	t.Run("returns all created jobs in ascending order", func(t *testing.T) {
		router := server.New()

		createJob := func(company, position string) {
			body := bytes.NewReader([]byte(`{"company":"` + company + `","position":"` + position + `"}`))
			req := httptest.NewRequest(http.MethodPost, "/jobs", body)
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)

			if rec.Code != http.StatusCreated {
				t.Fatalf("failed to seed job: got status %d", rec.Code)
			}
		}

		createJob("Acme", "Backend Engineer")
		createJob("Stripe", "Frontend Engineer")

		req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var jobs []server.JobResponse

		if err := json.NewDecoder(rec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if len(jobs) != 2 {
			t.Fatalf("expected 2 jobs, got %d", len(jobs))
		}

		if jobs[0].ID != 1 || jobs[0].Company != "Acme" {
			t.Errorf("expected first job to be Acme (ID 1), got %+v", jobs[0])
		}

		if jobs[1].ID != 2 || jobs[1].Company != "Stripe" {
			t.Errorf("expected second job to be Stripe (ID 2), got %+v", jobs[1])
		}
	})
}

func TestUpdateJob(t *testing.T) {
	t.Run("sucessfully updates an existing job", func(t *testing.T) {
		router := server.New()

		// Seed jobs
		createBody := bytes.NewReader([]byte(`{"company": "Google", "position": "Web Developer", "status": "Applied"}`))
		createReq := httptest.NewRequest(http.MethodPost, "/jobs", createBody)
		createReq.Header.Set("Content-Type", "application/json")
		createRec := httptest.NewRecorder()
		router.ServeHTTP(createRec, createReq)

		if createRec.Code != http.StatusCreated {
			t.Fatalf("failed to seed job: got status %d", createRec.Code)
		}

		var created server.JobResponse

		if err := json.NewDecoder(createRec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode created job: %v", err)
		}

		updatePayload := `{"company":"Google","position":"Senior Software Engineer","status":"Interviewing"}`
		req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d", created.ID), bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var updated server.JobResponse

		if err := json.NewDecoder(rec.Body).Decode(&updated); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if updated.ID != created.ID {
			t.Errorf("expected ID %d, got %d", created.ID, updated.ID)
		}

		if updated.Position != "Senior Software Engineer" {
			t.Errorf("expected position 'Senior Software Engineer', got '%s'", updated.Position)
		}

		if updated.Status != "Interviewing" {
			t.Errorf("expected status 'Interviewing', got '%s'", updated.Status)
		}
	})

	t.Run("returns 404 when job does not exist", func(t *testing.T) {
		router := server.New()

		updatePayload := `{"company":"Netflix","position":"Engineer","status":"Applied"}`
		req := httptest.NewRequest(http.MethodPut, "/jobs/999", bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("returns 400 for invalid job ID", func(t *testing.T) {
		router := server.New()

		updatePayload := `{"company":"Netflix","position":"Engineer","status":"Applied"}`
		req := httptest.NewRequest(http.MethodPut, "/jobs/invalid-id", bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", rec.Code)
		}
	})
}

func TestDeleteJob(t *testing.T) {
	t.Run("sucessfully deletes an existing job", func(t *testing.T) {
		router := server.New()

		// Seed jobs
		createBody := bytes.NewReader([]byte(`{"company": "Google", "position": "Web Developer", "status": "Applied"}`))
		createReq := httptest.NewRequest(http.MethodPost, "/jobs", createBody)
		createReq.Header.Set("Content-Type", "application/json")
		createRec := httptest.NewRecorder()
		router.ServeHTTP(createRec, createReq)

		if createRec.Code != http.StatusCreated {
			t.Fatalf("failed to seed job: got status %d", createRec.Code)
		}

		var created server.JobResponse

		if err := json.NewDecoder(createRec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode created job: %v", err)
		}

		// Delete the Job
		req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d", created.ID), nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNoContent {
			t.Fatalf("expected status 204 No Content, got %d", rec.Code)
		}

		// Confirm Job Deletion
		getReq := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		getRec := httptest.NewRecorder()
		router.ServeHTTP(getRec, getReq)

		var jobs []server.JobResponse

		if err := json.NewDecoder(getRec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode jobs list: %v", err)
		}

		if len(jobs) != 0 {
			t.Errorf("expected 0 jobs after deletion, got %d", len(jobs))
		}
	})

	t.Run("returns 404 when job does not exist", func(t *testing.T) {
		router := server.New()

		req := httptest.NewRequest(http.MethodDelete, "/jobs/999", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("returns 400 for invalid job ID", func(t *testing.T) {
		router := server.New()

		req := httptest.NewRequest(http.MethodDelete, "/jobs/invalid-id", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", rec.Code)
		}
	})
}
