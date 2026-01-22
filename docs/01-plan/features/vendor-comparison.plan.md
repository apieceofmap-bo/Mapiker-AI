# Project Compare Feature Enhancement Plan

> **Summary**: Dashboard의 프로젝트 비교 기능 개선 - 단일 페이지 레이아웃, PDF 내보내기, Quality 연동
>
> **Author**: Claude Code
> **Date**: 2026-01-21
> **Status**: Draft (v0.8)

---

## 1. Overview

### 1.1 Purpose

Dashboard에서 2개 이상의 프로젝트를 비교하는 기능을 개선한다:
- 가시성 및 사용성 향상
- 단일 페이지 레이아웃 + 사이드 네비게이션
- PDF 내보내기 (NDA 동의 포함)
- Quality Evaluation 연동 준비

### 1.2 Background

- 현재 Compare 버튼이 작고 눈에 잘 띄지 않음
- 탭 기반 UI가 비교 경험을 분절시킴
- PDF 내보내기 기능 부재
- Quality Evaluation 시스템 별도 개발 중 (향후 연동 필요)

### 1.3 Current State Analysis

**현재 구현:**
- `ProjectList.tsx`: Compare 모드 진입 버튼 (작은 텍스트 버튼)
- `/compare` 페이지: Pricing, Features, Quality **탭 분리**
- 2-3개 프로젝트 선택 후 비교

**개선 방향:**
| 항목 | 현재 | 목표 |
|------|------|------|
| Compare 버튼 | 작은 아이콘+텍스트 | 카드형 안내 + Tooltip |
| 페이지 레이아웃 | 탭 분리 | **단일 페이지 + 사이드 네비게이션** |
| PDF 내보내기 | 없음 | **NDA 동의 후 다운로드** |
| Quality 데이터 | 직접 표시 | **조건부 활성화** (Report 구매/Test Key 발급) |

### 1.4 Related Systems

- **Frontend**: `Mapiker-AI/frontend`
- **Backend**: `Mapiker-AI/backend`
- **Quality Evaluator**: `Mapiker-AI-Quality-Evaluator` (별도 개발 중, 향후 연동)

---

## 2. Scope

### 2.1 In Scope

**UI/UX:**
- [ ] Compare 버튼 가시성 개선 (카드형 안내 + Tooltip)
- [ ] 단일 페이지 레이아웃으로 변경 (탭 제거)
- [ ] 사이드 네비게이션 (섹션 북마크)
- [ ] 단계별 데이터 표시 + 다음 단계 유도

**PDF 내보내기:**
- [ ] NDA 동의 모달
- [ ] Confidential 워터마크/문구 삽입
- [ ] PDF 생성 및 다운로드

**Quality Evaluation 연동:**
- [ ] Quality Report 구매 시 데이터 표시
- [ ] Test Key 발급 시 유저 코멘트 입력 활성화
- [ ] 조건부 섹션 활성화 로직

**Backend:**
- [ ] PDF 생성 API (또는 프론트엔드 생성)
- [ ] Quality 활성화 상태 조회 API
- [ ] 유저 코멘트 저장/조회 API

### 2.2 Out of Scope

- Compare 기능을 Catalog에 추가 (Dashboard 전용)
- Quality Evaluator 시스템 자체 개발 (별도 프로젝트)
- 실시간 Quality 테스트 결과 연동 (Phase 2)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| **UI/UX** ||||
| FR-01 | Compare 버튼 개선 | High | 카드형 안내 → Tooltip 전환 |
| FR-02 | 단일 페이지 레이아웃 | High | Features, Pricing, Quality 한 페이지에 표시 |
| FR-03 | 사이드 네비게이션 | High | 섹션별 빠른 이동 북마크 |
| FR-04 | 단계별 데이터 표시 | High | 완료 단계만 표시 + 미완료 유도 |
| **PDF 내보내기** ||||
| FR-05 | NDA 동의 모달 | High | 다운로드 전 체크박스 동의 필수 |
| FR-06 | Confidential 문구 | High | PDF에 기밀 정보 고지 삽입 |
| FR-07 | PDF 다운로드 | High | 현재 비교 리포트 PDF 생성 |
| **Quality 연동** ||||
| FR-08 | Quality Report 조건부 표시 | Medium | 구매 시에만 데이터 표시 |
| FR-09 | Test Key 코멘트 입력 | Medium | 발급 후에만 프리텍스트 입력 가능 |
| FR-10 | 조건 미충족 시 안내 | Medium | 활성화 방법 안내 + CTA 버튼 |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Performance | 페이지 로딩 < 2초 | Lighthouse |
| Accessibility | 키보드 네비게이션 | Tab 키 테스트 |
| Security | NDA 동의 로깅 | Backend 기록 |
| Legal | Confidential 문구 필수 | PDF 검증 |

