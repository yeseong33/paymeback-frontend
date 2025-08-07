# PayMeBack API Specification

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

### Sign In
```http
POST /auth/signin
```

**Request Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "accessToken": "string",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string"
  }
}
```

### Sign Up
```http
POST /auth/signup
```

**Request Body**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response 200**
```json
{
  "message": "string",
  "verificationId": "string"
}
```

### Verify OTP
```http
POST /auth/verify
```

**Request Body**
```json
{
  "verificationId": "string",
  "code": "string"
}
```

**Response 200**
```json
{
  "accessToken": "string",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string"
  }
}
```

### Resend OTP
```http
POST /auth/resend-otp
```

**Request Body**
```json
{
  "email": "string"
}
```

**Response 200**
```json
{
  "message": "string",
  "verificationId": "string"
}
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

## Error Codes
- `AUTH001`: Invalid credentials
- `AUTH002`: Email already exists
- `AUTH003`: Invalid OTP
- `AUTH004`: OTP expired
- `AUTH005`: Too many attempts
- `AUTH006`: Account not verified

## Authentication Headers
Protected endpoints require the following header:
```http
Authorization: Bearer {accessToken}
```