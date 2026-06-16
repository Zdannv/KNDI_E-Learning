package services

import (
	"KNDI_E-LEARNING/internal/domains"
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/repository"
	"context"
	"errors"
	"fmt"
)

type QuizService interface {
	Create(ctx context.Context, senseiID string, req dto.CreateQuizRequest) (*domains.Quiz, error)
	FindAll(ctx context.Context) ([]domains.Quiz, error)
	FindByID(ctx context.Context, id int, withQuestions bool) (*domains.Quiz, error)
	FindAllBySensei(ctx context.Context, senseiID string) ([]domains.Quiz, error)
	Update(ctx context.Context, id int, senseiID string, req dto.UpdateQuizRequest) (*domains.Quiz, error)
	Delete(ctx context.Context, id int, senseiID string) error
	AddQuestion(ctx context.Context, quizID int, senseiID string, req dto.CreateQuestionRequest) (*domains.Question, error)
	UpdateQuestion(ctx context.Context, questionID int, senseiID string, req dto.UpdateQuestionRequest) (*domains.Question, error)
	DeleteQuestion(ctx context.Context, questionID int) error
}

type quizService struct {
	repo repository.QuizRepository
}

func NewQuizService(repo repository.QuizRepository) QuizService {
	return &quizService{repo: repo}
}

func (s *quizService) Create(ctx context.Context, senseiID string, req dto.CreateQuizRequest) (*domains.Quiz, error) {
	if req.Title == "" {
		return nil, errors.New("Quiz title is required!")
	}

	q := &domains.Quiz{
		SenseiID:    senseiID,
		Title:       req.Title,
		Description: req.Description,
	}

	if err := s.repo.Create(ctx, q); err != nil {
		return nil, fmt.Errorf("QuizService.Create: %w", err)
	}
	return q, nil
}

func (s *quizService) FindAll(ctx context.Context) ([]domains.Quiz, error) {
	quizzes, err := s.repo.FindByIsPublished(ctx)
	if err != nil {
		return nil, fmt.Errorf("QuizService.FindAll fetch list: %w", err)
	}

	if len(quizzes) == 0 {
		return quizzes, nil
	}

	quizIDs := make([]int, len(quizzes))
	for i, q := range quizzes {
		quizIDs[i] = q.ID
	}

	questionsByQuizID, err := s.repo.LoadQuestionsForQuizzes(ctx, quizIDs)
	if err != nil {
		return nil, fmt.Errorf("QuizService.FindAll load questions: %w", err)
	}

	for i := range quizzes {
		if qs, ok := questionsByQuizID[quizzes[i].ID]; ok {
			quizzes[i].Question = qs
		} else {
			quizzes[i].Question = []domains.Question{}
		}
	}

	return quizzes, nil
}

func (s *quizService) FindByID(ctx context.Context, id int, withQuestions bool) (*domains.Quiz, error) {
	q, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.FindByID: %w", err)
	}

	if withQuestions {
		questions, err := s.repo.LoadQuestionForQuiz(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("QuizService.FindByID load questions: %w", err)
		}
		q.Question = questions
	}
	return q, nil
}

func (s *quizService) FindAllBySensei(ctx context.Context, senseiID string) ([]domains.Quiz, error) {
	quizzes, err := s.repo.FindBySenseiID(ctx, senseiID)
	if err != nil {
		return nil, fmt.Errorf("QuizService.FindAllBySensei: %w", err)
	}

	if len(quizzes) == 0 {
		return quizzes, nil
	}

	quizIDs := make([]int, len(quizzes))
	for i, q := range quizzes {
		quizIDs[i] = q.ID
	}

	questionsByQuizID, err := s.repo.LoadQuestionsForQuizzes(ctx, quizIDs)
	if err != nil {
		return nil, fmt.Errorf("QuizService.FindAllBySensei load questions: %w", err)
	}

	for i := range quizzes {
		if qs, ok := questionsByQuizID[quizzes[i].ID]; ok {
			quizzes[i].Question = qs
		} else {
			quizzes[i].Question = []domains.Question{}
		}
	}

	return quizzes, nil
}


func (s *quizService) Update(ctx context.Context, id int, senseiID string, req dto.UpdateQuizRequest) (*domains.Quiz, error) {
	if req.Title == "" {
		return nil, fmt.Errorf("Quiz title is required!")
	}

	q := &domains.Quiz{
		ID:          id,
		SenseiID:    senseiID,
		Title:       req.Title,
		Description: req.Description,
		IsPublished: req.IsPublished,
	}

	if err := s.repo.Update(ctx, q); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.Update: %w", err)
	}
	return q, nil
}

func (s *quizService) Delete(ctx context.Context, id int, senseiID string) error {
	if err := s.repo.Delete(ctx, id, senseiID); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("QuizService.Delete: %w", err)
	}
	return nil
}

func (s *quizService) AddQuestion(ctx context.Context, quizID int, senseiID string, req dto.CreateQuestionRequest) (*domains.Question, error) {
	quiz, err := s.repo.FindByID(ctx, quizID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.AddQuestion find quiz: %w", err)
	}

	if quiz.SenseiID != senseiID {
		return nil, ErrorForbidden
	}

	if err := validateQuestionRequest(req); err != nil {
		return nil, err
	}

	if req.Point < 0 {
		req.Point = 1
	}

	q := buildQuestion(quizID, req)

	if err := validateQuestionChildren(q); err != nil {
		return nil, err
	}

	if err := s.repo.AddQuestion(ctx, q); err != nil {
		return nil, fmt.Errorf("QuizService.AddQuestion: %w", err)
	}
	return q, nil
}

