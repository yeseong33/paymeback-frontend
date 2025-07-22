# Pay Me Back Frontend

QR코드를 이용한 간편 더치페이 프론트엔드 애플리케이션

## 🚀 기능

- **사용자 인증**: 회원가입, 로그인, 이메일 OTP 인증
- **모임 관리**: 모임 생성, QR코드 발급, 참여자 관리
- **QR코드**: QR코드 생성/스캔을 통한 간편 참여
- **결제 시스템**: 더치페이 계산, 결제 처리, 상태 관리
- **실시간 현황**: 결제 진행 상황 실시간 확인

## 🛠 기술 스택

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: CSS + CSS Variables
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast
- **QR Code**: qrcode library

## 📱 화면 구성

### 인증 화면
- 로그인/회원가입 전환
- 이메일 OTP 인증
- 입력 값 실시간 검증

### 메인 화면
- 모임 만들기/참여하기 버튼
- 내 모임 목록
- 사용법 안내

### 모임 화면
- 모임 정보 및 참여자 목록
- QR 코드 생성/공유
- 결제 요청 생성 (방장)
- 결제 현황 확인 (방장)

### 결제 화면
- 결제 정보 확인
- 결제 방법 선택
- 카드 정보 입력
- 결제 상태 확인

## 🚀 설치 및 실행

### 1. 프로젝트 설정

```bash
# 프로젝트 클론
git clone [repository-url]
cd pay-me-back-frontend

# 의존성 설치
npm install
```