package domains

import "time"

type Material struct {
	ID				string		`json:"id"`
	UserID			string		`json:"user_id"`
	Name			string		`json:"name"`
	Description		*string		`json:"description"`
	FilePath		*string		`json:"file_path"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`
}