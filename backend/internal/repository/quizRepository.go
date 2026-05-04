package repository

import (
	"KNDI_E-LEARNING/internal/domains"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	insertQuiz = `
		INSERT INTO quizzes (sensei_id, title, description)
		VALUES ($1, $2, $3)
		RETURNING id, is_published, created_at, updated_at`

	selectQuizByID = `
		SELECT id, sensei_id, title, description, is_published, created_at, updated_at
		FROM quizzes WHERE id = $1`

	selectQuizzesBySenseiID = `
		SELECT id, sensei_id, title, description, is_published, created_at, updated_at
		FROM quizzes
		WHERE sensei_id = $1`

	selectPublishedQuizzes = `
		SELECT id, sensei_id, title, description, is_published, created_at, updated_at
		FROM quizzes WHERE is_published = TRUE
		ORDER BY created_at DESC`

	updateQuiz = `
		UPDATE quizzes
		SET title = $1, description = $2, is_published = $3, updated_at = NOW()
		WHERE id = $4 AND sensei_id = $5
		RETURNING updated_at`

	publishQuiz = `
		UPDATE quizzes
		SET is_published = $1, updated_at = NOW()
		WHERE id = $2 AND sensei_id = $3`

	deleteQuiz = `
		DELETE FROM quizzes WHERE id = $1 AND sensei_id = $2`
)

