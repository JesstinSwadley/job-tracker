package api_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type mockJobRepo struct{}

func (*mockJobRepo) InsertJob(_ context.Context, arg repository.InsertJobParams) (repository.Job, error) {
	return repository.Job{
		ID:            1,
		Position:      arg.Position,
		Company:       arg.Company,
		UserID:        arg.UserID,
		Status:        arg.Status,
		Salary:        arg.Salary,
		JobUrl:        arg.JobUrl,
		Notes:         arg.Notes,
		Source:        arg.Source,
		LocationType:  arg.LocationType,
		AppliedAt:     arg.AppliedAt,
		InterviewedAt: arg.InterviewedAt,
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

func (*mockJobRepo) UpdateJob(_ context.Context, arg repository.UpdateJobParams) (repository.Job, error) {
	return repository.Job{
		ID:            arg.ID,
		Position:      arg.Position,
		Company:       arg.Company,
		UserID:        arg.UserID,
		Status:        arg.Status,
		Salary:        arg.Salary,
		JobUrl:        arg.JobUrl,
		Notes:         arg.Notes,
		Source:        arg.Source,
		LocationType:  arg.LocationType,
		AppliedAt:     arg.AppliedAt,
		InterviewedAt: arg.InterviewedAt,
	}, nil
}

func (*mockJobRepo) DeleteJob(_ context.Context, arg repository.DeleteJobParams) error {
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

	validToken, _ := testTM.CreateToken(1, time.Minute)
	authHeader := "Bearer " + validToken

	app := api.ApiRouter(mockJob, mockUser, testTM)

	tests := []struct {
		name           string
		method         string
		url            string
		body           string
		setupHeader    func(r *http.Request)
		expectedStatus int
	}{
		{
			name:           "POST register works",
			method:         http.MethodPost,
			url:            "/api/v1/register",
			body:           `{"username": "newuser", "password": "password123"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "POST login works",
			method:         http.MethodPost,
			url:            "/api/v1/login",
			body:           `{"username": "testuser", "password": "password123"}`,
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:   "POST job works with valid token",
			method: http.MethodPost,
			url:    "/api/v1/jobs",
			body:   `{"position": "Backend Dev", "company": "Test Company", "status": "Applied"}`,
			setupHeader: func(r *http.Request) {
				r.Header.Set("Authorization", authHeader)
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name:   "GET jobs works with valid token",
			method: http.MethodGet,
			url:    "/api/v1/jobs",
			setupHeader: func(r *http.Request) {
				r.Header.Set("Authorization", authHeader)
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "PUT jobs works with valid token",
			method: http.MethodPut,
			url:    "/api/v1/jobs/1",
			body:   `{"position": "Backend Dev", "company": "Test Company", "status": "Offered"}`,
			setupHeader: func(r *http.Request) {
				r.Header.Set("Authorization", authHeader)
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "Delete jobs works with valid token",
			method: http.MethodDelete,
			url:    "/api/v1/jobs/1",
			setupHeader: func(r *http.Request) {
				r.Header.Set("Authorization", authHeader)
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "GET jobs fails without token",
			method:         http.MethodGet,
			url:            "/api/v1/jobs",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:   "GET jobs fails with malformed token",
			method: http.MethodGet,
			url:    "/api/v1/jobs",
			setupHeader: func(r *http.Request) {
				r.Header.Set("Authorization", "NotBearer token123")
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Route not found returns 401 when unauthenticated",
			method:         http.MethodGet,
			url:            "/api/v1/wrong-route",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.url, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")

			if tt.setupHeader != nil {
				tt.setupHeader(req)
			}

			w := httptest.NewRecorder()

			app.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("%s: expected status %d, got %d", tt.name, tt.expectedStatus, w.Code)
			}
		})
	}
}
