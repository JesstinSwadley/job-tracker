package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func UserRouter() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("POST /register", handler.RegisterUser)

	return router
}
