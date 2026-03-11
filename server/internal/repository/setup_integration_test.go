package repository

import (
	"context"
	"log"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

var testQueries *Queries
var testPool *pgxpool.Pool

const tempUserID int32 = 1

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

	_, err = testPool.Exec(ctx,
		"INSERT INTO users (id, username, hash_password) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
		tempUserID, "test_user", "hashed_password",
	)

	if err != nil {
		log.Fatalf("failed to seed test user: %v", err)
	}

	code := m.Run()

	testPool.Close()
	os.Exit(code)
}
