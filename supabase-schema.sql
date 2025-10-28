-- Portfolio Dashboard - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- 1. Page Views (Analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  country TEXT,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- 2. Projects Management
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  technologies TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  image_path TEXT,
  icon_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured, order_index);

-- 3. Contact Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status, created_at DESC);

-- 4. Skills
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
  category TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_skills_order ON skills(order_index);

-- 5. Analytics Summary (Daily aggregation for performance)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_views INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public read access (analytics tracking)
CREATE POLICY "Allow public insert for page views" ON page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public read for projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read for skills" ON skills
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert for messages" ON messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 8. Admin policies (requires authentication)
CREATE POLICY "Allow authenticated read all" ON page_views
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated full access projects" ON projects
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read messages" ON messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update messages" ON messages
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access skills" ON skills
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read analytics" ON analytics_daily
  FOR SELECT TO authenticated
  USING (true);

-- 9. Functions for analytics

-- Function to get daily page views
CREATE OR REPLACE FUNCTION get_daily_page_views(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*) as views
  FROM page_views
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular pages
CREATE OR REPLACE FUNCTION get_popular_pages(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  page_path TEXT,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pv.page_path,
    COUNT(*) as view_count
  FROM page_views pv
  WHERE pv.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY pv.page_path
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get total statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT,
  total_projects BIGINT,
  unread_messages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days'),
    (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= NOW() - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM projects),
    (SELECT COUNT(*) FROM messages WHERE status = 'unread');
END;
$$ LANGUAGE plpgsql;

-- 10. Insert sample data (optional - for testing)

-- Sample projects
INSERT INTO projects (title, description, category, technologies, github_url, is_featured, order_index) VALUES
('Foody AI', 'AI-powered food recognition and nutrition tracking app', 'Mobile', ARRAY['Flutter', 'Dart', 'TensorFlow', 'Firebase'], 'https://github.com/mohsenkashefi/foody-ai', true, 1),
('SongBuddy', 'Music streaming and playlist management application', 'Mobile', ARRAY['Flutter', 'Dart', 'Node.js', 'MongoDB'], 'https://github.com/mohsenkashefi/songbuddy', true, 2),
('Password Check', 'Secure password strength checker package', 'Package', ARRAY['Dart', 'Flutter'], 'https://github.com/mohsenkashefi/password-check', false, 3)
ON CONFLICT DO NOTHING;

-- Sample skills
INSERT INTO skills (name, percentage, category, order_index) VALUES
('Flutter', 90, 'Mobile', 1),
('Dart', 90, 'Languages', 2),
('Kotlin', 75, 'Languages', 3),
('TypeScript', 70, 'Languages', 4),
('Node.js', 65, 'Backend', 5),
('MongoDB', 70, 'Database', 6),
('SQL', 75, 'Database', 7),
('AWS', 60, 'Cloud', 8),
('Firebase', 80, 'Backend', 9),
('REST API', 85, 'Backend', 10),
('Git', 85, 'Tools', 11),
('Docker', 60, 'Tools', 12)
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully! 🎉' as status;
