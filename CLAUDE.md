# Fliq Frontend 프로젝트

## 1. 프로젝트 개요

모임 비용 정산 서비스 Fliq의 웹 프론트엔드 애플리케이션.
React 18 + Vite 7 기반의 SPA(Single Page Application).

## 2. 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| **프레임워크** | React | 18.3.1 | UI 라이브러리 |
| **빌드 도구** | Vite | 7.0.0 | 빠른 개발 서버, 번들링 |
| **상태 관리** | Zustand | 4.5.7 | 전역 상태 관리 |
| **라우팅** | react-router-dom | 6.30.1 | 클라이언트 라우팅 |
| **HTTP 클라이언트** | Axios | 1.10.0 | API 통신 |
| **스타일링** | Tailwind CSS | 3.4.17 | 유틸리티 CSS |
| **아이콘** | Lucide React | 0.315.0 | SVG 아이콘 |
| **알림** | react-hot-toast | 2.5.2 | 토스트 알림 |
| **보안** | DOMPurify | 3.3.1 | XSS 방어 |
| **QR** | qrcode | 1.5.4 | QR 코드 생성 |
| **인증** | WebAuthn/Passkey | - | 패스키 인증 |
| **봇 방지** | reCAPTCHA v2/v3 | - | 회원가입/복구 보안 |

## 3. 프로젝트 구조

```
src/
├── api/                 # API 엔드포인트 정의
│   ├── config.js        # Axios 인스턴스 및 인터셉터
│   ├── auth.js          # 인증 API
│   ├── gathering.js     # 모임 API
│   ├── payment.js       # 결제 API
│   ├── expense.js       # 비용 API
│   ├── settlement.js    # 정산 API
│   ├── paymentMethod.js # 결제 수단 API
│   └── index.js         # API 모듈 export
│
├── components/          # React 컴포넌트
│   ├── auth/            # 인증 관련
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   ├── OTPVerification.jsx
│   │   ├── PasskeyRegistration.jsx
│   │   └── RecoveryForm.jsx
│   ├── common/          # 공통 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Header.jsx
│   │   ├── Loading.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── AlertModal.jsx
│   │   └── DateTimeDisplay.jsx
│   ├── gathering/       # 모임 관련
│   │   ├── GatheringList.jsx
│   │   ├── GatheringDetail.jsx
│   │   ├── CreateGathering.jsx
│   │   ├── QRCodeDisplay.jsx
│   │   └── QRCodeScanner.jsx
│   └── payment/         # 결제 관련
│       ├── PaymentForm.jsx
│       ├── PaymentHistory.jsx
│       └── PaymentStatus.jsx
│
├── hooks/               # 커스텀 React 훅
│   ├── useAuth.js       # 인증 스토어 접근
│   ├── useGathering.js  # 모임 스토어 접근
│   ├── usePayment.js    # 결제 기능
│   ├── useRecaptcha.js  # reCAPTCHA 통합
│   └── useTheme.js      # 테마 토글
│
├── pages/               # 페이지 컴포넌트
│   ├── AuthPage.jsx     # 인증 페이지
│   ├── MainPage.jsx     # 대시보드
│   ├── GatheringPage.jsx # 모임 상세
│   ├── PaymentPage.jsx  # 결제 처리
│   ├── PaymentMethodPage.jsx # 결제 수단 관리
│   └── ProfilePage.jsx  # 사용자 프로필
│
├── services/            # 비즈니스 로직
│   ├── api.js           # API 클라이언트
│   ├── authService.js   # 인증 로직 (WebAuthn 포함)
│   ├── gatheringService.js # 모임 로직
│   └── paymentService.js # 결제 로직
│
├── store/               # Zustand 상태 관리
│   ├── authStore.js     # 인증 상태
│   ├── gatheringStore.js # 모임 데이터
│   └── themeStore.js    # 테마 상태
│
├── utils/               # 유틸리티
│   ├── constants.js     # 상수 정의
│   ├── validation.js    # 폼 검증
│   ├── webauthn.js      # WebAuthn 유틸리티
│   ├── errorCodes.js    # 에러 코드
│   └── helpers.js       # 날짜, 통화, 포맷팅
│
├── App.jsx              # 라우팅 및 전역 설정
├── main.jsx             # 앱 진입점
└── index.css            # 전역 스타일
```

