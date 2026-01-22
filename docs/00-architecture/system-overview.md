# System Overview - Mapiker-AI Complete Architecture

> **Version**: 2.0
> **Last Updated**: 2026-01-22
> **Status**: Complete

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                          (Next.js 14 App Router)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │ Chatbot  │  │ Products │  │ Pricing  │  │Dashboard │     │
│  │  Page    │  │  Window  │  │ Selection│  │Calculator│  │ /Compare │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (localhost:8000)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                         │
│                             (FastAPI)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │/api/chat │  │/api/prod │  │/api/pric │  │/api/cont │                    │
│  │  Router  │  │  Router  │  │  Router  │  │  Router  │                    │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘                    │
│       │             │                                                        │
│       ▼             ▼                                                        │
│  ┌──────────┐  ┌──────────────────────────────────────────────────────┐    │
│  │  Chat    │  │           Multi-Agent Pipeline (3-Agent)             │    │
│  │  Agent   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              │    │
│  │(Claude)  │  │  │ Agent 1 │─▶│ Agent 2 │─▶│ Agent 3 │              │    │
│  └──────────┘  │  │(LLM/RAG)│  │(Matcher)│  │(Scorer) │              │    │
│                │  └─────────┘  └─────────┘  └─────────┘              │    │
│                └──────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
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

## 2. Repository Structure

> **Note**: Frontend와 Backend는 별도 Git 저장소입니다.

```
Mapiker-AI/                    # 루트 (git repo 아님)
├── frontend/                  # ← Frontend Git Repo
│   ├── CLAUDE.md              # 프로젝트 개요
│   ├── docs/                  # 통합 PDCA 문서 (FE+BE)
│   │   ├── _INDEX.md
│   │   ├── 00-architecture/   # 시스템 아키텍처 (이 문서)
│   │   ├── 01-plan/           # 계획 문서
│   │   ├── 02-design/         # 설계 문서
│   │   ├── 03-analysis/       # 분석 문서
│   │   └── 04-report/         # 완료 리포트
│   └── src/                   # 소스 코드
│
├── backend/                   # ← Backend Git Repo (별도)
│   ├── CLAUDE.md              # Backend 개요 + docs 참조
│   └── _archive_docs/         # (Archive) 기존 문서
│
├── supabase/                  # Supabase 설정
└── start.sh                   # 개발 서버 실행
```

---

## 3. Frontend Structure (Complete)

### 3.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | React useState/useEffect |
| Auth | Supabase Auth |
| HTTP | Fetch API |

### 3.2 Page Routes (src/app/)

| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Landing Page |
| `/login` | `login/page.tsx` | 로그인 페이지 |
| `/signup` | `signup/page.tsx` | 회원가입 페이지 |
| `/auth/callback` | `auth/callback/route.ts` | OAuth 콜백 처리 |
| `/catalog` | `catalog/page.tsx` | 제품 카탈로그 |
| `/compare` | `compare/page.tsx` | 프로젝트 비교 |
| `/dashboard` | `dashboard/page.tsx` | 대시보드 |
| `/project/new` | `project/new/page.tsx` | 새 프로젝트 생성 |
| `/project/[id]` | `project/[id]/page.tsx` | 프로젝트 상세 (Chatbot) |
| `/project/[id]/products` | `project/[id]/products/page.tsx` | 제품 선택 |
| `/project/[id]/pricing` | `project/[id]/pricing/page.tsx` | 가격 계산 |
| `/project/[id]/quality` | `project/[id]/quality/page.tsx` | 품질 평가 |
| `/project/[id]/quality/report` | `project/[id]/quality/report/page.tsx` | 품질 리포트 |
| `/project/[id]/quality/test-keys` | `project/[id]/quality/test-keys/page.tsx` | 테스트 키 요청 |

### 3.3 Layouts

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout (AuthProvider 포함) |
| `dashboard/layout.tsx` | Dashboard layout |
| `project/[id]/layout.tsx` | Project layout (StageIndicator) |

### 3.4 Components Structure (src/components/)

#### 3.4.1 Landing Page Components (`landing/`)

