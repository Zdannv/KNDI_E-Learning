--  ==========================
--      DATABASE MIGRATION
--  ==========================


CREATE TABLE users {
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(225)    UNIQUE,
    password            VARCHAR(225),
    role                VARCHAR(8),
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),
}

CREATE TABLE materials {
    id                  SERIAL          PRIMARY KEY,
    user_id             UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(225)    NOT NULL,
    description         VARCHAR(225),
    file_path           VARCHAR(511),
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),
}

CREATE TABLE quizzes {
    id                  SERIAL          PRIMARY KEY,
    sensei_id           UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(225)    NOT NULL,
    description         VARCHAR(225),
    is_published        BOOLEAN         DEFAULT false,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),
}

CREATE TABLE questions {
    id                  SERIAL          PRIMARY KEY,
    quiz_id             INTEGER         NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text       VARCHAR(225)    NOT NULL,
    question_type       INTEGER         NOT NULL REFERENCES question_type(id),
    correct_answer      VARCHAR(225),
    url                 VARCHAR(511),
    point               FLOAT,
    order_number        INTEGER
}

CREATE TABLE question_options {
    id                  SERIAL          PRIMARY KEY,
    question_id         INTEGER         NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    option_text         VARCHAR(225),
    url                 VARCHAR(511),
    is_correct          BOOLEAN         DEFAULT FALSE
}

CREATE TABLE matching_cards {
    id                  SERIAL          PRIMARY KEY,
    question_id         INTEGER         NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    left_text           VARCHAR(225)    NOT NULL,
    left_url            VARCHAR(551),
    right_text          VARCHAR(225)    NOT NULL,
    right_url           VARCHAR(551)
}

CREATE TABLE assignments {
    id                  SERIAL          PRIMARY KEY,
    student_id          INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id             INTEGER         NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    total_point         FLOAT,
    status              INTEGER         REFERENCES assignment_status(id),
    started_at          TIMESTAMP       DEFAULT NOW(),
    completed_at        TIMESTAMP       DEFAULT NOW()
}

CREATE TABLE assignment_history {
    id                  SERIAL          PRIMARY KEY,
    assignment_id       INTEGER         NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    question_id         INTEGER         NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_option_id  INTEGER         REFERENCES question_options(id),
    matching_card_id    INTEGER         REFERENCES matching_cards(id),
    answer_text         VARCHAR(225),
    score_earned        FLOAT,
    created_at          TIMESTAMP       DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),
}

/* ==== ENUM LOOKUP TABLES ==== */
CREATE TABLE question_type {
    id                 SERIAL           PRIMARY KEY,
    name               VARCHAR(225)     NOT NULL,
}

CREATE TABLE assignment_status {
    id                  SERIAL          PRIMARY KEY,
    name                VARCHAR(225)    NOT NULL,
}

/* SEEDER LOOKUP TABLES */
INSERT INTO question_type (name) VALUES
    ('multiple_choice'),
    ('short_answer'),
    ('matching_card'),
ON CONFLICT DO NOTHING;

INSERT INTO assignment_status (name) VALUES
    ('not_started'),
    ('in_progres'),
    ('completed'),
ON CONFLICT DO NOTHING;