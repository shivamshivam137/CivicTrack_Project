# CivicTrack_Miniproject
## Miniproject Repository
Grp 11. Civic Awareness
# NagrikNeeti

## 1. Project Overview

NagrikNeeti is a civic awareness and candidate transparency platform designed to provide citizens with clear, verified, and structured information about election candidates and their promises. The platform addresses the persistent lack of accessible political data by consolidating candidate profiles, declared promises, and fulfillment indicators into a single, public-facing system. By prioritizing accuracy, separation of concerns, and controlled data access, NagrikNeeti aims to strengthen informed democratic participation and accountability in electoral processes.

---

## 2. Problem Statement

In many elections, voters struggle to access reliable and comprehensive information about candidates. Critical data—such as background details, declared promises, and performance indicators—is often fragmented across multiple sources, difficult to verify, or presented in opaque formats. Existing solutions frequently rely on unstructured data, lack transparency in sourcing, or fail to distinguish between public consumption and administrative control. NagrikNeeti addresses this gap by offering a structured, read-only public interface backed by controlled administrative data management, ensuring consistency, traceability, and trustworthiness.

---

## 3. System Architecture

NagrikNeeti is built as a static frontend application using only HTML, CSS, and vanilla JavaScript, with a strictly modular file structure to ensure long-term maintainability.

**Frontend Architecture**

* Static HTML pages for routing and layout
* Centralized CSS split by responsibility (base, layout, components, responsive)
* Page-specific JavaScript modules under `/assets/js/pages`
* Firestore access abstracted into helper modules under `/assets/js/firestore`

**Backend Services (Firebase)**

* Firebase Authentication for identity management
* Firestore for structured, role-aware data storage
* Firebase Storage for controlled asset uploads

**Separation of Concerns**

* Public pages: read-only access (candidates, comparisons, reports, promises)
* Authenticated user pages: user dashboards and personalization
* Admin-only pages: data creation, updates, verification, and analytics

Firestore helper modules encapsulate all database access, while page-level scripts handle rendering and interaction logic, ensuring no page directly depends on Firebase SDK internals.

---

## 4. Data & Firebase Usage

**Authentication**

* Email/password authentication via Firebase Authentication
* No role decisions made at login time

**Firestore Collections**

* `users`: user profiles, roles, and account metadata
* `candidates`: public candidate information
* `promises`: promises linked to candidates with status tracking
* `reports`: aggregated and derived transparency metrics

**Storage**

* Managed via an uploads abstraction to avoid direct Storage coupling in pages

**Access Patterns**

* Public pages: strictly read-only
* Admin operations: write access enforced via Firestore security rules
* All data mutations routed through helper modules

---

## 5. Security Model

NagrikNeeti follows a defense-in-depth security approach.

* Role-based access control is enforced using Firestore as the source of truth
* Client-side route guards prevent unauthorized access to admin pages
* Firestore security rules enforce backend-level protection
* Login logic performs authentication only; it does not determine authorization
* Role checks occur post-authentication to avoid privilege escalation
* Admin routes are protected both client-side and server-side

This separation ensures that UI logic cannot override backend security constraints.

---

## 6. Application Flows

**Public User Flow**

* Access the platform without authentication
* Browse candidate listings and profiles
* View promises, fulfillment summaries, and comparisons
* Cannot create, edit, or delete any data

**Registered User Flow**

* Login via email/password
* Redirected to a user dashboard
* No administrative privileges by default

**Admin Flow**

* Admin login
* Access to admin dashboard
* Create, edit, verify, and manage candidates, promises, and reports

Public users explicitly cannot modify data, access admin tools, or view restricted analytics.

---

## 7. Hosting & Deployment

* Frontend hosted as static assets (e.g., GitHub Pages)
* Firebase used as a backend-as-a-service
* No server-side rendering or custom backend required

This architecture minimizes operational overhead, supports rapid iteration, and scales well for hackathon and early-stage deployments while remaining production-viable.

---

## 8. Design & Engineering Decisions

* **Firebase** was chosen for its integrated authentication, database, and security model, reducing backend complexity.
* **Modular JavaScript** enforces strict boundaries between data access and UI logic.
* **SAFE MODE development practices** were used to ensure that each component was hardened against missing data, invalid inputs, and empty collections before expansion.
* No frameworks were used to maintain transparency, auditability, and ease of review.

---

## 9. Future Enhancements

* Formal data verification and approval workflows
* Advanced analytics and trend dashboards
* Integration with official election and affidavit data sources
* Progressive Web App (PWA) support for offline access and performance improvements

---

## 10. License / Contribution Notes

NagrikNeeti is designed to be open-source friendly. Contributors are expected to respect the established separation of concerns, security model, and modular architecture. Feature additions should align with the existing data access patterns and avoid introducing framework dependencies without clear justification.
