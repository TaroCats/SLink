CREATE TABLE domains (
    id TEXT PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ssl_cert_path TEXT
);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE links (
    id TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    domain_id TEXT REFERENCES domains(id),
    user_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    click_count INTEGER DEFAULT 0
);

CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_domain ON links(domain_id);
CREATE INDEX idx_links_created_at ON links(created_at DESC);

CREATE TABLE visits (
    id TEXT PRIMARY KEY,
    link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    referer TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(2)
);

CREATE INDEX idx_visits_link_id ON visits(link_id);
CREATE INDEX idx_visits_visited_at ON visits(visited_at DESC);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, password_hash, email, is_admin) 
VALUES ('b4c59914-41e7-4b95-a4b0-8eb7bc8514db', 'admin', '$2b$12$7sA8WyYtDwQX714GsvYl5uhck9k3u3rwmlyjAPtnp.w/SCSJthjHa', 'admin@example.com', 1);

-- Insert default domain
INSERT INTO domains (id, domain, is_primary) 
VALUES ('c4c59914-41e7-4b95-a4b0-8eb7bc8514dc', 'localhost:8080', 1);