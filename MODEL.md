# Data Model Design – Breathe ESG Prototype

## 1. Overview

The goal of this prototype is to ingest emissions-related activity data from multiple enterprise sources, normalize the data into a single structure, and provide an analyst review workflow before records are finalized for audit purposes.

The system was built using:

* Backend: Django REST Framework
* Frontend:React
* Authentication:JWT (JSON Web Token)
* Database:SQLite3



The prototype supports ingestion from three realistic enterprise source types:

1. SAP fuel/procurement data → Scope 1
2. Utility electricity data → Scope 2
3. Corporate travel data → Scope 3

All source data is normalized into a single model (`EmissionRecord`) to simplify downstream review, analytics, and auditability.

---

# 2. Core Data Model

The system uses three primary models:

1. `Company`
2. `EmissionRecord`
3. `AuditLog`

---

## 3. Company Model

### Purpose

The `Company` model enables **multi-tenancy**, allowing multiple client organizations to exist in the same system while keeping their data isolated.

### Fields

* `name`
* `created_at`
* `users`

### Design Decision

A many-to-many relationship between `User` and `Company` was chosen so that:

* one company can have multiple users
* one user can belong to multiple companies if needed in the future

This keeps the prototype extensible for enterprise use.

### Current Prototype Implementation

As of now, the prototype contains data for **one company only**, which is:

**Green Technologies**

However, the backend logic and functions required for **multi-tenancy have already been implemented**.

This means:

* multiple companies can be added later
* data isolation logic already exists
* records are filtered company-wise

For example:

If multiple companies are added, when a user selects a particular company, only the records related to that specific company will be displayed.

### Why this matters

In a real ESG platform, multiple enterprise customers would use the same system. Company-level isolation ensures that users only see records belonging to their organization.

Example:

* Company A cannot view Company B records
* Audit logs remain tenant-specific
* Dashboard metrics are company filtered

---

## 4. EmissionRecord Model

### Purpose

`EmissionRecord` is the central model of the system.

All source data (SAP, Utility, Travel) is normalized into this single structure.

Instead of maintaining separate tables for every source, a unified record model was selected to simplify:

* analyst review
* dashboards
* audit workflows
* status tracking
* normalization

### Key Fields

### Company Association

* `company`

Used for multi-tenant isolation.

---

### Source Tracking

* `source_type`

Values:

* `SAP`
* `UTILITY`
* `TRAVEL`

This field acts as the **source-of-truth tracker**, identifying where each row originated.

This enables traceability for auditors.

Example:

A reviewer can see whether a record came from:

* SAP fuel data
* electricity portal export
* travel platform export

---

### Scope Categorization

The model supports:

* `SCOPE_1`
* `SCOPE_2`
* `SCOPE_3`

Mapping used in the prototype:

| Source              | Scope   |
| ------------------- | ------- |
| SAP Fuel Data       | Scope 1 |
| Utility Electricity | Scope 2 |
| Corporate Travel    | Scope 3 |

This categorization reflects standard ESG reporting practices.

---

### Activity Classification

* `category`
* `activity_type`

These fields store business activity information.

Examples:

### SAP

* category → Fuel
* activity_type → Diesel / Petrol

### Utility

* category → Electricity
* activity_type → Electricity

### Travel

* category → Travel
* activity_type → Flight / Train / Hotel / Cab

This keeps source-specific activities understandable for analysts.

---

### Raw and Normalized Values

* `raw_value`
* `normalized_value`

The system stores both:

### Raw value

The original uploaded value.

### Normalized value

The processed emissions-related number used for reporting.

This preserves source integrity while still allowing standardized calculations.

---

## 5. Normalization Logic

The prototype implements lightweight normalization rules.

### SAP Fuel Data

### Problem

SAP exports may contain inconsistent units.

Example:

* Liters (`L`)
* Kiloliters (`KL`)

### Normalization rule

`0.5 KL → 500 L`

Logic:

If unit = `KL`

convert to liters using:

`Quantity × 1000`

This ensures consistent fuel measurement.

---

### Utility Electricity Data

Electricity data is normalized using:

`kWh × 0.82`

Where:

* `kWh` = electricity usage
* `0.82` = simplified prototype emission factor

This converts electricity consumption into estimated carbon emissions.

---

### Corporate Travel Data

Travel emissions are estimated using:

`Cost × 0.2`

The assignment mentioned that travel systems may not always provide distances and may only contain travel metadata.

To keep the prototype realistic within the assignment timeline, a simplified calculation was used.

In a production system this would likely be replaced with:

