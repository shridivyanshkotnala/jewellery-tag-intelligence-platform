# JEWELLERY TAG INTELLIGENCE PLATFORM

# GEMINI VISION API CONTRACTS V3

Base URL

/api/v1

Authentication

Not Required (MVP)

Supported Jewellery Types

* DIAMOND (Enabled)
* GOLD 
* SILVER 

---

# WORKFLOW

Create Scan Session

↓

Upload Front Image

↓

Upload Back Image (Optional)

↓

Gemini Vision Analysis

↓

Abbreviation Clarification

↓

Final Review

↓

Calculate

---

# SCAN SESSION

## POST /scans

Create a new scan session.

Request

{
"jewelleryType": "DIAMOND",
"scanType": "SINGLE_SIDE"
}

Response

{
"success": true,
"data": {
"scanId": "uuid",
"status": "WAITING_FOR_SCAN",
"jewelleryType": "DIAMOND",
"scanType": "SINGLE_SIDE",
"createdAt": "timestamp"
}

}

---

# IMAGE UPLOAD

## POST /scans/:scanId/front-image

Upload front image.

multipart/form-data

Field:

image

Response

{
"success": true,
"data": {
"scanId": "uuid",
"status": "FRONT_IMAGE_RECEIVED"
}
}

---

## POST /scans/:scanId/back-image

Upload back image.

multipart/form-data

Field:

image

Response

{
"success": true,
"data": {
"scanId": "uuid",
"status": "BACK_IMAGE_RECEIVED"
}
}

---

# GEMINI ANALYSIS

## POST /scans/:scanId/analyze

Purpose:

Send front and back images directly to Gemini Vision.

Gemini performs:

* OCR
* Abbreviation detection
* Field extraction
* Confidence scoring
* Structured JSON generation

No separate OCR engine.

No separate AI engine.

Response

{
"success": true,

"data": {

```
"scanId": "uuid",

"status": "ANALYSIS_COMPLETED",

"provider": "gemini-2.5-pro",

"rawText": {

  "front": "GWt: 3.280 ...",

  "back": "DR 16 0.24 ..."
},

"structuredData": {

  "grossWeight": {
    "value": "3.280", #only for gold & silver
    "confidence": 98
  },

  "netWeight": {
    "value": "3.232", #only for gold & silver
    "confidence": 96
  },

  "purity": {
    "value": "14K",
    "confidence": 92 #only for gold & silver
  },

  "diamondWeight": {
    "value": "0.24",
    "confidence": 88
  },

  "diamondPieces": {
    "value": "16",
    "confidence": 91
  },
  
    
    "diamondRate": {
        "value" : "IJ"
        "confidence": 90
    }
  ,

  "diamondQuality": {
    "value": "IJ VSSI",
    "confidence": 75
  },

  "labour": {
    "value": "71",  # can be for both diamond, gold,
    "confidence": 96
  }

},

"unknownFields": [  #Undetected abbrevations

  {
    
    "abbreviation" : "GRT"
    "suggested meaning" : "grossweight"  #Enum value
    "confidence" : 48
  }

],

"overallConfidence": 89
```

}
}

---

# CLARIFICATION WORKFLOW

Purpose:

Allow human confirmation of uncertain fields.

Only fields below confidence threshold require review.

Default Threshold:

80%

---
##abbrevation clarification system

## GET /scans/:scanId/clarification

Response

{
"scanId": "uuid",

"fieldsNeedingReview": [

```
{
  "abbreviation": "CSWt",

  "detectedValue": "",

  "suggestedField": "coloredStoneWeight",

  "confidence": 48,

  "availableFields": [

    "grossWeight",
    "netWeight",
    "purity",
    "diamondWeight",
    "diamondRate",
    "diamondQuality",
    "diamondPieces",
    "labour",
    "other"

  ]
}
```

]
}

---

## POST /scans/:scanId/clarification

Request

{
"confirmedMappings": [

```
{
  "abbreviation": "CSWt",

  "mappedField": "other",

  "description": "Colored Stone Weight"
}
```

]
}

Response

{
"status": "CLARIFICATION_COMPLETED"
}

---

# FINAL REVIEW

## GET /scans/:scanId/review

Returns final editable data.

Response

{
"scanId": "uuid",

"status": "READY_FOR_REVIEW",

"structuredData": {

```
"grossWeight": "3.280",

"netWeight": "3.232",

"purity": "14K",

"diamondWeight": "0.24",

"diamondPiecesgrossWeight": "16",

"diamondQuality": "IJ VSSI",

"diamondRate" : "IJ",

"labour": "71"
```

}
}

---

## POST /scans/:scanId/review

User edits values.

Request

{
"grossWeight": "3.280",

"netWeight": "3.232",

"purity": "14K",

"diamondWeight": "0.24",

"diamondPieces": "16",

"diamondQuality": "IJ VSSI",

"diamondRate" : "IJ",


"labour": "71"
}

Response

{
"status": "APPROVED"
}

---

# LEARNING DATASET

Every approved scan is stored.

Stored Data

* Front Image
* Back Image
* Gemini Raw Response
* User Corrections
* Final Approved Data

---

## GET /dataset/export

Export approved training examples.

Formats

* JSON
* CSV
* XLSX

---

# CALCULATE

## POST /scans/:scanId/calculate

Response

{
"success": true,
"message": "Calculation completed successfully.",
"result": "SUCCESS"
}

---

# HEALTH

## GET /health

Basic Health

---

## GET /health/providers

Returns provider health.

Response

{
"gemini": {
"status": "healthy",
"model": "gemini-2.5-pro"
},

"database": {
"status": "healthy"
}
}
