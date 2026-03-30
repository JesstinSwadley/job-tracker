package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/api/handler"
	_ "github.com/JesstinSwadley/job-tracker/docs"
	"github.com/JesstinSwadley/job-tracker/internal/auth"
	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/rs/cors"
)

// @title Job Tracker API

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type 'Bearer ' followed by your JWT token.

// @version 1.0
// @description This is a job tracking server.

// @contact.name Jesstin Swadley
// @contact.url https://jesstin.com/support
// @contact.email contact@jesstin.com

// @host localhost:8080
// @BasePath /api/v1
func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"

		slog.Warn("PORT not set. Defaulting to 8080")
	}

	dbPool := database.DatabasePool()
	defer dbPool.Close()

	if os.Getenv("SKIP_DB_PING") != "1" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := dbPool.Ping(ctx); err != nil {
			slog.Error("failed to ping database", "error", err)

			os.Exit(1)
		}
	}

	sqlcQueries := repository.New(dbPool)
	jobRepo := &handler.SQLCJobRepo{Queries: sqlcQueries}
	userRepo := &handler.SQLCUserRepo{Queries: sqlcQueries}

	jwtSecret := os.Getenv("JWT_SECRET")

	if jwtSecret == "" {
		jwtSecret = "very-secret-key-change-me"

		slog.Warn("JWT_SECRET not set. Using insecure default.")
	}

	tokenManager := auth.NewTokenManager(jwtSecret)

	apiHandler := api.ApiRouter(jobRepo, userRepo, tokenManager)
	corsHandler := cors.AllowAll().Handler(apiHandler)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      corsHandler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		slog.Info("Server listening", "port", port)

		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("Server failed", "error", err)

			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop
	slog.Info("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
	}

	slog.Info("Server exited gracefully")
}
