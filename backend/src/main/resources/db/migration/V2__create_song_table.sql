-- Song catalog
CREATE TABLE song (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    album VARCHAR(255),
    cover_url TEXT,
    duration_seconds INTEGER,
    audio_url TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Per-song timeline data (bass / echo / visual cues)
CREATE TABLE song_detail (
    id UUID PRIMARY KEY,
    song_id UUID NOT NULL REFERENCES song(id) ON DELETE CASCADE,
    timeline JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_song_detail_song_id ON song_detail(song_id);
CREATE INDEX idx_song_detail_timeline ON song_detail USING GIN (timeline);
