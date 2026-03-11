package repository

import (
	"context"
	"testing"
	"time"
)

func TestInsertJob_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := createTestUser(t)
	salary := "$100,000"

	arg := InsertJobParams{
		Position: "Backend Developer",
		Company:  "Test Company",
		Status:   "Applied",
		Salary:   &salary,
		UserID:   user.ID,
	}

	job, err := testQueries.InsertJob(ctx, arg)

	if err != nil {
		t.Fatalf("Failed to insert job: %v", err)
	}

	if job.ID == 0 {
		t.Error("Expected database to return a generated ID, got 0")
	}

	if job.Position != arg.Position || job.Company != arg.Company {
		t.Errorf("Data is mismatch: expected %s/%s, got %s/%s", arg.Position, arg.Company, job.Position, job.Company)
	}
}

func TestGetJobs_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := createTestUser(t)

	_, _ = testPool.Exec(ctx, "DELETE FROM jobs WHERE user_id = $1", user.ID)

	jobsToCreate := []InsertJobParams{
		{
			Position: "Job A",
			Company:  "Company A",
			UserID:   user.ID,
			Status:   "Applied",
		},
		{
			Position: "Job B",
			Company:  "Company B",
			UserID:   user.ID,
			Status:   "Applied",
		},
	}

	for _, j := range jobsToCreate {
		_, err := testQueries.InsertJob(ctx, j)

		if err != nil {
			t.Fatalf("Setup failed: could not insert seed data: %v", err)
		}
	}

	jobs, err := testQueries.GetJobs(ctx, user.ID)

	if err != nil {
		t.Fatalf("Failed to fetch jobs: %v", err)
	}

	if len(jobs) != len(jobsToCreate) {
		t.Errorf("Expected %d jobs, got %d", len(jobsToCreate), len(jobs))
	}
}

func TestUpdateJob_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := createTestUser(t)

	initialJob, err := testQueries.InsertJob(ctx, InsertJobParams{
		Position: "Job A",
		Company:  "Company A",
		Status:   "Applied",
		UserID:   user.ID,
	})

	if err != nil {
		t.Fatalf("Failed to insert initial job for update test: %v", err)
	}

	updateArg := UpdateJobParams{
		ID:       initialJob.ID,
		Position: "Update Job",
		Company:  "Update Company",
		Status:   "Offered",
		UserID:   user.ID,
	}

	updatedJob, err := testQueries.UpdateJob(ctx, updateArg)

	if err != nil {
		t.Fatalf("Failed to execute UpdateJob: %v", err)
	}

	if updatedJob.ID != initialJob.ID {
		t.Errorf("Expected ID %d, got %d", initialJob.ID, updatedJob.ID)
	}

	if updatedJob.Position != updateArg.Position {
		t.Errorf("Expected position %s, got %s", updateArg.Position, updatedJob.Position)
	}

	fetchedJob, err := testQueries.GetJobs(ctx, user.ID)

	if err != nil {
		t.Fatalf("Failed to fetch jobs after update: %v", err)
	}

	found := false
	for _, j := range fetchedJob {
		if j.ID == updatedJob.ID && j.Position == "Update Job" {
			found = true
			break
		}
	}

	if !found {
		t.Error("Could not find the updated job in the database")
	}
}

func TestDeleteJob_Integration(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := createTestUser(t)

	job, _ := testQueries.InsertJob(ctx, InsertJobParams{
		Position: "To Be Deleted",
		Company:  "Ghost Co.",
		Status:   "Applied",
		UserID:   user.ID,
	})

	err := testQueries.DeleteJob(ctx, DeleteJobParams{
		ID:     job.ID,
		UserID: user.ID,
	})

	if err != nil {
		t.Fatalf("Failed to delete job: %v", err)
	}

	jobs, _ := testQueries.GetJobs(ctx, user.ID)

	for _, j := range jobs {
		if j.ID == job.ID {
			t.Errorf("Job with ID %d still exists in database", job.ID)
		}
	}
}
