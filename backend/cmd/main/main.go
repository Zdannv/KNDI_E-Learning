package main

import (
	"KNDI_E-LEARNING/database"
	"KNDI_E-LEARNING/internal/config"
	"KNDI_E-LEARNING/internal/domains"
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

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("[Main] No env file found, using system environment variables")
	}

	cfg := config.Load()

	// DATABASE POOL
	ctx 	:= context.Background()
	pool 	:= database.NewPool(ctx, cfg)
	defer pool.Close()

	// Ensure quizzes has duration column
	ensureDurationColumnExists(ctx, pool)

	userRepo 		:= repository.NewUserRepository(pool)
	materialRepo 	:= repository.NewMaterialRepository(pool)
	quizRepo 		:= repository.NewQuizRepository(pool)
	assignmentRepo 	:= repository.NewAssignmentRepository(pool)

	// Seed starter account (adi / @kndi)
	seedStarterAccount(ctx, userRepo)

	authSvc 		:= services.NewAuthService(userRepo, cfg)
	materialSvc		:= services.NewMaterialService(materialRepo)
	quizSvc			:= services.NewQuizService(quizRepo)
	assignmentSvc	:= services.NewAssignmentService(assignmentRepo, quizRepo)

	httpHandler := router.Route(cfg, authSvc, materialSvc, quizSvc, assignmentSvc)

	srv := &http.Server{
		Addr: 		fmt.Sprintf(":%s", cfg.AppPort),
		Handler: 	httpHandler,
		
		ReadTimeout: 		10 * time.Second,
		WriteTimeout: 		30 * time.Second,
		IdleTimeout: 		120 * time.Second,
		ReadHeaderTimeout: 	5 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("[Main] Server listening on port %s", srv.Addr)
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

func seedStarterAccount(ctx context.Context, repo repository.UserRepository) {
	exists, err := repo.UsernameExists(ctx, "adi")
	if err != nil {
		log.Printf("[Seed] Error checking if starter account exists: %v", err)
		return
	}
	if !exists {
		hash, err := bcrypt.GenerateFromPassword([]byte("@kndi"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("[Seed] Error hashing password: %v", err)
			return
		}
		u := &domains.User{
			Username: "adi",
			Email:    "adi@kndi.co.id",
			Password: string(hash),
			Role:     "sensei",
		}
		if err := repo.Create(ctx, u); err != nil {
			log.Printf("[Seed] Error creating starter account: %v", err)
		} else {
			log.Printf("[Seed] Starter account 'adi' (role: sensei) created successfully")
		}
	}
}

func ensureDurationColumnExists(ctx context.Context, pool *pgxpool.Pool) {
	query := `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_name='quizzes' AND column_name='duration'
			) THEN
				ALTER TABLE quizzes ADD COLUMN duration INTEGER NOT NULL DEFAULT 0;
			END IF;
		END
		$$;
	`
	_, err := pool.Exec(ctx, query)
	if err != nil {
		log.Printf("[DB] Error ensuring duration column exists: %v", err)
	} else {
		log.Printf("[DB] Column 'duration' in 'quizzes' verified/created successfully")
	}
}

