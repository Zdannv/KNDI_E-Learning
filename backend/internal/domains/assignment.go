package domains

import "time"

const (
	StatusNotStarted	= 1
	StatusInProgres		= 2
	StatusCompleted		= 3
)

type AssignmentStatus struct {
	ID		int		`json:"id"`
	Name	string	`json:"name"`
}

type Assignment struct {
	ID				int						`json:"id"`
	StudentID		string					`json:"student_id"`
	QuizID			int						`json:"quiz_id"`
	TotalPoint		*float64				`json:"total_point"`
	Status			int						`json:"status"`
	StatusName		string					`json:"status_name"`
	StartedAt		time.Time				`json:"started_at"`
	CompletedAt		*time.Time				`json:"completed_at"`

	History			[]AssignmentHistory		`json:"history,omitempty"`
	Quiz			*Quiz					`json:"quiz,omitempty"`
}

type AssignmentHistory struct {
	ID					int					`json:"id"`
	AssignmentID		int					`json:"assignment_id"`
	QuestionID			int					`json:"question_id"`
	QuestionOptionID	*int				`json:"question_option_id"`
	MatchingCardID		*int				`json:"matching_card_id"`
	AnswerText			*string				`json:"answer_text"`
	ScoreEarned			float64				`json:"score_earned"`
	CreatedAt			time.Time			`json:"created_at"`
	UpdatedAt			time.Time			`json:"updated_at"`

	QuestionText		string				`json:"question_text,omitempty"`
	IsCorrect			bool				`json:"is_correct,omitempty"`
}