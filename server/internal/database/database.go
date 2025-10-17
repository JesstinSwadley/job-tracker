package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

func DatabaseConnection() (conn *pgx.Conn) {
	db, ok := os.LookupEnv("DB_URL")

	if !ok {
		panic("There is no Database URL")
	}

	ctx := context.Background()

	conn, err := pgx.Connect(ctx, db)

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}

	return conn
}
