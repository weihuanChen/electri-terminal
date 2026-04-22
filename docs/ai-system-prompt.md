# AI System Prompt
B2B Industrial Product Website System

This document defines the global rules and architectural constraints that all AI agents must follow when contributing to this project.

AI agents include:

- Codex (backend, database, admin logic)
- Claude (frontend pages and UI)
- Cursor (debugging, integration, fixes)

All agents must follow the system architecture and development principles defined here.

---

# 1. Project Overview

This project builds a **template-driven B2B industrial product website system**.

The system is designed to manage large industrial product catalogs and support SEO-driven traffic and RFQ inquiries.

The system must be reusable for different industrial product categories.

Initial categories include:

- Terminal Blocks
- Cable Glands
- Electrical Enclosures
- DIN Rail Accessories

Future categories may include:

- connectors
- automation components
- cable accessories
- switches
- sensors
- industrial electronics

---

# 2. Technology Stack

Frontend
Next.js

Backend / Data
Convex

Storage
Object Storage (images, pdf, cad files)

AI Workflow

Codex
database design
backend APIs
admin modules
business logic

Claude
frontend pages
component system
UI structure
page templates

Cursor
debugging
integration fixes
bug resolution

Human
architecture decisions
QA
feature planning

---

# 3. Architecture Principles

## 3.1 Content and Presentation Separation

Backend stores:

- structured data
- business logic
- configuration
- relationships

Frontend controls:

- layout
- UI components
- visual style
- page composition

Backend must NOT store visual design rules.

Frontend must NOT hardcode business rules that belong to backend.

---

## 3.2 Template Driven Pages

The system must NOT implement a drag-and-drop CMS page builder.

Pages must be template-driven.

Page templates include:

- homepage
- category page
- product family page
- product detail page
- blog page
- resource page
- application page

Frontend layouts are controlled by code templates.

---

## 3.3 Product Hierarchy

Products must follow this structure:

Category  
→ Product Family (Series)  
→ SKU

Example

Terminal Blocks  
→ UK Series  
→ UK-2.5B

This hierarchy must always be preserved.

---

## 3.4 Specification Template System

Industrial products require structured specification parameters.

Specifications must be defined using **attribute templates**.

Each category may have different specification fields.

Example

Terminal Blocks attributes:

rated_voltage  
rated_current  
wire_range  
pitch  
conductor_type  
mounting_type

Cable Glands attributes:

thread_type  
clamping_range  
material  
ip_rating  
temperature_range

Attribute templates must be reusable and extendable.

Do NOT hardcode category-specific fields directly into the main product table.

---

# 4. Backend Design Rules

The backend must support the following modules:

Category Management  
Attribute Template Management  
Product Family Management  
SKU Management  
Resource / Asset Management  
Blog / Article Management  
Inquiry / RFQ Management  
Navigation Management  
SEO Configuration  
CSV Import Center

---

## Backend Responsibilities

The backend must handle:

data integrity  
slug generation  
category hierarchy  
import validation  
product relationships  
SEO metadata  
navigation configuration

Backend must enforce data rules and validation.

---

## Backend Must NOT

control page layout  
store UI style configuration  
implement drag-and-drop page editing  
mix content logic with visual rules

---

# 5. Frontend Design Rules

Frontend must be built with **reusable components**.

Pages must be composed from modules.

Example components:

CategoryCard  
ProductCard  
SeriesCard  
SpecificationTable  
FilterPanel  
DownloadCard  
FAQAccordion  
InquiryForm  
CTASection

---

## Frontend Responsibilities

Frontend must:

render pages from backend data  
build SEO-friendly HTML structure  
ensure responsive layout  
organize information hierarchy clearly

---

## Frontend Must NOT

store product business logic  
redefine database rules  
duplicate backend validation logic

---

# 6. SEO Principles

All pages must support:

SEO title  
SEO description  
canonical URL

Category pages and product pages must be indexable.

Blog articles should target long-tail search queries.

---

# 7. Navigation Rules

Navigation must be configurable from backend.

Menu items must support:

category links  
article links  
custom URLs

Navigation must support multi-level structure.

Frontend should render navigation dynamically.

---

# 8. Resource Management

Technical documents must be supported.

Examples

datasheets  
catalogs  
certificates  
CAD files  
installation manuals

Resources must be attachable to:

categories  
product families  
products  
articles

---

# 9. Inquiry / RFQ System

The system must support three inquiry types:

General Inquiry  
Product Inquiry  
Bulk RFQ

Inquiry data must capture:

name  
email  
company  
country  
message  
product reference  
quantity (optional)

All inquiries must be stored in database.

---

# 10. CSV Import System

The system must support batch import of products.

Import pipeline must include:

field mapping  
data validation  
error logging  
partial success handling

Import jobs must store:

job status  
row results  
error messages

---

# 11. Extensibility Requirement

The architecture must support adding new product categories without major code changes.

Example future categories:

connectors  
industrial sensors  
automation modules

New categories should be supported by:

creating new category entries  
creating new attribute templates  
importing product data

No database redesign should be required.

---

# 12. Development Guidelines for AI Agents

When generating solutions, AI agents must:

prefer simple and maintainable designs  
avoid unnecessary complexity  
respect module boundaries  
follow the product hierarchy  
support future extensibility

If a design choice conflicts with these rules, the AI must explain the issue before proceeding.

---

# 13. Code Generation Rules

AI-generated code should:

be modular  
avoid tight coupling  
use clear naming  
include comments for non-obvious logic

Prefer clarity over cleverness.

---

# 14. Debugging and Fixing Issues

When debugging issues:

first identify root cause  
propose minimal fix  
avoid rewriting large modules unless necessary

Always preserve existing architecture rules.

---

# 15. AI Output Requirements

All AI outputs should:

be structured  
use markdown where appropriate  
separate explanation from implementation  
avoid irrelevant discussion

The goal is to produce actionable development output.