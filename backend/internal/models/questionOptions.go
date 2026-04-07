package models

import "github.com/google/uuid"

type QuestionOptions struct {
	Base
	QuestionID			uuid.UUID		`gorm:"type:uuid;not null;index" json:"question_id"`
	OptionText			string			`gorm:"type:text;not null" json:"option_text"`
	IsCorrect			bool			`gorm:"not null;default:false" json:"is_correct"`
	OrderNumber			int				`gorm:"not null;default:0" json:"order_number"`
}