package middleware

import (
	"net/http"
	"strings"

	"github.com/JesstinSwadley/job-tracker/internal/auth"
)

func AuthMiddleware(tm *auth.TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)

				return
			}

			fields := strings.Fields(authHeader)

			if len(fields) != 2 || strings.ToLower(fields[0]) != "bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)

				return
			}

			accessToken := fields[1]

			userID, err := tm.VerifyToken(accessToken)

			if err != nil {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)

				return
			}

			ctx := SetUserID(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
