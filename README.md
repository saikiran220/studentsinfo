# Student Data Entry System

A modern web application for managing student data with a React frontend, Python FastAPI backend, and Supabase database.

## Features

- Clean and modern UI/UX design
- Student data entry form (Name, Father Name, Email)
- Real-time data display
- Form validation
- Responsive design

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Python FastAPI
- **Database**: Supabase

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Supabase account (free tier works)

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the Supabase dashboard, go to SQL Editor
3. Run the following SQL to create the `students` table:

```sql
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX idx_students_email ON students(email);
```

4. Go to Settings > API and copy your:
   - Project URL (SUPABASE_URL)
   - Anon/Public Key (SUPABASE_KEY)

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

6. Edit `.env` and add your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

7. Run the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Fill in the student form with:
   - Student Name
   - Father Name
   - Email Address
3. Click "Submit" to save the data
4. View all registered students below the form

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styles
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

- `GET /` - Health check
- `POST /api/students` - Create a new student
- `GET /api/students` - Get all students

## Notes

- Make sure both backend and frontend servers are running
- The backend CORS is configured to allow requests from `localhost:3000` and `localhost:5173`
- All data is stored in Supabase and persists across sessions
