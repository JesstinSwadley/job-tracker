package router_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

type mockJobRepo struct{}

func (m *mockJobRepo) InsertJob(_ context.Context, position, company string) (respository.Job, error) {
	return respository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func TestJobRouter(t *testing.T) {
	mockRepo := &mockJobRepo{}
	apiHandler := api.ApiRouter(mockRepo)

	tests := []struct {
		name           string
		method         string
		path           string
		body           string
		expectedStatus int
	}{
		{
			name:           "Valid POST /api/v1/jobs",
			method:         http.MethodPost,
			path:           "/api/v1/jobs",
			body:           `{"position":"Software Engineer","company":"Acme Corp"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "Invalid method GET /api/v1/jobs",
			method:         http.MethodGet,
			path:           "/api/v1/jobs",
			body:           ``,
			expectedStatus: http.StatusMethodNotAllowed,
		},
		{
			name:           "Unknown route /api/v1/unknown",
			method:         http.MethodPost,
			path:           "/api/v1/unknown",
			body:           ``,
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(tt.body))
			w := httptest.NewRecorder()

			apiHandler.ServeHTTP(w, req)

			resp := w.Result()
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}
