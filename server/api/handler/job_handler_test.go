package handler_test

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api/handler"
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

func TestCreateJobHandler(t *testing.T) {
	mock := &mockJobRepo{}
	h := handler.NewJobHandler(mock)

	tests := []struct {
		name           string
		method         string
		body           string
		expectedStatus int
	}{
		{
			name:           "Valid POST request",
			method:         http.MethodPost,
			body:           `{"position":"Software Engineer","company":"Acme Corp"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "Invalid JSON body",
			method:         http.MethodPost,
			body:           `invalid-json`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Wrong HTTP method",
			method:         http.MethodGet,
			body:           ``,
			expectedStatus: http.StatusMethodNotAllowed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/jobs", bytes.NewBufferString(tt.body))
			w := httptest.NewRecorder()

			h.CreateJob(w, req)

			resp := w.Result()
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}
