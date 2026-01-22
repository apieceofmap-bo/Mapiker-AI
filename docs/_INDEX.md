# Mapiker-AI Documentation Index

> **Last Updated**: 2026-01-22
> **Project Level**: Dynamic

---

## PDCA Documentation Structure

```
Current Phase: [Do] - Multiple features in progress

┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│  Plan  │───▶│ Design │───▶│   Do   │───▶│ Check  │
│   ✅   │    │   🔶   │    │   🔶   │    │(Analyze)│
└────────┘    └────────┘    └────────┘    └────────┘
                                               │
                                               ▼
                                         ┌────────┐
                                         │  Act   │
                                         │(Report)│
                                         └────────┘

Legend: ✅ Complete | 🔶 In Progress | ⬚ Pending
```

---

## Folder Structure

```
docs/
├── _INDEX.md                  ← 현재 파일
├── 00-architecture/           # 시스템 아키텍처
│   ├── system-overview.md     # 전체 시스템 구조
│   ├── data-flow.md           # 데이터 흐름
│   └── api-reference.md       # API 명세
├── 01-plan/                   # 계획 문서
│   ├── _INDEX.md
│   └── features/
├── 02-design/                 # 설계 문서
│   ├── _INDEX.md
│   └── features/
├── 03-analysis/               # 분석 문서
│   ├── _INDEX.md
│   └── features/
└── 04-report/                 # 완료 리포트
    ├── _INDEX.md
    └── features/
```

---

## Architecture Documents

| Document | Description | Status |
|----------|-------------|--------|
| [system-overview.md](./00-architecture/system-overview.md) | 전체 시스템 아키텍처 | 🔶 Draft |
| [data-flow.md](./00-architecture/data-flow.md) | 데이터 흐름도 | ⬚ Pending |
| [api-reference.md](./00-architecture/api-reference.md) | API 명세서 | ⬚ Pending |

---

## Feature Documents

### Active Features (In Progress)

| Feature | Plan | Design | Analysis | Report | Progress |
|---------|------|--------|----------|--------|----------|
| chatbot-improvements | [✅](./01-plan/features/chatbot-improvements.plan.md) | ⬚ | ⬚ | ⬚ | 40% |
| user-journey-enhancements | [✅](./01-plan/features/user-journey-enhancements.plan.md) | ⬚ | ⬚ | ⬚ | 30% |
| vendor-comparison | [✅](./01-plan/features/vendor-comparison.plan.md) | ⬚ | ⬚ | ⬚ | 70% |
| product-recommendation | [✅](./01-plan/features/product-recommendation.plan.md) | [✅](./02-design/features/product-recommendation.design.md) | ⬚ | ⬚ | 92% |

### Completed Features

| Feature | Plan | Design | Analysis | Report | Date |
|---------|------|--------|----------|--------|------|
| feature-keyword-sync | [✅](./01-plan/features/feature-keyword-sync.plan.md) | - | - | - | 2026-01-22 |
| landing-page-improvement | ✅ | - | - | ✅ | 2026-01-16 |
| pricing-api | ✅ | - | - | ✅ | 2026-01-16 |

---

## Recent Updates

| Date | Feature | Phase | Description |
|------|---------|-------|-------------|
| 2026-01-22 | feature-keyword-sync | Complete | Feature Registry 통합 완료, google.genai 마이그레이션 |
| 2026-01-22 | chatbot-improvements | Plan | 세일즈 연결, 대화 흐름 개선 계획 |
| 2026-01-22 | product-recommendation | Design | FeatureDetail 마이그레이션 완료 |
| 2026-01-21 | vendor-comparison | Plan | PDF 내보내기, NDA 모달 구현 |
| 2026-01-21 | user-journey-enhancements | Plan | 전체 사용자 여정 개선 계획 |
| 2026-01-16 | landing-page-improvement | Act | PDCA Cycle #1 Complete |

---

## Quick Links

### Documentation

- [Plan Documents](./01-plan/_INDEX.md)
- [Design Documents](./02-design/_INDEX.md)
- [Analysis Documents](./03-analysis/_INDEX.md)
- [Reports](./04-report/_INDEX.md)

### Archive (Legacy)

> 아래 문서들은 마이그레이션 완료 후 아카이브 처리됩니다.

- [Frontend Docs (Archive)](../frontend/docs/_INDEX.md)
- [Backend Docs (Archive)](../backend/docs/_INDEX.md)

---

## PDCA Phase Guide

### Plan (계획)
- 기능 요구사항 정의
- 범위 및 목표 설정
- 구현 순서 계획

### Design (설계)
- 기술 설계 문서
- API 스키마 정의
- 컴포넌트 구조 설계

### Check/Analysis (검증)
- 설계-구현 갭 분석
- 코드 품질 검토
- 테스트 결과

### Act/Report (리포트)
- 완료 리포트
- 학습 내용 정리
- 다음 사이클 피드백

---

## Migration Status

| Source | Target | Status |
|--------|--------|--------|
| frontend/docs/01-plan/* | docs/01-plan/features/* | 🔶 In Progress |
| backend/docs/*.plan.md | docs/01-plan/features/* | 🔶 In Progress |
| backend/docs/*.design.md | docs/02-design/features/* | 🔶 In Progress |
| frontend/docs/04-report/* | docs/04-report/features/* | ⬚ Pending |

---

## Notes

- 모든 문서는 한국어/영어 혼용으로 작성됩니다
- Feature 이름은 영문 kebab-case를 사용합니다
- 각 PDCA 사이클 완료 시 Report 문서를 작성합니다
- 마이그레이션 완료 후 기존 docs 폴더는 `_archive/` 로 이동합니다
