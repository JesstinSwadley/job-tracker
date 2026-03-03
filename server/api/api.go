package api

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/api/router"
	"github.com/JesstinSwadley/job-tracker/internal/auth"
)

func ApiRouter(jobRepo handler.JobRepo, userRepo handler.UserRepo, tm *auth.TokenManager) *http.ServeMux {
	jobHandler := handler.NewJobHandler(jobRepo)
	userHandler := handler.NewUserHandler(userRepo, tm)

	v1 := http.NewServeMux()

	router.UserRouter(v1, userHandler)
	router.JobRouter(v1, jobHandler)

	apiMux := http.NewServeMux()
	apiMux.Handle("/api/v1/", http.StripPrefix("/api/v1", v1))

	return apiMux
}
