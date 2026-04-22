# Website Information Architecture

## 1. Top Navigation

Home

Products

Industries / Applications

Resources

Blog

About

Contact / RFQ

---

# 2. Product Category Structure

Products navigation is generated dynamically from category tree.

Example initial structure:

Terminal Blocks
    Feed-through Terminal Blocks
    Ground Terminal Blocks
    Fuse Terminal Blocks
    Disconnect Terminal Blocks

Cable Glands
    Nylon Cable Glands
    Brass Cable Glands
    EMC Cable Glands
    Stainless Steel Cable Glands

Electrical Enclosures
    Plastic Enclosures
    Metal Enclosures
    Waterproof Enclosures
    Junction Boxes

DIN Rail Accessories
    DIN Rails
    End Brackets
    Marker Tags

---

# 3. Page Types

Homepage

Category Page

Subcategory Page

Product Family Page

Product Detail Page

Blog List Page

Blog Article Page

Application Page

Resource / Download Page

Contact Page

RFQ Page

---

# 4. URL Structure

Category

/categories/[categorySlug]

Subcategory

/categories/[categorySlug]

Product Family

/families/[familySlug]

Product Detail

/products/[productSlug]

Blog

/blog/[slug]

Application

/applications/[slug]

Resources

/resources/[type]

Contact

/contact

RFQ

/rfq

---

# 5. Page Relationships

Category Page
- displays subcategories
- displays product families
- supports filtering
- displays related FAQ and downloads

Product Family Page
- displays product overview
- lists SKUs

Product Page
- shows detailed specs
- downloads
- inquiry form

Blog Articles
- can link to products
- can link to categories

Resources
- can attach to products
- can attach to categories

FAQ
- can attach to categories
- can attach to product families
- can attach to products

---

# 6. SEO Structure

Each page supports:

SEO Title  
SEO Description  
Canonical URL  
Structured data

Category pages and product pages must be indexable.

Blog articles should target long-tail keywords.

---

# 7. Navigation Management

Navigation should be configurable from backend.

Menu item types:

category  
article  
custom page  
external link

Each navigation item supports:

title  
url  
icon  
sort order  
sub-items
