# Build stage
FROM python:3.11-alpine AS builder

WORKDIR /app


# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-alpine AS production

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Build args
ARG FLASK_ENV=production 
ARG PORT=8000

# Set environment variables
ENV FLASK_ENV=${FLASK_ENV}
ENV PORT=${PORT}
ENV PYTHONUNBUFFERED=1

# Copy application code
COPY backend/ .

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE ${PORT}

# Run the application
CMD ["python", "app/app.py"]