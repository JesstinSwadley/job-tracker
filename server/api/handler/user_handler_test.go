package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type mockUserRepo struct {
	insertUserFn        func(ctx context.Context, arg repository.InsertUserParams) (repository.User, error)
	getUserByUsernameFn func(ctx context.Context, username string) (repository.User, error)
}

func (m *mockUserRepo) InsertUser(ctx context.Context, arg repository.InsertUserParams) (repository.User, error) {
	return m.insertUserFn(ctx, arg)
}

func (m *mockUserRepo) GetUserByUsername(ctx context.Context, username string) (repository.User, error) {
	return m.getUserByUsernameFn(ctx, username)
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
			mockRepo := &mockUserRepo{
				insertUserFn: func(ctx context.Context, arg repository.InsertUserParams) (repository.User, error) {
					if tt.mockErr != nil {
						return repository.User{}, tt.mockErr
					}

					return repository.User{ID: 1, Username: arg.Username}, nil
				},
			}

			testTokenManager := auth.NewTokenManager("secret-key-for-testing")

			h := NewUserHandler(mockRepo, testTokenManager)

			req := httptest.NewRequest(http.MethodPost, "/register", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()

			h.Register(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedStatus == http.StatusCreated {
				var resp LoginResponse

				if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
					t.Fatalf("failed to decode user: %v", err)
				}

				if resp.Token == "" {
					t.Error("Expected token in response, got empty string")
				}

				if resp.Username == "" {
					t.Error("Expected username in response, got empty string")
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

func TestLoginUser(t *testing.T) {
	correctPassword := "securepassword123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(correctPassword), 10)

	tests := []struct {
		name           string
		body           string
		mockUser       repository.User
		mockErr        error
		expectedStatus int
		expectedErrMsg string
	}{
		{
			name: "Success: Valid Login",
			body: `{"username": "testuser", "password": "securepassword123"}`,
			mockUser: repository.User{
				ID:           1,
				Username:     "testuser",
				HashPassword: string(hashedPassword),
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Error: Empty Credentials",
			body:           `{"username": "", "password": ""}`,
			expectedStatus: http.StatusBadRequest,
			expectedErrMsg: "Username and Password are required",
		},
		{
			name:           "Error: User Not Found",
			body:           `{"username": "nonexistent", "password": "password123"}`,
			mockErr:        errors.New("no rows in result set"),
			expectedStatus: http.StatusUnauthorized,
			expectedErrMsg: "Invalid username or password",
		},
		{
			name: "Error: Incorrect Password",
			body: `{"username": "testuser", "password": "wrongpassword"}`,
			mockUser: repository.User{
				Username:     "testuser",
				HashPassword: string(hashedPassword),
			},
			expectedStatus: http.StatusUnauthorized,
			expectedErrMsg: "Invalid username or password",
		},
		{
			name:           "Error: Database failure",
			body:           `{"username": "testuser", "password": "securepassword123"}`,
			mockErr:        context.DeadlineExceeded,
			expectedStatus: http.StatusInternalServerError,
			expectedErrMsg: "Internal server error",
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
			mockRepo := &mockUserRepo{
				getUserByUsernameFn: func(ctx context.Context, username string) (repository.User, error) {
					if tt.mockErr != nil {
						return repository.User{}, tt.mockErr
					}
					return tt.mockUser, nil
				},
			}

			testTokenManager := auth.NewTokenManager("secret-key-for-testing")

			h := NewUserHandler(mockRepo, testTokenManager)

			req := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()

			h.Login(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("%s: expected status %d, got %d", tt.name, tt.expectedStatus, w.Code)
			}

			if tt.expectedStatus == http.StatusOK {
				var resp LoginResponse

				if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
					t.Fatalf("failed to decode login response: %v", err)
				}

				if resp.Token == "" {
					t.Error("expected token in resposne, got empty string")
				}

				if resp.Username != tt.mockUser.Username {
					t.Errorf("expected username %s, got %s", tt.mockUser.Username, resp.Username)
				}
			} else if tt.expectedErrMsg != "" {
				var errResp map[string]string
				json.NewDecoder(w.Body).Decode(&errResp)

				if errResp["error"] != tt.expectedErrMsg {
					t.Errorf("%s: expected error %q, got %q", tt.name, tt.expectedErrMsg, errResp["error"])
				}

			}
		})
	}
}
