package server_test

import (
	"bytes"
	"encoding/json"
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
