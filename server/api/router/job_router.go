package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func JobRouter() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("POST /new", handler.NewJob)

	return router
}
