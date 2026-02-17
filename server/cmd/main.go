package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/JesstinSwadley/job-tracker/api"
	"github.com/JesstinSwadley/job-tracker/api/handler"
	"github.com/JesstinSwadley/job-tracker/internal/database"
	"github.com/JesstinSwadley/job-tracker/internal/repository"
	"github.com/rs/cors"
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
		log.Println("PORT not set. Defaulting to 8080")
	}

	dbPool := database.DatabasePool()
	defer dbPool.Close()

	if os.Getenv("SKIP_DB_PING") != "1" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := dbPool.Ping(ctx); err != nil {
			log.Fatalf("failed to ping database: %v", err)
		}
	}

	sqlcRepo := repository.New(dbPool)
	jobRepo := &handler.SQLCJobRepo{Queries: sqlcRepo}

	apiHandler := api.ApiRouter(jobRepo)
	corsHandler := cors.AllowAll().Handler(apiHandler)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: corsHandler,
	}

	go func() {
		log.Printf("Server listening on PORT: %s", port)

		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop
	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
