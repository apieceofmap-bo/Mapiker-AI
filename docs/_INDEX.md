# Mapiker-AI Documentation Index

> **Last Updated**: 2026-01-16

---

## PDCA Documentation Structure

이 프로젝트는 PDCA (Plan-Do-Check-Act) 사이클을 기반으로 문서화됩니다.

```
Current Phase: [Act] - Cycle #1 Complete

┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│  Plan  │───▶│ Design │───▶│   Do   │───▶│ Check  │
│        │    │        │    │ (Impl) │    │(Analyze)│
└────────┘    └────────┘    └────────┘    └────────┘
                                               │
                                               ▼
                                         ┌────────┐
                                         │  Act   │ ← Complete
                                         │(Report)│
                                         └────────┘
```

---

## Folder Structure

```
docs/
├── _INDEX.md              ← Current file
├── 01-plan/               # Planning documents
│   └── features/
├── 02-design/             # Design documents
│   └── features/
├── 03-analysis/           # Analysis results
└── 04-report/             # Completion reports
    └── features/
```

---

## Document List

### Features

| Feature | Plan | Design | Analysis | Report | Status |
|---------|------|--------|----------|--------|--------|
| landing-page-improvement | [✅](./01-plan/features/landing-page-improvement.plan.md) | - | - | [✅](./04-report/features/landing-page-improvement.report.md) | Complete |

---

## Recent Updates

| Date | Feature | Phase | Description |
|------|---------|-------|-------------|
| 2026-01-16 | landing-page-improvement | Act | PDCA Cycle #1 Complete |

---

## Quick Links

- [Plan Documents](./01-plan/_INDEX.md)
- [Design Documents](./02-design/_INDEX.md)
- [Analysis Documents](./03-analysis/_INDEX.md)
- [Reports](./04-report/_INDEX.md)

---

## Notes

- 모든 문서는 한국어/영어 혼용으로 작성됩니다
- Feature 이름은 영문 kebab-case를 사용합니다
- 각 PDCA 사이클 완료 시 Report 문서를 작성합니다
