package repository

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
		DELETE quizzes WHERE id = $1 AND sensei_id = $2`
)