---

## 4. Project Stages & Compare Data

### 4.1 Stage Progression

> **Note**: 프로젝트는 Products & Preview 또는 Catalog에서 제품 선택 완료 후에만 생성됨.

```
Stage 2: Products Selected (프로젝트 생성 시 기본 상태)
         → Features Section 전체 표시

Stage 3: Pricing Calculated
         → Pricing Section 표시

Stage 4: Quality Evaluation
         → Quality Section (조건부 활성화)
            ├── Quality Report 구매 시: 평가 데이터 표시
            └── Test Key 발급 시: 유저 코멘트 입력 가능
```

### 4.2 Quality Section Activation Conditions

| 조건 | 표시 내용 | 활성화 방법 |
|------|----------|------------|
| 없음 | "Quality 데이터 없음" 안내 | - |
| Quality Report 구매 | 전문 평가 데이터 | Report 구매 페이지 연결 |
| Test Key 발급 | 유저 코멘트 입력 필드 | Test Key 신청 페이지 연결 |
| 둘 다 | 평가 데이터 + 유저 코멘트 | - |

### 4.3 Compare Report Progressive Display

| Stage | Features | Pricing | Quality |
|-------|----------|---------|---------|
| 2 (Products) | Full data | "Go to Pricing" | 조건부 |
| 3 (Pricing) | Full data | Full data | 조건부 |
| 4 (Quality) | Full data | Full data | 조건부 활성화 |

---

## 5. UI/UX Design

### 5.1 Compare Button (Dashboard)

**첫 방문 시 (카드형 안내):**
```
┌─────────────────────────────────────────────────────────┐
│ My Projects                              [+ New Project]│
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐│
│ │ 📊 Compare Projects                           [✕]   ││
│ │ Select 2-3 projects to compare pricing,             ││
│ │ features, and quality side-by-side.                 ││
│ │ [ ] Don't show again          [Start Compare →]    ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**숨김 후 (Tooltip 스타일):**
- 강조된 Compare 버튼
- 호버 시 기능 설명 Tooltip

### 5.2 Compare Page - Single Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard              Compare Report    [📥 Export PDF]│
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                        │
│ NAVIGATE │  Project Header (Project A | Project B | Project C)   │
│          │  ─────────────────────────────────────────────────────│
│ ○ Features│                                                       │
│ ○ Pricing │  ┌─────────────────────────────────────────────────┐ │
│ ○ Quality │  │ FEATURES SECTION                                │ │
│          │  │ Vendor, Product Name, Category, Key Features... │ │
│          │  └─────────────────────────────────────────────────┘ │
│          │                                                        │
│          │  ┌─────────────────────────────────────────────────┐ │
│          │  │ PRICING SECTION                                  │ │
│          │  │ Monthly estimates, pricing tier...              │ │
│          │  └─────────────────────────────────────────────────┘ │
│          │                                                        │
│          │  ┌─────────────────────────────────────────────────┐ │
│          │  │ QUALITY SECTION                                  │ │
│          │  │ (조건부 활성화)                                  │ │
│          │  └─────────────────────────────────────────────────┘ │
│          │                                                        │
└──────────┴───────────────────────────────────────────────────────┘
```

**사이드 네비게이션:**
- 고정 위치 (sticky)
- 현재 보고 있는 섹션 하이라이트
- 클릭 시 해당 섹션으로 스크롤

### 5.3 Quality Section States