| Component | Description |
|-----------|-------------|
| `HeroChat.tsx` | 히어로 섹션 챗봇 데모 |
| `DemoMatchingFlow.tsx` | 제품 매칭 플로우 데모 |
| `DemoMapPreview.tsx` | 지도 미리보기 데모 |
| `DemoQualityEval.tsx` | 품질 평가 데모 |
| `ProductShowcase.tsx` | 제품 쇼케이스 |
| `ServiceList.tsx` | 서비스 목록 |
| `PhoneMockup.tsx` | 폰 목업 UI |
| `MapBackground.tsx` | 지도 배경 애니메이션 |
| `MapAnimation.tsx` | 지도 애니메이션 |
| `CoordinatePicker.tsx` | 좌표 선택기 |
| `DeliveryExample.tsx` | 배달 유즈케이스 예시 |
| `RetailExample.tsx` | 리테일 유즈케이스 예시 |
| `LogisticsExample.tsx` | 물류 유즈케이스 예시 |
| `FinalCTA.tsx` | 최종 CTA 섹션 |
| `Footer.tsx` | 푸터 |
| `ContactModal.tsx` | 연락처 모달 |
| `CookieSettingsModal.tsx` | 쿠키 설정 모달 |
| `PrivacyPolicyModal.tsx` | 개인정보처리방침 모달 |

#### 3.4.2 Chat Components (`chat/`)

| Component | Description |
|-----------|-------------|
| `ChatWindow.tsx` | 메인 챗봇 윈도우 |
| `ChatMessage.tsx` | 채팅 메시지 컴포넌트 |
| `InlineSalesForm.tsx` | 인라인 세일즈 폼 |

#### 3.4.3 Products Components (`products/`)

| Component | Description |
|-----------|-------------|
| `ProductSelection.tsx` | 제품 선택 메인 컴포넌트 |
| `CombinedProductPreview.tsx` | 통합 제품 미리보기 |
| `ProductCard.tsx` | 제품 카드 |
| `CategoryGroup.tsx` | 카테고리 그룹 |
| `EnvironmentSection.tsx` | Mobile/Backend 환경 섹션 |

#### 3.4.4 Catalog Components (`catalog/`)

| Component | Description |
|-----------|-------------|
| `CatalogProductCard.tsx` | 카탈로그 제품 카드 |
| `FilterSidebar.tsx` | 필터 사이드바 |
| `CreateProjectModal.tsx` | 프로젝트 생성 모달 |

#### 3.4.5 Compare Components (`compare/`)

| Component | Description |
|-----------|-------------|
| `FeaturesComparison.tsx` | 기능 비교 테이블 |
| `PricingComparison.tsx` | 가격 비교 |
| `QualityComparison.tsx` | 품질 비교 |
| `NDAModal.tsx` | NDA 동의 모달 |

#### 3.4.6 Pricing Components (`pricing/`)

| Component | Description |
|-----------|-------------|
| `PricingCalculator.tsx` | 가격 계산기 |
| `VendorComparison.tsx` | 벤더 비교 |

#### 3.4.7 Quality Components (`quality/`)

| Component | Description |
|-----------|-------------|
| `CountrySelector.tsx` | 국가 선택기 |
| `FeatureSelector.tsx` | 기능 선택기 |
| `QualityReportPricing.tsx` | 품질 리포트 가격 |
| `TestKeysRequest.tsx` | 테스트 키 요청 폼 |

#### 3.4.8 Auth Components (`auth/`)

| Component | Description |
|-----------|-------------|
| `AuthProvider.tsx` | Supabase Auth Context Provider |
| `LoginForm.tsx` | 로그인 폼 |
| `SignupForm.tsx` | 회원가입 폼 |
| `NDAModal.tsx` | NDA 동의 모달 |

#### 3.4.9 Dashboard Components (`dashboard/`)

| Component | Description |
|-----------|-------------|
| `ProjectList.tsx` | 프로젝트 목록 |
| `ProjectCard.tsx` | 프로젝트 카드 |
| `StageIndicator.tsx` | 단계 표시기 |

#### 3.4.10 Preview Components (`preview/`)

| Component | Description |
|-----------|-------------|
| `PreviewPage.tsx` | 미리보기 페이지 |
| `MapPreview.tsx` | 지도 미리보기 |
| `MapboxPreview.tsx` | Mapbox 미리보기 |
| `EmbedCode.tsx` | 임베드 코드 |

#### 3.4.11 Layout Components (`layout/`)

