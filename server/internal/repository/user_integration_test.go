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
		Username:     "Test User",
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
		t.Errorf("Data is mismatch: expected %s, got %s", user.Username, arg.Username)
	}
}

func TestInsertUser_Duplicate_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = testPool.Exec(ctx, "DELETE FROM users")

	arg := InsertUserParams{
		Username:     "DuplicateUser",
		HashPassword: "some_hash",
	}

	_, err := testQueries.InsertUser(ctx, arg)

	if err != nil {
		t.Fatalf("First insert failed: %v", err)
	}

	_, err = testQueries.InsertUser(ctx, arg)

	if err == nil {
		t.Error("Expected error when inserting duplicate username, but got nil")
	}
}
