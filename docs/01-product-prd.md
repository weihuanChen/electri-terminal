# Project PRD
B2B Industrial Product Website System

## 1. Project Overview

This project aims to build a **template-driven B2B industrial product website system**.

The system focuses on managing large-scale industrial product catalogs and supporting SEO-driven traffic and inquiry conversion.

The system should be reusable across multiple industrial product categories.

Initial product categories include:

- Terminal Blocks
- Cable Glands
- Electrical Enclosures
- DIN Rail Accessories

Future expansion may include other industrial products such as connectors, cable accessories, switches, sensors, and automation components.

---

# 2. Core Goals

The system must support:

1. Structured industrial product catalog
2. SKU management with specification templates
3. SEO-friendly category and product pages
4. RFQ and inquiry collection
5. Resource downloads (datasheets, catalogs, certificates)
6. Blog and knowledge content
7. CSV batch import of products
8. Template-based frontend pages
9. Reusable backend structure for future product categories

---

# 3. Technical Stack

Frontend
- Next.js

Backend / Data
- Convex

File Storage
- Object storage (images, pdf, certificates)

AI Development Workflow

Codex
- database design
- backend logic
- admin modules
- API implementation

Claude
- frontend pages
- UI components
- page templates

Cursor
- debugging
- integration testing
- bug fixing

Human
- product direction
- QA
- architecture decisions

---

# 4. System Principles

## Content and Presentation Separation

Backend stores:
- structured data
- business logic
- configuration

Frontend controls:
- layout
- UI
- page structure
- visual design

---

## Template Driven Pages

Pages must be template-based instead of CMS page builders.

Example page templates:

- homepage
- category page
- product family page
- product detail page
- blog page
- resource page

---

## Product Hierarchy

Products must follow three layers:

Category  
→ Product Family  
→ SKU

Example:

Terminal Blocks
→ UK Series
→ UK-2.5B

---

## Specification Template System

Industrial products require structured parameters.

Specifications must be defined using **attribute templates** per category.

Example attributes for terminal blocks:

- rated_voltage
- rated_current
- wire_range
- pitch
- conductor_type
- mounting_type

---

# 5. User Roles

Admin
- full access

Product Manager
- manage categories
- manage product families
- manage SKUs
- manage attributes

Content Editor
- manage blog
- manage resources
- manage FAQ

Sales
- view inquiries
- manage RFQ

Visitor
- browse products
- download resources
- submit inquiries

---

# 6. Core Modules

The system includes the following modules.

Category Management  
Attribute Template Management  
Product Family Management  
SKU Management  
Resource Management  
Blog / Article Management  
Inquiry / RFQ Management  
Navigation Management  
SEO Configuration  
CSV Import Center

---

# 7. MVP Scope

First version must include:

Category management  
Attribute template system  
Product family management  
SKU management  
CSV product import  
Blog management  
Resource management  
Inquiry system  
Navigation configuration  
SEO fields  
Homepage / category / product / blog pages

---

# 8. Not in MVP

The following features are intentionally excluded:

Online payment  
Order management  
ERP integration  
Complex customer account system  
Drag-and-drop page builders

---

# 9. Phase 2 Features

Planned for later phases:

Product comparison  
Alternative product suggestions  
Bulk RFQ  
Download lead capture  
Multi-language support  
Advanced filtering  
Search engine integration

---

# 10. Success Criteria

The system should:

support thousands of SKUs  
support structured specification filters  
generate SEO-friendly pages  
collect RFQ leads efficiently  
allow quick frontend iteration with AI