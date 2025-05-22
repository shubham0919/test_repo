-- waitlist_entries table
CREATE TABLE waitlist_entries (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE waitlist_entries IS 'Stores email addresses collected from the landing page waitlist.';
COMMENT ON COLUMN waitlist_entries.email IS 'The email address of the user who joined the waitlist.';
