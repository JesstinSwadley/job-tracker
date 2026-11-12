package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ErrorResponse struct {
	Error string `json:"error" example:"company and title are required"`
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{Error: message})
}

func parsePathID(r *http.Request, param string) (int64, error) {
	raw := r.PathValue(param)
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("invalid %s", param)
	}
	return id, nil
}

func toNullString(s string) sql.NullString {
	trimmed := strings.TrimSpace(s)
	return sql.NullString{
		String: trimmed,
		Valid:  trimmed != "",
	}
}

func fromNullString(ns sql.NullString) string {
	if !ns.Valid {
		return ""
	}
	return ns.String
}

func toNullInt64(v int64) sql.NullInt64 {
	return sql.NullInt64{
		Int64: v,
		Valid: true,
	}
}

func fromNullInt64(ni sql.NullInt64) int64 {
	if !ni.Valid {
		return 0
	}
	return ni.Int64
}

// parseNullDate accepts "", "YYYY-MM-DD", or RFC3339 timestamps.
func parseNullDate(raw string) (sql.NullTime, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return sql.NullTime{Valid: false}, nil
	}

	if parsed, err := time.Parse("2006-01-02", trimmed); err == nil {
		return sql.NullTime{Time: parsed.UTC(), Valid: true}, nil
	}

	if parsed, err := time.Parse(time.RFC3339, trimmed); err == nil {
		return sql.NullTime{Time: parsed.UTC(), Valid: true}, nil
	}

	return sql.NullTime{}, fmt.Errorf("invalid date format %q: expected YYYY-MM-DD", raw)
}

func formatNullDate(nt sql.NullTime) string {
	if !nt.Valid {
		return ""
	}

	return nt.Time.UTC().Format("2006-01-02")
}

func formatNullTimestamp(nt sql.NullTime) string {
	if !nt.Valid {
		return ""
	}
	return nt.Time.UTC().Format(time.RFC3339)
}
