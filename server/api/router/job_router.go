package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func JobRouter(mux *http.ServeMux, h *handler.JobHandler) {
	mux.HandleFunc("/jobs", h.CreateJob)
}
