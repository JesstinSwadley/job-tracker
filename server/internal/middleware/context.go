package middleware

import (
	"context"
	"errors"
)

type contextKey string

const userIDKey contextKey = "user_id"

func SetUserID(ctx context.Context, userID int32) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func GetUserID(ctx context.Context) (int32, error) {
	userID, ok := ctx.Value(userIDKey).(int32)
	if !ok {
		return 0, errors.New("user ID not found in context")
	}
	return userID, nil
}
