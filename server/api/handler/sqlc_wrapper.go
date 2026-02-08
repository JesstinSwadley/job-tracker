package handler

import (
	"context"

	"github.com/JesstinSwadley/job-tracker/internal/respository"
)

// SQLCJobRepo wraps *respository.Queries to implement minimal JobRepo interface
type SQLCJobRepo struct {
	Queries *respository.Queries
}

// InsertJob adapts SQLC InsertJob to minimal interface
func (s *SQLCJobRepo) InsertJob(ctx context.Context, position, company string) (respository.Job, error) {
	return s.Queries.InsertJob(ctx, respository.InsertJobParams{
		Position: position,
		Company:  company,
	})
}
