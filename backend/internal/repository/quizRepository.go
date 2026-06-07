package repository

import (
	"KNDI_E-LEARNING/internal/domains"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ─── SQL constants ────────────────────────────────────────────────────────────

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
		WHERE sensei_id = $1
		ORDER BY created_at DESC`

	selectPublishedQuizzes = `
		SELECT id, sensei_id, title, description, is_published, created_at, updated_at
		FROM quizzes WHERE is_published = TRUE
		ORDER BY created_at DESC`

	updateQuiz = `
		UPDATE quizzes
		SET title = $1, description = $2, is_published = $3, updated_at = NOW()
		WHERE id = $4 AND sensei_id = $5
		RETURNING updated_at`

	deleteQuiz = `
		DELETE FROM quizzes WHERE id = $1 AND sensei_id = $2`
)

const (
	insertQuestion = `
		INSERT INTO questions (quiz_id, question_text, question_type, correct_answer, image_url, audio_url, point, order_number)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	selectQuestionByID = `
		SELECT id, quiz_id, question_text, question_type, correct_answer, image_url, audio_url, point, order_number
		FROM questions WHERE id = $1`

	selectQuestionByHistoryID = `
	SELECT q.id, q.quiz_id, q.question_text, q.question_type,
		q.correct_answer, q.image_url, q.audio_url, q.point, q.order_number
	FROM assignment_history ah
	JOIN questions q ON q.id = ah.question_id
	WHERE ah.id = $1
		AND ah.assignment_id = $2`


	updateQuestionCore = `
		UPDATE questions
		SET question_text = $1,
			correct_answer = $2,
			image_url = $3,
			audio_url = $4,
			point = $5,
			order_number = $6
		WHERE id = $7`

	insertOption = `
		INSERT INTO question_options (question_id, option_text, image_url, audio_url, is_correct)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`

	updateOption = `
		UPDATE question_options
		SET option_text = $1, image_url = $2, audio_url = $3, is_correct = $4
		WHERE id = $5`

	deleteOptionByID = `DELETE FROM question_options WHERE id = $1`

	insertMatchingCard = `
		INSERT INTO matching_cards (question_id, left_text, left_image_url, left_audio_url, right_text, right_image_url, right_audio_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`

	updateMatchingCard = `
		UPDATE matching_cards
		SET left_text = $1, left_image_url = $2, left_audio_url = $3,
			right_text = $4, right_image_url = $5, right_audio_url = $6
		WHERE id = $7`

	deleteMatchingCardByID = `DELETE FROM matching_cards WHERE id = $1`

	selectQuestionByQuizID = `
		SELECT id, quiz_id, question_text, question_type, correct_answer, image_url, audio_url, point, order_number
		FROM questions
		WHERE quiz_id = $1
		ORDER BY order_number ASC`

	selectQuestionsByQuizIDs = `
		SELECT id, quiz_id, question_text, question_type, correct_answer, image_url, audio_url, point, order_number
		FROM questions
		WHERE quiz_id = ANY($1)
		ORDER BY quiz_id, order_number ASC`

	selectOptionsByQuestionID = `
		SELECT id, question_id, option_text, image_url, audio_url, is_correct
		FROM question_options WHERE question_id = $1
		ORDER BY id ASC`

	selectMatchingCardsByQuestionID = `
		SELECT id, question_id, left_text, left_image_url, left_audio_url, right_text, right_image_url, right_audio_url
		FROM matching_cards WHERE question_id = $1
		ORDER BY id ASC`

	deleteQuestion = `DELETE FROM questions WHERE id = $1`
)

// ─── Interface ────────────────────────────────────────────────────────────────

type QuizRepository interface {
	Create(ctx context.Context, q *domains.Quiz) error
	FindByID(ctx context.Context, id int) (*domains.Quiz, error)
	FindBySenseiID(ctx context.Context, senseiID string) ([]domains.Quiz, error)
	FindByIsPublished(ctx context.Context) ([]domains.Quiz, error)
	Update(ctx context.Context, q *domains.Quiz) error
	Delete(ctx context.Context, id int, senseiID string) error

	FindQuestionByHistoryID(ctx context.Context, historyID, assignmentID int) (*domains.Question, error)
	AddQuestion(ctx context.Context, q *domains.Question) error
	FindQuestionByID(ctx context.Context, id int) (*domains.Question, error)
	UpdateQuestion(ctx context.Context, q *domains.Question) error
	DeleteQuestion(ctx context.Context, questionID int) error

	LoadQuestionForQuiz(ctx context.Context, quizID int) ([]domains.Question, error)
	LoadQuestionsForQuizzes(ctx context.Context, quizIDs []int) (map[int][]domains.Question, error)
}

