# System Overview

> **Version**: 1.0
> **Last Updated**: 2026-01-22
> **Status**: Draft

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                          (Next.js 14 App Router)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Landing  │  │ Chatbot  │  │ Products │  │ Pricing  │  │Dashboard │ │
│  │  Page    │  │  Window  │  │ Selection│  │Calculator│  │ /Compare │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                             (FastAPI)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  /chat   │  │/products │  │ /pricing │  │ /contact │                │
│  │  Router  │  │  Router  │  │  Router  │  │  Router  │                │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘                │
│       │             │                                                    │
│       ▼             ▼                                                    │
│  ┌──────────┐  ┌──────────────────────────────────────────────────┐    │
│  │  Chat    │  │           Multi-Agent Pipeline                   │    │
│  │  Agent   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │    │
│  │          │  │  │ Agent 1 │─▶│ Agent 2 │─▶│ Agent 3 │          │    │
│  │          │  │  │  (RAG)  │  │ (Match) │  │(Scorer) │          │    │
│  └──────────┘  │  └─────────┘  └─────────┘  └─────────┘          │    │
│                │                                                   │    │
│                └──────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             ┌──────────┐   ┌──────────┐   ┌──────────┐
             │ Supabase │   │  Claude  │   │  Static  │
             │    DB    │   │   API    │   │   Data   │
             └──────────┘   └──────────┘   └──────────┘
```

---

## 2. Frontend Structure

### 2.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | React useState/useEffect |
| Auth | Supabase Auth |
| HTTP | Fetch API |

### 2.2 Page Routes

```
src/app/
├── page.tsx                    # Landing Page
├── login/page.tsx              # 로그인
├── signup/page.tsx             # 회원가입
├── auth/callback/              # OAuth 콜백
├── catalog/page.tsx            # 제품 카탈로그
├── compare/page.tsx            # 프로젝트 비교
├── dashboard/page.tsx          # 대시보드
└── project/
    └── [id]/
        ├── page.tsx            # 프로젝트 상세
        ├── products/page.tsx   # 제품 선택
        └── pricing/page.tsx    # 가격 계산
```

### 2.3 Component Structure

```
src/components/
├── landing/                    # 랜딩페이지 컴포넌트
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── DemoChat.tsx
│   ├── DemoQualityEval.tsx
│   ├── DemoMapPreview.tsx
│   ├── Footer.tsx
│   └── ContactModal.tsx
│
├── chat/                       # 챗봇 컴포넌트
│   ├── ChatWindow.tsx
│   ├── ChatMessage.tsx
│   └── InlineSalesForm.tsx
│
├── products/                   # 제품 관련 컴포넌트
│   ├── CombinedProductPreview.tsx
│   ├── ProductCard.tsx
│   ├── CategoryGroup.tsx
│   └── EnvironmentSection.tsx
│
├── compare/                    # 비교 페이지 컴포넌트
│   ├── FeaturesComparison.tsx
│   ├── PricingComparison.tsx
│   ├── QualityComparison.tsx
│   └── NDAModal.tsx
│
├── pricing/                    # 가격 계산 컴포넌트
│   └── PricingCalculator.tsx
│
├── catalog/                    # 카탈로그 컴포넌트
│   └── CatalogProductCard.tsx
│
└── dashboard/                  # 대시보드 컴포넌트
    └── ProjectList.tsx
```

### 2.4 Core Libraries

```
src/lib/
├── api.ts                      # API 호출 함수
├── types.ts                    # TypeScript 타입 정의
├── supabase.ts                 # Supabase 클라이언트
└── utils.ts                    # 유틸리티 함수
```

---

## 3. Backend Structure

### 3.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Validation | Pydantic |
| AI | Claude API (Anthropic) |
| Database | Supabase (PostgreSQL) |
| Email | SMTP |

### 3.2 Directory Structure

```
backend/
├── main.py                     # FastAPI 앱 진입점
├── database.py                 # Supabase 연결
├── pydantic_schemas.py         # Pydantic 모델
├── prompts.py                  # AI 프롬프트
│
├── routers/                    # API 라우터
│   ├── chat.py                 # /chat 엔드포인트
│   ├── products.py             # /products 엔드포인트
│   ├── pricing.py              # /pricing 엔드포인트
│   └── contact.py              # /contact 엔드포인트
│
├── services/                   # 비즈니스 로직
│   ├── chat_agent.py           # 챗봇 에이전트
│   ├── product_matcher.py      # 제품 매칭 로직
│   ├── api_differentiation.py  # API 차별화 분석
│   └── feature_deduplicator.py # Feature 중복 제거
│
├── improved_pipeline_v2.py     # 멀티 에이전트 파이프라인
├── agent3_scorer.py            # Agent 3 스코어러
│
├── data/                       # 정적 데이터
│   ├── Product_Dsc_All.json    # 제품 설명 데이터
│   ├── pricing_db.json         # 가격 데이터
│   └── ...
│
└── scripts/                    # 유틸리티 스크립트
```

### 3.3 API Endpoints

| Router | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| chat | POST | `/chat` | AI 챗봇 메시지 전송 |
| products | POST | `/products/match` | 제품 매칭 실행 |
| products | GET | `/products/catalog` | 전체 카탈로그 조회 |
| products | GET | `/products/{id}` | 제품 상세 조회 |
| pricing | POST | `/pricing/calculate` | 가격 계산 |
| contact | POST | `/contact` | 일반 문의 |
| contact | POST | `/contact/sales-lead` | 세일즈 리드 |

---

## 4. Multi-Agent Pipeline

### 4.1 Pipeline Flow

```
User Requirements
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AGENT 1: RAG                                  │
│  - 요구사항에서 키워드 추출                                            │
│  - Product_Dsc_All.json에서 관련 제품 검색                            │
│  - 후보 제품 리스트 생성 (10-20개)                                    │
└────────────────────────────────────────────────────────────────────┬─┘
                                                                     │
       ▼                                                             │
