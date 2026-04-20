package domains

import "time"

type Quiz struct {
	ID				int			`json:"id"`
	SenseiID		string		`json:"sensei_id"`
	Title			string		`json:"title"`
	Description		*string		`json:"description"`
	IsPublished		bool		`json:"is_published"`
	CreatedAt		time.Time	`json:"created_at"`
	UpdatedAt		time.Time	`json:"updated_at"`

	Question		[]Question	`json:"question,omitempty"`
}