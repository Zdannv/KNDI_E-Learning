package services

import (
	"KNDI_E-LEARNING/internal/domains"
	"KNDI_E-LEARNING/internal/dto"
	"KNDI_E-LEARNING/internal/repository"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

type AssignmentService interface {
	Start(ctx context.Context, studentID string, req dto.StartAssignment) (*domains.Assignment, error)
	Submit(ctx context.Context, studentID string, assignmentID int, req dto.SubmitAssignmentRequest) (*dto.AssignmentResultResponse, error)
	GetResult(ctx context.Context, studentID string, assignmentID int) (*dto.AssignmentResultResponse, error)
	GetHistory(ctx context.Context, studentID string) ([]dto.HistoryListResponse, error)
}

type assignmentService struct {
	assignmentRepo	repository.AssignmentRepository
	quizRepo		repository.QuizRepository
}

func NewAssignmentService(
	assignmentRepo 	repository.AssignmentRepository,
	quizRepo		repository.QuizRepository,
) AssignmentService {
	return &assignmentService{
		assignmentRepo: assignmentRepo,
		quizRepo:		quizRepo,
	}
}

func (s *assignmentService) Start(ctx context.Context, studentID string, req dto.StartAssignment) (*domains.Assignment, error) {
	if req.QuizID == 0 {
		return nil, fmt.Errorf("QuizID is required!")
	}

	quiz, err := s.quizRepo.FindByID(ctx, req.QuizID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("AssigntmentService.Start find quiz: %w", err)
	}

	if !quiz.IsPublished {
		return nil, fmt.Errorf("Quiz is not published yet!")
	}

	a := &domains.Assignment{
		StudentID: 	studentID,
		QuizID: 	req.QuizID,
	}

	if err := s.assignmentRepo.Create(ctx, a); err != nil {
		return nil, fmt.Errorf("AssignmentService.Start: %w", err)
	}

	return a, nil
}

func (s *assignmentService) Submit(
	ctx 			context.Context, 
	studentID 		string, 
	assignmentID 	int, 
	req 			dto.SubmitAssignmentRequest,
) (*dto.AssignmentResultResponse, error) {
	a, err := s.assignmentRepo.FindByID(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("AssignmentService.Submit find: %w", err)
	}

	if a.StudentID != studentID {
		return nil, ErrorForbidden
	}

	if a.Status == domains.StatusCompleted {
		return nil, errors.New("This assignment is already submitted!")
	}

	question, err := s.quizRepo.LoadQuestionForQuiz(ctx, a.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit load question: %w", err)
	}

	// Lookup: O(1) access during grading
	qMap := make(map[int]domains.Question, len(question))
	for _, q := range question {
		qMap[q.ID] = q
	}

	quiz, err := s.quizRepo.FindByID(ctx, a.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit find quiz: %w", err)
	}

	var historyItems []domains.AssignmentHistory
	var totalEarned float64
	var totalPossible float64
	
	for _, submitted := range req.Answer {
		q, ok := qMap[submitted.QuestionID]
		if !ok {
			continue		// Ignore question that not in this quiz
		}

		totalPossible += q.Point

		h := domains.AssignmentHistory {
			AssignmentID: 		assignmentID,
			QuestionID: 		submitted.QuestionID,
			QuestionOptionID: 	submitted.QuestionOptionID,
			MatchingCardID: 	submitted.MatchingCardID,
			AnswerText: 		submitted.AnswerText,
			QuestionText: 		q.QuestionText,
		}

		switch q.QuestionType {
		case domains.QuestionTypeMultipleChoice:
			if submitted.QuestionOptionID != nil {
				h.ScoreEarned = gradeMultipleChoice(q.Options, *submitted.QuestionOptionID, q.Point)
			}

		case domains.QuestionTypeShortAnswer:
			if submitted.AnswerText != nil && q.CorrectAnswer != nil {
				h.ScoreEarned = gradeShortAnswer(*q.CorrectAnswer, *submitted.AnswerText, q.Point)
			}

		case domains.QuestionTypeMatchingCard:
			if submitted.MatchingCardID != nil {
				h.ScoreEarned = gradeMatchingCard(q.MatchingCards, *submitted.MatchingCardID, *submitted.SelectedCard, q.Point)
			}
		}

		h.IsCorrect = h.ScoreEarned > 0
		totalEarned = h.ScoreEarned
		historyItems = append(historyItems, h)
	}

	if err := s.assignmentRepo.SaveHistory(ctx, historyItems); err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit save history: %w", err)
	}

	now := time.Now().UTC()
	if err := s.assignmentRepo.Finalise(ctx, assignmentID, totalEarned, now); err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit Finalise: %w", err)
	}
	
	return buildResultResponse(assignmentID, quiz.Title, totalEarned, totalPossible, historyItems, now), nil
}

