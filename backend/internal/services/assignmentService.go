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
	GetAllHistory(ctx context.Context) ([]dto.HistoryListResponse, error)
	GetPendingEssays(ctx context.Context) ([]dto.EssayPendingItem, error)
	GradeEssay(ctx context.Context, assignmentID, historyID int, req dto.GradeEssayRequest) error
}

type assignmentService struct {
	assignmentRepo repository.AssignmentRepository
	quizRepo       repository.QuizRepository
}

func NewAssignmentService(
	assignmentRepo repository.AssignmentRepository,
	quizRepo       repository.QuizRepository,
) AssignmentService {
	return &assignmentService{
		assignmentRepo: assignmentRepo,
		quizRepo:       quizRepo,
	}
}

type matchingPairEntry struct {
	leftCardID  int
	rightCardID int
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

	alreadyPassed, err := s.assignmentRepo.QuizPassedByStudentID(ctx, studentID, req.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.Start check: %w", err)
	}
	if alreadyPassed {
		return nil, ErrorAlreadyCompleted
	}

	a := &domains.Assignment{StudentID: studentID, QuizID: req.QuizID}
	if err := s.assignmentRepo.Create(ctx, a); err != nil {
		return nil, fmt.Errorf("AssignmentService.Start: %w", err)
	}

	return a, nil
}

func (s *assignmentService) Submit(
	ctx          context.Context,
	studentID    string,
	assignmentID int,
	req          dto.SubmitAssignmentRequest,
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

	questions, err := s.quizRepo.LoadQuestionForQuiz(ctx, a.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit load question: %w", err)
	}

	qMap := make(map[int]domains.Question, len(questions))
	for _, q := range questions {
		qMap[q.ID] = q
	}

	quiz, err := s.quizRepo.FindByID(ctx, a.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit find quiz: %w", err)
	}

	matchingPairsByQuestion := make(map[int][]matchingPairEntry)
	seenMatchingQuestion    := make(map[int]bool)

	var historyItems  []domains.AssignmentHistory
	var totalEarned   float64
	var totalPossible float64

	for _, submitted := range req.Answer {
		q, ok := qMap[submitted.QuestionID]
		if !ok {
			continue
		}

		switch q.QuestionType {

		case domains.QuestionTypeMultipleChoice:
			totalPossible += q.Point
			h := domains.AssignmentHistory{
				AssignmentID:     assignmentID,
				QuestionID:       submitted.QuestionID,
				QuestionOptionID: submitted.QuestionOptionID,
				QuestionText:     q.QuestionText,
				IsGraded:         true,
			}
			if submitted.QuestionOptionID != nil {
				h.ScoreEarned = gradeMultipleChoice(q.Options, *submitted.QuestionOptionID, q.Point)
			}
			h.IsCorrect  = h.ScoreEarned > 0
			totalEarned += h.ScoreEarned
			historyItems = append(historyItems, h)

		case domains.QuestionTypeShortAnswer:
			totalPossible += q.Point
			h := domains.AssignmentHistory{
				AssignmentID: assignmentID,
				QuestionID:   submitted.QuestionID,
				AnswerText:   submitted.AnswerText,
				QuestionText: q.QuestionText,
				IsGraded:     true,
			}
			if submitted.AnswerText != nil && q.CorrectAnswer != nil {
				h.ScoreEarned = gradeShortAnswer(*q.CorrectAnswer, *submitted.AnswerText, q.Point)
			}
			h.IsCorrect  = h.ScoreEarned > 0
			totalEarned += h.ScoreEarned
			historyItems = append(historyItems, h)

		case domains.QuestionTypeMatchingCard:
			if submitted.MatchingCardID != nil && submitted.SelectedCard != nil {
				matchingPairsByQuestion[q.ID] = append(
					matchingPairsByQuestion[q.ID],
					matchingPairEntry{
						leftCardID:  *submitted.MatchingCardID,
						rightCardID: *submitted.SelectedCard,
					},
				)
			}
			seenMatchingQuestion[q.ID] = true

		case domains.QuestionTypeEssay:
			totalPossible += q.Point
			h := domains.AssignmentHistory{
				AssignmentID: assignmentID,
				QuestionID:   submitted.QuestionID,
				AnswerText:   submitted.AnswerText,
				QuestionText: q.QuestionText,
				ScoreEarned:  0,
				IsGraded:     false,
				IsCorrect:    false,
			}
			historyItems = append(historyItems, h)
		}
	}

	// Grade matching questions accumulated across multiple submitted rows.
	for questionID := range seenMatchingQuestion {
		q := qMap[questionID]
		totalPossible += q.Point

		submittedPairs := matchingPairsByQuestion[questionID]
		totalPairs     := len(q.MatchingCards)
		correctPairs   := gradeMatchingPairs(q.MatchingCards, submittedPairs)

		scoreEarned := 0.0
		if totalPairs > 0 {
			scoreEarned = (float64(correctPairs) / float64(totalPairs)) * q.Point
		}
		totalEarned += scoreEarned

		h := domains.AssignmentHistory{
			AssignmentID: assignmentID,
			QuestionID:   questionID,
			QuestionText: q.QuestionText,
			ScoreEarned:  scoreEarned,
			IsCorrect:    correctPairs == totalPairs,
			IsGraded:     true,
		}
		historyItems = append(historyItems, h)
	}

	if err := s.assignmentRepo.SaveHistory(ctx, historyItems); err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit save history: %w", err)
	}

	now := time.Now().UTC()
	if err := s.assignmentRepo.Finalise(
		ctx, assignmentID, totalPossible, totalEarned, now, domains.StatusCompleted,
	); err != nil {
		return nil, fmt.Errorf("AssignmentService.Submit finalise: %w", err)
	}

	return buildResultResponse(assignmentID, quiz.Title, totalEarned, totalPossible, historyItems, qMap, now), nil
}

