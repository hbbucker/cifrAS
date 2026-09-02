CREATE TABLE share_links (
    id UUID PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_expires_at ON share_links(expires_at);
