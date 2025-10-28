# SQL Runner App

A full-stack web application for executing SQL queries with an interactive interface. Built with Flask (Python) backend and React (Vite) frontend.

## 🔗 Live Deployment (HTTP only)

- **Frontend (ALB):** `http://sql-frontend-lb-1605016243.ap-south-2.elb.amazonaws.com`
- **Backend API (ALB):** `http://sql-backend-lb-735475995.ap-south-2.elb.amazonaws.com`

Note: Access using http, not https (no TLS configured for this assignment).

## 🚀 What I Built (High-level Summary)

- Implemented CI/CD with AWS CodeBuild to build Docker images for frontend and backend, and pushed images to Amazon ECR.
- Set up Continuous Delivery on AWS ECS (EC2 instances) with task definitions and services behind an Application Load Balancer (ALB).
- Added query history in the UI (client-side persisted) to quickly rerun recent queries.
- Integrated structured backend logging and enabled metrics and log collection via Amazon CloudWatch (logs for API usage, query execution status, table listing, and health checks).
- Produced a production-grade deployment with separate frontend and backend services, ALB, ECR image versioning, and ECS blue/green-ready pipeline artifacts.

> Note: Production ELB endpoints are served over HTTP for this assignment; use http (not https) when accessing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Production Deployment (AWS)](#production-deployment-aws)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)


## ✨ Features

- **Interactive SQL Query Editor** - Write and execute SQL queries in real-time
- **Smart Results Display** - Tables for SELECT queries, status messages for modifications
- **Query Type Detection** - Automatically detects INSERT, UPDATE, DELETE, CREATE, DROP, ALTER queries
- **Query History (new)** - Recent queries are stored locally (up to 7) so you can quickly re-run or clear them
- **Detailed Feedback** - Success messages, warnings, and error handling
- **Table Browser** - View all tables and their schemas
- **Centralized Logging (new)** - Backend logs structured events for CloudWatch (queries received, successes/failures, table fetches)
- **Metrics & Dashboards (new)** - CloudWatch log streams and metrics can be visualized in dashboards for health and usage
- **Sample Data** - Pre-loaded with sample Customers, Orders, and Shippings tables

## 🛠 Tech Stack

### Backend
- **Python 3.x**
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite3** - Database
- **Structured Logging** - Python `logging` for CloudWatch ingestion

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **JavaScript/JSX** - Programming language
- **LocalStorage Query History** - Client-side persistence for recent queries

### DevOps / AWS (Deployment)
- **AWS CodeBuild** - CI builds container images
- **Amazon ECR** - Container registry for frontend/backend images
- **AWS ECS (with EC2 instances)** - Container orchestration for services
- **Elastic Load Balancer (ALB)** - Public access to services
- **Amazon CloudWatch** - Logs and metrics (dashboards)

## 📦 Prerequisites

### Backend
- Python 3.8 or higher
- pip (Python package installer)

### Frontend
- Node.js 16.x or higher
- Yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sql-runner-app
````

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
```

## 🎯 Running the Application

## 🌍 Environment Variables

### Backend (`backend/.env`)

```
DATABASE_PATH=../database/sql_runner.db
FRONTEND_URL=http://localhost:5173
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:8000
```


### Start Backend Server

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # On macOS/Linux
python app/app.py
```

The backend server will start on: **[http://localhost:8000](http://localhost:8000)**

**Note:** The database will be automatically created and populated with sample data on the first run.

### Start Frontend Development Server

```bash
# In a new terminal, navigate to frontend directory
cd frontend
yarn dev
```

The frontend will start on: **[http://localhost:5173](http://localhost:5173)** (or another port if 5173 is busy)

## 🏭 Production Deployment (AWS)

This project is deployed as a production-grade setup on AWS:

- **CI/CD:**
  - CodeBuild pipelines for both frontend and backend.
  - Docker images are built and tagged with the Git SHA, then pushed to **Amazon ECR**.
  - `imagedefinitions.json` artifacts enable ECS deployment updates.
- **ECS (EC2 instances):**
  - Task definitions for frontend and backend services.
  - Services run behind **Application Load Balancers (ALB)** for public access.
- **CloudWatch:**
  - Backend emits structured logs (query received, success/error, table list counts, health) for central visibility.
  - Metrics and dashboards can be configured to monitor health, traffic, and errors.

> Important: For this assignment deployment, endpoints use **HTTP only**. Access using `http://` (not `https://`).

## 🔌 API Endpoints

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/`                        | Health check                     |
| POST   | `/api/query`               | Execute SQL query                |
| GET    | `/api/tables`              | Get all table names              |
| GET    | `/api/tables/<table_name>` | Get table schema and sample data |

### Example API Usage

**Execute Query:**

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM Customers LIMIT 5"}'
```

**Get All Tables:**

```bash
curl http://localhost:8000/api/tables
```

## 💡 Usage

1. **Open the Application**

   * Navigate to `http://localhost:5173` in your browser

2. **Write SQL Queries**

   * Type your SQL query in the editor panel
   * Examples:

```sql
     SELECT * FROM Customers;
     SELECT * FROM Orders WHERE amount > 500;
     UPDATE Customers SET age = 31 WHERE first_name = 'John';
     INSERT INTO Customers (first_name, last_name, age, country) VALUES ('Jane', 'Smith', 25, 'USA');
     DELETE FROM Orders WHERE order_id = 1;
```

3. **Execute Queries**

   * Click the "Run Query" button or use keyboard shortcut
   * View results in the results panel below

4. **Understand Results**

   * **SELECT queries**: Display data in a table format
   * **INSERT/UPDATE/DELETE**: Show success message with affected row count
   * **CREATE/DROP/ALTER**: Show schema modification confirmation
   * **Errors**: Display detailed error messages

---

If you want to test the hosted version directly, use the Live Deployment links at the top.
