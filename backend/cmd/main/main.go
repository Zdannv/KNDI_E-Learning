package main

import (
	"KNDI_E-LEARNING/database"
	"KNDI_E-LEARNING/internal/config"
	"KNDI_E-LEARNING/internal/repository"
	"KNDI_E-LEARNING/internal/router"
	"KNDI_E-LEARNING/internal/services"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("[Main] No env file found")
	}

	// Config - This will crash if env variable is missing
	cfg := config.Load()

	// DATABASE POOL
	ctx 	:= context.Background()
	pool 	:= database.NewPool(ctx, cfg)
	defer pool.Close()

	userRepo 		:= repository.NewUserRepository(pool)
	materialRepo 	:= repository.NewMaterialRepository(pool)
	quizRepo 		:= repository.NewQuizRepository(pool)
	assignmentRepo 	:= repository.NewAssignmentRepository(pool)

	authSvc 		:= services.NewAuthService(userRepo, cfg)
	materialSvc		:= services.NewMaterialService(materialRepo)
	quizSvc			:= services.NewQuizService(quizRepo)
	assignmentSvc	:= services.NewAssignmentService(assignmentRepo, quizRepo)

	httpHandler := router.Route(cfg, authSvc, materialSvc, quizSvc, assignmentSvc)

	srv := &http.Server{
		Addr: 		fmt.Sprintf(": %s", cfg.AppPort),
		Handler: 	httpHandler,
		
		ReadTimeout: 		10 * time.Second,
		WriteTimeout: 		30 * time.Second,
		IdleTimeout: 		120 * time.Second,
		ReadHeaderTimeout: 	5 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("[Main] Server listening on : %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		log.Fatalf("[Main] Server error: %v", err)

	case sig := <-quit:
		log.Printf("[Main] Received signal %s - Shutting down gracefully", sig)

		shutdownCtx, cancel := context.WithTimeout(ctx, 15 * time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Fatalf("[Main] Graceful shutdown failed: %v", err)
		}
		log.Fatalf("[Main] Server stop cleanly")
	}
}