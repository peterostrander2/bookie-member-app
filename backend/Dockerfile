FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Default port (Railway sets PORT env var)
ENV PORT=8000

# Run the application using shell form for variable expansion
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
