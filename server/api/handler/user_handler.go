package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

type UserRepo interface {
	InsertUser(ctx context.Context, arg repository.InsertUserParams) (repository.User, error)
	GetUserByUsername(ctx context.Context, username string) (repository.User, error)
}

type UserHandler struct {
	Repo UserRepo
}

func NewUserHandler(repo UserRepo) *UserHandler {
	return &UserHandler{Repo: repo}
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

	user.HashPassword = ""
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	user, err := h.Repo.GetUserByUsername(r.Context(), reqBody.Username)

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Invalid username or password")

		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(reqBody.Password))

	if err != nil {
		h.errorResponse(w, http.StatusUnauthorized, "Invalid username or password")

		return
	}

	user.HashPassword = ""
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