| Component | Description |
|-----------|-------------|
| `Navbar.tsx` | 네비게이션 바 |

#### 3.4.12 Common Components (`common/`)

| Component | Description |
|-----------|-------------|
| `ConfidentialBanner.tsx` | 기밀 배너 |

#### 3.4.13 Root Level Components

| Component | Description |
|-----------|-------------|
| `GlobalContactSalesButton.tsx` | 글로벌 세일즈 연락 버튼 |
| `ContactSalesButton.tsx` | 세일즈 연락 버튼 |
| `SessionRestoreDialog.tsx` | 세션 복구 다이얼로그 |
| `EmailReportModal.tsx` | 이메일 리포트 모달 |

### 3.5 Libraries (src/lib/)

| File | Description |
|------|-------------|
| `api.ts` | Backend API 호출 함수 |
| `types.ts` | TypeScript 타입 정의 |
| `supabase.ts` | Supabase 클라이언트 (Client) |
| `supabase-server.ts` | Supabase 서버 클라이언트 |
| `supabase-middleware.ts` | Supabase 미들웨어 |
| `sessionStorage.ts` | 세션 스토리지 유틸리티 |
| `environmentDetector.ts` | Mobile/Backend 환경 감지 |
| `qualityEvaluationOptions.ts` | 품질 평가 옵션 |
| `vendorColors.ts` | 벤더별 색상 정의 |
| `accessLog.ts` | 접근 로그 |

### 3.6 Other Frontend Files

| File | Description |
|------|-------------|
| `middleware.ts` | Next.js 미들웨어 (Auth) |
| `types/html2pdf.d.ts` | html2pdf 타입 선언 |

---

## 4. Backend Structure (Complete)

### 4.1 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Validation | Pydantic |
| AI Chat | Claude API (Anthropic) |
| AI Pipeline | Gemini API (Google) |
| Database | Supabase (PostgreSQL) |
| Email | SMTP |

### 4.2 Directory Structure

```
backend/
├── CLAUDE.md              # Backend 개요 + docs 참조
├── main.py                # FastAPI 앱 진입점
├── database.py            # Supabase 연결
├── pydantic_schemas.py    # Pydantic 모델 정의
├── prompts.py             # AI 프롬프트 정의
├── improved_pipeline_v2.py  # 멀티 에이전트 파이프라인
├── agent3_scorer.py       # Agent 3 스코어러
│
├── routers/               # API 라우터
│   ├── __init__.py
│   ├── chat.py            # /api/chat 엔드포인트
│   ├── products.py        # /api/products 엔드포인트
│   ├── pricing.py         # /api/pricing 엔드포인트
│   └── contact.py         # /api/contact 엔드포인트
│
├── services/              # 비즈니스 로직
│   ├── __init__.py
│   ├── chat_agent.py      # 챗봇 에이전트 (Claude)
│   ├── product_matcher.py # 제품 매칭 Wrapper
│   ├── feature_deduplicator.py  # Feature 중복 제거
│   └── api_differentiation.py   # API 차별화 분석
│
├── data/                  # 정적 데이터
│   ├── Product_Dsc_All.json   # 제품 설명 데이터
│   └── pricing_db.json        # 가격 데이터
│
├── scripts/               # 유틸리티 스크립트
│   ├── add_feature_category.py  # Feature 카테고리 추가
│   ├── feature_matching_simulator.py  # 매칭 시뮬레이터
│   ├── sync_features.py         # Feature 동기화
│   └── watch_and_sync.py        # 변경 감시 & 동기화
│
├── original_pipeline/     # 원본 파이프라인 (Archive)
│   ├── __init__.py
│   ├── agent3_scorer.py
│   ├── database.py
│   ├── improved_pipeline_v2.py
│   ├── pricing_calculator.py
│   ├── prompts.py
│   └── pydantic_schemas.py
│
└── _archive_docs/         # (Archive) 기존 문서
```

### 4.3 Core Backend Files

#### 4.3.1 main.py

FastAPI 앱 진입점. 라우터 등록 및 CORS 설정.

```python
# CORS Origins
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]

# Routers
/api/chat      # Chat Router
/api/products  # Products Router
/api/pricing   # Pricing Router
/api/contact   # Contact Router
```

#### 4.3.2 pydantic_schemas.py

Pydantic 모델 정의:

- `CustomerInput` - 사용자 입력 모델
- `FeatureDetail` - Feature 상세 (name, description, use_case)
- `VendorSummary` - 벤더별 요약
- `FeatureVendorMapping` - Feature-제품 매핑
- `FinalRecommendations` - 최종 추천 결과

#### 4.3.3 prompts.py

Claude API 프롬프트 정의:

- Chat Agent 시스템 프롬프트
- 요구사항 추출 프롬프트
- Feature 매핑 프롬프트

---

## 5. API Endpoints (Complete)

### 5.1 Chat Router (`/api/chat`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/chat` | AI 챗봇 메시지 | `ChatRequest` | `ChatResponse` |
| GET | `/api/chat/initial` | 초기 인사 메시지 | - | `{message: string}` |

**ChatRequest:**
```json
{
  "message": "string",
  "conversation_history": [{"role": "user|assistant", "content": "string"}]
}
```

**ChatResponse:**
```json
{
  "reply": "string",
  "extracted_requirements": {...} | null,
  "is_complete": false,
  "trigger_sales_form": false
}
```

### 5.2 Products Router (`/api/products`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/products/match` | 제품 매칭 실행 | `RequirementsRequest` | `MatchResponse` |
| GET | `/api/products/categories` | 카테고리 조회 | - | `{categories: [...]}` |
| GET | `/api/products/catalog` | 전체 카탈로그 | `?provider=&category=&search=` | `CatalogResponse` |
| GET | `/api/products/catalog/{id}` | 제품 상세 | - | `CatalogProduct` |

**RequirementsRequest:**
```json
{
  "use_case": "food-delivery",
  "use_case_description": "string",
  "required_features": ["Forward Geocoding", "Traffic Flow"],
  "application": "mobile-app" | ["mobile-app", "backend"],
  "region": "South Korea",
  "vehicle_types": ["scooter", "bicycle"],
  "routing_types": ["multi_waypoint", "matrix"],
  "additional_notes": "string"
}
```

**MatchResponse:**
```json
{
  "categories": [{
    "id": "routing",
    "name": "Routing & Directions",
    "required": true,
    "description": "...",
    "products": [{
      "id": "google-directions-api",
      "provider": "Google",
      "product_name": "Directions API",
      "description": "...",
      "features": [{"name": "...", "description": "...", "use_case": "..."}],
      "matched_features": ["Forward Geocoding"],
      "match_score": 85.5,
      "document_url": "...",
      "data_format": "API"
    }]
  }],
  "total_matched": 15,
  "feature_coverage": {
    "total_required": 5,
    "total_covered": 4,
    "coverage_percent": 80,
    "covered_features": [...],
    "uncovered_features": [...],
    "bonus_features": [...]
  },
  "required_features": [...]
}
```

### 5.3 Pricing Router (`/api/pricing`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/pricing/calculate` | 가격 계산 | `{product_ids, monthly_requests}` | `BulkPricingResponse` |
| GET | `/api/pricing/product/{id}` | 개별 제품 가격 | `?monthly_requests=` | `ProductCost` |
| POST | `/api/pricing/vendor` | 벤더별 가격 | `{vendor, product_ids, monthly_requests}` | `VendorPricingResponse` |
| GET | `/api/pricing/info` | 가격 정보 메타 | - | `{version, last_updated, ...}` |

### 5.4 Contact Router (`/api/contact`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/api/contact` | 일반 문의 | `ContactFormData` | `{success, message}` |
| POST | `/api/contact/sales-lead` | 세일즈 리드 | `SalesLeadRequest` | `{success, message}` |
| POST | `/api/contact/report` | 리포트 이메일 | `ReportEmailData` | `{success, message}` |

---

## 6. Multi-Agent Pipeline (Detailed)

### 6.1 Pipeline Overview