const (
	insertQuestion = `
		INSERT INTO questions (quiz_id, question_text, question_type, correct_answer, url, point, order_number)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`

	insertOption = `
		INSERT INTO question_options (question_id, option_text, url, is_correct)
		VALUES ($1, $2, $3, $4)
		RETURNING id`

	insertMatchingCard = `
		INSERT INTO matching_cards (question_id, left_text, left_url, right_text, right_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	selectQuestionByQuizID = `
		SELECT id, quiz_id, question_text, question_type, correct_answer, url, point, order_number
		FROM quizzes WHERE quiz_id = $1
		ORDER BY order_number DESC`

	selectOptionsByQuestionID = `
		SELECT id, question_id, option_text, url, is_correct
		FROM question_options WHERE question_id = $1
		ORDER BY id ASC`

	selectMatchingCardsByQuestionID = `
		SELECT id, question_id, left_text, left_url, right_text, right_url
		FROM matching_cards WHERE question_id = $1
		ORDER BY id ASC`

	deleteQuestion = `DELETE FROM questions WHERE id = $1`
)

type QuizRepository interface {
	Create(ctx context.Context, q *domains.Quiz) error
	FindByID(ctx context.Context, id int) (*domains.Quiz, error)
	FindBySenseiID(ctx context.Context, senseiID string) ([]domains.Quiz, error)
	FindByIsPublished(ctx context.Context) ([]domains.Quiz, error)
	Update(ctx context.Context, q *domains.Quiz) error
	Delete(ctx context.Context, id int, senseiID string) error

	AddQuestion(ctx context.Context, q *domains.Question) error
	DeleteQuestion(ctx context.Context, questionID int) error

	LoadQuestionForQuiz(ctx context.Context, quizID int) ([]domains.Question, error)
}

type quizRepository struct {
	pool *pgxpool.Pool
}

func NewQuizRepository(pool *pgxpool.Pool) QuizRepository {
	return &quizRepository{pool: pool}
}

func (r *quizRepository) Create(ctx context.Context, q *domains.Quiz) error {
	return r.pool.QueryRow(ctx, insertQuiz, q.SenseiID, q.Title, q.Description).
				Scan(&q.ID, &q.IsPublished, &q.CreatedAt, &q.UpdatedAt)
}

func (r *quizRepository) FindByID(ctx context.Context, id int) (*domains.Quiz, error) {
	q := &domains.Quiz{}
	err := r.pool.QueryRow(ctx, selectQuizByID, id).
				Scan(&q.ID, &q.SenseiID, &q.Title, &q.Description, &q.IsPublished, &q.CreatedAt, &q.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}

		return nil, fmt.Errorf("QuizRepo.FindByID: %w", err)
	}

	return q, nil
}

func (r *quizRepository) FindBySenseiID(ctx context.Context, senseiID string) ([]domains.Quiz, error) {
	return r.scanQuizzes(ctx, selectQuizzesBySenseiID, senseiID)
}

func (r *quizRepository) FindByIsPublished(ctx context.Context) ([]domains.Quiz, error) {
	return r.scanQuizzes(ctx, selectPublishedQuizzes)
}

func (r *quizRepository) Update(ctx context.Context, q *domains.Quiz) error {
	err := r.pool.QueryRow(ctx, updateQuiz, q.Title, q.Description, q.IsPublished, q.ID, q.SenseiID).
				Scan(&q.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrorNotFound
		}
		
		return fmt.Errorf("QuizRepo.Update: %w", err)
	}
	return nil
}

func (r *quizRepository) Delete(ctx context.Context, id int, senseiID string) error {
	tag, err := r.pool.Exec(ctx, deleteQuiz, id, senseiID)
	if err != nil {
		return fmt.Errorf("QuizRepo.Delete: %w", err)
	}
	
	if tag.RowsAffected() == 0 {
		return ErrorNotFound
	}

	return nil
}

func (r *quizRepository) AddQuestion(ctx context.Context, q *domains.Question) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("QuizRepo.AddQuestion: %w", err)
	}

	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx, insertQuestion,
		q.QuizID, q.QuestionText, q.QuestionType,
		q.CorrectAnswer, q.URL, q.Point, q.OrderNumber,
	).Scan(&q.ID)
	if err != nil {
		return fmt.Errorf("QuizRepo.AddQuestion insert: %w", err)
	}

	switch q.QuestionType {
	case domains.QuestionTypeMultipleChoice:
		for i := range q.Options {
			q.Options[i].QuestionID = q.ID
			err = tx.QueryRow(ctx, insertOption,
				q.ID, q.Options[i].OptionText, q.Options[i].URL, q.Options[i].IsCorrect,
			).Scan(&q.Options[i].ID)
			if err != nil {
				return fmt.Errorf("QuizRepo.AddQuestion option: %w", err)
			}
		}
	
	case domains.QuestionTypeMatchingCard:
		for i := range q.MatchingCards {
			q.MatchingCards[i].QuestionID = q.ID
			err = tx.QueryRow(ctx, insertMatchingCard,
				q.ID,
				q.MatchingCards[i].LeftText, q.MatchingCards[i].LeftURL,
				q.MatchingCards[i].RightText, q.MatchingCards[i].RightURL,
			).Scan(&q.MatchingCards[i].ID)
			if err != nil {
				return fmt.Errorf("QuizRepo.AddQuestion matching card: %w", err)
			}
		}
	}

	return tx.Commit(ctx)
}

func (r *quizRepository) DeleteQuestion(ctx context.Context, questionID int) error {
	tag, err := r.pool.Exec(ctx, deleteQuestion, questionID)
	if err != nil {
		return fmt.Errorf("QuizRepo.Delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrorNotFound
	}

	return nil
}

func (r *quizRepository) LoadQuestionForQuiz(ctx context.Context, quizID int) ([]domains.Question, error) {
	rows, err := r.pool.Query(ctx, selectQuestionByQuizID, quizID)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.LoadQuestion: %w", err)
	}

	defer rows.Close()

	var questions []domains.Question
	for rows.Next() {
		var q domains.Question
		if err := rows.Scan(
			&q.ID, &q.QuizID, &q.QuestionText, &q.QuestionType,
			&q.CorrectAnswer, &q.URL, &q.Point, &q.OrderNumber,
		); err != nil {
			return nil, fmt.Errorf("QuizRepo.LoadQuestion scan: %w", err)
		}
		questions = append(questions, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("QuizRepo.LoadQuestion rows: %w", err)
	}

	if len(questions) == 0 {
		return questions, nil
	}

	batch := &pgx.Batch{}
	for _, q := range questions {
		switch q.QuestionType {
		case domains.QuestionTypeMultipleChoice:
			batch.Queue(selectOptionsByQuestionID, q.ID)
		case domains.QuestionTypeMatchingCard:
			batch.Queue(selectMatchingCardsByQuestionID, q.ID)
		}
	}

	if batch.Len() == 0 {
		return questions, nil
	}

	br := r.pool.SendBatch(ctx, batch)
	defer br.Close()

	batchIdx := 0
	for i := range questions {
		switch questions[i].QuestionType {
		case domains.QuestionTypeMultipleChoice:
			optRows, err := br.Query()
			if err != nil {
				return nil, fmt.Errorf("QuizRepo.batch options: %w", err)
			}

			for optRows.Next() {
				var o domains.QuestionOptions
				if err := optRows.Scan(&o.ID, &o.QuestionID, &o.OptionText, &o.URL, &o.IsCorrect); err != nil {
					optRows.Close()
					return nil, fmt.Errorf("QuizRepo.batch option scan: %w", err)
				}
				questions[i].Options = append(questions[i].Options, o)
			}
			optRows.Close()
			batchIdx++
		
		case domains.QuestionTypeMatchingCard:
			cardRows, err := br.Query()
			if err != nil {
				return nil, fmt.Errorf("QuizRepo.Batch cards: %w", err)
			}

			for cardRows.Next() {
				var c domains.MatchingCard
				if err := cardRows.Scan(
					&c.ID, 
					&c.QuestionID, &c.LeftText, &c.LeftURL, 
					&c.RightText, &c.RightURL,
				); err != nil {
					cardRows.Close()
					return nil, fmt.Errorf("QuizRepo.Batch scan cards: %w", err)
				}
				questions[i].MatchingCards = append(questions[i].MatchingCards, c)
			}
			cardRows.Close()
			batchIdx++
		}
	}

	_ = batchIdx
	
	return questions, nil
}

/* HELPER */
func (r *quizRepository) scanQuizzes(ctx context.Context, query string, args ...any) ([]domains.Quiz, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.ScanQuizzes: %w", err)
	}

	defer rows.Close()

	var quizzes []domains.Quiz
	for rows.Next() {
		var q domains.Quiz
		if err := rows.Scan(&q.ID, &q.SenseiID, &q.Title, &q.Description, &q.IsPublished, &q.CreatedAt, &q.UpdatedAt); err != nil {
			return nil, fmt.Errorf("QuizRepo.ScanQuizzes scan: %w", err)
		}

		quizzes = append(quizzes, q)
	}

	return quizzes, rows.Err()
}