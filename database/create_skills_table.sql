-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  category VARCHAR(100),
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_index for faster sorting
CREATE INDEX idx_skills_order ON skills(order_index);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_updated_at_trigger
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_skills_updated_at();

-- Insert some sample skills
INSERT INTO skills (name, percentage, category, icon, order_index) VALUES
  ('Flutter', 95, 'Frontend', 'flutter', 1),
  ('Dart', 90, 'Language', 'dart', 2),
  ('React', 85, 'Frontend', 'react', 3),
  ('Node.js', 80, 'Backend', 'nodejs', 4),
  ('TypeScript', 85, 'Language', 'typescript', 5),
  ('Firebase', 75, 'Backend', 'firebase', 6),
  ('Git', 90, 'Tools', 'git', 7),
  ('Docker', 70, 'DevOps', 'docker', 8)
ON CONFLICT DO NOTHING;
