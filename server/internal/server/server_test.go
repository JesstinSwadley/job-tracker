package server_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

func setupTestServer(t *testing.T) *server.Server {
	t.Helper()

	dbPath := os.Getenv("TEST_DB_PATH")

	if dbPath == "" {
		dbPath = "../../jobtracker_test.db"
	}

	return server.New(dbPath)
}

func TestHealthCheck(t *testing.T) {
	app := setupTestServer(t)
	router := app.RegisterRoutes()

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
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	tests := []struct {
		name                string
		body                string
		expectedStatus      int
		expectedStage       string
		expectedStatusField string
	}{
		{
			name:                "create first job (defaults applied)",
			body:                `{"company": "Acme", "title": "Web Developer"}`,
			expectedStatus:      http.StatusCreated,
			expectedStage:       "Search",
			expectedStatusField: "Active",
		},
		{
			name:                "create second job (explicit fields)",
			body:                `{"company": "Tesla", "title": "Backend Engineer", "stage": "Applied", "status": "Rejected"}`,
			expectedStatus:      http.StatusCreated,
			expectedStage:       "Applied",
			expectedStatusField: "Rejected",
		},
		{
			name:           "empty company",
			body:           `{"company": "", "title": "Web Developer"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "empty title",
			body:           `{"company": "Acme", "title": ""}`,
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

			handler.ServeHTTP(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.expectedStatus == http.StatusCreated {
				var res map[string]any

				if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}

				if id, ok := res["id"].(float64); !ok || int(id) <= 0 {
					t.Errorf("expected positive ID, got %v", res["id"])
				}

				if res["stage"] != tt.expectedStage {
					t.Errorf("expected stage %q, got %v", tt.expectedStage, res["stage"])
				}

				if res["status"] != tt.expectedStatusField {
					t.Errorf("expected status %q, got %v", tt.expectedStatusField, res["status"])
				}
			}
		})
	}
}

func TestGetJobs(t *testing.T) {
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	t.Run("returns a valid JSON array of jobs", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var jobs []server.JobResponse
		if err := json.NewDecoder(rec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}
	})

	t.Run("returns created jobs in the list", func(t *testing.T) {
		createJob := func(company, title string) server.JobResponse {
			body := bytes.NewReader([]byte(`{"company":"` + company + `","title":"` + title + `"}`))
			req := httptest.NewRequest(http.MethodPost, "/jobs", body)
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)

			if rec.Code != http.StatusCreated {
				t.Fatalf("failed to seed job: got status %d", rec.Code)
			}

			var createdJob server.JobResponse
			json.NewDecoder(rec.Body).Decode(&createdJob)
			return createdJob
		}

		job1 := createJob("Acme", "Backend Engineer")
		job2 := createJob("Stripe", "Frontend Engineer")

		req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var jobs []server.JobResponse
		if err := json.NewDecoder(rec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		found1, found2 := false, false
		for _, j := range jobs {
			if j.ID == job1.ID {
				found1 = true
			}

			if j.ID == job2.ID {
				found2 = true
			}
		}

		if !found1 || !found2 {
			t.Errorf("expected to find both seeded jobs in the response array")
		}
	})
}

func TestUpdateJob(t *testing.T) {
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	t.Run("successfully updates an existing job", func(t *testing.T) {
		createBody := bytes.NewReader([]byte(`{"company": "Google", "title": "Web Developer", "status": "Applied"}`))
		createReq := httptest.NewRequest(http.MethodPost, "/jobs", createBody)
		createReq.Header.Set("Content-Type", "application/json")
		createRec := httptest.NewRecorder()
		handler.ServeHTTP(createRec, createReq)

		if createRec.Code != http.StatusCreated {
			t.Fatalf("failed to seed job: got status %d", createRec.Code)
		}

		var created server.JobResponse
		if err := json.NewDecoder(createRec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode created job: %v", err)
		}

		updatePayload := `{"company":"Google","title":"Senior Software Engineer","stage":"Interview 1","status":"Interviewing","notes":"Scheduled for next Tuesday"}`
		req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d", created.ID), bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

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

		if updated.Title != "Senior Software Engineer" {
			t.Errorf("expected title 'Senior Software Engineer', got '%s'", updated.Title)
		}

		if updated.Stage != "Interview 1" {
			t.Errorf("expected stage 'Interview 1', got '%s'", updated.Stage)
		}

		if updated.Status != "Interviewing" {
			t.Errorf("expected status 'Interviewing', got '%s'", updated.Status)
		}

		if updated.Notes != "Scheduled for next Tuesday" {
			t.Errorf("expected notes 'Scheduled for next Tuesday', got '%s'", updated.Notes)
		}
	})

	t.Run("returns 404 when job does not exist", func(t *testing.T) {
		updatePayload := `{"company":"Netflix","title":"Engineer","status":"Applied"}`
		req := httptest.NewRequest(http.MethodPut, "/jobs/999999", bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("returns 400 for invalid job ID", func(t *testing.T) {
		updatePayload := `{"company":"Netflix","title":"Engineer","status":"Applied"}`
		req := httptest.NewRequest(http.MethodPut, "/jobs/invalid-id", bytes.NewReader([]byte(updatePayload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", rec.Code)
		}
	})
}

func TestDeleteJob(t *testing.T) {
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	t.Run("successfully deletes an existing job", func(t *testing.T) {
		createBody := bytes.NewReader([]byte(`{"company": "Google", "title": "Web Developer", "status": "Applied"}`))
		createReq := httptest.NewRequest(http.MethodPost, "/jobs", createBody)
		createReq.Header.Set("Content-Type", "application/json")
		createRec := httptest.NewRecorder()
		handler.ServeHTTP(createRec, createReq)

		if createRec.Code != http.StatusCreated {
			t.Fatalf("failed to seed job: got status %d", createRec.Code)
		}

		var created server.JobResponse
		if err := json.NewDecoder(createRec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode created job: %v", err)
		}

		req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d", created.ID), nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusNoContent {
			t.Fatalf("expected status 204 No Content, got %d", rec.Code)
		}

		getReq := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		getRec := httptest.NewRecorder()
		handler.ServeHTTP(getRec, getReq)

		var jobs []server.JobResponse

		if err := json.NewDecoder(getRec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode jobs list: %v", err)
		}

		for _, job := range jobs {
			if job.ID == created.ID {
				t.Errorf("expected job ID %d to be deleted, but it was still found in the database", created.ID)
			}
		}
	})

	t.Run("returns 404 when job does not exist", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/jobs/999999", nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", rec.Code)
		}
	})

	t.Run("returns 400 for invalid job ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/jobs/invalid-id", nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", rec.Code)
		}
	})
}
