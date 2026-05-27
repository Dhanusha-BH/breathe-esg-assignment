# SOURCES.md

# Data Source Research & Design – Breathe ESG Prototype

## 1. Overview

This document explains the research conducted for each of the three ingestion sources in the Breathe ESG prototype:

* SAP Fuel / Procurement Data (Scope 1)
* Utility Electricity Data (Scope 2)
* Corporate Travel Data (Scope 3)

Since real enterprise APIs were not integrated, this prototype is based on **real-world format research and synthetic data modeling**.

The goal was to ensure that even simulated datasets closely reflect how enterprise ESG data actually appears in production systems.

---

## 2. SAP Fuel / Procurement Data

### 2.1 Real-World Source Research

SAP systems typically expose data through:

* IDoc (Intermediate Document format)
* BAPI (Business API)
* OData services
* Flat file exports (CSV / Excel)

For this prototype, we focused on the most commonly used and realistic format in enterprise reporting:

> CSV export-style SAP reporting extracts

These are widely used by finance and operations teams for downstream analysis.

---

### 2.2 Key Findings from Research

Real SAP exports typically include:

* Plant codes (often meaningless without mapping)
* Material types (Diesel, Petrol, etc.)
* Quantity with inconsistent units
* Mixed formatting across systems (e.g., L, KL)
* Missing or incomplete values
* Date fields in inconsistent formats

---

### 2.3 Sample Data Design

We created synthetic SAP-like CSV files with:

* Plant Code
* Material
* Quantity
* Unit (L / KL)
* Date

Example:

BLR01, Diesel, 500, L
CHN01, Petrol, 0.5, KL

---

### 2.4 Why This Design

We intentionally included:

✔ unit inconsistency (L vs KL)
✔ missing values
✔ real-world plant codes
✔ multiple materials

to simulate enterprise SAP export behavior.

---

### 2.5 What Would Break in Real SAP Integration

* Missing master data mapping for plant codes
* Currency/unit mismatches
* Region-specific SAP configurations
* Authentication complexity (S/4HANA systems)

---

## 3. Utility Electricity Data

### 3.1 Real-World Source Research

Utility data typically comes from:

* Electricity provider portals (CSV downloads)
* Smart meter APIs
* Monthly billing PDFs

For this prototype, we simulated:

> CSV export from utility portal systems

---

### 3.2 Key Findings from Research

Real utility data includes:

* Meter IDs
* kWh consumption
* Billing start and end dates
* Sometimes missing readings
* Variable billing cycles (not always monthly)

---

### 3.3 Sample Data Design

We designed CSV structure with:

* Meter ID
* kWh usage
* Billing Start
* Billing End

Example:

M001, 1500 kWh, 2026-04-01 to 2026-04-30

---

### 3.4 Why This Design

We included:

✔ missing kWh values
✔ multiple meters
✔ billing period structure

to reflect real utility complexity.

---

### 3.5 What Would Break in Real Utility Integration

* PDF-only billing systems (no structured export)
* Regional tariff variations
* Time-of-use pricing complexity
* API access limitations from utilities

---

## 4. Corporate Travel Data

### 4.1 Real-World Source Research

Corporate travel platforms like:

* SAP Concur
* Navan
* Amadeus travel APIs

provide structured travel booking data.

---

### 4.2 Key Findings from Research

Typical travel datasets include:

* Employee ID
* Travel type (Flight, Train, Hotel, Cab)
* Origin and destination
* Travel date
* Cost
* Sometimes missing airport codes or locations

---

### 4.3 Sample Data Design

We designed synthetic datasets with:

* EmployeeID
* TravelType
* From
* To
* Date
* Cost

Example:

E001, Flight, BLR → DEL, 5000

---

### 4.4 Why This Design

We intentionally included:

✔ missing “From” fields
✔ multiple travel types
✔ cost-based structure

to simulate real-world incomplete travel logs.

---

### 4.5 What Would Break in Real Travel Integration

* Missing distance data for emission calculations
* Different APIs per provider
* Airport code normalization challenges
* Multi-leg journey handling complexity

---

## 5. Key Design Decision: Synthetic Data Instead of Direct Integration

### Important Clarification

The system does NOT directly connect to:

* SAP systems
* Utility provider APIs
* Travel platform APIs

Instead:

> We created synthetic CSV datasets based on research of real enterprise formats.

---

### Why this approach was chosen

* Enterprise APIs require credentials and contracts
* Out of scope for a 4-day prototype
* Assignment explicitly allows data fabrication based on research

---

### What was preserved from real systems

✔ structure realism
✔ missing data scenarios
✔ inconsistent formatting
✔ unit variations

---

## 6. Overall Learning from Source Research

This approach helped ensure:

* realistic ingestion pipeline design
* proper normalization logic
* robust error handling for missing values
* analyst-friendly review system

---

## 7. Final Summary

Even though data sources were simulated, they are:

> structurally aligned with real enterprise ESG systems and based on documented industry formats.

This ensures the prototype is realistic, extensible, and production-concept aware.