// ─── Implementation ───────────────────────────────────────────────────────────

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

func (r *quizRepository) FindQuestionByID(ctx context.Context, id int) (*domains.Question, error) {
	q := &domains.Question{}
	err := r.pool.QueryRow(ctx, selectQuestionByID, id).
		Scan(&q.ID, &q.QuizID, &q.QuestionText, &q.QuestionType,
			&q.CorrectAnswer, &q.ImageURL, &q.AudioURL, &q.Point, &q.OrderNumber)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizRepo.FindQuestionByID: %w", err)
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

func (r *quizRepository) FindQuestionByHistoryID(ctx context.Context, historyID, assignmentID int) (*domains.Question, error) {
	q := &domains.Question{}
	err := r.pool.QueryRow(ctx, selectQuestionByHistoryID, historyID, assignmentID).
		Scan(&q.ID, &q.QuizID, &q.QuestionText, &q.QuestionType,
			&q.CorrectAnswer, &q.ImageURL, &q.AudioURL, &q.Point, &q.OrderNumber)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, fmt.Errorf("QuizRepo.FindQuestionByHistoryID: %w", err)
	}
	return q, nil
}


func (r *quizRepository) AddQuestion(ctx context.Context, q *domains.Question) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("QuizRepo.AddQuestion begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx, insertQuestion,
		q.QuizID, q.QuestionText, q.QuestionType,
		q.CorrectAnswer, q.ImageURL, q.AudioURL, q.Point, q.OrderNumber,
	).Scan(&q.ID)
	if err != nil {
		return fmt.Errorf("QuizRepo.AddQuestion insert: %w", err)
	}

	if err := r.insertChildren(ctx, tx, q); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *quizRepository) UpdateQuestion(ctx context.Context, q *domains.Question) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("QuizRepo.UpdateQuestion begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, updateQuestionCore,
		q.QuestionText, q.CorrectAnswer, q.ImageURL, q.AudioURL,
		q.Point, q.OrderNumber, q.ID,
	)
	if err != nil {
		return fmt.Errorf("QuizRepo.UpdateQuestion update core: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrorNotFound
	}

	switch q.QuestionType {
	case domains.QuestionTypeMultipleChoice:
		if err := r.syncOptions(ctx, tx, q); err != nil {
			return err
		}
	case domains.QuestionTypeMatchingCard:
		if err := r.syncMatchingCards(ctx, tx, q); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *quizRepository) DeleteQuestion(ctx context.Context, questionID int) error {
	tag, err := r.pool.Exec(ctx, deleteQuestion, questionID)
	if err != nil {
		return fmt.Errorf("QuizRepo.DeleteQuestion: %w", err)
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
			&q.CorrectAnswer, &q.ImageURL, &q.AudioURL, &q.Point, &q.OrderNumber,
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
	return r.hydrateQuestionsWithDetails(ctx, questions)
}

func (r *quizRepository) LoadQuestionsForQuizzes(ctx context.Context, quizIDs []int) (map[int][]domains.Question, error) {
	if len(quizIDs) == 0 {
		return make(map[int][]domains.Question), nil
	}

	rows, err := r.pool.Query(ctx, selectQuestionsByQuizIDs, quizIDs)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.LoadQuestionsForQuizzes query: %w", err)
	}
	defer rows.Close()

	var questions []domains.Question
	for rows.Next() {
		var q domains.Question
		if err := rows.Scan(
			&q.ID, &q.QuizID, &q.QuestionText, &q.QuestionType,
			&q.CorrectAnswer, &q.ImageURL, &q.AudioURL, &q.Point, &q.OrderNumber,
		); err != nil {
			return nil, fmt.Errorf("QuizRepo.LoadQuestionsForQuizzes scan: %w", err)
		}
		questions = append(questions, q)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("QuizRepo.LoadQuestionsForQuizzes rows: %w", err)
	}

	if len(questions) > 0 {
		var hydErr error
		questions, hydErr = r.hydrateQuestionsWithDetails(ctx, questions)
		if hydErr != nil {
			return nil, hydErr
		}
	}

	result := make(map[int][]domains.Question, len(quizIDs))
	for _, q := range questions {
		result[q.QuizID] = append(result[q.QuizID], q)
	}
	return result, nil
}

func (r *quizRepository) syncOptions(ctx context.Context, tx pgx.Tx, q *domains.Question) error {
	existingRows, err := r.loadExistingOptions(ctx, tx, q.ID)
	if err != nil {
		return err
	}

	incoming := q.Options
	minLen := len(existingRows)
	if len(incoming) < minLen {
		minLen = len(incoming)
	}

	for i := 0; i < minLen; i++ {
		if _, err := tx.Exec(ctx, updateOption,
			incoming[i].OptionText,
			incoming[i].ImageURL,
			incoming[i].AudioURL,
			incoming[i].IsCorrect,
			existingRows[i].ID,
		); err != nil {
			return fmt.Errorf("QuizRepo.syncOptions update: %w", err)
		}
	}

	for i := minLen; i < len(incoming); i++ {
		var newID int
		if err := tx.QueryRow(ctx, insertOption,
			q.ID,
			incoming[i].OptionText,
			incoming[i].ImageURL,
			incoming[i].AudioURL,
			incoming[i].IsCorrect,
		).Scan(&newID); err != nil {
			return fmt.Errorf("QuizRepo.syncOptions insert extra: %w", err)
		}
	}

	for i := minLen; i < len(existingRows); i++ {
		if _, err := tx.Exec(ctx, deleteOptionByID, existingRows[i].ID); err != nil {
			return fmt.Errorf("QuizRepo.syncOptions delete surplus: %w", err)
		}
	}

	return nil
}

func (r *quizRepository) syncMatchingCards(ctx context.Context, tx pgx.Tx, q *domains.Question) error {
	existingRows, err := r.loadExistingMatchingCards(ctx, tx, q.ID)
	if err != nil {
		return err
	}

	incoming := q.MatchingCards
	minLen := len(existingRows)
	if len(incoming) < minLen {
		minLen = len(incoming)
	}

	for i := 0; i < minLen; i++ {
		if _, err := tx.Exec(ctx, updateMatchingCard,
			incoming[i].LeftText,
			incoming[i].LeftImageURL,
			incoming[i].LeftAudioURL,
			incoming[i].RightText,
			incoming[i].RightImageURL,
			incoming[i].RightAudioURL,
			existingRows[i].ID,
		); err != nil {
			return fmt.Errorf("QuizRepo.syncMatchingCards update: %w", err)
		}
	}

	for i := minLen; i < len(incoming); i++ {
		var newID int
		if err := tx.QueryRow(ctx, insertMatchingCard,
			q.ID,
			incoming[i].LeftText, incoming[i].LeftImageURL, incoming[i].LeftAudioURL,
			incoming[i].RightText, incoming[i].RightImageURL, incoming[i].RightAudioURL,
		).Scan(&newID); err != nil {
			return fmt.Errorf("QuizRepo.syncMatchingCards insert extra: %w", err)
		}
	}

	for i := minLen; i < len(existingRows); i++ {
		if _, err := tx.Exec(ctx, deleteMatchingCardByID, existingRows[i].ID); err != nil {
			return fmt.Errorf("QuizRepo.syncMatchingCards delete surplus: %w", err)
		}
	}

	return nil
}

func (r *quizRepository) loadExistingOptions(ctx context.Context, tx pgx.Tx, questionID int) ([]domains.QuestionOptions, error) {
	rows, err := tx.Query(ctx, selectOptionsByQuestionID, questionID)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.loadExistingOptions: %w", err)
	}
	defer rows.Close()

	var opts []domains.QuestionOptions
	for rows.Next() {
		var o domains.QuestionOptions
		if err := rows.Scan(&o.ID, &o.QuestionID, &o.OptionText, &o.ImageURL, &o.AudioURL, &o.IsCorrect); err != nil {
			return nil, fmt.Errorf("QuizRepo.loadExistingOptions scan: %w", err)
		}
		opts = append(opts, o)
	}
	return opts, rows.Err()
}

