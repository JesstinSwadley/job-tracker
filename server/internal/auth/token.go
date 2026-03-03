package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenManager struct {
	secretKey string
}

func NewTokenManager(secretKey string) *TokenManager {
	return &TokenManager{secretKey: secretKey}
}

func (m *TokenManager) CreateToken(userID int32, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(duration).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(m.secretKey))
}

func (m *TokenManager) VerifyToken(tokenString string) (int32, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}

		return []byte(m.secretKey), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := int32(claims["user_id"].(float64))

		return userID, nil
	}

	return 0, errors.New("invalid token")
}
