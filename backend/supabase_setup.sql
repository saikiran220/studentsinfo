-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);
