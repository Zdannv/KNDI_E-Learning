--  ==========================
--      DATABASE MIGRATION
--  ==========================

/* ==== ENUM LOOKUP TABLES ==== */
CREATE TABLE IF NOT EXISTS question_types (
    id                 SERIAL           PRIMARY KEY,
    name               VARCHAR(225)     NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS assignment_statuses (
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(225)    NOT NULL UNIQUE
);

/* ==== CORE TABLE ==== */
CREATE TABLE IF NOT EXISTS users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(225)    UNIQUE,
    email               VARCHAR(225)    UNIQUE,
    password            VARCHAR(225),
    role                VARCHAR(8)      NOT NULL DEFAULT 'student',
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
    id                  SERIAL          PRIMARY KEY,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(225)    NOT NULL,
    description         VARCHAR(225),
    file_path           VARCHAR(511),
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
    id                  SERIAL          PRIMARY KEY,
    sensei_id           UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(225)    NOT NULL,
    description         VARCHAR(225),
    is_published        BOOLEAN         DEFAULT FALSE,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id                  SERIAL          PRIMARY KEY,
    quiz_id             INTEGER         NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text       VARCHAR(225)    NOT NULL,
    question_type       INTEGER         NOT NULL REFERENCES question_types(id),
    correct_answer      VARCHAR(225),
    url                 VARCHAR(511),
    point               FLOAT           DEFAULT 1,
    order_number        INTEGER         DEFAULT 0
);

CREATE TABLE IF NOT EXISTS question_options (
    id                  SERIAL          PRIMARY KEY,
    question_id         INTEGER         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text         VARCHAR(225),
    url                 VARCHAR(511),
    is_correct          BOOLEAN         DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS matching_cards (
    id                  SERIAL          PRIMARY KEY,
    question_id         INTEGER         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    left_text           VARCHAR(225)    NOT NULL,
    left_url            VARCHAR(551),
    right_text          VARCHAR(225)    NOT NULL,
    right_url           VARCHAR(551)
);

CREATE TABLE IF NOT EXISTS assignments (
    id                  SERIAL          PRIMARY KEY,
    student_id          UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id             INTEGER         NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    total_point         FLOAT,
    status              INTEGER         REFERENCES assignment_statuses(id),
    started_at          TIMESTAMP       DEFAULT NOW(),
    completed_at        TIMESTAMP       DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_history (
    id                  SERIAL          PRIMARY KEY,
    assignment_id       INTEGER         NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    question_id         INTEGER         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_option_id  INTEGER         REFERENCES question_options(id),
    matching_card_id    INTEGER         REFERENCES matching_cards(id),
    answer_text         VARCHAR(225),
    score_earned        FLOAT,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW()
);

/* SEEDER LOOKUP TABLES */
INSERT INTO question_types (name) VALUES
    ('multiple_choice'),
    ('short_answer'),
    ('matching_card')
ON CONFLICT DO NOTHING;

INSERT INTO assignment_statuses (name) VALUES
    ('not_started'),
    ('in_progress'),
    ('completed')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_sensei_id ON quizzes(sensei_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_matching_cards_qid ON matching_cards(question_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_quiz_id ON assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_asgn_history_asgn_id ON assignment_history(assignment_id);