-- NBTC Microwave — Pre-PM Survey Cloudflare D1 Migration 0004
-- Feature: Round Status Management & Lock Protection (Rounds 1–18)
-- Table: inspection_rounds

CREATE TABLE IF NOT EXISTS inspection_rounds (
    round_number INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'closed'
    closed_at TEXT DEFAULT NULL,
    closed_by TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL
);

INSERT OR IGNORE INTO inspection_rounds (round_number, status) VALUES
  (1, 'open'), (2, 'open'), (3, 'open'), (4, 'open'), (5, 'open'), (6, 'open'),
  (7, 'open'), (8, 'open'), (9, 'open'), (10, 'open'), (11, 'open'), (12, 'open'),
  (13, 'open'), (14, 'open'), (15, 'open'), (16, 'open'), (17, 'open'), (18, 'open');