**State A: 아무것도 없음**
```
┌─────────────────────────────────────────────────────────────────┐
│ QUALITY EVALUATION                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 Quality data is not available for these projects            │
│                                                                  │
│  To unlock quality comparison:                                   │
│  • Purchase Quality Report for professional evaluation          │
│  • Or request Test Keys to evaluate yourself                    │
│                                                                  │
│  [Purchase Quality Report]     [Request Test Keys]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**State B: Quality Report 구매됨**
```
┌─────────────────────────────────────────────────────────────────┐
│ QUALITY EVALUATION                                               │
├─────────────┬─────────────┬─────────────────────────────────────┤
│             │ Project A   │ Project B                           │
├─────────────┼─────────────┼─────────────────────────────────────┤
│ Overall     │ 8.5/10      │ 7.2/10                              │
│ Coverage    │ 95%         │ 88%                                 │
│ Accuracy    │ High        │ Medium                              │
│ ...         │ ...         │ ...                                 │
└─────────────┴─────────────┴─────────────────────────────────────┘
```

**State C: Test Key 발급됨 (유저 코멘트)**
```
┌─────────────────────────────────────────────────────────────────┐
│ YOUR EVALUATION NOTES                                            │
├─────────────┬─────────────┬─────────────────────────────────────┤
│             │ Project A   │ Project B                           │
├─────────────┼─────────────┼─────────────────────────────────────┤
│ Your Notes  │ ┌─────────┐ │ ┌─────────────────────────────────┐ │
│             │ │ API가    │ │ │ Test Key 미발급                │ │
│             │ │ 빠르고   │ │ │                                │ │
│             │ │ 안정적임 │ │ │ [Request Test Key →]           │ │
│             │ └─────────┘ │ └─────────────────────────────────┘ │
│             │ [Edit]      │                                     │
└─────────────┴─────────────┴─────────────────────────────────────┘
```

### 5.4 PDF Export Flow

```
1. User clicks [📥 Export PDF]
   ↓
2. NDA Agreement Modal appears
   ┌─────────────────────────────────────────────────────────┐
   │ Non-Disclosure Agreement                                 │
   │ ───────────────────────────────────────────────────────│
   │                                                          │
   │ This document contains confidential information.         │
   │ By downloading, you agree to:                           │
   │                                                          │
   │ • Not share this document externally                    │
   │ • All intellectual property belongs to A Piece of Map   │
   │   Inc. and our map product partners                     │
   │ • Use this information only for internal evaluation     │
   │                                                          │
   │ ☑ I agree to the Non-Disclosure Agreement              │
   │                                                          │
   │ [Cancel]                    [Download PDF]              │
   └─────────────────────────────────────────────────────────┘
   ↓
3. PDF generated with Confidential watermark
4. Download starts
```

### 5.5 PDF Document Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONFIDENTIAL                             │
│         Project Comparison Report - [Date]                       │
│                                                                  │
│  ⚠️ This document contains confidential information.            │
│  All intellectual property belongs to A Piece of Map Inc.       │
│  and respective map product partners. External distribution     │
│  is strictly prohibited.                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Features Comparison Table]                                    │
│                                                                  │
│  [Pricing Comparison Table]                                     │
│                                                                  │
│  [Quality Evaluation] (if available)                            │
│                                                                  │
│  [User Notes] (if available)                                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Generated by Mapiker AI | © A Piece of Map Inc.                │
│  Confidential - Do not distribute                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Technical Implementation

### 6.1 Frontend Files to Modify/Create

| File | Action | Changes |
|------|--------|---------|
| `components/dashboard/ProjectList.tsx` | Modify | Compare 버튼 UI 개선, Tooltip |
| `app/compare/page.tsx` | **Rewrite** | 단일 페이지 레이아웃 |
| `components/compare/SideNavigation.tsx` | **New** | 사이드 네비게이션 컴포넌트 |
| `components/compare/FeaturesSection.tsx` | Modify | 탭→섹션 변환 |
| `components/compare/PricingSection.tsx` | Modify | 탭→섹션 변환 |
| `components/compare/QualitySection.tsx` | **Rewrite** | 조건부 활성화 로직 |
| `components/compare/UserComments.tsx` | **New** | 유저 코멘트 입력/표시 |
| `components/compare/NDAModal.tsx` | **New** | NDA 동의 모달 |
| `components/compare/PDFExport.tsx` | **New** | PDF 생성 로직 |
| `lib/pdf-generator.ts` | **New** | PDF 생성 유틸리티 |

### 6.2 Backend Files to Modify/Create

| File | Action | Changes |
|------|--------|---------|
| `routers/compare.py` | **New** | Compare 관련 API 엔드포인트 |
| `routers/quality.py` | **New/Modify** | Quality 활성화 상태 API |
| `models/user_comments.py` | **New** | 유저 코멘트 모델 |
| `services/pdf_service.py` | **New** (Optional) | 서버사이드 PDF 생성 |

### 6.3 Database Schema Changes

```sql
-- 유저 코멘트 테이블 (새로 생성)
CREATE TABLE project_quality_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 프로젝트 테이블에 Quality 활성화 상태 컬럼 추가
ALTER TABLE projects ADD COLUMN quality_report_purchased BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN test_keys_issued BOOLEAN DEFAULT FALSE;

