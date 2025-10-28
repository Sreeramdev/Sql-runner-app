FROM python:3.11-alpine AS builder

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-alpine AS production

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

ARG FLASK_ENV=production 
ARG PORT=8000

ENV FLASK_ENV=${FLASK_ENV}
ENV PORT=${PORT}
ENV PYTHONUNBUFFERED=1

COPY . .

RUN mkdir -p database

EXPOSE ${PORT}

# Run the application
CMD ["python", "app/app.py"]
