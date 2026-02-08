package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func JobRouter(repo handler.JobRepo) *http.ServeMux {
	router := http.NewServeMux()
	jobHandler := handler.NewJobHandler(repo)

	router.HandleFunc("/jobs", jobHandler.CreateJob)
	// router.HandleFunc("GET /list", handler.GetListOfJobs)
	// router.HandleFunc("PATCH /update", handler.UpdateJob)
	// router.HandleFunc("DELETE /delete", handler.DeleteJob)

	return router
}
