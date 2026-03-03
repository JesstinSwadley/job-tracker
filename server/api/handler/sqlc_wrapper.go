package handler

import (
	"context"

	"github.com/JesstinSwadley/job-tracker/internal/repository"
)

type SQLCJobRepo struct {
	Queries *repository.Queries
}

func (s *SQLCJobRepo) InsertJob(ctx context.Context, position, company string, userID int32) (repository.Job, error) {
	return s.Queries.InsertJob(ctx, repository.InsertJobParams{
		Position: position,
		Company:  company,
		UserID:   userID,
	})
}

func (s *SQLCJobRepo) GetJobs(ctx context.Context, userID int32) ([]repository.Job, error) {
	return s.Queries.GetJobs(ctx, userID)
}

func (s *SQLCJobRepo) UpdateJob(ctx context.Context, id, userID int32, position, company string) (repository.Job, error) {
	return s.Queries.UpdateJob(ctx, repository.UpdateJobParams{
		ID:       id,
		UserID:   userID,
		Position: position,
		Company:  company,
	})
}

func (s *SQLCJobRepo) DeleteJob(ctx context.Context, userID, id int32) error {
	return s.Queries.DeleteJob(ctx, repository.DeleteJobParams{
		ID:     id,
		UserID: userID,
	})
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