-- NDA 동의 로그 테이블
CREATE TABLE nda_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  project_ids TEXT[], -- 비교한 프로젝트 ID 배열
  agreed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT
);
```

### 6.4 API Endpoints

**Compare Router (`/api/compare`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quality-status?projects=id1,id2` | 각 프로젝트의 Quality 활성화 상태 |
| GET | `/comments?projects=id1,id2` | 프로젝트별 유저 코멘트 조회 |
| POST | `/comments` | 유저 코멘트 저장/수정 |
| POST | `/nda-agreement` | NDA 동의 기록 |
| POST | `/generate-pdf` | (Optional) 서버사이드 PDF 생성 |

**Request/Response Examples:**

```typescript
// GET /api/compare/quality-status?projects=id1,id2
{
  "projects": {
    "id1": {
      "quality_report_purchased": true,
      "test_keys_issued": true,
      "quality_data": { ... }  // if purchased
    },
    "id2": {
      "quality_report_purchased": false,
      "test_keys_issued": false,
      "quality_data": null
    }
  }
}

// POST /api/compare/comments
{
  "project_id": "uuid",
  "comment": "API 응답 속도가 빠르고 안정적임"
}

// POST /api/compare/nda-agreement
{
  "project_ids": ["id1", "id2"],
  "agreed": true
}
```

### 6.5 Quality Evaluator Integration (Future)

> **Note**: Quality Evaluator는 별도 프로젝트 (`Mapiker-AI-Quality-Evaluator`)에서 개발 중.
> 연동 준비를 위한 인터페이스만 정의.

```typescript
// Quality Evaluator에서 제공할 데이터 인터페이스 (예상)
interface QualityReportData {
  projectId: string;
  overallScore: number;       // 0-10
  coveragePercent: number;    // 0-100
  accuracyRating: 'High' | 'Medium' | 'Low';
  detailedMetrics: {
    mapQuality: number;
    routingAccuracy: number;
    geocodingPrecision: number;
    // ... 추가 메트릭
  };
  generatedAt: string;
}

// 연동 방식 (TBD)
// Option A: API 호출
// Option B: Shared Database
// Option C: Webhook/Event
```

---

## 7. Success Criteria

### 7.1 Definition of Done

**UI/UX:**
- [ ] Compare 버튼 카드형 안내 표시
- [ ] "Don't show again" 기능 동작
- [ ] 단일 페이지 레이아웃 구현
- [ ] 사이드 네비게이션 동작 (스크롤 + 하이라이트)
- [ ] 단계별 데이터 표시 동작

**PDF 내보내기:**
- [ ] NDA 동의 모달 표시
- [ ] 동의 없이 다운로드 불가
- [ ] PDF에 Confidential 문구 포함
- [ ] PDF 다운로드 정상 동작

**Quality 연동:**
- [ ] Quality Report 미구매 시 안내 표시
- [ ] Test Key 미발급 시 안내 표시
- [ ] 유저 코멘트 저장/수정/표시 동작
- [ ] 조건부 섹션 활성화 동작

**Backend:**
- [ ] Quality 상태 조회 API 동작
- [ ] 유저 코멘트 CRUD API 동작
- [ ] NDA 동의 로깅 동작

### 7.2 Quality Criteria

- [ ] TypeScript 빌드 성공
- [ ] 기존 Compare 기능 회귀 없음
- [ ] 모바일 반응형 동작
- [ ] PDF 파일 정상 열림

---

## 8. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 페이지가 너무 길어짐 | Medium | High | 사이드 네비게이션으로 해결 |
| PDF 생성 성능 | Medium | Medium | 클라이언트 사이드 생성 우선 |
| Quality Evaluator 연동 지연 | Low | Medium | 조건부 UI로 분리 |
| NDA 법적 효력 | Medium | Low | 법무 검토 필요 |