// ─── GetResult ────────────────────────────────────────────────────────────────

func (s *assignmentService) GetResult(ctx context.Context, studentID string, assignmentID int) (*dto.AssignmentResultResponse, error) {
	a, err := s.assignmentRepo.FindByID(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("AssignmentService.GetResult find: %w", err)
	}

	role, _ := ctx.Value(ContextKeyRole).(string)
	if a.StudentID != studentID && role != "sensei" {
		return nil, ErrorForbidden
	}

	history, err := s.assignmentRepo.FindHistoryByAssignmentID(ctx, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetResult history: %w", err)
	}

	questions, err := s.quizRepo.LoadQuestionForQuiz(ctx, a.QuizID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetResult load questions: %w", err)
	}

	qMap := make(map[int]domains.Question, len(questions))
	for _, question := range questions {
		qMap[question.ID] = question
	}

	totalEarned := 0.0
	for _, h := range history {
		totalEarned += h.ScoreEarned
	}

	var completedAt time.Time
	if a.CompletedAt != nil {
		completedAt = *a.CompletedAt
	}

	totalPossible := 0.0
	if a.TotalPoint != nil {
		totalPossible = *a.TotalPoint
	}

	return buildResultResponse(assignmentID, a.Quiz.Title, totalEarned, totalPossible, history, qMap, completedAt), nil
}

// ─── History ──────────────────────────────────────────────────────────────────

func (s *assignmentService) GetHistory(ctx context.Context, studentID string) ([]dto.HistoryListResponse, error) {
	if role, _ := ctx.Value(ContextKeyRole).(string); role == "sensei" {
		return []dto.HistoryListResponse{}, nil
	}

	assignments, err := s.assignmentRepo.FindHistoryByStudentID(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetHistory: %w", err)
	}
	return s.buildHistoryResponse(assignments), nil
}

func (s *assignmentService) GetAllHistory(ctx context.Context) ([]dto.HistoryListResponse, error) {
	assignments, err := s.assignmentRepo.FindAllHistory(ctx)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetAllHistory: %w", err)
	}
	return s.buildHistoryResponse(assignments), nil
}

func (s *assignmentService) GetPendingEssays(ctx context.Context) ([]dto.EssayPendingItem, error) {
	items, err := s.assignmentRepo.FindPendingEssays(ctx)
	if err != nil {
		return nil, fmt.Errorf("AssignmentService.GetPendingEssays: %w", err)
	}

	result := make([]dto.EssayPendingItem, 0, len(items))
	for _, item := range items {
		result = append(result, dto.EssayPendingItem{
			AssignmentID:        item.AssignmentID,
			AssignmentHistoryID: item.AssignmentHistoryID,
			StudentName:         item.StudentName,
			QuizTitle:           item.QuizTitle,
			QuestionID:          item.QuestionID,
			QuestionText:        item.QuestionText,
			MaxPoint:            item.MaxPoint,
			StudentAnswer:       item.StudentAnswer,
		})
	}
	return result, nil
}

