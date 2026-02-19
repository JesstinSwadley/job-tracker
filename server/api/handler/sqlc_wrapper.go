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

func (s *SQLCJobRepo) GetJobs(ctx context.Context) ([]repository.Job, error) {
	return s.Queries.GetJobs(ctx)
}

func (s *SQLCJobRepo) UpdateJob(ctx context.Context, id int32, position, company string) (repository.Job, error) {
	return s.Queries.UpdateJob(ctx, repository.UpdateJobParams{
		ID:       id,
		Position: position,
		Company:  company,
	})
}
