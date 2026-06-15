-- Mengubah tipe data kolom yang sudah ada
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='image_url') THEN
        ALTER TABLE questions ALTER COLUMN image_url TYPE TEXT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='audio_url') THEN
        ALTER TABLE questions ALTER COLUMN audio_url TYPE TEXT;
    END IF;
END $$;

-- Menambah kolom hanya jika BELUM ada
ALTER TABLE question_options 
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS audio_url TEXT;

ALTER TABLE matching_cards 
    ADD COLUMN IF NOT EXISTS left_image_url TEXT,
    ADD COLUMN IF NOT EXISTS left_audio_url TEXT,
    ADD COLUMN IF NOT EXISTS right_image_url TEXT,
    ADD COLUMN IF NOT EXISTS right_audio_url TEXT;