func (s *assignmentService) GradeEssay(
	ctx          context.Context,
	assignmentID int,
	historyID    int,
	req          dto.GradeEssayRequest,
) error {
	if req.Score < 0 || req.Score > 100 {
		return fmt.Errorf("Score must be between 0 and 100")
	}

	if _, err := s.assignmentRepo.FindByID(ctx, assignmentID); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("AssignmentService.GradeEssay find assignment: %w", err)
	}

	question, err := s.quizRepo.FindQuestionByHistoryID(ctx, historyID, assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("AssignmentService.GradeEssay find question: %w", err)
	}

	actualScore := (req.Score / 100) * question.Point

	if err := s.assignmentRepo.UpdateEssayScore(ctx, historyID, assignmentID, actualScore); err != nil {
		if errors.Is(err, repository.ErrorNotFound) {
			return ErrorNotFound
		}
		return fmt.Errorf("AssignmentService.GradeEssay update: %w", err)
	}

	if err := s.assignmentRepo.RecalcAssignmentScore(ctx, assignmentID); err != nil {
		return fmt.Errorf("AssignmentService.GradeEssay recalc: %w", err)
	}

	return nil
}

func (s *assignmentService) buildHistoryResponse(assignments []domains.Assignment) []dto.HistoryListResponse {
	result := make([]dto.HistoryListResponse, 0, len(assignments))
	for _, a := range assignments {
		scoreEarned := 0.0
		totalPoint  := 0.0

		if a.ScoreEarned != nil {
			scoreEarned = *a.ScoreEarned
		}
		if a.TotalPoint != nil {
			totalPoint = *a.TotalPoint
		}

		scorePct := 0.0
		if totalPoint > 0 {
			scorePct = scoreEarned / totalPoint * 100
		}

		dateStr, timeStr := "", ""
		var completedAtStr *string
		if a.CompletedAt != nil {
			dateStr = a.CompletedAt.Format("02 January 2006")
			timeStr = a.CompletedAt.Format("15:04")
			rfc     := a.CompletedAt.Format(time.RFC3339)
			completedAtStr = &rfc
		}

		result = append(result, dto.HistoryListResponse{
			AssignmentID: a.ID,
			QuizID:       a.QuizID,
			QuizTitle:    a.Quiz.Title,
			StudentName:  a.StudentName,
			ScoreEarned:  scoreEarned,
			TotalPoint:   totalPoint,
			ScorePct:     scorePct,
			Status:       a.StatusName,
			DateStr:      dateStr,
			TimeStr:      timeStr,
			CompletedAt:  completedAtStr,
			HasUngradedEssay: a.HasUngradedEssay,
		})
	}
	return result
}

func gradeMultipleChoice(options []domains.QuestionOptions, selectedID int, point float64) float64 {
	for _, opt := range options {
		if opt.ID == selectedID && opt.IsCorrect {
			return point
		}
	}
	return 0
}

func gradeShortAnswer(answerKey, studentAnswer string, point float64) float64 {
	if strings.EqualFold(strings.TrimSpace(answerKey), strings.TrimSpace(studentAnswer)) {
		return point
	}
	return 0
}

func gradeMatchingPairs(cards []domains.MatchingCard, submitted []matchingPairEntry) int {
	validIDs := make(map[int]bool, len(cards))
	for _, c := range cards {
		validIDs[c.ID] = true
	}
	correct := 0
	for _, pair := range submitted {
		if validIDs[pair.leftCardID] && pair.leftCardID == pair.rightCardID {
			correct++
		}
	}
	return correct
}

func buildResultResponse(
	assignmentID  int,
	quizTitle     string,
	totalEarned   float64,
	totalPossible float64,
	history       []domains.AssignmentHistory,
	qMap          map[int]domains.Question,
	completedAt   time.Time,
) *dto.AssignmentResultResponse {
	scorePct := 0.0
	if totalPossible > 0 {
		scorePct = totalEarned / totalPossible * 100
	}

	completedAtStr := completedAt.Format(time.RFC3339)

	answers := make([]dto.AssignmentHistoryResponse, 0, len(history))
	for _, h := range history {
		yourAnswer := ""
		if h.AnswerText != nil {
			yourAnswer = *h.AnswerText
		}

		item := dto.AssignmentHistoryResponse{
			QuestionText: h.QuestionText,
			YourAnswer:   yourAnswer,
			IsCorrect:    h.IsCorrect,
			ScoreEarned:  h.ScoreEarned,
		}

		if q, ok := qMap[h.QuestionID]; ok {
			item.QuestionType = q.QuestionType
			if q.QuestionType == domains.QuestionTypeMatchingCard {
				item.TotalPairs = len(q.MatchingCards)
			}
			if q.QuestionType == domains.QuestionTypeEssay {
				item.PendingGrade = !h.IsGraded
			}
		}

		answers = append(answers, item)
	}

	return &dto.AssignmentResultResponse{
		AssignmentID: assignmentID,
		QuizTitle:    quizTitle,
		TotalPoint:   totalPossible,
		ScoreEarned:  totalEarned,
		ScorePct:     scorePct,
		Passed:       scorePct > 70,
		Status:       "completed",
		CompletedAt:  &completedAtStr,
		Answers:      answers,
	}
}