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
	FindAll(ctx context.Context, role, senseiID string) ([]domains.Quiz, error)
	FindByID(ctx context.Context, id int, withQuestions bool) (*domains.Quiz, error)
	Update(ctx context.Context, id int, senseiID string, req dto.UpdateQuizRequest) (*domains.Quiz, error)
	Delete(ctx context.Context, id int, senseiID string) error
	AddQuestion(ctx context.Context, quizID int, senseiID string, req dto.CreateQuestionRequest) (*domains.Question, error)
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
		SenseiID: 		senseiID,
		Title: 			req.Title,
		Description: 	req.Description,
	}

	if err := s.repo.Create(ctx, q); err != nil {
		return nil, fmt.Errorf("MaterialService.Create: %w", err)
	}

	return q, nil
}

func (s *quizService) FindAll(ctx context.Context, role, senseiID string) ([]domains.Quiz, error) {
	if role == "sensei" {
		return s.repo.FindBySenseiID(ctx, senseiID)
	}
	return s.repo.FindByIsPublished(ctx)
}

func (s *quizService) FindByID(ctx context.Context, id int , withQuestions bool) (*domains.Quiz, error) {
	q, err := s.repo.FindByID(ctx, id)
	if err!= nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.FindByID")
	}

	if withQuestions {
		questions, err := s.repo.LoadQuestionForQuiz(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("QuizService.FindByID load question: %w", err)
		}
		q.Question = questions
	}
	return q, nil
}

func (s *quizService) Update(ctx context.Context, id int, senseiID string, req dto.UpdateQuizRequest) (*domains.Quiz, error) {
	if req.Title == "" {
		return nil, fmt.Errorf("Quiz title is required!")
	}

	q := &domains.Quiz{
		ID: 			id,
		SenseiID: 		senseiID,
		Title: 			req.Title,
		Description: 	req.Description,
		IsPublished: 	req.IsPublished,
	}

	if err := s.repo.Update(ctx, q); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizRepo.Update: %w", err)
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

func (s *quizService) AddQuestion(ctx context.Context, quizID int, senseiID string, req dto.CreateQuestionRequest) (*domains.Question,error) {
	quiz, err := s.repo.FindByID(ctx, quizID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizService.AddQuestion: %w", err)
	}

	if quiz.SenseiID != senseiID {
		return nil, ErrorForbidden
	}

	if req.QuestionText == "" {
		return nil, fmt.Errorf("Question text is required!")
	}
	if req.QuestionType < 1 || req.QuestionType > 3 {
		return nil, fmt.Errorf("Question type must be 1 (multiple_choice), 2 (short_answer), or 3 (matching_card)")
	}

	if req.Point < 0 {
		req.Point = 1
	}

	q := &domains.Question{
		QuizID: 		quizID,
		QuestionText: 	req.QuestionText,
		QuestionType: 	req.QuestionType,
		CorrectAnswer: 	req.CorrectAnswer,
		URL: 			req.URL,
		Point: 			req.Point,
		OrderNumber: 	req.OrderNumber,
	}

	for _, o := range req.Options {
		q.Options = append(q.Options, domains.QuestionOptions{
			OptionText: o.OptionText,
			URL: 		o.URL,
			IsCorrect: 	o.IsCorrect,
		})
	}

	for _, c := range req.MatchingCards {
		q.MatchingCards = append(q.MatchingCards, domains.MatchingCard{
			LeftText: 	c.LeftText,
			LeftURL: 	c.LeftURL,
			RightText: 	c.RightText,
			RightURL: 	&c.RightText,
		})
	}

	switch q.QuestionType {
	case domains.QuestionTypeMultipleChoice:
		if len(q.Options) < 2 {
			return nil, fmt.Errorf("Multiple choice require at least 2 questions")
		}

	case domains.QuestionTypeMatchingCard:
		if len(q.MatchingCards) < 2 {
			return nil, fmt.Errorf("Matching card require at least2 pairs")
		}

	case domains.QuestionTypeShortAnswer:
		if q.CorrectAnswer == nil || *q.CorrectAnswer == "" {
			return nil, fmt.Errorf("Short answer require correct answer")
		}
	}

	if err := s.repo.AddQuestion(ctx, q); err != nil {
		return nil, fmt.Errorf("QuizService.AddQuestion: %w", err)
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