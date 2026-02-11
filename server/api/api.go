package api

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/api/router"
)

func ApiRouter(jobRepo handler.JobRepo) *http.ServeMux {
	jobHandler := handler.NewJobHandler(jobRepo)

	apiMux := http.NewServeMux()

	v1 := router.New(jobHandler)

	apiMux.Handle("/api/v1/", http.StripPrefix("/api/v1", v1))

	return apiMux
}
