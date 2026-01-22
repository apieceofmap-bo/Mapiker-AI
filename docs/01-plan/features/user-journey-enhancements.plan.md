# User Journey Enhancements Plan

> **Summary**: 챗봇 → 제품 추천 → Product Selection → Pricing 전체 사용자 여정 개선
>
> **Author**: Claude Code
> **Date**: 2026-01-21
> **Status**: Planning (v0.1)

---

## 1. Overview

### 1.1 Purpose

Mapiker AI의 핵심 사용자 여정을 개선한다:
- 챗봇 대화 유형 다양화 (세일즈 연결 기능)
- 추천 대기 화면 UX 개선
- Product Selection 페이지 기능 강화
- 로그인 플로우 버그 수정
- Pricing 페이지 정리 및 통일

### 1.2 User Journey Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Chatbot   │ → │  Loading    │ → │  Products   │ → │   Pricing   │
│  (요구사항)  │    │  (추천대기)  │    │ & Preview   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      ↓                                      ↓
 세일즈 연결                            Dashboard
 (신규 기능)                           (로그인 후)
```

---

## 2. Requirements Summary

### 2.1 변경사항 목록

| # | 영역 | 항목 | 우선순위 | 상태 |
|---|------|------|----------|------|
| **1. 챗봇** |||||
| 1.1 | Chatbot | 대화 유형 다양화 - 세일즈 팀 연결 기능 | High | TODO |
| 1.2 | Chatbot | "Requirements captured!" 후 안내 메시지 추가 | Medium | TODO |
| **2. 추천 대기화면** |||||
| 2.1 | Loading | 진행률 게이지 UI 개선 (점 → 단계적 채우기) | Medium | TODO |
| **3. Products & Preview** |||||
| 3.1 | Products | Vendor별 필터링 기능 추가 | High | TODO |
| 3.2 | Products | Vendor별 Required 제품 일괄 선택 기능 | High | TODO |
| 3.3 | Products | Required/Optional Features 표시 UI 변경 | High | TODO |
| 3.4 | Products | 로그인 후 새 프로젝트 자동 생성 버그 수정 | Critical | TODO |
| 3.5 | Products | Dashboard→Products 페이지 UI 수정 (5개 항목) | High | TODO |
| **4. Pricing** |||||
| 4.1 | Pricing | "Vendor Comparison" 탭 삭제 | Medium | TODO |
| 4.2 | Pricing | "Selected Products" 섹션 삭제 | Low | TODO |
| 4.3 | Pricing | 페이지 제목 통일 ("Price Calculation" 등) | Low | TODO |

---

## 3. Detailed Requirements

### 3.1 챗봇 (Chatbot)

#### 3.1.1 대화 유형 다양화 - 세일즈 팀 연결

**현재 상태:**
- 챗봇은 제품 요구사항 수집 및 추천만 수행
- 추가 요구사항 (시스템 구축 요청 등)에 대한 처리 없음

**요구사항:**
- 유저가 제품 추천 외 추가 요구사항 있을 경우 세일즈 팀으로 연결
- 예: "지도 제품을 활용한 시스템/서비스 구축 요청"
- 세일즈 팀에 고객 정보 및 요청사항 전달

**구현 방향:**
```
유저: "시스템 구축도 도와줄 수 있나요?"
     ↓
챗봇: "네, 저희 세일즈 팀이 도와드릴 수 있습니다.
      연락처를 남겨주시면 담당자가 연락드리겠습니다."
     ↓
[이름] [이메일] [전화번호] [요청사항] 폼 표시
     ↓