---

## 9. Implementation Order

### Phase 1: UI/UX 기본
1. Compare 버튼 가시성 개선 + Tooltip
2. 단일 페이지 레이아웃 변환
3. 사이드 네비게이션 구현

### Phase 2: PDF 내보내기
4. NDA 동의 모달 구현
5. PDF 생성 로직 (클라이언트 사이드)
6. Confidential 문구 삽입

### Phase 3: Quality UI 준비 (데모 데이터)
7. Backend: Quality 상태 API + 코멘트 API
8. Frontend: 조건부 Quality 섹션 (데모용 랜덤 숫자로 UI 구현)
9. 유저 코멘트 입력/표시

### Phase 4: Quality Evaluator 연동 (Future)
> ⚠️ **시작 전 필수**: Quality Evaluator 연동 방식 결정 (API vs Shared DB vs Webhook)

10. Quality Evaluator 시스템과 연동
11. 데모 데이터 → 실제 Quality 데이터로 교체

---

## 10. Decisions Made

| 항목 | 결정 사항 |
|------|----------|
| Compare 버튼 디자인 | 카드형 → Tooltip 전환 |
| 페이지 레이아웃 | 탭 제거 → 단일 페이지 + 사이드 네비게이션 |
| PDF 내보내기 | NDA 동의 필수, Confidential 문구 삽입 |
| PDF 생성 방식 | 클라이언트 사이드 (html2pdf.js) |
| Quality 표시 조건 | Report 구매 또는 Test Key 발급 시에만 활성화 |
| 유저 코멘트 | Test Key 발급 후에만 입력 가능 |
| Compare 최대 개수 | 3개 유지 |

---

## 11. Open Questions & Action Items

### Resolved
| 항목 | 결정 | 날짜 |
|------|------|------|
| PDF 생성 위치 | 클라이언트 사이드 (html2pdf.js) | 2026-01-21 |
| NDA 문구 법무 검토 | 나중에 별도 실시 | 2026-01-21 |

### ⚠️ TODO: 반드시 체크 필요

> **Quality Evaluator 연동 방식 결정**
>
> - **옵션**: API 호출 vs Shared Database vs Webhook/Event
> - **결정 시점**: Quality Evaluator (`Mapiker-AI-Quality-Evaluator`) 개발 진행 후
> - **담당**: Product Owner
> - **리마인더**: ⏰ **Compare 기능 Phase 4 시작 전** 반드시 결정 필요
>
> ```
> [ ] Quality Evaluator 개발 상태 확인
> [ ] 연동 방식 3가지 옵션 검토
> [ ] 기술적 제약사항 파악
> [ ] 최종 연동 방식 결정
> ```
>
> **Note**: Phase 3에서는 데모용 랜덤 데이터로 UI만 구현

---

## 12. Implementation Issues & Fixes

### 12.1 Pricing Data Not Showing (2026-01-21)

**증상:** 프로젝트에 Pricing 데이터가 있지만 Compare 페이지에서 "No pricing data available" 표시

**원인:**
- `PricingComparison.tsx`에서 `p.pricing_calculated && p.pricing_data` 조건 사용
- DB에서 `pricing_calculated`가 `null`로 반환되는 경우 조건이 false가 됨

**해결:**
```typescript
// Before
const hasPricingData = projects.some((p) => p.pricing_calculated && p.pricing_data);

// After
const hasPricingData = projects.some(
  (p) => p.pricing_data && p.pricing_data.vendors && p.pricing_data.vendors.length > 0
);
```

### 12.2 PDF Export oklab Color Error (2026-01-21)

**증상:** Export PDF 클릭 시 콘솔에 `Attempting to parse an unsupported color function "oklab"` 에러

**원인:**
- Tailwind CSS v4가 색상 보간에 `oklab` 색상 공간 사용
- html2canvas가 `oklab` 형식을 지원하지 않음

**해결:**
- `onclone` 콜백으로 oklab 색상을 fallback 색상으로 교체
- `backgroundColor: "#ffffff"` 옵션 추가
- `allowTaint: true` 옵션 추가

```typescript
html2canvas: {
  backgroundColor: "#ffffff",
  allowTaint: true,
  onclone: (clonedDoc: Document) => {
    // Add CSS overrides for oklab colors
    addColorOverrides(clonedDoc);
  },
}
```

