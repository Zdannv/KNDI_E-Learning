package dto

import "github.com/google/uuid"

type SubmitAttemptRequest struct {
	Answer		[]SubmitAttemptRequest		`json:"answer" binding:"required"`
}

type SubmitAnswerRequest struct {
	QuestionID			uuid.UUID		`json:"question_id" binding:"required"`
	QuestionOptionID	*uuid.UUID		`json:"question_option_id"`
	AnswerText			string			`json:"answer_text"`
}

// Returned after submission and route GET /attempt/:id
type AttempResultResponse struct {
	AttemptID			string				`json:"attempt_id"`
	QuizTitle			string				`json:"quiz_title"`
	Score				int					`json:"score"`
	TotalPoints			int					`json:"total_points"`
	ScorePercent		float64				`json:"score_percnt"`
	Passed				bool				`json:"passed"`
	CompletedAt			string				`json:"completed_at"`
	Answers				[]AnswerResponse	`json:"answer"`
}

type AnswerResponse struct {
	QuestionText		string			`json:"question_text"`
	Answer				string			`json:"answer"`
	IsCorrect			bool			`json:"is_correct"`
	PointEarned			int				`json:"point_earnedd"`
}

type HistoryResponse struct {
	AttemptID			string			`json:"attempt_id"`
	QuizTitle			string			`json:"quiz_title"`
	Score				int				`json:"score"`
	TotalPoints			int				`json:"total_points"`
	ScorePercent		float64			`json:"score_percent"`
	Passed				bool			`json:"passed"`
	Status				string			`json:"status"`
	CompletedAt			string			`son:"completed_at"`
}