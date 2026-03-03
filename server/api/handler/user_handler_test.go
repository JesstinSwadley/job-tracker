package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/jackc/pgx/v5/pgconn"
)

type mockUserRepo struct {
	user []repository.User
	err  error
}

func (m *mockUserRepo) InsertUser(_ context.Context, arg repository.InsertUserParams) (repository.User, error) {
	if m.err != nil {
		return repository.User{}, m.err
	}

	return repository.User{
		ID:           1,
		Username:     arg.Username,
		HashPassword: arg.HashPassword,
	}, nil
}

func TestRegisterUser(t *testing.T) {
	tests := []struct {
		name           string
		body           string
		mockErr        error
		expectedStatus int
		expectedID     int32
		expectedErrMsg string
	}{
		{
			name:           "Success: Valid User Registration",
			body:           `{"username": "testuser", "password": "securepassword123"}`,
			expectedStatus: http.StatusCreated,
			expectedID:     1,
		},
		{
			name:           "Error: Password Too Short",
			body:           `{"username": "testuser", "password": "123"}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Password must be at least 8 characters",
		},
		{
			name:           "Error: Password Too Long (Bcrypt Limit)",
			body:           `{"username": "testuser", "password": "` + strings.Repeat("a", 73) + `"}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Password is too long",
		},
		{
			name:           "Error: Empty Username",
			body:           `{"username": "", "password": "securepassword123"}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Username and Password are required",
		},
		{
			name:           "Error: Empty Password",
			body:           `{"username": "testuser", "password": ""}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Username and Password are required",
		},
		{
			name:           "Error: Username already taken",
			body:           `{"username": "takenuser", "password": "password123"}`,
			mockErr:        &pgconn.PgError{Code: "23505"},
			expectedStatus: http.StatusConflict,
			expectedErrMsg: "Username is already taken",
		},
		{
			name:           "Error: Database failure",
			body:           `{"username": "testuser", "password": "securepassword123"}`,
			mockErr:        context.DeadlineExceeded,
			expectedStatus: http.StatusInternalServerError,
			expectedErrMsg: "Failed to register user",
		},
		{
			name:           "Error: Invalid JSON",
			body:           `{invalid-json}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Invalid request body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockUserRepo{err: tt.mockErr}
			h := NewUserHandler(mockRepo)

			req := httptest.NewRequest(http.MethodPost, "/register", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()

			h.Register(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedStatus == http.StatusCreated {
				var user repository.User

				if err := json.NewDecoder(w.Body).Decode(&user); err != nil {
					t.Fatalf("failed to decode user: %v", err)
				}

				if user.ID != tt.expectedID {
					t.Errorf("expected user ID %d, got %d", tt.expectedID, user.ID)
				}

				if user.HashPassword != "" {
					t.Error("Security violation: password hash was leaked in JSON response")
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