┌─────────────────────────────────────────────────────────────────────┐
│                       AGENT 2: MATCHER                               │
│  - 각 후보 제품에 대해 요구사항 매칭                                   │
│  - Feature 매칭 점수 계산                                            │
│  - Environment (Mobile/Backend) 필터링                               │
│  - 점수별 정렬                                                        │
└────────────────────────────────────────────────────────────────────┬─┘
                                                                     │
       ▼                                                             │
┌─────────────────────────────────────────────────────────────────────┐
│                       AGENT 3: SCORER                                │
│  - 최종 점수 조정 (부스트/페널티)                                      │
│  - Vehicle Type 보정                                                 │
│  - Routing Type 보정                                                 │
│  - 카테고리별 Top 제품 선정                                           │
└────────────────────────────────────────────────────────────────────┬─┘
                                                                     │
       ▼
Final Recommendations (by Feature Category)
```

### 4.2 Key Files

| File | Purpose |
|------|---------|
| `improved_pipeline_v2.py` | 전체 파이프라인 오케스트레이션 |
| `services/product_matcher.py` | Agent 2 매칭 로직 |
| `agent3_scorer.py` | Agent 3 스코어링 로직 |
| `services/chat_agent.py` | 챗봇 요구사항 추출 |
| `prompts.py` | AI 프롬프트 정의 |

---

## 5. Data Models

### 5.1 Core Types (Frontend)

```typescript
// Requirements - 사용자 요구사항
interface Requirements {
  use_case: string;
  required_features: string[];
  application: string | string[];
  region: string;
  vehicle_types?: string[];
  routing_types?: string[];
  additional_notes?: string;
}

// Product - 추천 제품
interface Product {
  id: string;
  provider: string;
  product_name: string;
  description: string;
  features: FeatureDetail[];
  matched_features: string[];
  match_score: number;
  document_url: string;
}

// FeatureDetail - Feature 상세
interface FeatureDetail {
  name: string;
  description: string;
  use_case: string;
}

// Project - 프로젝트
interface Project {
  id: string;
  name: string;
  user_id: string;
  requirements: Requirements;
  selected_products: SelectionState;
  pricing_data?: PricingData;
  created_at: string;
}
```

### 5.2 Database Schema (Supabase)

```sql
-- projects 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  use_case TEXT,
  required_features TEXT[],
  application TEXT,
  region TEXT,
  vehicle_types TEXT[],
  routing_types TEXT[],
  selected_products JSONB,
  pricing_data JSONB,
  match_result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. External Dependencies

### 6.1 APIs

| Service | Purpose | Config |
|---------|---------|--------|
| Claude API | AI 챗봇, 분석 | `ANTHROPIC_API_KEY` |
| Supabase | Auth, Database | `SUPABASE_URL`, `SUPABASE_KEY` |
| SMTP | 이메일 전송 | `SMTP_*` 환경변수 |

### 6.2 Static Data Files

| File | Description |
|------|-------------|
| `Product_Dsc_All.json` | 모든 지도 제품 설명 |
| `pricing_db.json` | 벤더별 가격 정보 |
| `feature_categories.json` | Feature 카테고리 매핑 |

---

## 7. Environment Variables

### Backend (.env)

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# Email
SMTP_EMAIL=...
SMTP_PASSWORD=...
ADMIN_EMAIL=...
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 8. Development Workflow

```
1. Start Backend
   cd backend && uvicorn main:app --reload --port 8000

2. Start Frontend
   cd frontend && npm run dev

3. Access
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-22 | Initial draft | Claude Code |
