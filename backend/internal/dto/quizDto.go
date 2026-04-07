package dto

type CreateQuizRequest struct {
	Title			string		`json:"title" binding:"required,min=3,max=32"`
	Description		string		`json:"description"`
	PassingScore	int			`json:"passing_score" binding:"min=0,max=100"`
}

type PublishQuizRequest struct {
	IsPublished		bool		`json:"is_published"`
}

type CreateQuestionRequest struct {
	QuestionType	string						`json:"question_type" binding:"required,oneof=multiple_choice short_answer"`
	QuestionText	string						`json:"question_text" binding:"required"`
	OrderNumber		int							`json:"order_number"`
	Points			int							`json:"points" binding:"min=1"`
	Options			[]CreateOptionsRequest		`json:"options"`
	ShortAnswer		*CreateShortAnswerRequest	`json:"short_answer"`
}

type CreateOptionsRequest struct {
	OptionText		string		`json:"option_text" binding:"required"`
	IsCorrect		bool		`json:"is_correct"`
	OrderNumber		int			`json:"order_number"`
}

type CreateShortAnswerRequest struct {
	AnswerKey		string		`json:"answer_key" binding:"required"`
	CaseSensitive	bool		`json:"case_sensitive"`
}

type CreateMaterialRequest struct {
	Title			string		`json:"title" binding:"requred,min=6,max=32"`
	Description		string		`json:"description"`
	FilePath		string		`json:"file_path" binding:"required"`
	FileType		string		`json:"file_type" binding:"required,oneof=pdf pptx"`
}