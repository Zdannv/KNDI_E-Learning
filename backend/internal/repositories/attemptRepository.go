package repositories

import (
	"KNDI_E-LEARNING/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AttemptRepository interface {
	Create(attempt *models.QuizAttempts) error
	FindByID(id uuid.UUID) (*models.QuizAttempts, error)
	Update(attempt *models.QuizAttempts) error
	CreateAnswers(answers []models.QuizHistory) error
	FindHistoryByStudentID(studentID uuid.UUID) ([]models.QuizAttempts, error)
}

type attemptRepository struct {
	db *gorm.DB
}

func NewAttemptRepository(db *gorm.DB) AttemptRepository {
	return &attemptRepository{db: db}
}

func (r *attemptRepository) Create(attempt *models.QuizAttempts) error {
	return r.db.Create(attempt).Error
}

func (r *attemptRepository) FindByID(id uuid.UUID) (*models.QuizAttempts, error) {
	var attempt models.QuizAttempts
	err := r.db.
		Preload("Quiz").
		Preload("Student").
		Preload("Answer").
		Preload("Answer.Question").
		Preload("Answer.Option").
		First(&attempt, "id = ?", id).Error
	
	return &attempt, err
}

func (r *attemptRepository) Update(attempt *models.QuizAttempts) error {
	return r.db.Save(attempt).Error
}

func (r *attemptRepository) CreateAnswers(answers []models.QuizHistory) error {
	return r.db.Create(&answers).Error
}

func (r *attemptRepository) FindHistoryByStudentID(studentID uuid.UUID) ([]models.QuizAttempts, error) {
	var attempts []models.QuizAttempts
	err := r.db.
		Preload("Quiz").
		Where("student_id = ? AND status = ?", studentID, models.AttemptStatusCompleted).
		Order("completed_at DESC").
		Find(&attempts).Error
	
	return attempts, err
}