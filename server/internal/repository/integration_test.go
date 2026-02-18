package repository

import (
	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var testQueries *Queries
var testPool *pgxpool.Pool

func TestMain(m *testing.M) {
	ctx := context.Background()

	connStr := os.Getenv("TEST_DATABASE_URL")
	if connStr == "" {
		connStr = "postgresql://postgres:postgres@localhost:5432/job_tracker_test?sslmode=disable"
	}

	var err error
	testPool, err = pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("cannot connect to test db: %v", err)
	}

	if err := testPool.Ping(ctx); err != nil {
		log.Fatalf("db ping failed: %v", err)
	}

	testQueries = New(testPool)

	code := m.Run()

	testPool.Close()
	os.Exit(code)
}

func TestInsertJob_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	arg := InsertJobParams{
		Position: "Backend Developer",
		Company:  "Test Company",
	}

	job, err := testQueries.InsertJob(ctx, arg)

	if err != nil {
		t.Fatalf("Failed to insert job: %v", err)
	}

	if job.ID == 0 {
		t.Error("Expected database to return a generated ID, got 0")
	}

	if job.Position != arg.Position || job.Company != arg.Company {
		t.Errorf("Data is mismatch: expected %s/%s, got %s/%s", arg.Position, arg.Company, job.Position, job.Company)
	}
}

func TestGetJobs_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = testPool.Exec(ctx, "DELETE FROM jobs")

	jobsToCreate := []InsertJobParams{
		{Position: "Job A", Company: "Company A"},
		{Position: "Job B", Company: "Company B"},
	}

	for _, j := range jobsToCreate {
		_, err := testQueries.InsertJob(ctx, j)
		if err != nil {
			t.Fatalf("Setup failed: could not insert seed data: %v", err)
		}
	}

	jobs, err := testQueries.GetJobs(ctx)

	if err != nil {
		t.Fatalf("Failed to fetch jobs: %v", err)
	}

	if len(jobs) != len(jobsToCreate) {
		t.Errorf("Expected %d jobs, got %d", len(jobsToCreate), len(jobs))
	}
}
