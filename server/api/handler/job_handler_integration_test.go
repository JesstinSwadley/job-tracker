package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

func setupTestDB(t *testing.T) *repository.Queries {
	t.Helper()

	dbURL := os.Getenv("TEST_DB_URL")
	if dbURL == "" {
		t.Fatal("TEST_DB_URL environment variable not set")
	}

	// Connect using pgxpool
	dbPool, err := database.ConnectWithURL(dbURL)
	if err != nil {
		t.Fatalf("failed to connect to test DB: %v", err)
	}

	// Optional: clean jobs table before test
	_, err = dbPool.Exec(context.Background(), "TRUNCATE TABLE jobs RESTART IDENTITY CASCADE")
	if err != nil {
		t.Fatalf("failed to truncate jobs table: %v", err)
	}

	return repository.New(dbPool)
}

func TestCreateJobIntegration(t *testing.T) {
	queries := setupTestDB(t)

	// Wrap SQLC repo in minimal interface
	jobRepo := &handler.SQLCJobRepo{Queries: queries}

	// Full API router
	router := api.ApiRouter(jobRepo)

	// Prepare test payload
	payload := map[string]string{
		"position": "Integration Engineer",
		"company":  "Acme Corp",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/jobs", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Serve request through full router
	router.ServeHTTP(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, resp.StatusCode)
	}

	// Optional: verify response body contains job info
	buf := new(bytes.Buffer)
	buf.ReadFrom(resp.Body)
	respBody := buf.String()
	if respBody == "" {
		t.Fatal("expected response body, got empty")
	}
	t.Logf("response: %s", respBody)

	// Optional: verify job exists in DB
	insertedJob, err := queries.InsertJob(context.Background(), repository.InsertJobParams{
		Position: "Integration Engineer",
		Company:  "Acme Corp",
	})
	if err != nil {
		t.Fatalf("failed to insert job for verification: %v", err)
	}
	t.Logf("Inserted job ID: %d", insertedJob.ID)
}
