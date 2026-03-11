package repository

import (
	"context"
	"fmt"
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

func createTestUser(t *testing.T) User {
	ctx := context.Background()

	username := fmt.Sprintf("user_%d_%d", time.Now().UnixNano(), time.Now().Second())

	arg := InsertUserParams{
		Username:     username,
		HashPassword: "test_hashed_password",
	}

	user, err := testQueries.InsertUser(ctx, arg)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	t.Cleanup(func() {
		_, _ = testPool.Exec(ctx, "DELETE FROM users WHERE id = $1", user.ID)
	})

	return user
}