func (r *quizRepository) loadExistingMatchingCards(ctx context.Context, tx pgx.Tx, questionID int) ([]domains.MatchingCard, error) {
	rows, err := tx.Query(ctx, selectMatchingCardsByQuestionID, questionID)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.loadExistingMatchingCards: %w", err)
	}
	defer rows.Close()

	var cards []domains.MatchingCard
	for rows.Next() {
		var c domains.MatchingCard
		if err := rows.Scan(
			&c.ID, &c.QuestionID,
			&c.LeftText, &c.LeftImageURL, &c.LeftAudioURL,
			&c.RightText, &c.RightImageURL, &c.RightAudioURL,
		); err != nil {
			return nil, fmt.Errorf("QuizRepo.loadExistingMatchingCards scan: %w", err)
		}
		cards = append(cards, c)
	}
	return cards, rows.Err()
}

func (r *quizRepository) insertChildren(ctx context.Context, tx pgx.Tx, q *domains.Question) error {
	switch q.QuestionType {
	case domains.QuestionTypeMultipleChoice:
		for i := range q.Options {
			q.Options[i].QuestionID = q.ID
			if err := tx.QueryRow(ctx, insertOption,
				q.ID,
				q.Options[i].OptionText,
				q.Options[i].ImageURL,
				q.Options[i].AudioURL,
				q.Options[i].IsCorrect,
			).Scan(&q.Options[i].ID); err != nil {
				return fmt.Errorf("QuizRepo.insertChildren option: %w", err)
			}
		}

	case domains.QuestionTypeMatchingCard:
		for i := range q.MatchingCards {
			q.MatchingCards[i].QuestionID = q.ID
			if err := tx.QueryRow(ctx, insertMatchingCard,
				q.ID,
				q.MatchingCards[i].LeftText, q.MatchingCards[i].LeftImageURL, q.MatchingCards[i].LeftAudioURL,
				q.MatchingCards[i].RightText, q.MatchingCards[i].RightImageURL, q.MatchingCards[i].RightAudioURL,
			).Scan(&q.MatchingCards[i].ID); err != nil {
				return fmt.Errorf("QuizRepo.insertChildren matching card: %w", err)
			}
		}
	}
	return nil
}

