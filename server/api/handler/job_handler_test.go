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

type mockJobRepo struct{}

func (m *mockJobRepo) InsertJob(_ context.Context, position, company string) (repository.Job, error) {
	return repository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func (m *mockJobRepo) GetJobs(_ context.Context) ([]repository.Job, error) {
	return []repository.Job{
		{ID: 1, Position: "Backend Engineer", Company: "Acme Corp"},
		{ID: 2, Position: "Frontend Engineer", Company: "Beta Inc"},
	}, nil
}

func TestCreateJobHandler(t *testing.T) {
	mock := &mockJobRepo{}
	h := handler.NewJobHandler(mock)

	tests := []struct {
		name           string
		method         string
		body           string
		expectedStatus int
		expectedJSON   map[string]interface{}
	}{
		{
			name:           "Valid POST request",
			method:         http.MethodPost,
			body:           `{"position":"Software Engineer","company":"Test Corp"}`,
			expectedStatus: http.StatusCreated,
			expectedJSON: map[string]interface{}{
				"id":       float64(1),
				"position": "Software Engineer",
				"company":  "Test Corp",
			},
		},
		{
			name:           "Invalid JSON body",
			method:         http.MethodPost,
			body:           `invalid-json`,
			expectedStatus: http.StatusBadRequest,
			expectedJSON: map[string]interface{}{
				"error": "Invalid request body",
			},
		},
		{
			name:           "Wrong HTTP method",
			method:         http.MethodGet,
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
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}

			if tt.expectedJSON != nil {
				var responseBody map[string]interface{}

				if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
					t.Fatalf("failed to decode JSON response: %v", err)
				}

				for key, expected := range tt.expectedJSON {
					if responseBody[key] != expected {
						t.Errorf("expected JSON %s=%v, got %v", key, expected, responseBody[key])
					}
				}
			}
		})
	}
}
