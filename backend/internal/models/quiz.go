package models

import (
	"errors"

	"github.com/google/uuid"
)

type Quiz struct {
	Base
	SenseiID		uuid.UUID		`gorm:"type:uuid;not null;index" json:"sensei_id"`
	Title			string			`gorm:"type:varchar(32);not null" json:"title"`
	Description		string			`gorm:"type:text" json:"description"`
	IsPublished		bool			`gorm:"not null;default:false" json:"is_published"`
	PassingScore	int				`gorm:"not null;default:60" json:"passing_score"`

	Sensei			*User			`gorm:"foreignKey:SenseiID" json:"sensei,omitempty"`
	Question		[]Question		`gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE" json:"questions,omitempty"`
	Attempts		[]QuizAttempts	`gorm:"foreignKey:QuizID" json:"attempts,omitempty"`
}

func (Quiz) TableName() string {
	return "quizzes"
}

func (q *Quiz) QuestionCount() int {
	return len(q.Question)
}

func (q *Quiz) TotalPoints() int {
	total := 0
	for _, question := range q.Question {
		total += question.Points
	}
	return total
}

func (q *Quiz) Validate() error {
	if q.Title == "" {
		return errors.New("Title must not be empty!")
	}

	if q.PassingScore < 0 || q.PassingScore > 100 {
		return errors.New("Passing score must be between 0 and 100!")
	}

	return nil
}