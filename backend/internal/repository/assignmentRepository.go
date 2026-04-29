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
		SELECT a.id, a.student_id, a.quiz_id, a.total_point, a.status,
			   s.name AS status_name, a.started_at, a.completed_at,
			   q.title AS quiz_title
		FROM assignments a
		JOIN assignment_status s ON s.id = a.status
		JOIN quizzes q ON q.id = a.quiz_id
		WHERE a.student_id = $1 AND a.status = $2
		ORDER BY a.completed_at DESC`

	finaliseAssignment = `
		UPDATE assignments
		SET total_point = $1, status = $2, completed_at = $3
		WHERE id = $4`

	insertAssignmentHistory = `
		INSERT INTO assignment_history
			(assignment_id, question_id, question_option_id, matching_card_id, answer_text, score_earned)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`

	selectHistoryByAssignmentID = `
		SELECT ah.id, ah.assignment_id, ah.question_id,
			ah.question_option_id, ah.matching_card_id,
			ah.answer_text, ah.score_earned, ah.created_at, ah.updated_at,
			q.question_text
		FROM   assignment_history ah
		JOIN   questions q ON q.id = ah.question_id
		WHERE  ah.assignment_id = $1
		ORDER  BY ah.id ASC`
)

type AssignmentRepository interface {
	Create(ctx context.Context, a *domains.Assignment) error
	FindByID(ctx context.Context, id int) (*domains.Assignment, error)
	Finalise(ctx context.Context, id int, totalPoint float64, completedAt time.Time, status int) error
	SaveHistory(ctx context.Context, items []domains.AssignmentHistory) error
	FindHistoryByAssignmentID(ctx context.Context, assignmentID int) ([]domains.AssignmentHistory, error)
	FindHistoryByStudentID(ctx context.Context, studentID string) ([]domains.Assignment, error)
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

func (r *assignmentRepository) Finalise(ctx context.Context, id int, totalPoint float64, completedAt time.Time, status int) error {
	_, err := r.pool.Exec(ctx, finaliseAssignment, totalPoint, status, completedAt, id)
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
			&h.AnswerText, &h.ScoreEarned, &h.CreatedAt, &h.UpdatedAt,
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
			&a.ID, &a.StudentID, &a.QuizID, &a.TotalPoint, &a.Status,
			&a.StatusName, &a.StartedAt, &a.CompletedAt, &quizTitle,
		); err != nil {
			return nil, fmt.Errorf("AssignmentRepo.FindHistoryStudent scan: %w", err)
		}

		a.Quiz.Title = quizTitle
		assignments = append(assignments, a)
	}

	return assignments, rows.Err()
}