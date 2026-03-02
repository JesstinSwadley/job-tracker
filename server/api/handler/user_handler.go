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

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var reqBody RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		h.errorResponse(w, http.StatusBadRequest, "Invalid request body")

		return
	}

	if strings.TrimSpace(reqBody.Username) == "" || strings.TrimSpace(reqBody.Password) == "" {
		h.errorResponse(w, http.StatusBadRequest, "Username and Password are required")

		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(reqBody.Password), 10)

	if err != nil {
		h.errorResponse(w, http.StatusInternalServerError, "Internal server error")

		return
	}

	user, err := h.Repo.InsertUser(r.Context(), repository.InsertUserParams{
		Username:     reqBody.Username,
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

// import (
// 	"encoding/json"
// 	"fmt"
// 	"net/http"
// 	"strconv"
// 	"time"

// 	"github.com/JesstinSwadley/job-tracker/internal/database"
// 	"github.com/JesstinSwadley/job-tracker/internal/respository"
// 	"github.com/golang-jwt/jwt/v5"
// 	"golang.org/x/crypto/bcrypt"
// )

// const secretKey = "secret"

// func RegisterUser(w http.ResponseWriter, r *http.Request) {
// 	var user respository.User

// 	ctx := r.Context()
// 	dbConn := database.DatabaseConnection()
// 	repo := respository.New(dbConn)

// 	decoder := json.NewDecoder(r.Body)

// 	if err := decoder.Decode(&user); err != nil {
// 		fmt.Print(err)
// 		w.WriteHeader(400)
// 		w.Write([]byte("unable to register user"))
// 		return
// 	}

// 	bytes, err := bcrypt.GenerateFromPassword([]byte(user.HashPassword), 10)

// 	if err != nil {
// 		fmt.Print(err)
// 		w.WriteHeader(400)
// 		w.Write([]byte("unable to register user"))
// 		return
// 	}

// 	u, err := repo.InsertUser(ctx, respository.InsertUserParams{
// 		Username:     user.Username,
// 		HashPassword: string(bytes),
// 	})

// 	if err != nil {
// 		fmt.Print(err)
// 		w.WriteHeader(400)
// 		w.Write([]byte("unable to register user"))
// 		return
// 	}

// 	w.WriteHeader(201)
// 	w.Write([]byte(u.Username + " has been registered"))
// }

// func LoginUser(w http.ResponseWriter, r *http.Request) {
// 	var user respository.User

// 	ctx := r.Context()
// 	dbConn := database.DatabaseConnection()
// 	repo := respository.New(dbConn)

// 	decoder := json.NewDecoder(r.Body)

// 	if err := decoder.Decode(&user); err != nil {
// 		w.WriteHeader(401)
// 		w.Write([]byte("incorrect username or password"))
// 		return
// 	}

// 	u, err := repo.FindUserByUsername(ctx, user.Username)

// 	if err != nil {
// 		w.WriteHeader(401)
// 		w.Write([]byte("incorrect username or password"))
// 		return
// 	}

// 	if err = bcrypt.CompareHashAndPassword([]byte(u.HashPassword), []byte(user.HashPassword)); err != nil {
// 		w.WriteHeader(400)
// 		w.Write([]byte("incorrect username or password"))
// 		return
// 	}

// 	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
// 		"iss": strconv.Itoa(int(u.ID)),
// 		"exp": time.Now().Add(time.Hour).Unix(),
// 	})

// 	token, err := claims.SignedString([]byte(secretKey))

// 	if err != nil {
// 		w.WriteHeader(500)
// 		w.Write([]byte("could not login"))
// 		return
// 	}

// 	cookie := http.Cookie{
// 		Name:     "jwt",
// 		Value:    token,
// 		Expires:  time.Now().Add(time.Hour),
// 		MaxAge:   3600,
// 		HttpOnly: true,
// 	}

// 	http.SetCookie(w, &cookie)

// 	w.WriteHeader(200)
// 	w.Write([]byte(u.Username + " has been logged in"))
// }
