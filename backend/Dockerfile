FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]



# docker run -p 8000:8000 --env-file ./backend/.env studentsinfo-backend


# docker run -p 8000:8000 -e SUPABASE_URL=your_url -e SUPABASE_KEY=your_key studentsinfo-backend