package config

import (
	"KNDI_E-LEARNING/internal/models"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func connectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		getEnv("DB_HOST"),
		getEnv("DB_USER"),
		getEnv("DB_PASSWORD"),
		getEnv("DB_NAME"),
		getEnv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func () time.Time {
			return time.Now().UTC()
		},
		PrepareStmt: true,
	})

	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	log.Println("Database connected!")
}

func Migrations() {
	err := DB.AutoMigrate(
		&models.Materials{},
		&models.User{},
		&models.Quiz{},
		&models.Question{},
		&models.QuestionOptions{},
		&models.QuizAttempts{},
		&models.QuizHistory{},
		&models.ShorAnswerQuestion{},
	)

	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration successfuly!")
}

func getEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("Required environment variable %q is not set", key)
	}

	return v
}