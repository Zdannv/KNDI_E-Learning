package dto

type CreateQuestionRequest struct {
	QuestionText		string						`json:"question_text"`
	QuestionType		int							`json:"question_type"`
	CorrectAnswer		*string						`json:"correct_answer"`
	ImageURL			*string						`json:"image_url"`
	AudioURL			*string						`json:"audio_url"`
	Point				float64						`json:"point"`
	OrderNumber			int							`json:"order_number"`
	Options				[]CreateOptionRequest		`json:"options"`
	MatchingCards		[]CreateMatchingCardRequest	`json:"matching_cards"`
}

type UpdateQuestionRequest struct {
	QuestionText		string						`json:"question_text"`
	CorrectAnswer		*string						`json:"correct_answer"`
	ImageURL			*string						`json:"image_url"`
	AudioURL			*string						`json:"audio_url"`
	Point				float64						`json:"point"`
	OrderNumber			int							`json:"order_number"`
	Options				[]CreateOptionRequest		`json:"options"`
	MatchingCards		[]CreateMatchingCardRequest	`json:"matching_cards"`
}

type CreateOptionRequest struct {
	OptionText			string				`json:"option_text"`
	ImageURL			*string				`json:"image_url"`
	AudioURL			*string				`json:"audio_url"`
	IsCorrect			bool				`json:"is_correct"`
}

type CreateMatchingCardRequest struct {
	LeftText			string				`json:"left_text"`
	LeftImageURL		*string				`json:"left_image_url"`
	LeftAudioURL		*string				`json:"left_audio_url"`
	RightText			string				`json:"right_text"`
	RightImageURL		*string				`json:"right_image_url"`
	RightAudioURL		*string				`json:"right_audio_url"`
}