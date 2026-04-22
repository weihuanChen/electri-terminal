# Data Model

This document defines the main entities used in the system.

---

# 1. categories

Purpose

Manage hierarchical product categories.

Fields

id
name
slug
parentId
level
path
description
shortDescription
image
icon
sortOrder
status
templateKey
seoTitle
seoDescription
isVisibleInNav
createdAt
updatedAt

Rules

slug must be unique  
path generated automatically  
deleting parent requires handling children

---

# 2. attributeTemplates

Purpose

Define specification templates for product categories.

Fields

id
name
categoryId
description
status
createdAt
updatedAt

---

# 3. attributeFields

Purpose

Define fields within a specification template.

Fields

id
templateId
fieldKey
label
fieldType
unit
options
isRequired
isFilterable
isSearchable
isVisibleOnFrontend
importAlias
sortOrder
groupName
helpText
createdAt
updatedAt

Field Types

text  
number  
boolean  
enum_single  
enum_multi  
range  
rich_text

---

# 4. productFamilies

Purpose

Represent product series grouping multiple SKUs.

Fields

id
name
slug
categoryId
brand
summary
content
highlights
heroImage
gallery
status
sortOrder
seoTitle
seoDescription
createdAt
updatedAt

---

# 5. products

Purpose

Represent individual SKUs.

Fields

id
skuCode
model
normalizedModel
slug
title
shortTitle
familyId
categoryId
brand
summary
content
attributes
featureBullets
mainImage
gallery
status
isFeatured
moq
packageInfo
leadTime
origin
searchKeywords
sortOrder
seoTitle
seoDescription
createdAt
updatedAt

Attributes field

JSON structure storing specification values.

Example

{
  "rated_voltage": "800V",
  "rated_current": "32A",
  "wire_range": "0.2-4mm²",
  "mounting_type": "DIN rail"
}

---

# 6. assets

Purpose

Store downloadable files.

Fields

id
title
type
fileUrl
previewImage
language
version
fileSize
mimeType
isPublic
requireLeadForm
createdAt
updatedAt

Asset Types

catalog  
datasheet  
certificate  
cad  
manual

---

# 7. assetRelations

Purpose

Associate assets with entities.

Fields

id
assetId
entityType
entityId
sortOrder

Entity types

category  
family  
product  
article

---

# 8. articles

Purpose

Blog and knowledge content.

Fields

id
type
title
slug
excerpt
coverImage
content
categoryIds
tagNames
relatedCategoryIds
relatedFamilyIds
relatedProductIds
status
publishedAt
seoTitle
seoDescription
createdAt
updatedAt

Article Types

blog  
guide  
faq  
application

---

# 9. inquiries

Purpose

Store visitor inquiries and RFQ.

Fields

id
type
name
email
company
country
phone
message
sourcePage
sourceType
sourceId
utmSource
utmMedium
utmCampaign
status
assignedTo
internalNotes
createdAt
updatedAt

Types

general  
product  
rfq

---

# 10. inquiryItems

Purpose

Store multiple RFQ items.

Fields

id
inquiryId
productId
sku
quantity
notes

---

# 11. navMenus

Fields

id
name
location
status

---

# 12. navItems

Fields

id
menuId
parentId
title
itemType
targetId
url
icon
sortOrder
isHighlighted
isExternal

Item Types

category  
article  
page  
custom_url

---

# 13. importJobs

Purpose

Track CSV import tasks.

Fields

id
type
fileUrl
status
mappingConfig
totalRows
successRows
failedRows
createdBy
createdAt
finishedAt

---

# 14. importJobRows

Fields

id
jobId
rowNumber
rawData
status
errorMessage
entityId
