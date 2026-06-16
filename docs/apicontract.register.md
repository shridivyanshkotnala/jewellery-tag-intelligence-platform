API CONTRACTS

GST Verification - after entering GST number click on verify then this happens
POST /auth/business/gst/verify

Request

{
  "gstNumber": "26ABCDE1234F1Z5"
}

Response

{
  "success": true,
  "data": {
    "gstNumber": "26ABCDE1234F1Z5",
    "legalName": "Pratham International",
    "tradeName": "Pratham International",
    "businessType": "Proprietorship",
    "address": "Delhi",
    "gstStatus": "Active"
  }
}




STEP 2
Confirm GST Business - on pressing confirm business details after verifying the retrieved GST information are all ok.
After this on pressing confirm, the data is stored in database directly with uuid identifier.
in this we save the data to table name - "businesses"

POST /auth/business/gst/confirm
Request

{
  "gstNumber": "26ABCDE1234F1Z5"
}

Response

{
  "success": true,
  "data": {
    "businessId": "uuid",         //generated uuid for identification
    "status": "GST_CONFIRMED"
  }
}





STEP 3

Submit Contact Details
POST /auth/business/contact-details

Request

{
  "businessId": "uuid",
  "phone": "9999999999",
  "email": "owner@pratham.com"
}

Response

{
  "success": true,
  "data": {
    "phoneOtpSent": true,
    "emailOtpSent": true
  }
}





STEP 4

Verify Mobile OTP

table used "otp_verifications"

POST /auth/business/verify-phone-otp

Request

{
  "businessId": "uuid",
  "otp": "127563"
}

Response

{
  "success": true,
  "data": {
    "phoneVerified": true
  }
}






STEP 5

Verify Email OTP

POST /auth/business/verify-email-otp

Request

{
  "businessId": "uuid",
  "otp": "428761"
}

Response

{
  "success": true,
  "data": {
    "emailVerified": true
  }
}





STEP 6
 
Create Password  - after this the account will be secured with password. If some how 
table - "business_users"

POST /auth/business/create-password

Request

{
  "businessId": "uuid",
  "password": "StrongPassword123",
  "confirmPassword": "StrongPassword123"
}

Response

{
  "success": true,
  "data": {
    "registrationCompleted": true,
    "userId": "uuid"
  }
}





STEP 7

Auto Login

POST /auth/business/login

Request

{
  "email": "owner@pratham.com",
  "password": "StrongPassword123"
}

Response

{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "businessId": "uuid",
    "userId": "uuid"
  }
}