```
User Requirements
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT 1: Semantic Feature Mapping (LLM)           │
│  - User Features → DB Features 매핑                                      │
│  - Pre-computed 매핑 캐시 활용 (PRECOMPUTED_FEATURE_MAPPINGS)            │
│  - Gemini API (gemini-2.5-flash) 사용                                    │
│  - Temperature=0.0 (완전 결정적)                                         │
└────────────────────────────────────────────────────────────────────────┬─┘
                                                                         │
       ▼                                                                 │
┌─────────────────────────────────────────────────────────────────────────┐
│                       AGENT 2: Product Matching (Rule-based)             │
│  - Agent 1의 매핑 결과로 Exact String Matching                           │
│  - Product_Dsc_All.json 데이터베이스 검색                                │
│  - 환경(Mobile/Backend) 필터링                                           │
│  - Vendor별 제품 그룹핑                                                   │
└────────────────────────────────────────────────────────────────────────┬─┘
                                                                         │
       ▼                                                                 │
┌─────────────────────────────────────────────────────────────────────────┐
│                       AGENT 3: Scoring & Ranking (Rule-based)            │
│  - Feature Coverage (30%) 계산                                           │
│  - Regional Quality (20%) 평가                                           │
│  - Agent 2 Score (50%) 반영                                              │
│  - Vehicle Type 보정                                                     │
│  - Routing Type 보정                                                     │
│  - 카테고리별 Top 제품 선정                                              │
└────────────────────────────────────────────────────────────────────────┬─┘
                                                                         │
       ▼
Final Recommendations (by Feature Category)
```

### 6.2 Key Pipeline Files

| File | Purpose |
|------|---------|
| `improved_pipeline_v2.py` | 전체 파이프라인 오케스트레이션 |
| `services/product_matcher.py` | 파이프라인 Wrapper (Frontend 형식 변환) |
| `agent3_scorer.py` | Agent 3 스코어링 로직 |
| `services/chat_agent.py` | Chat Agent (Claude API) |
| `services/feature_deduplicator.py` | Feature 중복 제거 |
| `pydantic_schemas.py` | 데이터 모델 정의 |

### 6.3 Feature Mapping Cache

```python
# Pre-computed 매핑 예시 (improved_pipeline_v2.py)
PRECOMPUTED_FEATURE_MAPPINGS = {
    "Forward Geocoding": ["Forward Geocoding", "Geocoding", "Geocode and Reverse Geocode", ...],
    "Matrix Routing": ["Matrix Routing", "Distance Matrix", "Route Matrix", ...],
    "Traffic Flow": ["Traffic Flow", "Real-Time Traffic", "Traffic-aware Routing", ...],
    ...
}
```

### 6.4 Functional Categories

| Category ID | Name | Description |
|-------------|------|-------------|
| `map_display` | Map Display | Base map rendering, tiles, visualization |
| `routing` | Routing & Directions | Route calculation, directions, navigation |
| `geocoding` | Geocoding & Search | Address-coordinates conversion, place search |
| `traffic` | Traffic Data | Real-time and historical traffic |
| `tracking` | Asset Tracking | Real-time location and fleet tracking |
| `matrix` | Distance Matrix | Distance/time calculations |
| `optimization` | Route Optimization | Multi-stop optimization, fleet routing |
| `data` | Map Data & APIs | Raw data, elevation, weather |

---

## 7. Data Models

### 7.1 Frontend Types (types.ts)

```typescript
// 사용자 요구사항
interface Requirements {
  use_case: string;
  use_case_description?: string;
  required_features: string[];
  application: string | string[];
  region: string;
  vehicle_types?: string[];
  routing_types?: string[];
  additional_notes?: string;
}

// Feature 상세 (Phase 8 Unified Feature System)
interface FeatureDetail {
  name: string;
  description: string;
  use_case: string;
}

// 제품
interface Product {
  id: string;
  provider: string;
  product_name: string;
  description: string;
  features: FeatureDetail[];
  matched_features: string[];
  match_score: number;
  document_url: string;
  data_format: string;
  similar_products?: SimilarProduct[];
}

// 프로젝트
interface Project {
  id: string;
  user_id: string;
  name: string;
  use_case: string;
  required_features: string[];
  application: string | string[];
  region: string;
  vehicle_types?: string[];
  routing_types?: string[];
  selected_products: SelectionState | EnvironmentSelectionState;
  match_result?: MatchResponse;
  is_multi_environment: boolean;
  pricing_calculated: boolean;
  pricing_data?: PricingData;
  current_stage: 1 | 2 | 3 | 4;
  status: 'draft' | 'in_progress' | 'completed' | 'quote_requested';
  created_at: string;
  updated_at: string;
}
```

### 7.2 Backend Models (pydantic_schemas.py)

