package dto

type CreateQuestionRequest struct {
	QuestionText		string						`json:"question_text"`
	QuestionType		int							`json:"question_type"`
	CorrectAnswer		*string						`json:"correct_answer"`
	URL					*string						`json:"url"`
	Point				float64						`json:"point"`
	OrderNumber			int							`json:"order_number"`
	Options				[]CreateOptionRequest		`json:"options"`
	MatchingCards		[]CreateMatchingCardRequest	`json:"matching_cards"`
}

type CreateOptionRequest struct {
	OptionText			string				`json:"option_text"`
	URL					*string				`json:"url"`
	IsCorrect			bool				`json:"is_correct"`
}

type CreateMatchingCardRequest struct {
	LeftText			string				`json:"left_text"`
	LeftURL				*string				`json:"left_url"`
	RightText			string				`json:"right_text"`
	RightUrl			*string				`json:"right_url"`
}