## 4. 아키텍처 패턴

### 레이어드 아키텍처

```
┌─────────────────────────────────────┐
│  Pages (라우트 핸들러)               │
├─────────────────────────────────────┤
│  Components (UI 로직)               │
├─────────────────────────────────────┤
│  Custom Hooks (비즈니스 로직)        │
├─────────────────────────────────────┤
│  Store (Zustand 상태 관리)          │
├─────────────────────────────────────┤
│  Services (비동기 작업)              │
├─────────────────────────────────────┤
│  API (HTTP 요청)                    │
└─────────────────────────────────────┘
```

### Zustand 스토어

**authStore** - 인증 상태:
- `user`: 사용자 정보
- `isAuthenticated`: 인증 여부
- `authFlow`: 현재 인증 단계 (SIGNUP_EMAIL, LOGIN_PASSKEY 등)
- `flowData`: 단계별 데이터
- `webAuthnSupported`: WebAuthn 지원 여부

**gatheringStore** - 모임 데이터:
- `gatherings`: 모임 목록
- `currentGathering`: 현재 선택된 모임
- `loading`, `error`: 상태 관리

**themeStore** - 테마 관리:
- `theme`: 'dark' 또는 'light'
- localStorage 연동

## 5. 코드 컨벤션

### 네이밍 규칙

| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `LoginForm`, `GatheringDetail` |
| 변수/함수 | camelCase | `currentGathering`, `formatCurrency` |
| 상수 | UPPER_SNAKE_CASE | `STORAGE_KEYS`, `AUTH_FLOW` |
| 이벤트 핸들러 | handle 접두사 | `handleSubmit`, `handleClick` |
| 불린 함수 | is/can 접두사 | `isValid`, `canSubmit` |

### 코드 스타일

- **함수형 컴포넌트**: 클래스 컴포넌트 사용 안함
- **Hooks**: useState, useEffect, useCallback, useMemo 활용
- **비동기 처리**: async/await 사용
- **JSDoc 주석**: API 함수에 파라미터/반환값 명시

### ESLint 설정

```javascript
// eslint.config.js
- @eslint/js 권장 규칙
- react-hooks/recommended-latest
- react-refresh (Vite Fast Refresh)
- 사용하지 않은 변수: 경고 (대문자 패턴 제외)
```

## 6. API 통신

### Axios 설정

**Request Interceptor:**
1. sessionStorage에서 JWT 토큰 조회
2. `Authorization: Bearer {token}` 헤더 추가
3. CSRF 방어 헤더 설정 (`X-Requested-With`)

**Response Interceptor:**
1. `success: false` 응답을 에러로 처리
2. 401 응답: 토큰 삭제, `/auth`로 리다이렉트
3. 에러 코드/메시지 추출 및 표준화

### API 엔드포인트

```javascript
// 인증
POST /auth/signup/start          // 회원가입 시작
POST /auth/signup/verify         // OTP 검증
POST /auth/signup/passkey/start  // Passkey 등록 옵션
POST /auth/signup/passkey/finish // Passkey 등록 완료
POST /auth/login/start           // 로그인 challenge
POST /auth/login/finish          // Passkey 인증 완료
POST /auth/recovery/*            // 계정 복구

// 모임
POST   /gatherings               // 모임 생성
GET    /gatherings/my            // 내가 생성한 모임
GET    /gatherings/{id}          // 모임 상세
POST   /gatherings/join          // QR코드로 참여
GET    /gatherings/participated  // 내가 참여한 모임

// 비용 & 정산
POST   /expenses                 // 비용 기록
GET    /settlements/calculate/{gatheringId}  // 정산 계산

// 결제
POST   /payments                 // 결제 생성
GET    /payments/history/{gatheringId}  // 결제 히스토리
```

## 7. 스타일링 (Tailwind CSS)

### 커스텀 색상

```javascript
// tailwind.config.js
colors: {
  primary: {
    "500": "#2942FF",  // 메인 브랜드 컬러
    // ... 50-950 전체 팔레트
  }
}
```

### 다크 모드

- `darkMode: 'class'` 설정
- `html` 태그에 `dark` 클래스 토글
- 예: `dark:bg-gray-900`, `dark:text-white`

### 커스텀 애니메이션

