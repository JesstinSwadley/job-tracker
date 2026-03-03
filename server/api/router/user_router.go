package router

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/handler"
)

func UserRouter(mux *http.ServeMux, h *handler.UserHandler) {
	mux.HandleFunc("POST /register", h.Register)
	mux.HandleFunc("POST /login", h.Login)
}
