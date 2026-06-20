-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INT,
    education VARCHAR(100),
    skill_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    hours_per_day INT DEFAULT 2,
    learning_style VARCHAR(50) DEFAULT 'visual', -- visual, reading, practical
    interests VARCHAR(255),
    xp INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    role VARCHAR(20) DEFAULT 'user', -- user, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. GOALS Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_months INT NOT NULL,
    knowledge_level VARCHAR(50) NOT NULL,
    daily_time_commitment INT NOT NULL, -- in hours
    completion_percentage NUMERIC(5, 2) DEFAULT 0.00,
    risk_score NUMERIC(4, 3) DEFAULT 0.000, -- 0.000 (no risk) to 1.000 (extreme risk)
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 3. MILESTONES Table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    target_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TASKS Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_minutes INT DEFAULT 60,
    order_index INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RESOURCES Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- book, course, youtube, article, documentation
    url VARCHAR(512) NOT NULL,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACHIEVEMENTS Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_key VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. NOTIFICATIONS Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- risk_alert, milestone_unlock, streak_update, system
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimizations
CREATE INDEX idx_goals_user_id ON goals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX idx_resources_milestone_id ON resources(milestone_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id) WHERE is_read = FALSE;

-- Insert initial dummy Admin user for quick system checks
-- Password hash for 'admin123'
INSERT INTO users (email, password_hash, full_name, role, xp, current_streak)
VALUES ('admin@example.com', '$2a$10$iF7wK5N0N160g29z2WvCdeL7B.2f7cM15e6BvLd6W5/D60P5.7r7K', 'System Administrator', 'admin', 500, 10)
ON CONFLICT (email) DO NOTHING;

-- Password hash for 'user123'
INSERT INTO users (email, password_hash, full_name, role, xp, current_streak)
VALUES ('user@example.com', '$2a$10$H71B3P87C2O75O8M6E9F.eFf6f.D60P5.7r7KH71B3P87C2O75O8M6', 'Alice Dev', 'user', 120, 3)
ON CONFLICT (email) DO NOTHING;
