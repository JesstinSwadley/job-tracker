package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/respository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const secretKey = "secret"

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user respository.User

	ctx := r.Context()
	dbConn := database.DatabaseConnection()
	repo := respository.New(dbConn)

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&user); err != nil {
		fmt.Print(err)
		w.WriteHeader(400)
		w.Write([]byte("unable to register user"))
		return
	}

	bytes, err := bcrypt.GenerateFromPassword([]byte(user.HashPassword), 10)

	if err != nil {
		fmt.Print(err)
		w.WriteHeader(400)
		w.Write([]byte("unable to register user"))
		return
	}

	u, err := repo.InsertUser(ctx, respository.InsertUserParams{
		Username:     user.Username,
		HashPassword: string(bytes),
	})

	if err != nil {
		fmt.Print(err)
		w.WriteHeader(400)
		w.Write([]byte("unable to register user"))
		return
	}

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
		w.WriteHeader(401)
		w.Write([]byte("incorrect username or password"))
		return
	}

	u, err := repo.FindUserByUsername(ctx, user.Username)

	if err != nil {
		w.WriteHeader(401)
		w.Write([]byte("incorrect username or password"))
		return
	}

	if err = bcrypt.CompareHashAndPassword([]byte(u.HashPassword), []byte(user.HashPassword)); err != nil {
		w.WriteHeader(400)
		w.Write([]byte("incorrect username or password"))
		return
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": strconv.Itoa(int(u.ID)),
		"exp": time.Now().Add(time.Hour).Unix(),
	})

	token, err := claims.SignedString([]byte(secretKey))

	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte("could not login"))
		return
	}

	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour),
		MaxAge:   3600,
		HttpOnly: true,
	}

	http.SetCookie(w, &cookie)

	w.WriteHeader(200)
	w.Write([]byte(u.Username + " has been logged in"))
}
