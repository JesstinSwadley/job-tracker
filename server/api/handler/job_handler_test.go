package handler_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type mockJobRepo struct {
	jobs []repository.Job
	err  error
}

func (m *mockJobRepo) InsertJob(_ context.Context, position, company string) (repository.Job, error) {
	return repository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func (m *mockJobRepo) GetJobs(_ context.Context) ([]repository.Job, error) {
	return m.jobs, m.err
}

func TestCreateJob(t *testing.T) {
	mockRepo := &mockJobRepo{}
	h := handler.NewJobHandler(mockRepo)

	tests := []struct {
		name           string
		method         string
		body           string
		expectedStatus int
		expectedJSON   map[string]interface{}
	}{
		{
			name:           "POST method with body returns 201",
			method:         http.MethodPost,
			body:           `{"position": "dev", "company": "test"}`,
			expectedStatus: http.StatusCreated,
			expectedJSON: map[string]interface{}{
				"id":       float64(1),
				"position": "dev",
				"company":  "test",
			},
		},
		{
			name:           "POST method with invalid JSON returns 400",
			method:         http.MethodPost,
			body:           `invalid-json`,
			expectedStatus: http.StatusBadRequest,
			expectedJSON: map[string]interface{}{
				"error": "Invalid request body",
			},
		},
		{
			name:           "POST method without returns 400",
			method:         http.MethodPost,
			body:           ``,
			expectedStatus: http.StatusBadRequest,
			expectedJSON: map[string]interface{}{
				"error": "Invalid request body",
			},
		},
		{
			name:           "GET method returns 405",
			method:         http.MethodGet,
			body:           ``,
			expectedStatus: http.StatusMethodNotAllowed,
			expectedJSON: map[string]interface{}{
				"error": "Method Not Allowed",
			},
		},
		{
			name:           "PUT method returns 405",
			method:         http.MethodPut,
			body:           ``,
			expectedStatus: http.StatusMethodNotAllowed,
			expectedJSON: map[string]interface{}{
				"error": "Method Not Allowed",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/jobs", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			h.CreateJob(w, req)

			resp := w.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Fatalf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}

			if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
				t.Errorf("expected Content-Type application/json, got %q", ct)
			}

			if tt.expectedJSON != nil {
				var respBody map[string]interface{}

				if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
					t.Fatalf("failed to decode JSON response: %v", err)
				}

				for k, v := range tt.expectedJSON {
					if respBody[k] != v {
						t.Errorf("expected JSON %s=%v, got %v", k, v, respBody[k])
					}
				}
			}
		})
	}
}

func TestGetJobs(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		mockJobs       []repository.Job
		mockErr        error
		expectedStatus int
	}{
		{
			name:   "GET method return 200",
			method: http.MethodGet,
			mockJobs: []repository.Job{
				{
					ID:       1,
					Position: "dev",
					Company:  "test",
				},
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "GET returns empty array when no jobs",
			method:         http.MethodGet,
			mockJobs:       []repository.Job{},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "GET request, repo error returns 500",
			method:         http.MethodGet,
			mockErr:        context.DeadlineExceeded,
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name:           "POST method return 405",
			method:         http.MethodPost,
			expectedStatus: http.StatusMethodNotAllowed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockJobRepo{
				jobs: tt.mockJobs,
				err:  tt.mockErr,
			}

			h := handler.NewJobHandler(mockRepo)

			req := httptest.NewRequest(tt.method, "/jobs", nil)
			w := httptest.NewRecorder()

			h.GetJobs(w, req)

			resp := w.Result()
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Fatalf("expected %d, got %d", tt.expectedStatus, resp.StatusCode)
			}

			if resp.Header.Get("Content-Type") != "application/json" {
				t.Fatalf("expected Content-Type application/json")
			}

			if tt.expectedStatus == http.StatusOK {
				var jobs []repository.Job

				if err := json.NewDecoder(resp.Body).Decode(&jobs); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}

				if len(jobs) != len(tt.mockJobs) {
					t.Fatalf("expected %d jobs, got %d", len(tt.mockJobs), len(jobs))
				}

				for i := range jobs {
					if jobs[i] != tt.mockJobs[i] {
						t.Errorf("expected %+v, got %+v", tt.mockJobs[i], jobs[i])
					}
				}
			}

			if tt.expectedStatus == http.StatusInternalServerError || tt.expectedStatus == http.StatusMethodNotAllowed {
				var body map[string]string
				if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
					t.Fatalf("failed to decode error response: %v", err)
				}

				if body["error"] == "" {
					t.Errorf("expected error message in response")
				}
			}
		})
	}
}
