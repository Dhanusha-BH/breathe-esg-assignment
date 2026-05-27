# Architectural and Design Decisions – Breathe ESG Prototype

## 1. Overview

This document explains the key design decisions taken during the development of the Breathe ESG ingestion prototype. It focuses on why certain approaches were chosen, what alternatives were considered, and what tradeoffs were made due to the 4-day prototype constraint.

The system ingests emissions data from SAP, Utility, and Travel sources, normalizes it, and provides an analyst review workflow before audit finalization.

---

## 2. Choice of Backend Framework

### Decision: Django REST Framework (DRF)

### Why Django REST Framework was chosen:

* Fast backend development for prototypes
* Built-in ORM simplifies data modeling
* Strong support for authentication (JWT integration)
* Easy integration with PostgreSQL
* Admin and debugging tools available out-of-the-box

### Alternative considered:

* Node.js (Express) or FastAPI

### Reason for rejection:

These would require additional setup for ORM, authentication, and structure, which would slow down prototype delivery.

---

## 3. Database Choice

### Decision: PostgreSQL

### Why PostgreSQL:

* Reliable relational database for structured ESG data
* Strong support for filtering and reporting
* Better suited for multi-tenant systems
* Scales well for enterprise workloads

### Why not SQLite:

* Not suitable for production-like workloads
* Limited concurrency handling
* Not realistic for enterprise ESG systems

---

## 4. Multi-Tenancy Design Decision

### Decision: Company-based filtering architecture

### Implementation approach:

Each record is linked to a `Company` model.

### Current prototype state:

* Only one company exists in the dataset: Green Technologies
* However, full multi-tenancy logic is already implemented in backend code

### Future-ready capability:

* Multiple companies can be added later without changing core logic
* Data is already filtered using company relationship
* User-company mapping exists

### Design choice:

Instead of building separate databases per company, a shared database with company-level isolation was chosen.

### Why:

* Easier analytics aggregation
* Simpler architecture
* Standard SaaS pattern

---

## 5. Data Ingestion Strategy Decision 

### Decision: Simulated enterprise ingestion using CSV files

### Key clarification:

SAP, Utility, and Travel data were **NOT directly integrated from real enterprise systems or APIs**.

Instead:

* I researched real-world formats (SAP exports, utility billing data, Concur/Navan travel structures)
* Based on that research, I designed realistic synthetic CSV datasets
* These CSV files simulate how enterprise data would actually look in production systems

### Why this approach was chosen:

Real SAP / utility / travel integrations require:

* Enterprise credentials
* API access (OData, REST, etc.)
* Paid subscriptions or client systems

These are not feasible in a short prototype timeline.

### What was done instead:

We focused on:

✔ realistic schema design
✔ correct column structure
✔ proper missing data simulation
✔ unit variations (L, KL, kWh, cost-based travel)

### Why this is valid:

The assignment explicitly expects:

> “Part of the assignment is figuring out what these data sources actually look like in the real world.”

So the implementation focuses on realistic simulation rather than direct integration.

---

## 6. Data Model Unification Decision

### Decision: Single `EmissionRecord` model for all sources

### Alternative:

Separate models for:

* SAPRecord
* UtilityRecord
* TravelRecord

### Why unified model was chosen:

* Simplifies analyst dashboard
* Single review workflow
* Easier audit logging
* Unified reporting layer

### Tradeoff:

Some source-specific flexibility is reduced, but handled using:

* `source_type`
* `activity_type`
* `travel_* fields`

---

## 7. Ingestion Format Decision

### Decision: CSV-based ingestion

### Why:

* Matches real-world enterprise exports
* Easy to simulate SAP / utility / travel datasets
* Simplifies backend parsing logic

---

## 8. Normalization Strategy Decisions

### SAP Fuel Data

Convert all fuel units to liters:

* KL → L using × 1000

---

### Utility Data

Convert electricity to emissions:

* kWh × 0.82

---

### Travel Data

Estimate emissions using:

* Cost × 0.2

---

## 9. Record Status Workflow Decision

Statuses:

* PENDING
* APPROVED
* REJECTED
* LOCKED
* FAILED

### Why:

Represents full analyst lifecycle before audit approval.

---

## 10. Analyst Workflow Design Decision

Analyst can directly:

* Approve
* Reject
* Lock for audit

### Key behavior:

Actions are independent and part of a single review flow.

---

## 11. Failed Record Strategy Decision

Invalid records are NOT discarded.

Instead they are stored with:

* status = FAILED
* is_suspicious = True
* failed_reason populated

### Why:

Ensures full traceability of bad data for auditors.

---

## 12. Suspicious Flag Decision

Marks records that may need attention:

* missing fields
* invalid numeric values
* incomplete rows

---

## 13. Audit Logging Decision

Every analyst action is tracked using `AuditLog`:

* APPROVED
* REJECTED
* LOCKED

Ensures full traceability.

---

## 14. Authentication Decision

JWT authentication used for:

* secure API access
* frontend integration
* stateless session handling

---

## 15. Tradeoffs Summary

### What was simplified:

* No real SAP API integration
* No utility PDF parsing
* No Concur/Navan API integration
* No advanced anomaly detection

### Why:

Focused on core ingestion + normalization + review workflow due to 4-day constraint.

---

## 16. Final Design Philosophy

The system prioritizes:

> “Realistic enterprise structure simulation over direct system integration.”

Focus areas:

* ingestion realism
* normalization logic
* analyst usability
* audit readiness
