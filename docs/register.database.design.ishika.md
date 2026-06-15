
# Registration Architecture

Permanent Collections:

```text
businesses
business_users
otp_verifications
```
USE - for caching in between incomplete registration flow
Redis

---

# Scenario 1

User enters GST


GST Verified
↓
Business Found
↓
Confirm Business


At this point:

### Create Business Record

MongoDB

```javascript
{
  _id: ObjectId("..."),

  gstNumber: "26ABCDE1234F1Z5",

  legalName: "Pratham International",

  tradeName: "Pratham International",

  businessType: "Proprietorship",

  gstStatus: "ACTIVE",

  registrationStatus: "PENDING",

  isRegistered: false,  // important

  createdAt: ISODate(),

  updatedAt: ISODate()
}
```

No user created yet. //no user

---

# Why?

Suppose app crashes here.

Next time user enters GST:

```text
26ABCDE1234F1Z5
```

Backend checks:

```javascript
db.businesses.findOne({
  gstNumber: "26ABCDE1234F1Z5"
})
```

Found.

Check:

```javascript
isRegistered === false
```

Then:

```text
Resume Registration
```

Don't create new business.

Reuse existing:

```text
object_id present in database collection "business"
```

---

# Registration State Machine

Inside business document:

```javascript
{
  registrationStep: "GST_CONFIRMED"
}
```

Possible values:

```text
GST_CONFIRMED

CONTACT_DETAILS_SUBMITTED

PHONE_VERIFIED

EMAIL_VERIFIED

PASSWORD_CREATED

COMPLETED
```

---


# User Adds Contact Details

Don't create business_user.

Store temporary state:

Redis:

```javascript
registration:businessId
```

```javascript
{
  phone: "9999999999",

  email: "owner@company.com",

  phoneVerified: false,

  emailVerified: false
}
```

TTL:

```text
24 hours
```

---

# OTP Verification Collection

MongoDB

```javascript
{
  _id: ObjectId(),

  businessId: ObjectId(), //Mapped with the "business" table

  otpType: "PHONE",

  destination: "9999999999",

  otpHash: "...",

  verified: true,

  expiresAt: ISODate(),

  createdAt: ISODate()
}
```

---

# App Crash During OTP

No issue.

Business record:

```javascript
registrationStep:
"CONTACT_DETAILS_SUBMITTED"
```

User reopens app.

Backend:

```text
GST Exists
↓
registration incomplete
↓
Resume flow
```

---



# When Business User Is Created

ONLY HERE: after entring password then only create full user in collection "businesss_users"

```text
Password Created
↓
Registration Complete
```

Then create:

---
## business_users

```javascript
{
  _id: ObjectId(),

  businessId: ObjectId(),

  email: "owner@company.com",

  phone: "9999999999",

  passwordHash: "...",

  role: "OWNER", //Default in registration always - Role could be either OWNER or EMP (meaning Employee)

  emailVerified: true,

  phoneVerified: true,

  isActive: true,

  createdAt: ISODate(),

  updatedAt: ISODate()
}
```

---

Update business:

```javascript
{
  registrationStep: "COMPLETED",

  isRegistered: true
}
```

---

# Future Registration Attempt

User enters:

```text
26ABCDE1234F1Z5
```

Backend:

```javascript
business = db.businesses.findOne({
 gstNumber: "26ABCDE1234F1Z5"
})
```

Check:

```javascript
business.isRegistered === true
```

Return:

```json
{
  "success": false,
  "error": "BUSINESS_ALREADY_REGISTERED",
  "message": "This GST number is already registered. Please login."
}
```

---

# MongoDB Collections

## businesses

```javascript
{
  _id: ObjectId(),

  gstNumber: String,

  legalName: String,

  tradeName: String,

  businessType: String,

  gstStatus: String,

  address: String,

  stateCode: String,

  stateName: String,

  pincode: String,

  registrationStep: String,

  isRegistered: Boolean,

  createdAt: Date,

  updatedAt: Date
}
```

Index:

```javascript
db.businesses.createIndex(
 { gstNumber: 1 },
 { unique: true }
)
```

---

## business_users

```javascript
{
  _id: ObjectId(),

  businessId: ObjectId(),

  email: String,

  phone: String,

  passwordHash: String,

  role: String,

  emailVerified: Boolean,

  phoneVerified: Boolean,

  isActive: Boolean,

  lastLoginAt: Date,

  createdAt: Date,

  updatedAt: Date
}
```

Indexes:

```javascript
email unique

phone unique

businessId
```

---

## otp_verifications

```javascript
{
  _id: ObjectId(),

  businessId: ObjectId(),

  otpType: String,

  destination: String,

  otpHash: String,

  verified: Boolean,

  expiresAt: Date,

  createdAt: Date
}
```

TTL Index:

```javascript
db.otp_verifications.createIndex(
 { expiresAt: 1 },
 { expireAfterSeconds: 0 }
)
```

Mongo automatically deletes expired OTPs.

---


 project:

```text
MongoDB
    ↓
Businesses
Business Users
OTP History

Redis
    ↓
Registration Session
Current OTP Attempts
Temporary Contact Details
Rate Limiting
```