func (s *quizService) UpdateQuestion(ctx context.Context, questionID int, senseiID string, req dto.UpdateQuestionRequest) (*domains.Question, error) {
	existing, err := s.repo.FindQuestionByID(ctx, questionID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.UpdateQuestion find: %w", err)
	}


	if req.Point < 0 {
		req.Point = 1
	}

	q := &domains.Question{
		ID:            questionID,
		QuizID:        existing.QuizID,
		QuestionType:  existing.QuestionType,
		QuestionText:  req.QuestionText,
		CorrectAnswer: req.CorrectAnswer,
		ImageURL:      req.ImageURL,
		AudioURL:      req.AudioURL,
		Point:         req.Point,
		OrderNumber:   req.OrderNumber,
	}

	for _, o := range req.Options {
		q.Options = append(q.Options, domains.QuestionOptions{
			OptionText: o.OptionText,
			ImageURL:   o.ImageURL,
			AudioURL:   o.AudioURL,
			IsCorrect:  o.IsCorrect,
		})
	}

	for _, c := range req.MatchingCards {
		q.MatchingCards = append(q.MatchingCards, domains.MatchingCard{
			LeftText:      c.LeftText,
			LeftImageURL:  c.LeftImageURL,
			LeftAudioURL:  c.LeftAudioURL,
			RightText:     c.RightText,
			RightImageURL: c.RightImageURL,
			RightAudioURL: c.RightAudioURL,
		})
	}

	if err := validateQuestionChildren(q); err != nil {
		return nil, err
	}

	if err := s.repo.UpdateQuestion(ctx, q); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.UpdateQuestion: %w", err)
	}
	return q, nil
}

func (s *quizService) DeleteQuestion(ctx context.Context, questionID int) error {
	if err := s.repo.DeleteQuestion(ctx, questionID); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("QuizService.DeleteQuestion: %w", err)
	}
	return nil
}

func validateQuestionRequest(req dto.CreateQuestionRequest) error {
	if req.QuestionType < 1 || req.QuestionType > 4 {
		return fmt.Errorf("Question type must be between 1 and 4")
	}
	return nil
}

func validateQuestionChildren(q *domains.Question) error {
	if q.QuestionText == "" && (q.ImageURL == nil || *q.ImageURL == "") && (q.AudioURL == nil || *q.AudioURL == "") {
		return fmt.Errorf("Question must have at least one of text, image, or audio")
	}

	switch q.QuestionType {
	case domains.QuestionTypeMultipleChoice:
		if len(q.Options) < 2 {
			return fmt.Errorf("Multiple choice requires at least 2 options")
		}
		for i, opt := range q.Options {
			if opt.OptionText == "" && (opt.ImageURL == nil || *opt.ImageURL == "") && (opt.AudioURL == nil || *opt.AudioURL == "") {
				return fmt.Errorf("Option %d must have at least one of text, image, or audio", i+1)
			}
		}
	case domains.QuestionTypeMatchingCard:
		if len(q.MatchingCards) < 2 {
			return fmt.Errorf("Matching card requires at least 2 pairs")
		}
		for i, card := range q.MatchingCards {
			if card.LeftText == "" && (card.LeftImageURL == nil || *card.LeftImageURL == "") && (card.LeftAudioURL == nil || *card.LeftAudioURL == "") {
				return fmt.Errorf("Matching card %d left side must have at least one of text, image, or audio", i+1)
			}
			if card.RightText == "" && (card.RightImageURL == nil || *card.RightImageURL == "") && (card.RightAudioURL == nil || *card.RightAudioURL == "") {
				return fmt.Errorf("Matching card %d right side must have at least one of text, image, or audio", i+1)
			}
		}
	case domains.QuestionTypeShortAnswer:
		if q.CorrectAnswer == nil || *q.CorrectAnswer == "" {
			return fmt.Errorf("Short answer requires a correct answer")
		}
	}
	return nil
}

func buildQuestion(quizID int, req dto.CreateQuestionRequest) *domains.Question {
	q := &domains.Question{
		QuizID:        quizID,
		QuestionText:  req.QuestionText,
		QuestionType:  req.QuestionType,
		CorrectAnswer: req.CorrectAnswer,
		ImageURL:      req.ImageURL,
		AudioURL:      req.AudioURL,
		Point:         req.Point,
		OrderNumber:   req.OrderNumber,
	}

	for _, o := range req.Options {
		q.Options = append(q.Options, domains.QuestionOptions{
			OptionText: o.OptionText,
			ImageURL:   o.ImageURL,
			AudioURL:   o.AudioURL,
			IsCorrect:  o.IsCorrect,
		})
	}

	for _, c := range req.MatchingCards {
		q.MatchingCards = append(q.MatchingCards, domains.MatchingCard{
			LeftText:      c.LeftText,
			LeftImageURL:  c.LeftImageURL,
			LeftAudioURL:  c.LeftAudioURL,
			RightText:     c.RightText,
			RightImageURL: c.RightImageURL,
			RightAudioURL: c.RightAudioURL,
		})
	}

	return q
}