```javascript
animation: {
  'shake': 'shake 0.5s ease-in-out'  // 입력 오류 시 흔들림
}
```

### 글로벌 컴포넌트 레이어

```css
@layer components {
  .page { /* 페이지 컨테이너 */ }
  .card { /* 카드 스타일 */ }
  .button-grid { /* 버튼 그리드 */ }
  .status-badge { /* 상태 배지 */ }
}
```

## 8. 라우팅

```javascript
// App.jsx 라우트 구조
/auth/*              → AuthPage (인증)
/main               → MainPage (대시보드)
/gathering/:id      → GatheringPage (모임 상세)
/payment/:gatheringId → PaymentPage (결제)
/profile            → ProfilePage (프로필)
/payment-methods    → PaymentMethodPage (결제 수단)
/                   → 리다이렉트 (/main 또는 /auth)
```

### 보호된 라우트

- 인증된 사용자만 접근 가능
- 미인증 시 `/auth`로 리다이렉트

## 9. 인증 시스템

### WebAuthn/Passkey 플로우

**회원가입:**
1. `signupStart({ email, name })` → OTP 발송
2. `signupVerify({ email, otpCode })` → signupToken 저장
3. `signupPasskeyStart()` → Passkey challenge 발급
4. `signupPasskeyFinish()` → JWT 토큰 발급

**로그인:**
1. `loginStart({ email })` → server challenge 발급
2. `navigator.credentials.get()` → Passkey 인증
3. `loginFinish()` → JWT 토큰 발급

### 토큰 저장

```javascript
// sessionStorage 사용
sessionStorage.setItem('token', jwtToken);
```

## 10. 환경 설정

### 환경 변수

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_DELAY=0
VITE_RECAPTCHA_V3_SITE_KEY=...
VITE_RECAPTCHA_V2_SITE_KEY=...

# .env.production
VITE_API_BASE_URL=https://api.fliq-it.com/api/v1
VITE_ENV=production
```

### Vite 설정

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

## 11. 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 검사
npm run lint
```

## 12. 보안 고려사항

### XSS 방어

```javascript
import DOMPurify from 'dompurify';
const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
```

### CSRF 방어

```javascript
// Axios 인터셉터에서 헤더 설정
headers['X-Requested-With'] = 'XMLHttpRequest';
```

### CSP (Content Security Policy)

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="...">
```

## 13. 주요 기능

- **모임 관리**: 생성, 조회, QR코드 참여
- **비용 등록**: 모임 내 비용 기록
- **자동 정산**: 누가 누구에게 얼마 송금할지 계산
- **결제 수단**: 계좌 등록 및 관리
- **다크 모드**: 테마 전환 지원
- **반응형 UI**: 모바일 최적화

## 14. 패키지 의존성

### Dependencies (12개)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| axios | ^1.10.0 | HTTP 클라이언트 |
| clsx | ^1.2.1 | CSS 클래스 조건부 결합 |
| dompurify | ^3.3.1 | XSS 방어 |
| lucide-react | ^0.315.0 | 아이콘 |
| qrcode | ^1.5.4 | QR 코드 생성 |
| react | ^18.3.1 | UI 라이브러리 |
| react-dom | ^18.3.1 | React DOM 렌더링 |
| react-google-recaptcha | ^3.1.0 | reCAPTCHA v2 |
| react-google-recaptcha-v3 | ^1.11.0 | reCAPTCHA v3 |
| react-hot-toast | ^2.5.2 | 토스트 알림 |
| react-router-dom | ^6.30.1 | 라우팅 |
| zustand | ^4.5.7 | 상태 관리 |

### DevDependencies (10개)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @eslint/js | ^9.29.0 | ESLint 기본 규칙 |
| @vitejs/plugin-react | ^4.5.2 | Vite React 플러그인 |
| autoprefixer | ^10.4.21 | CSS 벤더 프리픽스 |
| eslint | ^9.29.0 | 코드 린터 |
| eslint-plugin-react-hooks | ^5.2.0 | Hooks 규칙 |
| eslint-plugin-react-refresh | ^0.4.20 | Fast Refresh |
| postcss | ^8.5.6 | CSS 후처리 |
| tailwindcss | ^3.4.17 | 유틸리티 CSS |
| vite | ^7.0.0 | 빌드 도구 |
