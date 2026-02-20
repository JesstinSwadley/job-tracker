package api_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type mockJobRepo struct{}

func (*mockJobRepo) InsertJob(_ context.Context, position, company string) (repository.Job, error) {
	return repository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func (*mockJobRepo) GetJobs(_ context.Context) ([]repository.Job, error) {
	return []repository.Job{
		{
			ID:       1,
			Position: "Backend Dev",
			Company:  "Test Company",
		},
	}, nil
}

func (*mockJobRepo) UpdateJob(_ context.Context, id int32, position, company string) (repository.Job, error) {
	return repository.Job{
		ID:       id,
		Position: position,
		Company:  company,
	}, nil
}

func (*mockJobRepo) DeleteJob(_ context.Context, id int32) error {
	return nil
}

func TestApiRouting(t *testing.T) {
	mockRepo := &mockJobRepo{}
	app := api.ApiRouter(mockRepo)

	tests := []struct {
		name           string
		method         string
		url            string
		body           string
		expectedStatus int
	}{
		{
			name:           "POST job works through v1 prefix",
			method:         http.MethodPost,
			url:            "/api/v1/jobs",
			body:           `{"position": "Backend Dev", "company": "Test Company"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "GET jobs works through v1 prefix",
			method:         http.MethodGet,
			url:            "/api/v1/jobs",
			body:           "",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "PUT jobs works through v1 prefix",
			method:         http.MethodPut,
			url:            "/api/v1/jobs/1",
			body:           `{"position": "Backend Dev", "company": "Test Company"}`,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Delete jobs works through v1 prefix",
			method:         http.MethodDelete,
			url:            "/api/v1/jobs/1",
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "Route not found returns 404",
			method:         http.MethodGet,
			url:            "/api/v1/wrong-route",
			body:           "",
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Incorrect method returns 405 via Handler Guard",
			method:         http.MethodPatch,
			url:            "/api/v1/jobs",
			body:           `{}`,
			expectedStatus: http.StatusMethodNotAllowed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.url, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			app.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("%s: expected status %d, got %d", tt.name, tt.expectedStatus, w.Code)
			}
		})
	}
}
