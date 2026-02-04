# 송금 UI 구현 스펙

## 목차
1. [디자인 토큰](#1-디자인-토큰)
2. [카드 컴포넌트 스펙](#2-카드-컴포넌트-스펙)
3. [애니메이션 구현 상세](#3-애니메이션-구현-상세)
4. [버튼 시스템](#4-버튼-시스템)
5. [완료 화면 스펙](#5-완료-화면-스펙)
6. [인터랙션 플로우](#6-인터랙션-플로우)
7. [접근성 고려사항](#7-접근성-고려사항)

---

## 1. 디자인 토큰

### 1.1 색상 (Colors)

#### Primary (송금 전)
```javascript
const COLORS = {
  primary: {
    gradient: 'from-blue-500 to-indigo-500',
    gradientHover: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    solid: '#3B82F6', // blue-500
  },
  success: {
    gradient: 'from-green-500 to-emerald-500',
    gradientHover: 'from-green-600 to-emerald-600',
    shadow: 'shadow-green-500/25',
    solid: '#22C55E', // green-500
  },
  complete: {
    gradient: 'from-green-500 to-emerald-600',
    background: 'bg-gradient-to-b from-green-500 to-emerald-600',
  }
};
```

#### 배경 (Background)
| 용도 | Light | Dark |
|------|-------|------|
| 페이지 배경 | `gray-50` (#F9FAFB) | `gray-900` (#111827) |
| 카드 배경 | `white` (#FFFFFF) | `gray-800` (#1F2937) |
| 금액 박스 | `gray-50` (#F9FAFB) | `gray-700/50` |
| 진행 바 트랙 | `gray-200` (#E5E7EB) | `gray-700` (#374151) |

#### 텍스트 (Text)
| 용도 | Light | Dark |
|------|-------|------|
| 제목 | `gray-900` (#111827) | `white` (#FFFFFF) |
| 본문 | `gray-700` (#374151) | `gray-300` (#D1D5DB) |
| 보조 | `gray-500` (#6B7280) | `gray-400` (#9CA3AF) |
| 비활성 | `gray-400` (#9CA3AF) | `gray-500` (#6B7280) |

### 1.2 간격 (Spacing)

```javascript
const SPACING = {
  page: {
    paddingX: '24px',  // px-6
    paddingY: '32px',  // py-8
  },
  card: {
    padding: '24px',   // p-6
    borderRadius: '24px', // rounded-3xl
    gap: '24px',       // space-y-6
  },
  button: {
    paddingY: '16px',  // py-4
    borderRadius: '16px', // rounded-2xl
  },
  stack: {
    offset: '12px',    // 카드 간 Y 오프셋
    scaleStep: 0.04,   // 카드 간 스케일 감소
    opacityStep: 0.25, // 카드 간 투명도 감소
  }
};
```

### 1.3 타이포그래피 (Typography)

| 요소 | 크기 | 굵기 | 행간 |
|------|------|------|------|
| 헤더 타이틀 | `text-base` (16px) | `font-medium` | 1.5 |
| 수신자 이름 | `text-xl` (20px) | `font-bold` | 1.4 |
| 금액 (메인) | `text-4xl` (36px) | `font-bold` | 1.2 |
| 금액 (단위) | `text-xl` (20px) | `font-normal` | 1.4 |
| 버튼 텍스트 | `text-lg` (18px) | `font-bold` | 1.5 |
| 보조 텍스트 | `text-sm` (14px) | `font-normal` | 1.5 |

### 1.4 그림자 (Shadows)

```css
/* 카드 그림자 */
.card-shadow {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  /* Tailwind: shadow-xl */
}

/* 버튼 그림자 */
.button-shadow-blue {
  box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.25);
}

.button-shadow-green {
  box-shadow: 0 10px 15px -3px rgb(34 197 94 / 0.25);
}
```

---

## 2. 카드 컴포넌트 스펙

### 2.1 카드 구조

```
Card (384px max-width)
├── Header (128px height)
│   ├── Decorative Circle 1 (top-right, -40px offset)
│   ├── Decorative Circle 2 (bottom-left, -40px offset)
│   └── Icon Container (80x80px, centered)
│       └── Send Icon (36px)
│
└── Content (padding: 24px)
    ├── Profile Section
    │   ├── Avatar (48x48px, rounded-full)
    │   ├── Name (20px, bold)
    │   └── Account Info (14px, gray-500)
    │
    ├── Amount Box (padding: 20px, rounded-2xl)
    │   ├── Label ("송금 금액", 14px)
    │   └── Amount (36px + 20px unit)
    │
    └── Action Button (full-width, 56px height)
```

### 2.2 헤더 그라데이션 상세

```jsx
<div className="h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 relative overflow-hidden">
  {/* 장식 원 - 우상단 */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />

  {/* 장식 원 - 좌하단 */}
  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />

  {/* 아이콘 컨테이너 */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
      <Send className="text-white" size={36} />
    </div>
  </div>
</div>
```

### 2.3 카드 스택 렌더링

```jsx
// 뒤 카드들 (최대 2장)
{pendingSettlements.slice(currentIndex + 1, currentIndex + 3).map((_, idx) => (
  <div
    key={idx}
    className="absolute inset-x-4 top-0 h-full bg-white dark:bg-gray-800 rounded-3xl shadow-lg"
    style={{
      transform: `translateY(${(idx + 1) * 12}px) scale(${1 - (idx + 1) * 0.04})`,
      opacity: 1 - (idx + 1) * 0.25,
      zIndex: 10 - idx,
    }}
  />
))}

// 현재 카드
<div
  className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden
    transition-all duration-500 ${isAnimating ? 'animate-card-fly-up' : ''}`}
  style={{ zIndex: 20 }}
>
  {/* 카드 내용 */}
</div>
```

### 2.4 프로필 이니셜 아바타

```jsx
<div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full">
  <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
    {name?.charAt(0) || '?'}
  </span>
</div>
```

---

## 3. 애니메이션 구현 상세

### 3.1 카드 날아가기 (Card Fly Up)

```css
@keyframes card-fly-up {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  40% {
    transform: translateY(-30%) scale(0.98);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-120%) scale(0.9);
    opacity: 0;
  }
}

.animate-card-fly-up {
  animation: card-fly-up 0.5s ease-in-out forwards;
}
```

**트리거 조건:**
```javascript
const handleMarkComplete = async () => {
  // 1. API 호출
  await settlementAPI.complete(settlementId);

  // 2. 애니메이션 시작
  setIsAnimating(true);

  // 3. 0.5초 후 다음 카드로 전환
  setTimeout(() => {
    setIsAnimating(false);
    setCurrentIndex(prev => prev + 1);
  }, 500);
};
```

### 3.2 스케일 인 (Scale In)

```css
@keyframes scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);  /* 오버슈트 - 탄성 효과 */
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

**이징 커브 설명:**
- `cubic-bezier(0.34, 1.56, 0.64, 1)`: 탄성 있는 오버슈트 효과
- 50% 지점에서 105%까지 확대 후 100%로 안착

### 3.3 콘페티 시스템

```jsx
const CONFETTI_COLORS = ['#fff', '#FFE66D', '#4ECDC4', '#95E1D3', '#F8B500'];
const CONFETTI_COUNT = 30;

// 렌더링
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  {[...Array(CONFETTI_COUNT)].map((_, i) => (
    <div
      key={i}
      className="confetti"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        // 크기 변형 (선택적)
        width: `${8 + Math.random() * 6}px`,
        height: `${8 + Math.random() * 6}px`,
      }}
    />
  ))}
</div>
```

```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  animation: confetti-fall 3s ease-in-out forwards;
}
```

### 3.4 진행 바 애니메이션

```jsx
<div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div
    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
    style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
  />
</div>
```

**핵심:**
- `transition-all duration-500 ease-out`: 0.5초 동안 부드러운 전환
- 퍼센트 계산: `(현재 인덱스 + 1) / 전체 개수 * 100`

---

## 4. 버튼 시스템

### 4.1 버튼 상태 매트릭스

| 상태 | 배경 | 텍스트 | 아이콘 | 그림자 |
|------|------|--------|--------|--------|
| 송금하기 (기본) | blue→indigo gradient | white | Send | blue/25 |
| 송금하기 (hover) | blue-600→indigo-600 | white | Send | blue/30 |
| 완료했어요 (기본) | green→emerald gradient | white | Check | green/25 |
| 완료했어요 (hover) | green-600→emerald-600 | white | Check | green/30 |
| 로딩 | 현재 상태 + opacity-50 | - | Spinner | 현재 상태 |
| 비활성 | gray-300 | white | 현재 | none |

### 4.2 버튼 구현

```jsx
// 송금 버튼 (토스 앱 열기 전)
<button
  onClick={handleTransfer}
  disabled={!hasPaymentMethod}
  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500
    hover:from-blue-600 hover:to-indigo-600
    disabled:bg-gray-300 disabled:cursor-not-allowed
    text-white font-bold text-lg rounded-2xl
    flex items-center justify-center gap-2
    transition-all shadow-lg shadow-blue-500/25"
>
  <Send size={22} />
  {amount?.toLocaleString()}원 송금하기
</button>

// 완료 버튼 (토스 앱 열고 돌아온 후)
<button
  onClick={handleMarkComplete}
  disabled={isProcessing}
  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500
    hover:from-green-600 hover:to-emerald-600
    disabled:opacity-50
    text-white font-bold text-lg rounded-2xl
    flex items-center justify-center gap-2
    transition-all shadow-lg shadow-green-500/25"
>
  {isProcessing ? (
    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  ) : (
    <>
      <Check size={22} />
      송금 완료했어요
    </>
  )}
</button>
```

### 4.3 로딩 스피너

```jsx
<span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
```

```css
/* Tailwind animate-spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 5. 완료 화면 스펙

### 5.1 레이아웃

```jsx
<div className="fixed inset-0 z-50 bg-gradient-to-b from-green-500 to-emerald-600 flex flex-col">
  {/* 헤더 */}
  <div className="flex items-center justify-between p-4">
    <div className="w-10" /> {/* 좌측 스페이서 */}
    <div className="text-white/80 font-medium">송금 완료</div>
    <button className="w-10 h-10 flex items-center justify-center">
      <X className="text-white/80" size={24} />
    </button>
  </div>

  {/* 메인 콘텐츠 */}
  <div className="flex-1 flex flex-col items-center justify-center px-8">
    {/* 콘페티 */}
    {/* ... */}

    <div className="animate-scale-in text-center">
      {/* 파티 아이콘 */}
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
        <PartyPopper className="text-white" size={48} />
      </div>

      {/* 타이틀 */}
      <h1 className="text-4xl font-bold text-white mb-3">완료!</h1>
      <p className="text-white/80 text-lg mb-12">모든 송금이 완료되었습니다</p>

      {/* 건수 박스 */}
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-12 py-8 mb-12">
        <div className="text-6xl font-bold text-white mb-2">{totalCount}</div>
        <div className="text-white/70">건 송금 완료</div>
      </div>
    </div>
  </div>

  {/* 하단 버튼 */}
  <div className="p-6 pb-8">
    <button className="w-full py-4 bg-white text-green-600 font-bold text-lg rounded-2xl shadow-lg">
      확인
    </button>
  </div>
</div>
```

### 5.2 아이콘 컨테이너

```jsx
// 글래스모피즘 효과
<div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
  <PartyPopper className="text-white" size={48} />
</div>
```

### 5.3 건수 박스

```jsx
<div className="bg-white/20 backdrop-blur-sm rounded-3xl px-12 py-8">
  <div className="text-6xl font-bold text-white mb-2">{count}</div>
  <div className="text-white/70">건 송금 완료</div>
</div>
```

---

## 6. 인터랙션 플로우

### 6.1 상태 머신

```
┌─────────────┐
│   IDLE      │ ← 초기 상태
└──────┬──────┘
       │ 토스 앱 열기
       ▼
┌─────────────┐
│ TOSS_OPENED │ ← 토스 앱 열림 (openedTossIds에 추가)
└──────┬──────┘
       │ "송금 완료했어요" 클릭
       ▼
┌─────────────┐
│  PROCESSING │ ← API 호출 중
└──────┬──────┘
       │ API 성공
       ▼
┌─────────────┐
│  ANIMATING  │ ← 카드 날아감 (0.5초)
└──────┬──────┘
       │ 애니메이션 완료
       ▼
┌─────────────┐
│ NEXT_CARD   │ ← 다음 카드 표시 or 완료 화면
└─────────────┘
```

### 6.2 상태 관리 코드

```javascript
const [currentIndex, setCurrentIndex] = useState(0);
const [completedIds, setCompletedIds] = useState(new Set());
const [openedTossIds, setOpenedTossIds] = useState(new Set());
const [isAnimating, setIsAnimating] = useState(false);
const [showComplete, setShowComplete] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);

// 파생 상태
const hasOpenedToss = currentSettlement && openedTossIds.has(currentSettlement.id);
const isLastCard = currentIndex === totalCount - 1;
const allCompleted = completedIds.size === totalCount;
```

### 6.3 완료 감지

```javascript
useEffect(() => {
  if (completedIds.size === totalCount && totalCount > 0) {
    // 300ms 딜레이 후 완료 화면 표시
    setTimeout(() => setShowComplete(true), 300);
  }
}, [completedIds.size, totalCount]);
```

---

## 7. 접근성 고려사항

### 7.1 ARIA 속성

```jsx
// 진행 상태
<div
  role="progressbar"
  aria-valuenow={currentIndex + 1}
  aria-valuemin={1}
  aria-valuemax={totalCount}
  aria-label={`송금 진행 상황: ${totalCount}건 중 ${currentIndex + 1}건`}
>
  {/* 진행 바 */}
</div>

// 버튼
<button
  aria-label={hasOpenedToss ? '송금 완료 확인' : `${amount}원 송금하기`}
  aria-busy={isProcessing}
>
  {/* 버튼 내용 */}
</button>

// 완료 화면
<div role="alert" aria-live="polite">
  모든 송금이 완료되었습니다
</div>
```

### 7.2 키보드 네비게이션

```jsx
// ESC 키로 닫기
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

### 7.3 모션 감소 (prefers-reduced-motion)

```css
@media (prefers-reduced-motion: reduce) {
  .animate-card-fly-up,
  .animate-scale-in,
  .animate-bounce-in,
  .confetti {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 부록: 체크리스트

### 구현 시 확인사항

- [ ] 다크 모드 색상 대응
- [ ] 로딩 상태 UI
- [ ] 에러 상태 처리 (토스트 메시지)
- [ ] 빈 상태 (보낼 정산 없음)
- [ ] 계좌 정보 없음 처리
- [ ] 진행 바 퍼센트 계산
- [ ] 카드 스택 z-index 관리
- [ ] 애니메이션 타이밍 동기화
- [ ] 접근성 속성 적용
- [ ] 모션 감소 미디어 쿼리
