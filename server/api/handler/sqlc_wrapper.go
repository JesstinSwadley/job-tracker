package handler

import (
	"context"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type SQLCJobRepo struct {
	Queries *repository.Queries
}

func (s *SQLCJobRepo) InsertJob(ctx context.Context, arg repository.InsertJobParams) (repository.Job, error) {
	return s.Queries.InsertJob(ctx, arg)
}

func (s *SQLCJobRepo) GetJobs(ctx context.Context, userID int32) ([]repository.Job, error) {
	return s.Queries.GetJobs(ctx, userID)
}

func (s *SQLCJobRepo) UpdateJob(ctx context.Context, arg repository.UpdateJobParams) (repository.Job, error) {
	return s.Queries.UpdateJob(ctx, arg)
}

func (s *SQLCJobRepo) DeleteJob(ctx context.Context, arg repository.DeleteJobParams) error {
	return s.Queries.DeleteJob(ctx, arg)
}

type SQLCUserRepo struct {
	Queries *repository.Queries
}

func (s *SQLCUserRepo) InsertUser(ctx context.Context, arg repository.InsertUserParams) (repository.User, error) {
	return s.Queries.InsertUser(ctx, arg)
}

func (s *SQLCUserRepo) GetUserByUsername(ctx context.Context, username string) (repository.User, error) {
	return s.Queries.GetUserByUsername(ctx, username)
}
