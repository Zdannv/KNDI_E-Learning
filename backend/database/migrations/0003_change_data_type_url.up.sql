ALTER TABLE questions
    ALTER COLUMN image_url   TYPE VARCHAR(511),
    ALTER COLUMN audio_url   TYPE VARCHAR(511);

ALTER TABLE question_options
    ALTER COLUMN image_url   TYPE VARCHAR(511),
    ALTER COLUMN audio_url   TYPE VARCHAR(511);

ALTER TABLE matching_cards
    ALTER COLUMN left_image_url   TYPE VARCHAR(511),
    ALTER COLUMN left_audio_url   TYPE VARCHAR(511),
    ALTER COLUMN right_image_url  TYPE VARCHAR(511),
    ALTER COLUMN right_audio_url  TYPE VARCHAR(511);