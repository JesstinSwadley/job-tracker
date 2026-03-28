package api

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/api/router"
	_ "github.com/JesstinSwadley/job-tracker/docs"
	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
)

func ApiRouter(jobRepo handler.JobRepo, userRepo handler.UserRepo, tm *auth.TokenManager) http.Handler {
	jobHandler := handler.NewJobHandler(jobRepo)
	userHandler := handler.NewUserHandler(userRepo, tm)

	v1 := http.NewServeMux()

	router.UserRouter(v1, userHandler)

	jobMux := http.NewServeMux()
	router.JobRouter(jobMux, jobHandler)

	protectedJobs := middleware.AuthMiddleware(tm)(jobMux)

	v1.Handle("/", protectedJobs)

	apiMux := http.NewServeMux()
	apiMux.Handle("/swagger/", httpSwagger.WrapHandler)
	apiMux.Handle("/api/v1/", http.StripPrefix("/api/v1", v1))

	return middleware.Logger(apiMux)
}
