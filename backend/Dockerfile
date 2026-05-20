# Use lightweight python base image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (sqlite3 etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies list
COPY requirements.txt .

# Install dependencies inside container
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend codebase
COPY . .

# Create database folder to mount persistent volumes
RUN mkdir -p /app/data

# Expose backend service port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
