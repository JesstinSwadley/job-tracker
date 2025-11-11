package handler

import (
	"encoding/json"
	"net/http"

	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user respository.User

	ctx := r.Context()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&user); err != nil {
		panic(err)
	}

	bytes, err := bcrypt.GenerateFromPassword([]byte(user.HashPassword), 10)

	if err != nil {
		panic(err)
	}

	u, err := repo.InsertUser(ctx, respository.InsertUserParams{
		Username:     user.Username,
		HashPassword: string(bytes),
	})

	w.WriteHeader(201)
	w.Write([]byte(u.Username + " has been registered"))
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var user respository.User

	ctx := r.Context()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&user); err != nil {
		panic(err)
	}

	u, err := repo.FindUserByUsername(ctx, user.Username)

	if err != nil {
		panic(err)
	}

	if err = bcrypt.CompareHashAndPassword([]byte(u.HashPassword), []byte(user.HashPassword)); err != nil {
		panic(err)
	}

	w.WriteHeader(200)
	w.Write([]byte(u.Username + " has been logged in"))
}