* airport distance calculations
* emission factor databases
* travel-mode-specific calculations

---

## 6. Travel-Specific Fields

The model includes travel fields:

* `travel_from`
* `travel_to`
* `travel_type`
* `travel_date`

These exist because travel data has a different structure than fuel or utility records.

Example:

`BLR → DEL (Flight)`

The assignment specifically mentioned airport/city codes, so support for source/destination data was included.

---

## 7. Record Status Workflow

Every record moves through a review lifecycle.

Statuses:

* `PENDING`
* `APPROVED`
* `REJECTED`
* `LOCKED`
* `FAILED`

### Workflow

Upload → Pending → Analyst Review → Approve / Reject / Lock for Audit

### Meaning of statuses

### Pending

* newly uploaded
* waiting for review

### Approved

* accepted by analyst

### Rejected

* flagged as invalid

### Locked

* finalized for audit

### Failed

* upload or validation problem

This structure ensures analyst review before audit signoff.

---

## 8. Analyst Review Workflow

The prototype includes an **Analyst Review Table**.

The analyst can click on a **record ID** and review the uploaded information in detail.

Three actions were implemented:

### Approve

If the data looks valid.

### Reject

If the record appears invalid.

### Lock for Audit

Used to finalize records for auditing purposes.

### Workflow

The analyst reviews the record and can directly:

* Approve
* Reject
* Lock for Audit

These actions work in the **same review flow**.

The system does not force a sequence such as:

Approve → Reject → Lock

Instead, the analyst can directly perform the required action based on the review.

This provides flexibility and better analyst usability.

---

## 9. Failed Record Handling

Real enterprise data is messy.

The prototype intentionally handles invalid rows.

### Example invalid SAP row

Missing quantity:

`BLR02,Petrol,,L`

### Example invalid utility row

Missing electricity usage:

`M004,,2026-05-02,2026-05-30`

### Example invalid travel row

Missing travel location:

`E004,Flight,,DEL,2026-05-01,5000`

When invalid data is detected:

The record is:

* stored as `FAILED`
* marked suspicious
* reason saved in `failed_reason`

Examples:

* `Invalid SAP data`
* `Invalid Utility data`
* `Invalid Travel data`

Instead of silently dropping bad rows, they remain visible for investigation.

This improves transparency.

---

## 10. Suspicious Data Detection

The system includes:

`is_suspicious`

This flag highlights questionable records.

Current prototype usage:

* invalid SAP rows
* incomplete utility records
* missing travel locations

This creates a foundation for future anomaly detection.

### Examples for production

* abnormal fuel spikes
* duplicate invoices
* suspicious travel costs

---

## 11. Audit Trail Design

### Model: `AuditLog`

### Purpose

Track every meaningful record change.

### Fields

* `record`
* `action`
* `old_value`
* `new_value`
* `timestamp`

### Actions logged

* APPROVED
* REJECTED
* LOCKED

### Example

Pending → Approved

The audit log stores:

Old value:

`PENDING`

New value:

`APPROVED`

This provides traceability for auditors.

No approval decision happens silently.

Every analyst action becomes traceable.

---

## 12. Authentication and Access

The system uses:

**JWT Authentication**

This protects all API endpoints.

Only authenticated users can:

* upload files
* review records
* access dashboards
* view audit logs

### Future Role Expansion

The intended enterprise workflow would separate permissions:

### Admin

* upload source data
* manage ingestion

### Analyst

* review records
* approve/reject records
* lock records for audit

### Prototype Limitation

Due to assignment timeline constraints, full role-based access control (RBAC) was not implemented.

However:

* authentication
* analyst review workflow
* approval/rejection
* audit tracking

were implemented successfully.

---

## 13. Why a Single Unified Model Was Chosen

Instead of creating:

* `SAPRecord`
* `UtilityRecord`
* `TravelRecord`

A single normalized model was selected.

### Benefits

### Simpler dashboards

One table powers all analytics.

### Easier review workflow

Analysts review records in one place.

### Easier audit logging

One audit structure for every source.

### Extensible

New source types can be added later.

### Example future additions

* Waste management
* Vendor procurement
* Shipping logistics

without redesigning the system.

---

## 14. Future Improvements

Given more time, the following improvements would be added:

* role-based UI permissions
* real emission factor database
* SAP OData/API integrations
* utility PDF parsing
* Concur/Navan API integration
* anomaly detection rules
* bulk approval workflows
* company admin management

The prototype prioritizes ingestion, normalization, review, and auditability within the assignment timeline.
