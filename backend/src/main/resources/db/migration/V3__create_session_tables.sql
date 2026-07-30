-- Karaoke rooms / lobbies
CREATE TABLE session (
    id UUID PRIMARY KEY,
    invite_code VARCHAR(16) NOT NULL UNIQUE,
    host_user_id UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_session_invite_code ON session(invite_code);
CREATE INDEX idx_session_expires_at ON session(expires_at);

-- Users currently in a session
CREATE TABLE session_users (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL,
    UNIQUE (session_id, user_id)
);

CREATE INDEX idx_session_users_session_id ON session_users(session_id);
CREATE INDEX idx_session_users_user_id ON session_users(user_id);
