package server_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

func setupTestServer(t *testing.T) *server.Server {
	t.Helper()

	dbPath := os.Getenv("TEST_DB_PATH")

	if dbPath == "" {
		dbPath = "../../jobtracker_test.db"
	}

	return server.New(dbPath)
}
func seedJob(t *testing.T, handler http.Handler, payload string) server.JobResponse {
	t.Helper()

	if payload == "" {
		payload = `{
			"company":"Acme",
			"title":"Software Engineer"
		}`
	}

	req := httptest.NewRequest(http.MethodPost, "/jobs", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("failed to seed job: expected status 201, got %d (%s)", rec.Code, rec.Body.String())
	}

	var created server.JobResponse

	if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
		t.Fatalf("failed to decode seeded job: %v", err)
	}

	return created
}
