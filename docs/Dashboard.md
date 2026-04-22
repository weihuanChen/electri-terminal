Use the rules defined in:
docs/ai-system-prompt.md
docs/ai-frontend-prompt.md

Task: Design and implement the Admin Dashboard page for the backend system.

Project context:

This project is a template-driven B2B industrial product website system built with Next.js and Convex.

The backend dashboard is not a CMS page builder.  
It is a management dashboard used by product managers, sales teams, and content editors.

The dashboard must provide quick insights into:

- product catalog status
- SKU statistics
- content publishing
- inquiries and RFQ
- import jobs
- system activity

The dashboard should help users quickly understand system status and access key actions.

Target users:

Admin
Product Manager
Content Editor
Sales

Important constraints:

1. Do NOT design a page-builder style interface.
2. Focus on operational information and management shortcuts.
3. Follow an industrial B2B system style (clean, professional, information-driven).
4. Avoid unnecessary visual complexity.
5. Components should be reusable across other admin pages.

Page goal:

Provide a high-level overview of system activity and quick access to important modules.

Required sections:

1. Welcome header

Show:
- user name
- role
- current system overview message

Example:
"Welcome back, Product Manager"

---

2. System statistics cards

Display key metrics:

Total Categories  
Total Product Families  
Total SKUs  
Published Products  
Draft Products

Each card should include:

title  
number  
icon  
link to management page

---

3. Inquiry overview

Display:

Total inquiries today  
Total inquiries this week  
Unassigned inquiries

Include a small list showing:

latest 5 inquiries

Fields:

name  
company  
product reference  
date

Provide "View all inquiries" link.

---

4. Import job status

Display:

recent CSV import jobs

Show:

job status  
success rows  
failed rows  
timestamp

Include link:

"View Import Center"

---

5. Content overview

Display:

total blog articles  
draft articles  
published articles

Include quick action:

Create new article

---

6. Quick actions panel

Provide shortcuts:

Create Category  
Create Product Family  
Create SKU  
Upload Resource  
Create Blog Article  
View Inquiries

---

7. System activity feed

Display recent actions:

Product created  
SKU updated  
Import completed  
Article published

Limit to latest 10 events.

---

UI layout requirements:

Use a grid-based dashboard layout.

Sections should include:

Top stats row  
Two-column middle section  
Activity feed at bottom

---

Component suggestions:

StatCard  
InquiryList  
ImportJobTable  
QuickActionCard  
ActivityFeed

All components should be reusable.

---

Technical requirements:

Use Next.js components

Design responsive layout

Ensure cards and widgets are modular

Avoid embedding backend business logic

Assume data comes from APIs.

---

Output format:

1. Dashboard layout description
2. Component structure
3. Example Next.js component layout
4. Data dependencies
5. Suggestions for improving usability