package models

import "github.com/google/uuid"

type QuizHistory struct {
	Base
	AttemptID			uuid.UUID			`gorm:"type:uuid;not null;index" json:"attempt_quiz_id"`
	QuestionID			uuid.UUID			`gorm:"type:uuid;not null;index" json:"question_id"`
	QuestionOptionID	*uuid.UUID			`gorm:"type:uuid" json:"question_option_id,omitempty"`
	AnswerText			string				`gorm:"type:text" json:"answer_text"`
	IsCorrect			bool				`gorm:"not null;default:false" json:"is_correct"`
	PointEarned			int					`gorm:"not null;default:0" json:"point_earned"`

	Question			*Question			`gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	QuestionOptions		*QuestionOptions	`gorm:"foreignKey:QuestionOptionID" json:"question_options,omitempty"`
}

func (QuizHistory) TableName() string {
	return "quiz_history"
}