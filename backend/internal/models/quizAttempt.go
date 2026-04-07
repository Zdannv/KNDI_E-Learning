package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type AttemptStatus string

const (
	AttemptStatusInProgress AttemptStatus = "in_progress"
	AttemptStatusCompleted AttemptStatus = "completed"
)

func (s AttemptStatus) Validate() error {
	switch s {
	case AttemptStatusCompleted, AttemptStatusInProgress:
		return nil
	default:
		return errors.New("Invalid attemp status!")
	}
}

type QuizAttempts struct {
	Base
	StudentID		uuid.UUID		`gorm:"type:uuid;not null;index" json:"student_id"`
	QuizID			uuid.UUID		`gorm:"type:uuid;not null;index" json:"quiz_id"`
	Score			float64			`gorm:"not null;default:0" json:"score"`
	TotalPoints		float64			`gorm:"not null;default:0" json:"total_points"`
	Status			AttemptStatus	`gorm:"type:varchar(18);not null;default:'in_progress';check:chk_attempt_status,status IN ('in_progress','completed')" json:"status"`
	StartedAt		time.Time		`json:"started_at"`
	CompletedAt		*time.Time		`json:"completed_at,omitempty"`

	Student			*User			`gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Quiz			*Quiz			`gorm:"foreignKey:QuizID" json:"quiz,omitempty"`
	Answers			[]QuizHistory	`gorm:"foreignKey:AttemptID;constraint:OnDelete:CASCADE" json:"answers,omitempty"`
}

func (QuizAttempts) TableName() string {
	return "quiz_attempts"
}

func (a *QuizAttempts) IsCompleted() bool {
	return a.Status == AttemptStatusCompleted
}

func (a *QuizAttempts) ScorePercent() float64 {
	if a.TotalPoints == 0 {
		return 0
	}

	return float64(a.Score) / float64(a.TotalPoints) * 100
}