세일즈 팀에 알림 전송 (이메일/Slack 등)
```

**수정 파일:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `backend/services/chat_agent.py` | Modify | 세일즈 연결 의도 감지 로직 추가 |
| `backend/routers/contact.py` | Modify | 세일즈 리드 저장 API 확장 |
| `frontend/src/components/chat/` | Modify | 세일즈 연결 UI 컴포넌트 추가 |

---

#### 3.1.2 "Requirements captured!" 후 안내 메시지

**현재 상태:**
- "Here's a summary of your requirements" 표시
- "Requirements captured!" 박스 표시
- 다음 행동에 대한 안내 없음

**요구사항:**
- 안내 메시지 추가: "View Recommended Products 버튼을 누르거나, 추가 요청사항이 있으면 채팅창에 입력하세요"

**수정 파일:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/components/chat/RequirementsCard.tsx` | Modify | 안내 메시지 추가 |

---

### 3.2 추천 프로덕트 대기화면

#### 3.2.1 진행률 게이지 UI 개선

**현재 상태:**
- 회전하는 원 + 색깔 채워지는 점
- 점이 다 채워지면 초기화되고 다시 반복

**요구사항:**
- 초기화 없이 진행 비율에 따라 단계적으로 채워지기
- 완료 직전에 마지막 점이 채워지는 형태
- 실제 진행률과 연동 (가능한 경우)

**UI 변경:**
```
Before: ○ ○ ○ ○ ○ → ● ○ ○ ○ ○ → ● ● ○ ○ ○ → ... → ● ● ● ● ● → ○ ○ ○ ○ ○ (반복)

After:  ○ ○ ○ ○ ○ → ● ○ ○ ○ ○ → ● ● ○ ○ ○ → ● ● ● ○ ○ → ● ● ● ● ○ → ● ● ● ● ● (완료)
        (0%)       (20%)       (40%)        (60%)        (80%)        (100%)
```

**수정 파일:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/components/chat/LoadingIndicator.tsx` 또는 관련 파일 | Modify | 진행률 기반 게이지 로직 |

---

### 3.3 Products & Preview

#### 3.3.1 Vendor별 필터링 기능

**현재 상태:**
- 모든 Vendor의 제품이 카테고리별로 표시
- 특정 Vendor만 보는 필터 없음

**요구사항:**
- Vendor별 필터 드롭다운/탭 추가
- 선택한 Vendor의 제품만 표시

**UI 설계:**
```
┌─────────────────────────────────────────────────────────┐
│ Filter by Vendor: [All ▼] [Google] [HERE] [Mapbox] [NB] │
├─────────────────────────────────────────────────────────┤
│ ... 제품 목록 ...                                        │
└─────────────────────────────────────────────────────────┘
```

---

#### 3.3.2 Vendor별 Required 제품 일괄 선택

**현재 상태:**
- 제품을 하나씩 선택해야 함

**요구사항:**
- 특정 Vendor의 Required Features 해당 제품 일괄 선택 버튼
- 예: "Select all Google products for Required Features"

**UI 설계:**
```
┌─────────────────────────────────────────────────────────┐
│ Filter by Vendor: [Google ▼]                             │
│                                                          │
│ [✓ Select all Google products for Required Features]    │
├─────────────────────────────────────────────────────────┤
│ ... Google 제품 목록 ...                                 │
└─────────────────────────────────────────────────────────┘
```

---

#### 3.3.3 Required/Optional Features 표시 UI 변경

**현재 상태:**
- "Select one product from each required category" 문장 표시
- Required Features가 명시적으로 보이지 않음

**요구사항:**
1. "Select one product from each required category" 문장 삭제
2. 챗봇에서 설정한 Required Features 목록 표시
3. 제품 선택 시 해당 Feature 충족 표시 (마킹)
4. Optional Features도 별도 색상으로 표시
5. Required는 모두 선택해야 다음 단계로 진행 가능

**UI 설계:**
```
┌─────────────────────────────────────────────────────────┐
│ Required Features                                        │
│ ✓ Map Rendering (covered by: Dynamic Maps)              │
│ ✓ Navigation (covered by: Routes API)                   │
│ ○ Geocoding (not selected)                              │
│ ○ Places Search (not selected)                          │
├─────────────────────────────────────────────────────────┤
│ Optional Features                                        │
│ ◆ Traffic Data (covered by: Traffic API) [다른 색상]    │
│ ◇ Weather (not selected)                                │
└─────────────────────────────────────────────────────────┘
```

**색상 구분:**
- Required 충족: 녹색 (✓)
- Required 미충족: 회색 (○)
- Optional 충족: 파란색 (◆)
- Optional 미충족: 연회색 (◇)

---

#### 3.3.4 로그인 후 새 프로젝트 자동 생성 버그 수정

**현재 상태:**
- Sign In 안 한 상태에서 챗봇 → 제품 추천 → Products & Preview 진행
- 하단 로그인 버튼 클릭 → 로그인 완료
- Dashboard에 새 프로젝트가 없음 (기존 프로젝트만 표시)
- 뒤로가기 → 다시 Dashboard 클릭해야 새 프로젝트 생성됨

**요구사항:**
- 로그인 버튼 클릭 → Sign In 완료 후 → 자동으로 새 프로젝트 생성 → Dashboard에 표시

**원인 분석 필요:**
- [ ] 로그인 후 redirect 로직 확인
- [ ] 프로젝트 생성 타이밍 확인
- [ ] localStorage/sessionStorage에 임시 데이터 저장 여부 확인
- [ ] AuthProvider에서 로그인 후 콜백 처리 확인

**수정 파일 (예상):**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/components/auth/` | Modify | 로그인 후 프로젝트 생성 로직 |
| `frontend/src/app/products/page.tsx` | Modify | 임시 데이터 저장/복원 로직 |

