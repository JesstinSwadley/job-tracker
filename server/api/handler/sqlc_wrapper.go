package handler

import (
	"context"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

// SQLCJobRepo wraps *respository.Queries to implement minimal JobRepo interface
type SQLCJobRepo struct {
	Queries *repository.Queries
}

// InsertJob adapts SQLC InsertJob to minimal interface
func (s *SQLCJobRepo) InsertJob(ctx context.Context, position, company string) (repository.Job, error) {
	return s.Queries.InsertJob(ctx, repository.InsertJobParams{
		Position: position,
		Company:  company,
	})
}
