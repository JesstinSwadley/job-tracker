package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func JobRouter(mux *http.ServeMux, h *handler.JobHandler) {
	mux.HandleFunc("POST /jobs", h.CreateJob)
	mux.HandleFunc("GET /jobs", h.GetJobs)
	mux.HandleFunc("PUT /jobs/{id}", h.UpdateJob)
}