---

#### 3.3.5 Dashboard → Products 페이지 UI 수정

**현재 위치:** Dashboard → 프로젝트 → Stage "Products" 클릭

**수정 항목:**

| # | 현재 상태 | 요구사항 |
|---|----------|----------|
| 1 | NavBar가 두 줄로 중복 | 두 번째 작은 NavBar 삭제 |
| 2 | Directory: "Directory / 프로젝트명 / Products" | "Directory / 프로젝트명"까지만 표시 (Stage명 제거) |
| 3 | "Refresh" 버튼 없음 | 제품 선택 초기화/재설정 버튼 추가 |
| 4 | 제품 변경 시 바로 Pricing으로 이동 | 경고 모달: "기존 기록 초기화" vs "새 프로젝트 생성" 선택 |
| 5 | "Back to Chat" 버튼 → Requirements 페이지로 이동 | 버튼 삭제 |

**수정 파일:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/app/project/[id]/products/page.tsx` | Modify | NavBar 중복 제거, Directory 수정, Refresh 버튼 추가, Back to Chat 삭제 |
| `frontend/src/components/products/` | Modify | 제품 변경 경고 모달 추가 |

---

### 3.4 Pricing

#### 3.4.1 "Vendor Comparison" 탭 삭제

**현재 상태:**
- Pricing 페이지에 "Vendor Comparison" 탭 존재

**요구사항:**
- 탭 삭제
- Comparison은 Dashboard의 Compare 리포트에서만 제공

---

#### 3.4.2 "Selected Products" 섹션 삭제

**현재 상태:**
- 하단에 "Selected Products" 섹션이 제품 목록 다시 표시

**요구사항:**
- 불필요한 중복이므로 삭제

---

#### 3.4.3 페이지 제목 통일

**현재 상태:**
- 다른 페이지: "Quality Evaluation" 등 기능명 표시
- Pricing: "프로젝트명" 표시 (불일치)

**요구사항:**
- "Price Calculation" 또는 "Pricing Estimate" 등으로 변경
- 다른 Stage 페이지와 일관성 유지

**수정 파일:**
| 파일 | 액션 | 변경 내용 |
|------|------|----------|
| `frontend/src/app/project/[id]/pricing/page.tsx` | Modify | 탭 삭제, 섹션 삭제, 제목 변경 |

---

## 4. Implementation Plan

### 4.1 Phase 1: Critical Bug Fix

| 순서 | 항목 | 예상 복잡도 |
|------|------|------------|
| 1 | 3.3.4 로그인 후 새 프로젝트 자동 생성 버그 수정 | High |

### 4.2 Phase 2: Products & Preview 개선

| 순서 | 항목 | 예상 복잡도 |
|------|------|------------|
| 2 | 3.3.5 Dashboard→Products 페이지 UI 수정 (5개 항목) | Medium |
| 3 | 3.3.3 Required/Optional Features 표시 UI 변경 | High |
| 4 | 3.3.1 Vendor별 필터링 기능 | Medium |
| 5 | 3.3.2 Vendor별 Required 제품 일괄 선택 | Medium |

### 4.3 Phase 3: Pricing 정리

| 순서 | 항목 | 예상 복잡도 |
|------|------|------------|
| 6 | 3.4.1 "Vendor Comparison" 탭 삭제 | Low |
| 7 | 3.4.2 "Selected Products" 섹션 삭제 | Low |
| 8 | 3.4.3 페이지 제목 통일 | Low |

### 4.4 Phase 4: 챗봇 & UX 개선

| 순서 | 항목 | 예상 복잡도 |
|------|------|------------|
| 9 | 3.1.2 "Requirements captured!" 후 안내 메시지 | Low |
| 10 | 3.2.1 추천 대기화면 진행률 게이지 개선 | Medium |
| 11 | 3.1.1 챗봇 세일즈 팀 연결 기능 | High |

---

## 5. Affected Files Summary

### 5.1 Frontend

| 파일 | 항목 |
|------|------|
| `src/app/project/[id]/products/page.tsx` | 3.3.5 |
| `src/app/project/[id]/pricing/page.tsx` | 3.4.1, 3.4.2, 3.4.3 |
| `src/app/products/page.tsx` | 3.3.1, 3.3.2, 3.3.3, 3.3.4 |
| `src/components/products/CombinedProductPreview.tsx` | 3.3.1, 3.3.2, 3.3.3 |
| `src/components/products/CategoryGroup.tsx` | 3.3.3 |
| `src/components/chat/RequirementsCard.tsx` | 3.1.2 |
| `src/components/chat/LoadingIndicator.tsx` | 3.2.1 |
| `src/components/auth/AuthProvider.tsx` | 3.3.4 |

### 5.2 Backend

| 파일 | 항목 |
|------|------|
| `backend/services/chat_agent.py` | 3.1.1 |
| `backend/routers/contact.py` | 3.1.1 |

---

## 6. Verification Checklist

### 6.1 챗봇
- [ ] 세일즈 연결 요청 시 폼 표시
- [ ] 세일즈 팀에 알림 전송 확인
- [ ] "Requirements captured!" 후 안내 메시지 표시

### 6.2 추천 대기화면
- [ ] 진행률에 따라 점이 단계적으로 채워짐
- [ ] 초기화 없이 완료까지 진행

### 6.3 Products & Preview
- [ ] Vendor 필터 동작
- [ ] Vendor별 일괄 선택 동작
- [ ] Required Features 목록 표시 및 충족 마킹
- [ ] Optional Features 별도 색상 표시
- [ ] 로그인 후 새 프로젝트 자동 생성
- [ ] Dashboard→Products 페이지 UI 5개 항목 수정 확인

### 6.4 Pricing
- [ ] Vendor Comparison 탭 삭제됨
- [ ] Selected Products 섹션 삭제됨
- [ ] 페이지 제목 "Price Calculation" 등으로 표시

---

## 7. Open Questions

| # | 질문 | 상태 | 답변 |
|---|------|------|------|
| 1 | 세일즈 팀 알림 방식? (이메일/Slack/둘 다) | Open | |
| 2 | 세일즈 리드 저장 테이블 구조 확인 필요 | Open | |
| 3 | 로딩 진행률을 실제 API 응답과 연동할지? | Open | |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-21 | Initial draft - 요구사항 정리 | Claude Code |
