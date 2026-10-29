-- NBTC Microwave — Pre-PM Survey Cloudflare D1 Migration 0003
-- Feature: Multi-Round Inspection Management (Rounds 1–18)
-- Adds round_number column and index to surveys table

ALTER TABLE surveys ADD COLUMN round_number INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_surveys_round_number ON surveys (round_number);

