package repository

import (
	"context"
	"testing"
	"time"
)

func TestInsertUser_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	arg := InsertUserParams{
		Username:     "PrimaryTestUser_" + time.Now().Format("150405"),
		HashPassword: "alied,mva",
	}

	user, err := testQueries.InsertUser(ctx, arg)

	if err != nil {
		t.Fatalf("Failed to insert user: %v", err)
	}

	if user.ID == 0 {
		t.Error("Expected database to return a generated ID, got 0")
	}

	if user.Username != arg.Username {
		t.Errorf("Data is mismatch: expected %s, got %s", arg.Username, user.Username)
	}

	t.Cleanup(func() {
		_, _ = testPool.Exec(ctx, "DELETE FROM users WHERE id = $1", user.ID)
	})
}

func TestInsertUser_Duplicate_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	username := "DuplicateUser_" + time.Now().Format("150405")
	arg := InsertUserParams{
		Username:     username,
		HashPassword: "some_hash",
	}

	user, err := testQueries.InsertUser(ctx, arg)
	if err != nil {
		t.Fatalf("First insert failed: %v", err)
	}

	t.Cleanup(func() {
		_, _ = testPool.Exec(ctx, "DELETE FROM users WHERE id = $1", user.ID)
	})

	_, err = testQueries.InsertUser(ctx, arg)
	if err == nil {
		t.Error("Expected error when inserting duplicate username, but got nil")
	}
}