### 12.3 Compare Page Enhancements (2026-01-21)

**요청사항:**
1. Compare 페이지에서 실시간 Pricing 계산 기능 추가
2. 섹션 순서 변경: Features → Pricing → Quality
3. 레이아웃 여백 조정 (테이블 칼럼 간격)
4. Features Comparison 전면 개편

**구현 내용:**

#### 1. 실시간 Pricing 계산
- `PricingComparison.tsx` 전면 재작성
- Custom Usage 입력 추가 (Monthly API Requests, MAU, Trips, Destinations)
- 기존 `calculatePricing` API 연동
- 프로젝트별 실시간 가격 계산 및 비교

#### 2. 섹션 순서 변경
```typescript
// Before
const sections: SectionInfo[] = [
  { id: "pricing", ... },
  { id: "features", ... },
  { id: "quality", ... },
];

// After
const sections: SectionInfo[] = [
  { id: "features", ... },
  { id: "pricing", ... },
  { id: "quality", ... },
];
```

#### 3. 레이아웃 조정
- 테이블 padding: `px-6` → `px-4`
- Vendor 칼럼 고정 폭: `w-36`
- `table-fixed` 클래스 추가

#### 4. Features Comparison 개편
**변경 전:**
- Product Count Summary
- Provider/Product 매트릭스
- Category Coverage (가격 티어 기반)

**변경 후:**
- Project Info Header (Region, Required Features 표시)
- Selected Product Summary (프로젝트명, 숫자, 제품 리스트)
- Feature Comparison by Category (Feature Category별 기능 비교)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-21 | Initial draft | Claude Code |
| 0.2 | 2026-01-21 | Project comparison 방향 수정 | Claude Code |
| 0.3 | 2026-01-21 | Stage 1 제거, Option A 확정 | Claude Code |
| 0.4 | 2026-01-21 | 단일 페이지 레이아웃, PDF 내보내기, Quality 조건부 활성화 | Claude Code |
| 0.5 | 2026-01-21 | PDF 클라이언트 사이드 확정, Quality Evaluator 연동 TODO 추가 | Claude Code |
| 0.6 | 2026-01-21 | Phase 3 데모 데이터 사용, Phase 4 시작 전 리마인더 설정 | Claude Code |
| 0.7 | 2026-01-21 | Implementation Issues 섹션 추가 (Pricing 조건, oklab 에러) | Claude Code |
| 0.8 | 2026-01-21 | Compare 개선: 실시간 Pricing, 섹션 순서, Features 개편 | Claude Code |
| 0.9 | 2026-01-21 | Feature Category 실시간 재분류, 추가 개선사항 계획 | Claude Code |

---

## 13. Upcoming Changes (v0.9)

### 13.1 Feature Category 실시간 재분류 (완료)

**문제:**
- Catalog에서 직접 선택한 프로젝트의 경우 `sub_category` 기준으로 분류됨
- Google: "Enterprise", "Essentials", "Pro" (가격 티어)
- Mapbox: "Standard Pricing" (단일)
- 챗봇 추천 프로젝트는 `feature_category` 기준으로 분류됨 ("Map Rendering", "Navigation" 등)

**해결:**
- `FeaturesComparison.tsx`에서 백엔드 Catalog API 호출
- 제품 ID → feature_category 매핑 생성
- 기존 프로젝트도 실시간으로 feature_category 기준 재분류

**수정 파일:**
- `src/components/compare/FeaturesComparison.tsx`

---

### 13.2 추가 수정사항 계획

> **Status**: Planning
> **Author**: [사용자 입력 대기]
> **Priority**: [High/Medium/Low]

#### 요청사항

| # | 항목 | 설명 | 우선순위 |
|---|------|------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

#### 영향 범위

| 범위 | 수정 필요 | 상세 |
|------|----------|------|
| 프론트엔드 | [ ] Yes / [ ] No | |
| 백엔드 | [ ] Yes / [ ] No | |
| 데이터베이스 | [ ] Yes / [ ] No | |

#### 수정 파일 목록

**프론트엔드:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| | New/Modify | |
| | New/Modify | |

**백엔드:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| | New/Modify | |
| | New/Modify | |

#### 구현 순서

1.
2.
3.
4.
5.

#### 검증 항목

- [ ]
- [ ]
- [ ]

---
