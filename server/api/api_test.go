package api_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type mockJobRepo struct{}

func (*mockJobRepo) InsertJob(_ context.Context, position, company string, userID int32) (repository.Job, error) {
	return repository.Job{
		ID:       1,
		Position: position,
		Company:  company,
	}, nil
}

func (*mockJobRepo) GetJobs(_ context.Context, userID int32) ([]repository.Job, error) {
	return []repository.Job{
		{
			ID:       1,
			Position: "Backend Dev",
			Company:  "Test Company",
		},
	}, nil
}

func (*mockJobRepo) UpdateJob(_ context.Context, id, userID int32, position, company string) (repository.Job, error) {
	return repository.Job{
		ID:       id,
		Position: position,
		Company:  company,
	}, nil
}

func (*mockJobRepo) DeleteJob(_ context.Context, userID, id int32) error {
	return nil
}

type mockUserRepo struct{}

func (*mockUserRepo) InsertUser(_ context.Context, arg repository.InsertUserParams) (repository.User, error) {
	return repository.User{
		ID:       1,
		Username: arg.Username,
	}, nil
}

func (*mockUserRepo) GetUserByUsername(_ context.Context, username string) (repository.User, error) {
	return repository.User{
		ID:           1,
		Username:     username,
		HashPassword: "mock_hash_pass",
	}, nil
}

func TestApiRouting(t *testing.T) {
	mockJob := &mockJobRepo{}
	mockUser := &mockUserRepo{}
	testTM := auth.NewTokenManager("test-secret")

	app := api.ApiRouter(mockJob, mockUser, testTM)

	tests := []struct {
		name           string
		method         string
		url            string
		body           string
		expectedStatus int
	}{
		{
			name:           "POST register works through v1 prefix",
			method:         http.MethodPost,
			url:            "/api/v1/register",
			body:           `{"username": "newuser", "password": "password123"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "POST login works through v1 prefix",
			method:         http.MethodPost,
			url:            "/api/v1/login",
			body:           `{"username": "testuser", "password": "password123"}`,
			expectedStatus: http.StatusUnauthorized,
		},
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
