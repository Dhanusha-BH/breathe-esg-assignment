# Breathe ESG – Emissions Ingestion & Review Prototype

## 1. Overview

It demonstrates a complete pipeline for:

* ingesting emissions-related data from multiple enterprise sources
* normalizing inconsistent real-world data formats
* enabling analyst review and approval
* maintaining audit-ready records

The system simulates enterprise ESG ingestion workflows commonly found in SAP, utility, and travel systems.

---

## 2. Tech Stack

### Backend

* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication

### Frontend

* React (Vite)

### Other Tools

* Pandas (CSV ingestion)
* Postman (API testing)

---

## 3. Key Features

### 3.1 Multi-Source Data Ingestion

Supports ingestion from:

* SAP Fuel / Procurement (Scope 1)
* Utility Electricity Data (Scope 2)
* Corporate Travel Data (Scope 3)

All data is uploaded via CSV files.

---

### 3.2 Data Normalization

Each source is normalized into a unified structure:

* SAP → unit normalization (L / KL)
* Utility → kWh × emission factor
* Travel → cost-based emission estimate

---

### 3.3 Analyst Review System

Analysts can:

* View all uploaded records
* Identify suspicious or failed records
* Approve / Reject / Lock records

---

### 3.4 Audit Trail

Every action is tracked using an audit log:

* status changes
* reviewer actions
* historical traceability

---

### 3.5 Multi-Tenancy Support

The backend supports multiple companies:

* Data is isolated per company
* Dashboard filters by company
* Architecture is scalable for enterprise use

(Current prototype uses a single demo company: **Green Technologies**)

---

## 4. System Architecture

```
CSV Upload → Django API → Pandas Processing → EmissionRecord DB
                                      ↓
                             Analyst Review Panel
                                      ↓
                          Audit Logs & Final Approval
```

---

## 5. Data Sources

### SAP Data (Scope 1)

* Fuel consumption (Diesel, Petrol)
* Plant-based structure
* Mixed units (L, KL)

### Utility Data (Scope 2)

* Electricity consumption in kWh
* Billing cycle-based data

### Travel Data (Scope 3)

* Employee travel records
* Flight / Train / Hotel / Cab
* Cost-based estimation

---

## 6. Core Models

### EmissionRecord

Central model storing all emissions data:

* source_type
* scope
* activity_type
* raw_value
* normalized_value
* status

### Company

Supports multi-tenancy.

### AuditLog

Tracks all analyst actions.

---

## 7. Record Workflow

```
Upload → PENDING → Analyst Review → APPROVED / REJECTED → LOCKED
```

Invalid records are marked as:

* FAILED
* is_suspicious = True

---

## 8. Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### Login Credentials (Demo Access)

For testing and evaluation purposes, use the following credentials:

Admin Login
* Username: admin
* Password: 1234

## 9. API Endpoints

### Auth

* `POST /api/token/`

### Uploads

* `POST /api/upload-sap/`
* `POST /api/upload-utility/`
* `POST /api/upload-travel/`

### Records

* `GET /api/records/`
* `GET /api/failed-records/`

### Actions

* `POST /api/approve/<id>/`
* `POST /api/reject/<id>/`
* `POST /api/lock/<id>/`

---

## 10. Design Decisions

Key decisions:

* Single unified model for all sources
* CSV-based ingestion instead of direct APIs
* Simplified emission calculations
* Status-based workflow instead of complex state machine

---

## 11. Future Improvements

* Real SAP OData integration
* Utility PDF parsing
* Concur/Navan API integration
* Advanced anomaly detection
* Role-based access control (RBAC)
* Production-grade emission factor database

---

## 12. Deployment

The application is deployed on:

> 🔗 Add deployed URL here

Backend and frontend can be hosted on:

* Render
* Railway
* Vercel (frontend)

---

## 13. Author Notes

This prototype focuses on:

> Realistic ingestion design + clean normalization + analyst workflow clarity

rather than over-engineered production complexity.
