-- USERS
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  starter_card INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active | suspended | pending
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- TASKS
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  reward_tokens INTEGER NOT NULL,
  provider TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  daily_limit INTEGER DEFAULT 5
);

-- USER TASK COMPLETIONS
CREATE TABLE user_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  task_id INTEGER,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, task_id, completed_at)
);

-- TRANSACTIONS (WITHDRAWALS)
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT, -- withdraw
  tokens INTEGER,
  amount_kes INTEGER,
  status TEXT DEFAULT 'pending', -- pending | approved | paid | rejected
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- USD EARNINGS (YOU)
CREATE TABLE earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT,
  usd REAL,
  kes INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- EXCHANGE RATE HISTORY
CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usd_to_kes INTEGER,
  set_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN LOGS
CREATE TABLE admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT,
  data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- DEFAULT TASKS
INSERT INTO tasks (title, reward_tokens, provider, daily_limit) VALUES
('Complete CPA Offer', 100, 'CPA', 2),
('Install Sponsored App', 60, 'APP', 2),
('Answer Short Survey', 40, 'SURVEY', 3),
('Watch Sponsored Ad', 10, 'ADS', 20),
('Invite Verified User', 100, 'REFERRAL', 5),
('Read Article & Answer', 30, 'CONTENT', 5),
('Daily Check-in', 5, 'INTERNAL', 1);
