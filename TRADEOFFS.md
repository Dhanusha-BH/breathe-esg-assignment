# Design Tradeoffs – Breathe ESG Prototype

## 1. Overview

This document outlines the key tradeoffs made during the development of the Breathe ESG ingestion prototype. Due to the time constraint, several design decisions were simplified to prioritize core functionality: ingestion, normalization, analyst review, and audit readiness.

---

## 2. Real Integrations vs Simulated Data

### Tradeoff: No direct SAP / Utility / Travel API integrations

### What was done:

Instead of connecting to real enterprise systems, we created **synthetic CSV datasets** based on research.

### Why this tradeoff was made:

* SAP, Concur, and utility APIs require enterprise credentials
* Integration setup is time-consuming and out of scope
* Assignment explicitly allows fabricated data based on research

### Impact:

✔ Faster development
✔ Focus on data modeling and logic
❌ No real-time ingestion pipelines

---

## 3. CSV Upload vs API-Based Ingestion

### Tradeoff: File upload ingestion instead of live APIs

### Why:

* Simplifies backend design
* Matches how many enterprise exports actually look (SAP CSV dumps, utility exports)
* Easier to test and debug

### Impact:

✔ Easy testing with sample files
✔ Deterministic ingestion flow
❌ No streaming or real-time ingestion

---

## 4. Single Unified Data Model vs Separate Models

### Tradeoff: One `EmissionRecord` model instead of separate tables

### Alternative:

* SAPRecord
* UtilityRecord
* TravelRecord

### Why unified model was chosen:

* Simplifies analyst dashboard
* Easier filtering and reporting
* Centralized audit system

### Impact:

✔ Easier querying
✔ Simplified review workflow
❌ Less source-specific schema flexibility

---

## 5. Simplified Normalization Logic

### Tradeoff: Basic emission formulas instead of real emission engines

### Implemented:

* SAP: KL → L conversion
* Utility: kWh × 0.82
* Travel: Cost × 0.2

### Why:

Real emission calculation requires:

* industry emission factor databases
* geography-based multipliers
* complex routing and distance calculations

### Impact:

✔ Quick prototype implementation
✔ Demonstrates transformation logic
❌ Not production-grade carbon accuracy

---

## 6. Status System Simplicity

### Tradeoff: Simple status workflow instead of complex state machine

### Implemented statuses:

* PENDING
* APPROVED
* REJECTED
* LOCKED
* FAILED

### Why:

Keeps analyst workflow easy to understand and implement.

### Impact:

✔ Clear audit lifecycle
✔ Easy frontend integration
❌ No advanced workflow rules (e.g. multi-stage approvals)

---

## 7. Basic Suspicious Flagging vs Advanced Detection

### Tradeoff: Rule-based checks instead of ML anomaly detection

### Implemented:

* Missing values
* Invalid numeric data
* Empty fields

### Why:

Machine learning anomaly detection is outside prototype scope.

### Impact:

✔ Simple explainable logic
❌ No predictive anomaly detection

---

## 8. Authentication Scope Limitation

### Tradeoff: JWT auth without full RBAC system

### Why:

Full role-based access control (Admin / Analyst / Auditor separation) requires additional complexity.

### Impact:

✔ Secure API access
✔ Basic user isolation
❌ No granular permission system

---

## 9. Audit System Simplicity

### Tradeoff: Basic audit logging instead of full enterprise-grade audit engine

### Implemented:

* Logs only status changes (approve/reject/lock)

### Why:

Focus was on traceability rather than full compliance engine.

### Impact:

✔ Transparent decision tracking
❌ No diff-level field auditing

---

## 10. Multi-Tenancy Partial Implementation

### Tradeoff: Logic implemented but single-company dataset used

### Why:

* Backend supports multiple companies
* Frontend/demo uses only one company (Green Technologies)

### Impact:

✔ Future-ready architecture
✔ Easy to extend
❌ Not fully demonstrated in UI

---

## 11. Storage Choice (PostgreSQL vs Advanced Data Warehouse)

### Tradeoff: Relational DB instead of analytics warehouse

### Why:

PostgreSQL is sufficient for:

* structured ESG data
* filtering
* analyst workflows

### Impact:

✔ Simple and fast setup
❌ Not optimized for large-scale analytics pipelines

---

## 12. Final Design Philosophy

The system prioritizes:

> “Correct system design and workflow clarity over production-scale complexity.”

Focus areas:

* ingestion realism
* normalization logic
* analyst usability
* audit traceability
