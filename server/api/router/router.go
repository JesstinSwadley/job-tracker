package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func New(h *handler.JobHandler) *http.ServeMux {
	mux := http.NewServeMux()

	JobRouter(mux, h)

	return mux
}
