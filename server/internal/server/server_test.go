package server_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheck(t *testing.T) {
	app := setupTestServer(t)
	router := app.RegisterRoutes()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", rec.Code)
	}

	if rec.Body.String() != "OK" {
		t.Fatalf("expected body %q, got %q", "OK", rec.Body.String())
	}
}
