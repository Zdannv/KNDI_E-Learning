package domains

import "time"

type user struct {
	ID			string		`json:"id"`
	Username	string		`json:"username"`
	Password	string		`json:"-"`
	Role		string		`json:"role"`
	CreatedAt	time.Time	`json:"created_at"`
	UpdatedAt	time.Time	`json:"updated_at"`
}