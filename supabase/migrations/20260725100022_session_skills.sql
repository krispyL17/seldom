-- Skills trained per session + team session flag (halves skill credit)
ALTER TABLE training_sessions
  ADD COLUMN IF NOT EXISTS skills_trained jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS team_session boolean NOT NULL DEFAULT false;
