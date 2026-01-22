# Mapiker-AI

> AI-powered Map Product Recommendation Platform

## Project Level

**Level: Dynamic**

- BaaS 연동 (Supabase)
- AI 챗봇 기반 요구사항 수집
- 멀티 에이전트 파이프라인
- Full-stack 웹 애플리케이션

---

## Overview

Mapiker-AI는 사용자의 요구사항을 AI 챗봇으로 수집하고, 최적의 지도 제품(Google Maps, HERE, Mapbox 등)을 추천하는 플랫폼입니다.

### Core Features

| Feature | Description |
|---------|-------------|
| AI Chatbot | 자연어로 요구사항 수집 |
| Product Matching | 멀티 에이전트 파이프라인으로 제품 매칭 |
| Pricing Calculator | 벤더별 가격 계산 |
| Quality Evaluation | 지도 품질 평가 (개발 중) |
| Project Compare | 프로젝트 간 비교 리포트 |

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Auth**: Supabase Auth

### Backend
- **Framework**: FastAPI
- **AI**: Claude API (Anthropic)
- **Validation**: Pydantic
- **Database**: Supabase (PostgreSQL)

### Infrastructure
- **Database**: Supabase
- **Deployment**: (TBD)

---

## Repository Structure

> **Note**: Frontend와 Backend는 별도 Git 저장소입니다.
> 통합 PDCA 문서는 Frontend 저장소(`docs/`)에서 관리합니다.

```
Mapiker-AI/                    # 루트 (git repo 아님)
├── frontend/                  # ← Frontend Git Repo (현재)
│   ├── CLAUDE.md              # 프로젝트 개요
│   ├── docs/                  # 통합 PDCA 문서 (FE+BE)
│   │   ├── _INDEX.md
│   │   ├── 00-architecture/   # 시스템 아키텍처
│   │   ├── 01-plan/           # 계획 문서
│   │   ├── 02-design/         # 설계 문서
│   │   ├── 03-analysis/       # 분석 문서
│   │   └── 04-report/         # 완료 리포트
│   └── src/
│       ├── app/               # 페이지 라우트
│       ├── components/        # React 컴포넌트
│       └── lib/               # 유틸리티, API
│
├── backend/                   # ← Backend Git Repo (별도)
│   ├── CLAUDE.md              # Backend 개요 + docs 참조
│   ├── routers/               # API 라우터
│   ├── services/              # 비즈니스 로직
│   ├── data/                  # 정적 데이터
│   └── _archive_docs/         # (Archive) 기존 문서
│
├── supabase/                  # Supabase 설정
└── start.sh                   # 개발 서버 실행
```

---

## Key Commands

### Development

```bash
# 전체 서버 실행
./start.sh

# Frontend만 실행
cd frontend && npm run dev

# Backend만 실행
cd backend && uvicorn main:app --reload --port 8000
```

### Build

```bash
# Frontend 빌드
cd frontend && npm run build
```

---

## API Endpoints

| Router | Prefix | Description |
|--------|--------|-------------|
| chat | `/chat` | AI 챗봇 대화 |
| products | `/products` | 제품 매칭/조회 |
| pricing | `/pricing` | 가격 계산 |
| contact | `/contact` | 연락처/세일즈 리드 |

---

## User Journey

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

---

## Pipeline Architecture

```
User Message
     │
     ▼
┌─────────────────┐
│   Chat Agent    │  ← Claude API
│ (요구사항 추출)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent 1: RAG   │  ← 문서 검색, 관련 제품 필터링
│ (후보 제품 선별) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent 2: Match │  ← 스코어링, 매칭
│ (제품별 점수)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Agent 3: Scorer │  ← 최종 순위 결정
│  (순위 조정)     │
└────────┬────────┘
         │
         ▼
    Recommendations
```

---

## Documentation (PDCA)

이 프로젝트는 PDCA (Plan-Do-Check-Act) 사이클로 문서화됩니다.

- **Plan**: 기능 계획 및 요구사항 정의
- **Design**: 기술 설계 문서
- **Check (Analysis)**: 구현 후 분석/검증
- **Act (Report)**: 완료 리포트, 학습 내용

**문서 위치**: [`docs/_INDEX.md`](./docs/_INDEX.md)

### Cross-Repository Documentation

> **통합 PDCA 문서**는 Frontend/Backend 양쪽 작업을 모두 포함합니다.

| 작업 위치 | 문서 참조 | 커밋 방식 |
|-----------|-----------|-----------|
| Frontend | 직접 참조 (`docs/`) | 코드와 함께 커밋 |
| Backend | 상대경로 (`../frontend/docs/`) | Plan 참조하여 별도 커밋 |

**Backend 커밋 시 참조 형식:**
```
feat: [기능 설명]

Ref: ../frontend/docs/01-plan/features/[feature].plan.md
Section: [섹션 번호]
```

---

## Current Status

### Active Plans

| Plan | Status | Progress |
|------|--------|----------|
| chatbot-improvements | In Progress | 40% |
| user-journey-enhancements | In Progress | 30% |
| vendor-comparison | In Progress | 70% |
| product-recommendation | In Progress | 92% |

### Completed

| Feature | Date |
|---------|------|
| landing-page-improvement | 2026-01-16 |
| pricing-api | 2026-01-16 |

---

## Conventions

### Naming

- **파일**: kebab-case (`user-journey-enhancements.plan.md`)
- **컴포넌트**: PascalCase (`ChatWindow.tsx`)
- **함수/변수**: camelCase (`sendChatMessage`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Git

- **커밋 메시지**: `type: description`
  - `feat:` 새 기능
  - `fix:` 버그 수정
  - `refactor:` 리팩토링
  - `docs:` 문서
  - `style:` 스타일/포맷
  - `test:` 테스트

---

## Related Links

- **통합 PDCA Docs**: [`docs/_INDEX.md`](./docs/_INDEX.md)
- **Backend Repo**: `../backend/` (별도 Git 저장소)
- **Backend CLAUDE.md**: `../backend/CLAUDE.md`
- **Backend Archive Docs**: `../backend/_archive_docs/`