func (r *quizRepository) hydrateQuestionsWithDetails(ctx context.Context, questions []domains.Question) ([]domains.Question, error) {
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
				return nil, fmt.Errorf("QuizRepo.hydrate options: %w", err)
			}
			for optRows.Next() {
				var o domains.QuestionOptions
				if err := optRows.Scan(
					&o.ID, &o.QuestionID, &o.OptionText,
					&o.ImageURL, &o.AudioURL, &o.IsCorrect,
				); err != nil {
					optRows.Close()
					return nil, fmt.Errorf("QuizRepo.hydrate option scan: %w", err)
				}
				questions[i].Options = append(questions[i].Options, o)
			}
			optRows.Close()
			batchIdx++

		case domains.QuestionTypeMatchingCard:
			cardRows, err := br.Query()
			if err != nil {
				return nil, fmt.Errorf("QuizRepo.hydrate cards: %w", err)
			}
			for cardRows.Next() {
				var c domains.MatchingCard
				if err := cardRows.Scan(
					&c.ID, &c.QuestionID,
					&c.LeftText, &c.LeftImageURL, &c.LeftAudioURL,
					&c.RightText, &c.RightImageURL, &c.RightAudioURL,
				); err != nil {
					cardRows.Close()
					return nil, fmt.Errorf("QuizRepo.hydrate card scan: %w", err)
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

func (r *quizRepository) scanQuizzes(ctx context.Context, query string, args ...any) ([]domains.Quiz, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("QuizRepo.scanQuizzes: %w", err)
	}
	defer rows.Close()

	var quizzes []domains.Quiz
	for rows.Next() {
		var q domains.Quiz
		if err := rows.Scan(
			&q.ID, &q.SenseiID, &q.Title, &q.Description,
			&q.IsPublished, &q.CreatedAt, &q.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("QuizRepo.scanQuizzes scan: %w", err)
		}
		quizzes = append(quizzes, q)
	}
	return quizzes, rows.Err()
}