-- Track currently playing song + sync timestamp for all clients
ALTER TABLE session
    ADD COLUMN current_song_id UUID REFERENCES song(id),
    ADD COLUMN song_started_at TIMESTAMP;

CREATE INDEX idx_session_current_song_id ON session(current_song_id);
