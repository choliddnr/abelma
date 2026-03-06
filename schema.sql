DROP TABLE IF EXISTS GameState;

CREATE TABLE GameState (
  id INTEGER PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 0,
  weights TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Init data
INSERT INTO GameState (id, score, level, weights) VALUES (1, 0, 0, '{}');
