package server_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JesstinSwadley/job-tracker/internal/server"
)

func TestJobNotes(t *testing.T) {
	app := setupTestServer(t)
	handler := app.RegisterRoutes()

	defaultJobPayload := `{"company":"Stripe","title":"Staff Backend Engineer"}`

	t.Run("creates a sectioned note with interview round", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		payload := `{"section":"Interview","interview_round":2,"content":"Discussed distributed rate limiting and PostgreSQL partitioning."}`
		req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/jobs/%d/notes", job.ID), bytes.NewReader([]byte(payload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("expected status 201 Created, got %d (%s)", rec.Code, rec.Body.String())
		}

		var created server.JobNoteResponse

		if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode note response: %v", err)
		}

		if created.ID <= 0 {
			t.Errorf("expected positive note ID, got %d", created.ID)
		}

		if created.JobID != job.ID {
			t.Errorf("expected job_id %d, got %d", job.ID, created.JobID)
		}

		if created.Section != "Interview" {
			t.Errorf("expected section 'Interview', got %q", created.Section)
		}

		if created.InterviewRound != 2 {
			t.Errorf("expected interview_round 2, got %d", created.InterviewRound)
		}

		if created.Content != "Discussed distributed rate limiting and PostgreSQL partitioning." {
			t.Errorf("unexpected content %q", created.Content)
		}
	})

	t.Run("applies default section General and interview_round 0 when omitted", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		payload := `{"content":"Found via engineering blog post."}`
		req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/jobs/%d/notes", job.ID), bytes.NewReader([]byte(payload)))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("expected status 201 Created, got %d", rec.Code)
		}

		var created server.JobNoteResponse

		if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
			t.Fatalf("failed to decode note response: %v", err)
		}

		if created.Section != "General" {
			t.Errorf("expected default section 'General', got %q", created.Section)
		}
		if created.InterviewRound != 0 {
			t.Errorf("expected default interview_round 0, got %d", created.InterviewRound)
		}
	})

	t.Run("validates note creation requests", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		tests := []struct {
			name           string
			url            string
			body           string
			expectedStatus int
		}{
			{
				name:           "empty content",
				url:            fmt.Sprintf("/jobs/%d/notes", job.ID),
				body:           `{"section":"Role","content":"   "}`,
				expectedStatus: http.StatusBadRequest,
			},
			{
				name:           "malformed JSON",
				url:            fmt.Sprintf("/jobs/%d/notes", job.ID),
				body:           `{"section":"Role",`,
				expectedStatus: http.StatusBadRequest,
			},
			{
				name:           "invalid job ID",
				url:            "/jobs/not-an-id/notes",
				body:           `{"content":"Valid note"}`,
				expectedStatus: http.StatusBadRequest,
			},
			{
				name:           "non-existent parent job",
				url:            "/jobs/999999/notes",
				body:           `{"content":"Orphan note"}`,
				expectedStatus: http.StatusNotFound,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				req := httptest.NewRequest(http.MethodPost, tt.url, bytes.NewReader([]byte(tt.body)))
				req.Header.Set("Content-Type", "application/json")
				rec := httptest.NewRecorder()

				handler.ServeHTTP(rec, req)

				if rec.Code != tt.expectedStatus {
					t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
				}
			})
		}
	})

	t.Run("lists notes for a job and updates notes_count on GET /jobs", func(t *testing.T) {
		jobA := seedJob(t, handler, defaultJobPayload)
		jobB := seedJob(t, handler, `{"company":"Linear","title":"Product Engineer"}`)

		emptyReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/notes", jobA.ID), nil)
		emptyRec := httptest.NewRecorder()
		handler.ServeHTTP(emptyRec, emptyReq)

		if emptyRec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", emptyRec.Code)
		}

		var emptyNotes []server.JobNoteResponse

		if err := json.NewDecoder(emptyRec.Body).Decode(&emptyNotes); err != nil {
			t.Fatalf("failed to decode empty notes: %v", err)
		}

		if len(emptyNotes) != 0 {
			t.Fatalf("expected 0 notes initially, got %d", len(emptyNotes))
		}

		seedNote := func(jobID int64, payload string) server.JobNoteResponse {
			req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/jobs/%d/notes", jobID), bytes.NewReader([]byte(payload)))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)

			if rec.Code != http.StatusCreated {
				t.Fatalf("failed to seed note: status %d", rec.Code)
			}
			var n server.JobNoteResponse
			_ = json.NewDecoder(rec.Body).Decode(&n)
			return n
		}

		firstNote := seedNote(jobA.ID, `{"section":"Role","content":"Team owns core billing ledger"}`)
		secondNote := seedNote(jobA.ID, `{"section":"Compensation","content":"Base band $210k-$240k + equity"}`)
		_ = seedNote(jobB.ID, `{"section":"General","content":"Note belonging to jobB"}`)

		listReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/notes", jobA.ID), nil)
		listRec := httptest.NewRecorder()
		handler.ServeHTTP(listRec, listReq)

		if listRec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", listRec.Code)
		}

		var notes []server.JobNoteResponse

		if err := json.NewDecoder(listRec.Body).Decode(&notes); err != nil {
			t.Fatalf("failed to decode notes list: %v", err)
		}

		if len(notes) != 2 {
			t.Fatalf("expected 2 notes for jobA, got %d", len(notes))
		}

		if notes[0].ID != secondNote.ID || notes[1].ID != firstNote.ID {
			t.Errorf("expected newest note first (%d then %d), got (%d then %d)", secondNote.ID, firstNote.ID, notes[0].ID, notes[1].ID)
		}

		jobsReq := httptest.NewRequest(http.MethodGet, "/jobs", nil)
		jobsRec := httptest.NewRecorder()
		handler.ServeHTTP(jobsRec, jobsReq)

		var jobs []server.JobResponse

		if err := json.NewDecoder(jobsRec.Body).Decode(&jobs); err != nil {
			t.Fatalf("failed to decode jobs: %v", err)
		}

		for _, j := range jobs {
			if j.ID == jobA.ID {
				if j.NotesCount != 2 {
					t.Errorf("expected notes_count 2 for jobA, got %d", j.NotesCount)
				}
				return
			}
		}
		t.Fatalf("jobA (ID %d) not found in GET /jobs response", jobA.ID)
	})

	t.Run("updates an existing note and enforces job ownership", func(t *testing.T) {
		jobA := seedJob(t, handler, defaultJobPayload)
		jobB := seedJob(t, handler, `{"company":"Figma","title":"Systems Engineer"}`)

		createReq := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/jobs/%d/notes", jobA.ID), bytes.NewReader([]byte(`{"section":"Interview","interview_round":1,"content":"Initial notes"}`)))
		createReq.Header.Set("Content-Type", "application/json")
		createRec := httptest.NewRecorder()
		handler.ServeHTTP(createRec, createReq)

		var created server.JobNoteResponse
		_ = json.NewDecoder(createRec.Body).Decode(&created)

		updatePayload := `{"section":"Interview","interview_round":2,"content":"Updated post-panel debrief"}`
		putReq := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/notes/%d", jobA.ID, created.ID), bytes.NewReader([]byte(updatePayload)))
		putReq.Header.Set("Content-Type", "application/json")
		putRec := httptest.NewRecorder()
		handler.ServeHTTP(putRec, putReq)

		if putRec.Code != http.StatusOK {
			t.Fatalf("expected status 200 OK, got %d (%s)", putRec.Code, putRec.Body.String())
		}

		var updated server.JobNoteResponse

		if err := json.NewDecoder(putRec.Body).Decode(&updated); err != nil {
			t.Fatalf("failed to decode updated note: %v", err)
		}

		if updated.InterviewRound != 2 || updated.Content != "Updated post-panel debrief" {
			t.Errorf("unexpected updated note fields: %+v", updated)
		}

		crossReq := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/jobs/%d/notes/%d", jobB.ID, created.ID), bytes.NewReader([]byte(updatePayload)))
		crossReq.Header.Set("Content-Type", "application/json")
		crossRec := httptest.NewRecorder()
		handler.ServeHTTP(crossRec, crossReq)

		if crossRec.Code != http.StatusNotFound {
			t.Errorf("expected 404 when updating note under wrong parent job, got %d", crossRec.Code)
		}
	})

	t.Run("deletes a note and cascades when parent job is deleted", func(t *testing.T) {
		job := seedJob(t, handler, defaultJobPayload)

		createNote := func(content string) server.JobNoteResponse {
			req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/jobs/%d/notes", job.ID), bytes.NewReader([]byte(fmt.Sprintf(`{"content":%q}`, content))))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)
			var n server.JobNoteResponse
			_ = json.NewDecoder(rec.Body).Decode(&n)
			return n
		}

		note1 := createNote("First note")
		_ = createNote("Second note")

		delNoteReq := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d/notes/%d", job.ID, note1.ID), nil)
		delNoteRec := httptest.NewRecorder()
		handler.ServeHTTP(delNoteRec, delNoteReq)

		if delNoteRec.Code != http.StatusNoContent {
			t.Fatalf("expected status 204 No Content, got %d", delNoteRec.Code)
		}

		delAgainReq := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d/notes/%d", job.ID, note1.ID), nil)
		delAgainRec := httptest.NewRecorder()
		handler.ServeHTTP(delAgainRec, delAgainReq)

		if delAgainRec.Code != http.StatusNotFound {
			t.Errorf("expected status 404 on second delete, got %d", delAgainRec.Code)
		}

		delJobReq := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/jobs/%d", job.ID), nil)
		delJobRec := httptest.NewRecorder()
		handler.ServeHTTP(delJobRec, delJobReq)

		if delJobRec.Code != http.StatusNoContent {
			t.Fatalf("expected status 204 when deleting parent job, got %d", delJobRec.Code)
		}

		getNotesReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/jobs/%d/notes", job.ID), nil)
		getNotesRec := httptest.NewRecorder()
		handler.ServeHTTP(getNotesRec, getNotesReq)

		if getNotesRec.Code != http.StatusNotFound {
			t.Errorf("expected 404 when fetching notes for deleted job, got %d", getNotesRec.Code)
		}
	})
}
