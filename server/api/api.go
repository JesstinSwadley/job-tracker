package api

import (
	"net/http"

	"github.com/JesstinSwadley/job-tracker/api/router"
)

func ApiRouter() *http.ServeMux {
	api := http.NewServeMux()

	api.Handle("/job/", http.StripPrefix("/job", router.JobRouter()))
	api.Handle("/user/", http.StripPrefix("/user", router.UserRouter()))

	return api
}
