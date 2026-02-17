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
	if m.err != nil {
		return repository.Job{}, m.err
	}

	return repository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func (m *mockJobRepo) GetJobs(_ context.Context) ([]repository.Job, error) {
	if m.err != nil {
		return nil, m.err
	}

	return m.jobs, nil
}

func TestCreateJob(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		body           string
		mockErr        error
		expectedStatus int
		expectedID     int32
		expectedErrMsg string
	}{
		{
			name:           "Success: Valid job creation",
			method:         http.MethodPost,
			body:           `{"position": "Backend Dev", "company": "Test Company"}`,
			expectedStatus: http.StatusCreated,
			expectedID:     1,
		},
		{
			name:           "Error: Empty position",
			method:         http.MethodPost,
			body:           `{"position": "", "company": "Test Company"}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Position and Company are required",
		},
		{
			name:           "Error: Empty Company",
			method:         http.MethodPost,
			body:           `{"position": "Backend Dev", "company": ""}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Position and Company are required",
		},
		{
			name:           "Error: Database failure",
			method:         http.MethodPost,
			body:           `{"position": "Backend Dev", "company": "Test Company"}`,
			mockErr:        context.DeadlineExceeded,
			expectedStatus: http.StatusInternalServerError,
			expectedErrMsg: "Failed to create job",
		},
		{
			name:           "Error: Invalid JSON",
			method:         http.MethodPost,
			body:           `{invalid-json}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Invalid request body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockJobRepo{err: tt.mockErr}
			h := handler.NewJobHandler(mockRepo)

			req := httptest.NewRequest(tt.method, "/jobs", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			h.CreateJob(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedStatus == http.StatusCreated {
				var job repository.Job
				if err := json.NewDecoder(w.Body).Decode(&job); err != nil {
					t.Fatalf("failed to decode job: %v", err)
				}

				if job.ID != tt.expectedID {
					t.Errorf("expected job ID %d, got %d", tt.expectedID, job.ID)
				}
			} else {
				var errResp map[string]string
				json.NewDecoder(w.Body).Decode(&errResp)

				if errResp["error"] != tt.expectedErrMsg {
					t.Errorf("expected error %q, got %q", tt.expectedErrMsg, errResp["error"])
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
		expectedCount  int
		expectedErrMsg string
	}{
		{
			name:   "Success: Multiple jobs found",
			method: http.MethodGet,
			mockJobs: []repository.Job{
				{
					ID:       1,
					Position: "Backend Dev",
					Company:  "Google",
				},
				{
					ID:       2,
					Position: "Fullstack Dev",
					Company:  "Meta",
				},
			},
			expectedStatus: http.StatusOK,
			expectedCount:  2,
		},
		{
			name:           "Success: No jobs found",
			method:         http.MethodGet,
			mockJobs:       []repository.Job{},
			expectedStatus: http.StatusOK,
			expectedCount:  0,
		},
		{
			name:           "Error: Database failure",
			method:         http.MethodGet,
			mockErr:        context.DeadlineExceeded,
			expectedStatus: http.StatusInternalServerError,
			expectedErrMsg: "Failed to fetch jobs",
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

			if w.Code != tt.expectedStatus {
				t.Fatalf("expected %d, got %d", tt.expectedStatus, w.Code)
			}

			if ct := w.Header().Get("Content-Type"); ct != "application/json" {
				t.Fatalf("expected Content-Type application/json")
			}

			if tt.expectedStatus == http.StatusOK {
				var jobs []repository.Job

				if err := json.NewDecoder(w.Body).Decode(&jobs); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}

				if len(jobs) != tt.expectedCount {
					t.Errorf("expected %d jobs, got %d", tt.expectedCount, len(jobs))
				}

				if tt.expectedCount == 0 && w.Body.String() == "null\n" {
					t.Errorf("expected empty array [], got null")
				}
			} else {
				var errResp map[string]string
				json.NewDecoder(w.Body).Decode(&errResp)

				if errResp["error"] != tt.expectedErrMsg {
					t.Errorf("expected error %q, got %q", tt.expectedErrMsg, errResp["error"])
				}
			}
		})
	}
}
