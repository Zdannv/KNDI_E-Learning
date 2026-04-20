package domains

import "time"

type material struct {
	ID				string		`json:"id"`
	QuizID			string		`json:"user_id"`
	Name			string		`json:"name"`
	Description		*string		`json:"description"`
	FilePath		*string		`json:"file_path"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}