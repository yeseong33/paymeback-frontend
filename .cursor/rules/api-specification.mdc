# PayMeBack API 명세서

## 목차
1. [인증 API](#인증-api)
2. [모임 API](#모임-api)
3. [결제 API](#결제-api)

## 인증 API
Base URL: `/api/auth`

### 회원가입
- **URL:** `/signup`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
    "data": {
      "id": "long",
      "email": "string",
      "name": "string"
    }
  }
  ```

### 로그인
- **URL:** `/signin`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "로그인이 완료되었습니다.",
    "data": {
      "accessToken": "string"
    }
  }
  ```

### OTP 인증
- **URL:** `/verify-otp`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "string",
    "otpCode": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "이메일 인증이 완료되었습니다."
  }
  ```

### OTP 재발송
- **URL:** `/resend-otp`
- **Method:** `POST`
- **Request Parameters:**
  - `email`: string
- **Response:**
  ```json
  {
    "success": true,
    "message": "인증 코드가 재발송되었습니다."
  }
  ```

## 모임 API
Base URL: `/api/gatherings`

### 모임 생성
- **URL:** `/`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "모임이 생성되었습니다.",
    "data": {
      "id": "long",
      "name": "string",
      "description": "string",
      "qrCode": "string",
      "status": "string",
      "participants": [
        {
          "id": "long",
          "name": "string",
          "email": "string"
        }
      ]
    }
  }
  ```

### 모임 참여
- **URL:** `/join`
- **Method:** `POST`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "qrCode": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "모임에 참여했습니다.",
    "data": {
      "id": "long",
      "name": "string",
      "description": "string",
      "qrCode": "string",
      "status": "string",
      "participants": [
        {
          "id": "long",
          "name": "string",
          "email": "string"
        }
      ]
    }
  }
  ```

### 결제 요청 생성
- **URL:** `/{gatheringId}/payment-request`
- **Method:** `POST`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Request Parameters:**
  - `totalAmount`: decimal
- **Response:**
  ```json
  {
    "success": true,
    "message": "결제 요청이 생성되었습니다.",
    "data": {
      "id": "long",
      "name": "string",
      "description": "string",
      "qrCode": "string",
      "status": "string",
      "totalAmount": "decimal",
      "participants": [
        {
          "id": "long",
          "name": "string",
          "email": "string"
        }
      ]
    }
  }
  ```

### 모임 상세 조회
- **URL:** `/{gatheringId}`
- **Method:** `GET`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "long",
      "name": "string",
      "description": "string",
      "qrCode": "string",
      "status": "string",
      "participants": [
        {
          "id": "long",
          "name": "string",
          "email": "string"
        }
      ]
    }
  }
  ```

### 내가 생성한 모임 목록 조회
- **URL:** `/my`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "content": [
        {
          "id": "long",
          "name": "string",
          "description": "string",
          "qrCode": "string",
          "status": "string",
          "participants": [
            {
              "id": "long",
              "name": "string",
              "email": "string"
            }
          ]
        }
      ],
      "totalPages": "integer",
      "totalElements": "long",
      "size": "integer",
      "number": "integer"
    }
  }
  ```

### 참여한 모임 목록 조회
- **URL:** `/participated`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
- **Response:** 내가 생성한 모임 목록 조회와 동일

### 모임 종료
- **URL:** `/{gatheringId}/close`
- **Method:** `POST`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Response:**
  ```json
  {
    "success": true,
    "message": "모임이 종료되었습니다."
  }
  ```

### QR 코드 이미지 조회
- **URL:** `/{gatheringId}/qr-image`
- **Method:** `GET`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Response:**
  - Content-Type: image/png
  - Body: QR 코드 이미지 바이너리 데이터

## 결제 API
Base URL: `/api/payments`

### 결제 처리
- **URL:** `/gatherings/{gatheringId}`
- **Method:** `POST`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Request Body:**
  ```json
  {
    "paymentMethod": "string",
    "amount": "decimal"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "결제가 완료되었습니다.",
    "data": {
      "id": "long",
      "amount": "decimal",
      "status": "string",
      "paymentMethod": "string",
      "createdAt": "datetime"
    }
  }
  ```

### 내 결제 상태 조회
- **URL:** `/gatherings/{gatheringId}/my`
- **Method:** `GET`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "long",
      "amount": "decimal",
      "status": "string",
      "paymentMethod": "string",
      "createdAt": "datetime"
    }
  }
  ```

### 모임의 전체 결제 내역 조회
- **URL:** `/gatherings/{gatheringId}`
- **Method:** `GET`
- **Authentication:** Required
- **Path Parameters:**
  - `gatheringId`: long
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "long",
        "amount": "decimal",
        "status": "string",
        "paymentMethod": "string",
        "createdAt": "datetime"
      }
    ]
  }
  ```

## 공통 사항

### 인증
- 모든 API는 로그인 후 발급받은 JWT 토큰을 Authorization 헤더에 Bearer 형식으로 포함해야 합니다.
  ```
  Authorization: Bearer {access_token}
  ```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": {
    "code": "ERROR_CODE",
    "message": "상세 에러 메시지"
  }
}
```