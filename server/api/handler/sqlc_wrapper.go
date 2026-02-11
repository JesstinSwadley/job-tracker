package handler

import (
	"context"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type SQLCJobRepo struct {
	Queries *repository.Queries
}

func (s *SQLCJobRepo) InsertJob(ctx context.Context, position, company string) (repository.Job, error) {
	return s.Queries.InsertJob(ctx, repository.InsertJobParams{
		Position: position,
		Company:  company,
	})
}
