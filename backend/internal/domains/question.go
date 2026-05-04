package domains

const (
	QuestionTypeMultipleChoice	= 1
	QuestionTypeShortAnswer		= 2
	QuestionTypeMatchingCard	= 3
)

type QuestionType struct {
	ID			int		`json:"id"`
	Name		string	`json:"name"`
}


type Question struct {
	ID				int					`json:"id"`
	QuizID			int					`json:"quiz_id"`
	QuestionText	string				`json:"question_text"`
	QuestionType	int					`json:"question_type"`
	CorrectAnswer	*string				`json:"correct_answer"`
	URL				*string				`json:"url"`
	Point			float64				`json:"point"`
	OrderNumber		int					`json:"order_number"`

	Options			[]QuestionOptions	`json:"question_options,omitempty"`
	MatchingCards	[]MatchingCard		`json:"matching_card,omitempty"`
}

type QuestionOptions struct {
	ID				int					`json:"id"`
	QuestionID		int					`json:"question_id"`
	OptionText		string				`json:"option_text"`
	URL				*string				`json:"url"`
	IsCorrect		bool				`json:"is_correct"`
}

type MatchingCard struct {
	ID				int					`json:"id"`
	QuestionID		int					`json:"question_id"`
	LeftText		string				`json:"left_text"`
	LeftURL			*string				`json:"left_url"`
	RightText		string				`json:"right_text"`
	RightURL		*string				`json:"right_url"`
}