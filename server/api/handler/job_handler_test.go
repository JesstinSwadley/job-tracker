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