func (s *assignmentService) GetResult(ctx context.Context, studentID string, assignmentID int) (*dto.AssignmentResultResponse, error) {
	a, err := s.assignmentRepo.FindByID(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("AssignmentService.GetResult find: %w", err)
	}

	if a.StudentID != studentID {
		return nil ,ErrorForbidden
	}

	history, err := s.assignmentRepo.FindHistoryByAssignmentID(ctx, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetResult history: %w", err)
	} 

	totalEarned := 0.0
	for _, h := range history {
		totalEarned = h.ScoreEarned
	}

	var completedAt time.Time
	if a.CompletedAt != nil {
		completedAt = *a.CompletedAt
	}

	totalPossible := 0.0
	if a.TotalPoint != nil {
		totalPossible = *a.TotalPoint
	}

	return buildResultResponse(assignmentID, a.Quiz.Title, totalEarned, totalPossible, history, completedAt), nil
}

func (s *assignmentService) GetHistory(ctx context.Context, studentID string) ([]dto.HistoryListResponse, error) {
	assignments, err := s.assignmentRepo.FindHistoryByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetHistory: %w", err)
	}

	result := make([]dto.HistoryListResponse, 0, len(assignments))
	for _, a := range assignments {
		totalPoint := 0.0
		if a.TotalPoint != nil {
			totalPoint = *a.TotalPoint
		}

		var completedAtStr *string
		dateStr, timeStr := "", ""
		if a.CompletedAt != nil {
			d := a.CompletedAt.Format("23 April 2026")
			t := a.CompletedAt.Format("10:30")
			rfc := a.CompletedAt.Format(time.RFC3339)
			dateStr = d
			timeStr = t
			completedAtStr = &rfc
		}

		scorePct := 0.0
		if totalPoint > 0 {
			scorePct = totalPoint / totalPoint * 100
		}

		_ = scorePct

		result = append(result, dto.HistoryListResponse{
			AssignmentID: 	a.ID,
			QuizTitle: 		a.Quiz.Title,
			ScoreEarned: 	totalPoint,
			TotalPoint: 	totalPoint,
			ScorePct: 		100,	// completed means full record
			Status: 		a.StatusName,
			DateStr: 		dateStr,
			TimeStr: 		timeStr,
			CompletedAt: 	completedAtStr,
		})
	}

	return result, nil

}

func gradeMultipleChoice(options []domains.QuestionOptions, selectedID int, point float64) float64 {
	for _, opt := range options {
		if opt.ID == selectedID && opt.IsCorrect {
			return point
		}
	}

	return 0
}

func gradeShortAnswer(answerkey, studentAnswer string, point float64) float64 {
	if strings.EqualFold(strings.TrimSpace(answerkey), strings.TrimSpace(studentAnswer)) {
		return point
	}
	return 0
}

func gradeMatchingCard(cards []domains.MatchingCard, leftCardID, rightCardID int, point float64) float64 {
	for _, c := range cards {
		if c.ID == leftCardID {
			if leftCardID == rightCardID {
				return point / float64(len(cards))
			}
			return  0
		}
	}
	return 0
}

func buildResultResponse(
	assignmentID	int,
	quizTitle		string,
	totalEarned,
	totalPossible 	float64,
	history			[]domains.AssignmentHistory,
	completedAt		time.Time,
) *dto.AssignmentResultResponse {
	scorePct := 0.0
	if totalPossible > 0 {
		scorePct = totalEarned / totalPossible * 100
	}

	completedAtStr := completedAt.Format(time.RFC3339)
	var answers []dto.AssignmentHistoryResponse
	for _, h := range history {
		yourAnswer := ""
		if h.AnswerText != nil {
			yourAnswer = *h.AnswerText
		}
		answers = append(answers, dto.AssignmentHistoryResponse{
			QuestionText: 	h.QuestionText,
			YourAnswer: 	yourAnswer,
			IsCorrect: 		h.IsCorrect,
			ScoreEarned: 	h.ScoreEarned,
		})
	}

	return &dto.AssignmentResultResponse{
		AssignmentID: 	assignmentID,
		QuizTitle: 		quizTitle,
		TotalPoint: 	totalPossible,
		ScoreEarned: 	totalEarned,
		ScorePct: 		scorePct,
		Passed: 		scorePct > 70,
		Status: 		"completed",
		CompletedAt: 	&completedAtStr,
		Answers: 		answers,
	}
}