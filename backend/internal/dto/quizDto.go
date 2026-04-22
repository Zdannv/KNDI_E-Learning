package dto

type CreateQuizRequest struct {
	Title			string		`json:"title"`
	Description		string		`json:"description"`
}

type UpdateQuizRequest struct {
	Title			string		`json:"title"`
	Description		string		`json:"description"`
	IsPublished		bool		`json:"is_published"`
}