```python
class CustomerInput(BaseModel):
    use_case: str
    map_features: List[str]
    application: str
    monthly_requests: int
    region: str
    use_case_description: Optional[str]
    vehicle_types: Optional[List[str]]
    routing_type: Optional[str]

class FeatureDetail(BaseModel):
    name: str
    description: str = ""
    use_case: str = ""

class VendorSummary(BaseModel):
    vendor: str
    matched_products: List[str]
    matched_product_ids: List[str]
    match_score: float
    recommendation_reason: str
    pricing_estimate: float

class FeatureVendorMapping(BaseModel):
    feature: str
    google_product: Optional[str]
    google_product_id: Optional[str]
    here_product: Optional[str]
    here_product_id: Optional[str]
    mapbox_product: Optional[str]
    mapbox_product_id: Optional[str]
```

### 7.3 Database Schema (Supabase)

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
  is_multi_environment BOOLEAN DEFAULT FALSE,
  pricing_calculated BOOLEAN DEFAULT FALSE,
  current_stage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Static Data Files

### 8.1 Product_Dsc_All.json

전체 지도 제품 데이터베이스.

```json
{
  "products": [
    {
      "id": "google-directions-api",
      "provider": "Google",
      "product_name": "Directions API",
      "sub_category": "Routing",
      "feature_category": "Routing",
      "product_group": "Routes",
      "description": "...",
      "features": [
        {"name": "Route Calculation", "description": "...", "use_case": "..."},
        ...
      ],
      "suitable_for": {
        "use_cases": ["delivery", "ridesharing"],
        "applications": ["mobile-app", "backend"],
        "regions": ["Global"]
      },
      "data_format": "API",
      "document_url": "https://..."
    }
  ]
}
```

### 8.2 pricing_db.json

벤더별 가격 정보.

```json
{
  "version": "1.0",
  "last_updated": "2026-01",
  "currency": "USD",
  "products": {
    "google-directions-api": {
      "billing_unit": "request",
      "tiers": [
        {"from": 0, "to": 100000, "price_per_1000": 5.0},
        {"from": 100001, "to": null, "price_per_1000": 4.0}
      ],
      "free_tier": 0,
      "pricing_url": "https://..."
    }
  }
}
```

---

## 9. User Journey

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Landing    │───▶│   Chatbot   │───▶│  Products   │───▶│   Pricing   │
│   Page      │    │ (요구사항)   │    │  Selection  │    │ Calculator  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                    Sales Form         Dashboard            Compare
                    (세일즈 연결)      (프로젝트 관리)       (프로젝트 비교)
```

### User Journey Stages

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Chatbot | AI 챗봇으로 요구사항 수집 |
| 2 | Products | 추천 제품 선택 |
| 3 | Pricing | 가격 계산 및 비교 |
| 4 | Quality | 품질 평가 (선택적) |

---

## 10. Environment Variables

### 10.1 Backend (.env)

```bash
# Anthropic (Chat Agent)
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (Pipeline)
GEMINI_API_KEY=...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# Email
SMTP_EMAIL=...
SMTP_PASSWORD=...
ADMIN_EMAIL=...
```

### 10.2 Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 11. Development Commands

### 11.1 Server Startup

```bash
# 전체 서버 실행
./start.sh

# Frontend만 실행
cd frontend && npm run dev

# Backend만 실행
cd backend && uvicorn main:app --reload --port 8000
```

### 11.2 Build

```bash
# Frontend 빌드
cd frontend && npm run build
```

### 11.3 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## 12. Naming Conventions

### 12.1 Files

| Type | Convention | Example |
|------|------------|---------|
| 파일 | kebab-case | `user-journey-enhancements.plan.md` |
| 컴포넌트 | PascalCase | `ChatWindow.tsx` |
| 함수/변수 | camelCase | `sendChatMessage` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |

### 12.2 Git Commits

```
type: description

Ref: ../frontend/docs/01-plan/features/[feature].plan.md
Section: [섹션 번호]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

| Type | Description |
|------|-------------|
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
| `refactor:` | 리팩토링 |
| `docs:` | 문서 |
| `style:` | 스타일/포맷 |
| `test:` | 테스트 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-22 | Initial draft | Claude Code |
| 2.0 | 2026-01-22 | Complete architecture (모든 파일 포함) | Claude Code |
