package api

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/api/router"
)

// ApiRouter mounts all subrouters under /api/v1/
func ApiRouter(jobRepo handler.JobRepo) *http.ServeMux {
	api := http.NewServeMux()

	api.Handle("/api/v1/", http.StripPrefix("/api/v1", router.JobRouter(jobRepo)))
	// 	api.Handle("/user/", http.StripPrefix("/user", router.UserRouter()))

	return api
}
