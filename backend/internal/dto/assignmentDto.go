package dto

type StartAssignment struct {
	QuizID			int					`json:"quiz_id"`
}

type SubmitAssignmentRequest struct {
	Answer			[]SubmitAnswerRequest		`json:"answer"`
}

type SubmitAnswerRequest struct {
	QuestionID			int				`json:"question_id"`
	QuestionOptionID	*int			`json:"question_option_id"`
	MatchingCardID		*int			`json:"question_card_id"`
	SelectedCard		*int			`json:"selected_card"`
	AnswerText			*string			`json:"answer_text"`
}

type AssignmentResultResponse struct {
	AssignmentID		int								`json:"assignment_id"`
	QuizTitle			string							`json:"quiz_title"`
	TotalPoint			float64							`json:"total_point"`
	ScoreEarned			float64							`json:"score_earned"`
	ScorePct			float64							`json:"score_percent"`
	Passed				bool							`json:"passed"`
	Status				string							`json:"status"`
	CompletedAt			*string							`json:"completed_at"`
	Answers				[]AssignmentHistoryResponse		`json:"answers"`
}

type AssignmentHistoryResponse struct {
	QuestionText		string			`json:"question_text"`
	QuestionType		int				`json:"question_type"`
	YourAnswer			string			`json:"your_answer"`
	IsCorrect			bool			`json:"is_correct"`
	ScoreEarned			float64			`json:"score_earned"`
	TotalPairs			int				`json:"total_pairs,omitempty"`
	PendingGrade		bool			`json:"pending_grade,omitempty"`
}

type HistoryListResponse struct {
	AssignmentID 		int     		`json:"assignment_id"`
	QuizID       		int     		`json:"quiz_id"`
	QuizTitle    		string  		`json:"quiz_title"`
	StudentName  		string  		`json:"student_name"`
	ScoreEarned  		float64 		`json:"score_earned"`
	TotalPoint   		float64 		`json:"total_point"`
	ScorePct     		float64 		`json:"score_percent"`
	Status       		string  		`json:"status"`
	DateStr      		string  		`json:"date_str"`
	TimeStr      		string  		`json:"time_str"`
	CompletedAt  		*string 		`json:"completed_at"`
	HasUngradedEssay    bool            `json:"has_ungraded_essay"`
}

type GradeEssayRequest struct {
	Score				float64			`json:"score"`
}

type EssayPendingItem struct {
	AssignmentID		int				`json:"assignment_id"`
	AssignmentHistoryID int				`json:"assignment_history_id"`
	StudentName			string			`json:"student_name"`
	QuizTitle			string			`json:"quiz_title"`
	QuestionID          int     		`json:"question_id"`
	QuestionText        string  		`json:"question_text"`
	MaxPoint            float64 		`json:"max_point"`
	StudentAnswer       string  		`json:"student_answer"`
}
