package models

import "github.com/google/uuid"

type ShorAnswerQuestion struct {
	Base
	QuestionID			uuid.UUID		`gorm:"type:uuid;not null;index" json:"question_id"`
	AnswerKey			string			`gorm:"type:text;not null" json:"answer_key"`
	CaseSensitive		bool			`gorm:"not null;default:false" json:"case_sensitive"`	
}

func (ShorAnswerQuestion) TableName() string {
	return "short_answer_question"
}