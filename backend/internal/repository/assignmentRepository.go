package repository

import (
	"KNDI_E-LEARNING/internal/domains"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	insertAssignment = `
		INSERT INTO assignments (student_id, quiz_id, status)
		VALUES ($1, $2, $3)
		RETURNING id, started_at`
	
	selectAssignmentByID = `
		SELECT a.id, a.student_id, a.quiz_id, a.total_point, a.status,
			s.name AS status_name, a.started_at, a.completed_at,
			q.title AS quiz_title
		FROM assignments a
		JOIN assignment_status s ON s.id = a.status
		JOIN quizzes q ON q.id = a.quiz_id
		WHERE a.id = $1`

	selectHistoryByStudentID = `
		SELECT a.id, a.student_id, a.quiz_id, a.total_point, a.score_earned, a.status,
			s.name AS status_name, a.started_at, a.completed_at,
			q.title AS quiz_title
		FROM assignments a
		JOIN assignment_status s ON s.id = a.status
		JOIN quizzes q ON q.id = a.quiz_id
		WHERE a.student_id = $1 AND a.status = $2
		ORDER BY a.completed_at DESC`

	selectAllHistory = `
		SELECT a.id, a.student_id, a.quiz_id, a.total_point, a.score_earned, a.status,
			s.name AS status_name, a.started_at, a.completed_at,
			q.title AS quiz_title,
			u.username AS student_name
		FROM assignments a
		JOIN assignment_status s ON s.id = a.status
		JOIN quizzes q ON q.id = a.quiz_id
		JOIN users u ON u.id = a.student_id
		WHERE a.status = $1
		ORDER BY a.completed_at DESC`

	finaliseAssignment = `
		UPDATE assignments
		SET total_point = $1, score_earned = $2, status = $3, completed_at = $4
		WHERE id = $5`

	insertAssignmentHistory = `
		INSERT INTO assignment_history
			(assignment_id, question_id, question_option_id, matching_card_id, answer_text, score_earned, is_graded)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	selectHistoryByAssignmentID = `
		SELECT ah.id, ah.assignment_id, ah.question_id,
			ah.question_option_id, ah.matching_card_id,
			ah.answer_text, ah.score_earned, ah.is_graded,
			ah.created_at, ah.updated_at,
			q.question_text
		FROM assignment_history ah
		JOIN questions q ON q.id = ah.question_id
		WHERE ah.assignment_id = $1
		ORDER BY ah.id ASC`

	selectQuizCompletedAssignmentByUserID = `
		SELECT EXISTS (
			SELECT 1
			FROM assignments
			WHERE student_id = $1
				AND quiz_id = $2
				AND status = $3
		)`

	selectPendingEssays = `
		SELECT
			ah.assignment_id,
			ah.id AS assignment_history_id,
			u.username AS student_name,
			qz.title AS quiz_title,
			q.id AS question_id,
			q.question_text,
			q.point AS max_point,
			COALESCE(ah.answer_text, '') AS student_answer
		FROM assignment_history ah
		JOIN assignments a ON a.id = ah.assignment_id
		JOIN users u ON u.id = a.student_id
		JOIN questions q ON q.id = ah.question_id
		JOIN quizzes qz ON qz.id = a.quiz_id
		WHERE q.question_type = 4
			AND ah.is_graded    = FALSE
		ORDER BY ah.created_at ASC`

	updateEssayScore = `
		UPDATE assignment_history
		SET score_earned = $1,
			is_graded = TRUE,
			updated_at = NOW()
		WHERE  id = $2
			AND  assignment_id = $3`

	recalcAssignmentScore = `
		UPDATE assignments
		SET score_earned = (
			SELECT COALESCE(SUM(score_earned), 0)
			FROM assignment_history
			WHERE assignment_id = $1
		)
		WHERE  id = $1`
)

type AssignmentRepository interface {
	Create(ctx context.Context, a *domains.Assignment) error
	FindByID(ctx context.Context, id int) (*domains.Assignment, error)
	Finalise(ctx context.Context, id int, totalPoint float64, scoreEarned float64, completedAt time.Time, status int) error
	SaveHistory(ctx context.Context, items []domains.AssignmentHistory) error
	FindHistoryByAssignmentID(ctx context.Context, assignmentID int) ([]domains.AssignmentHistory, error)
	FindHistoryByStudentID(ctx context.Context, studentID string) ([]domains.Assignment, error)
	FindAllHistory(ctx context.Context) ([]domains.Assignment, error)
	QuizCompletedByStudentID(ctx context.Context, studentID string, quizID int) (bool, error)
	FindPendingEssays(ctx context.Context) ([]domains.PendingEssay, error)
	UpdateEssayScore(ctx context.Context, historyID, assignmentID int, score float64) error
	RecalcAssignmentScore(ctx context.Context, assignmentID int) error
}

type assignmentRepository struct {
	pool *pgxpool.Pool
}

func NewAssignmentRepository(pool *pgxpool.Pool) AssignmentRepository {
	return &assignmentRepository{pool: pool}
}

func (r *assignmentRepository) Create(ctx context.Context, a *domains.Assignment) error {
	err := r.pool.QueryRow(ctx, insertAssignment, a.StudentID, a.QuizID, domains.StatusInProgres).
				Scan(&a.ID, &a.StartedAt)
	if err != nil {
		return fmt.Errorf("AssignmentRepo.Create: %w", err)
	}

	a.Status = domains.StatusInProgres
	return nil
}

func (r *assignmentRepository) FindByID(ctx context.Context, id int) (*domains.Assignment, error) {
	a := &domains.Assignment{Quiz: &domains.Quiz{}}
	var quizTitle string
	err := r.pool.QueryRow(ctx, selectAssignmentByID, id).
				Scan(&a.ID, &a.StudentID, &a.QuizID, &a.TotalPoint, &a.Status,
					&a.StatusName, &a.StartedAt, &a.CompletedAt, &quizTitle)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("AssignmentRepo.FindByID: %w", err)
	}
	
	a.Quiz.Title = quizTitle
	
	return a, nil
}

func (r *assignmentRepository) Finalise(
	ctx         context.Context,
	id          int,
	totalPoint  float64,
	scoreEarned float64,
	completedAt time.Time,
	status      int,
) error {
	_, err := r.pool.Exec(ctx, finaliseAssignment,
		totalPoint, scoreEarned, status, completedAt, id)
	if err != nil {
		return fmt.Errorf("AssignmentRepo.Finalise: %w", err)
	}
	return nil
}

func (r *assignmentRepository) SaveHistory(ctx context.Context, items []domains.AssignmentHistory) error {
	if len(items) == 0 {
		return nil
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("AssignmentRepo.SaveHistory: %w", err)
	}

	defer tx.Rollback(ctx)

	for i := range items {
		err := tx.QueryRow(
			ctx, insertAssignmentHistory,
			items[i].AssignmentID,
			items[i].QuestionID,
			items[i].QuestionOptionID,
			items[i].MatchingCardID,
			items[i].AnswerText,
			items[i].ScoreEarned,
			items[i].IsGraded,
		).Scan(&items[i].ID, &items[i].CreatedAt, &items[i].UpdatedAt)
		if err != nil {
			return fmt.Errorf("AssignmentRepo.SaveHistory insert: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *assignmentRepository) FindHistoryByAssignmentID(ctx context.Context, assignmentID int) ([]domains.AssignmentHistory, error) {
	rows, err := r.pool.Query(ctx, selectHistoryByAssignmentID, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("AssignmentRepo.FindHistory: %w", err)
	}

	defer rows.Close()

	var items []domains.AssignmentHistory
	for rows.Next() {
		var h domains.AssignmentHistory
		if err := rows.Scan(
			&h.ID, &h.AssignmentID, &h.QuestionID,
			&h.QuestionOptionID, &h.MatchingCardID,
			&h.AnswerText, &h.ScoreEarned, &h.IsGraded,
			&h.CreatedAt, &h.UpdatedAt,
			&h.QuestionText,
		); err != nil {
			return nil, fmt.Errorf("AssignmentRepo.FindHistory scan: %w", err)
		}
		items = append(items, h)
	}

	return items, rows.Err()
}

func (r *assignmentRepository) FindHistoryByStudentID(ctx context.Context, studentID string) ([]domains.Assignment, error) {
	rows, err := r.pool.Query(ctx, selectHistoryByStudentID, studentID, domains.StatusCompleted)
	if err != nil {
		return nil, fmt.Errorf("AssignmentRepo.FindHistoryStudent: %w", err)
	}

	defer rows.Close()

	var assignments []domains.Assignment
	for rows.Next() {
		a := domains.Assignment{Quiz: &domains.Quiz{}}
		var quizTitle string
		if err := rows.Scan(
			&a.ID, &a.StudentID, &a.QuizID, &a.TotalPoint, &a.ScoreEarned, &a.Status,
			&a.StatusName, &a.StartedAt, &a.CompletedAt, &quizTitle,
		); err != nil {
			return nil, fmt.Errorf("AssignmentRepo.FindHistoryStudent scan: %w", err)
		}

		a.Quiz.Title = quizTitle
		assignments = append(assignments, a)
	}

	return assignments, rows.Err()
}

func (r *assignmentRepository) FindAllHistory(ctx context.Context) ([]domains.Assignment, error) {
	rows, err := r.pool.Query(ctx, selectAllHistory, domains.StatusCompleted)
	if err != nil {
		return nil, fmt.Errorf("AssignmentRepo.FindAllHistory: %w", err)
	}
	defer rows.Close()

	var assignments []domains.Assignment
	for rows.Next() {
		a := domains.Assignment{Quiz: &domains.Quiz{}}
		var quizTitle, studentName string
		if err := rows.Scan(
			&a.ID, &a.StudentID, &a.QuizID, &a.TotalPoint, &a.ScoreEarned, &a.Status,
			&a.StatusName, &a.StartedAt, &a.CompletedAt,
			&quizTitle, &studentName,
		); err != nil {
			return nil, fmt.Errorf("AssignmentRepo.FindAllHistory scan: %w", err)
		}

		a.Quiz.Title = quizTitle
		a.StudentName = studentName
		assignments = append(assignments, a)
	}

	return assignments, rows.Err()
}

func (r *assignmentRepository) QuizCompletedByStudentID(ctx context.Context, studentID string, quizID int) (bool, error) {
	var exist bool
	err := r.pool.QueryRow(
		ctx, selectQuizCompletedAssignmentByUserID, studentID, quizID, domains.StatusCompleted,
	).Scan(&exist)

	if err != nil {
		return false, fmt.Errorf("AssignmentRepo.QuizCompleted: %w", err)
	}

	return exist, nil
}

func (r *assignmentRepository) FindPendingEssays(ctx context.Context) ([]domains.PendingEssay, error) {
	rows, err := r.pool.Query(ctx, selectPendingEssays)
	if err != nil {
		return nil, fmt.Errorf("AssignmentRepo.FindPendingEssays: %w", err)
	}
	defer rows.Close()

	var items []domains.PendingEssay
	for rows.Next() {
		var item domains.PendingEssay
		if err := rows.Scan(
			&item.AssignmentID,
			&item.AssignmentHistoryID,
			&item.StudentName,
			&item.QuizTitle,
			&item.QuestionID,
			&item.QuestionText,
			&item.MaxPoint,
			&item.StudentAnswer,
		); err != nil {
			return nil, fmt.Errorf("AssignmentRepo.FindPendingEssays scan: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *assignmentRepository) UpdateEssayScore(ctx context.Context, historyID, assignmentID int, score float64) error {
	tag, err := r.pool.Exec(ctx, updateEssayScore, score, historyID, assignmentID)
	if err != nil {
		return fmt.Errorf("AssignmentRepo.UpdateEssayScore: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrorNotFound
	}
	return nil
}

func (r *assignmentRepository) RecalcAssignmentScore(ctx context.Context, assignmentID int) error {
	_, err := r.pool.Exec(ctx, recalcAssignmentScore, assignmentID)
	if err != nil {
		return fmt.Errorf("AssignmentRepo.RecalcAssignmentScore: %w", err)
	}
	return nil
}