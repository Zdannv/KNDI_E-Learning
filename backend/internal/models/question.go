package models

import (
	"errors"

	"github.com/google/uuid"
)

type QuestionType string

const (
	QuestionTypeMultipleChoice QuestionType = "multiple_choice"
	QuestionTypeShortAnswer QuestionType = "short_answer"
)

func (qt QuestionType) Validate() error {
	switch qt {
	case QuestionTypeMultipleChoice, QuestionTypeShortAnswer:
		return nil
	default:
		return errors.New("Question type must be multiple_choice or short_answer!")
	}
}

type Question struct {
	Base
	QuizID			uuid.UUID			`gorm:"type:uuid;not null;index" json:"quiz_id"`
	QuestionType	QuestionType		`gorm:"type:varchar(20);not null;check:chk_qtype,question_type IN ('multiple_choice','short_answer')" json:"question_type"`
	QuestionText	string				`gorm:"type:text;not nulll" json:"question_text"`
	OrderNumber		int					`gorm:"not null;default:0;index" json:"order_number"`
	Points			int					`gorm:"not null;default:1" json:"points"`

	Options			[]QuestionOptions	`gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE" json:"options,omitempty"`
	ShortAnswer		*ShorAnswerQuestion	`gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE" json:"short_answer,omitempty"`
}

func (Question) TableName() string {
	return "questions"
}

func (q *Question) IsMultipleChoice() bool {
	return q.QuestionType == QuestionTypeMultipleChoice
}

func (q *Question) IsShortAnswer() bool {
	return q.QuestionType == QuestionTypeShortAnswer
}

func (q *Question) Validate() error {
	if err := q.QuestionType.Validate(); err != nil {
		return err
	}

	if q.QuestionText == "" {
		return errors.New("Question text must not be empty!")
	}

	if q.Points < 1 {
		return errors.New("Question point must be at least 1!")
	}

	if q.IsMultipleChoice() {
		if len(q.Options) < 2 {
			return errors.New("Multiple choice must be at least 2 options!")
		}

		correct := 0
		for _, option := range q.Options {
			if option.IsCorrect {
				correct++
			}
		}

		if correct != 1 {
			return errors.New("Multiple choice must have exactly 1 correct option")
		}
	}

	return nil
}