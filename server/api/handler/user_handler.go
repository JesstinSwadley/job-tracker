package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type UserRepo interface {
	InsertUser(ctx context.Context, arg repository.InsertUserParams) (repository.User, error)
	GetUserByUsername(ctx context.Context, username string) (repository.User, error)
}

type UserHandler struct {
	Repo         UserRepo
	TokenManager *auth.TokenManager
}

func NewUserHandler(repo UserRepo, tokenManager *auth.TokenManager) *UserHandler {
	return &UserHandler{
		Repo:         repo,
		TokenManager: tokenManager,
	}
}

func (h *UserHandler) errorResponse(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string          `json:"token"`
	User  repository.User `json:"user"`
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	username := strings.TrimSpace(reqBody.Username)
	password := reqBody.Password

	if username == "" || password == "" {
		h.errorResponse(w, http.StatusBadRequest, "Username and Password are required")

		return
	}

	if len(password) < 8 {
		h.errorResponse(w, http.StatusBadRequest, "Password must be at least 8 characters")

		return
	}

	if len(password) > 72 {
		h.errorResponse(w, http.StatusBadRequest, "Password is too long")

		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Internal server error")

		return
	}

	user, err := h.Repo.InsertUser(r.Context(), repository.InsertUserParams{
		Username:     username,
		HashPassword: string(hashedPassword),
	})

	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" {
				h.errorResponse(w, http.StatusConflict, "Username is already taken")

				return
			}
		}

		h.errorResponse(w, http.StatusInternalServerError, "Failed to register user")

		return
	}

	token, err := h.TokenManager.CreateToken(user.ID, 24*time.Hour)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "User created but token generation failed")
		return
	}

	user.HashPassword = ""
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(LoginResponse{
		Token: token,
		User:  user,
	})
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	username := strings.TrimSpace(reqBody.Username)

	if username == "" || reqBody.Password == "" {
		h.errorResponse(w, http.StatusBadRequest, "Username and Password are required")

		return
	}

	user, err := h.Repo.GetUserByUsername(r.Context(), username)

	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			h.errorResponse(w, http.StatusUnauthorized, "Invalid username or password")

			return
		}

		h.errorResponse(w, http.StatusInternalServerError, "Internal server error")

		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(reqBody.Password))

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Invalid username or password")

		return
	}

	token, err := h.TokenManager.CreateToken(user.ID, 24*time.Hour)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Failed to generate token")

		return
	}

	user.HashPassword = ""
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(LoginResponse{
		Token: token,
		User:  user,
	})
}
