package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func DatabasePool() *pgxpool.Pool {
	dbURL, ok := os.LookupEnv("DB_URL")
	if !ok {
		panic("DB_URL environment variable not defined")
	}

	pool, err := ConnectWithURL(dbURL)
	if err != nil {
		log.Fatalf("failed to create DB pool: %v", err)
	}

	return pool
}

func ConnectWithURL(dbURL string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(dbURL)

	if err != nil {
		return nil, err
	}

	// Tweak Pool Settings
	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnIdleTime = 5 * time.Minute

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)

	if err != nil {
		return nil, err
	}

	// Ping to verify connection
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	return pool, nil
}
