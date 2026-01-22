# Plan Documents Index

> **Phase**: Plan (계획)
> **Last Updated**: 2026-01-22

---

## Purpose

Plan 문서는 PDCA 사이클의 첫 번째 단계로, 기능 요구사항과 구현 계획을 정의합니다.

### Plan 문서에 포함되는 내용

- 기능 개요 및 배경
- 요구사항 (Functional / Non-Functional)
- 범위 (In Scope / Out of Scope)
- 구현 계획 및 순서
- 영향 받는 파일 목록
- 검증 체크리스트

---

## Document List

### Active Plans

| Feature | Status | Progress | Last Updated |
|---------|--------|----------|--------------|
| [chatbot-improvements](./features/chatbot-improvements.plan.md) | In Progress | 40% | 2026-01-22 |
| [user-journey-enhancements](./features/user-journey-enhancements.plan.md) | In Progress | 30% | 2026-01-21 |
| [vendor-comparison](./features/vendor-comparison.plan.md) | In Progress | 70% | 2026-01-21 |
| [product-recommendation](./features/product-recommendation.plan.md) | In Progress | 60% | 2026-01-22 |

### Completed Plans

| Feature | Completion Date | Report |
|---------|-----------------|--------|
| landing-page-improvement | 2026-01-16 | [Report](../04-report/features/landing-page-improvement.report.md) |
| pricing-api | 2026-01-16 | [Report](../04-report/features/pricing-api.report.md) |

---

## Template

새 Plan 문서 작성 시 아래 템플릿을 사용합니다:

```markdown
# [Feature Name] Plan

> **Summary**: [한 줄 요약]
>
> **Author**: Claude Code
> **Date**: [YYYY-MM-DD]
> **Status**: Planning (v0.1)

---

## 1. Overview

### 1.1 Background
[배경 설명]

### 1.2 Current State
[현재 상태]

### 1.3 Target State
[목표 상태]

---

## 2. Scope

### 2.1 In Scope
- [ ] ...

### 2.2 Out of Scope
- ...

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | ... | High |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | ... |

---

## 4. Implementation Plan

### 4.1 Phase 1: ...

| 순서 | 항목 |
|------|------|
| 1 | ... |

---

## 5. File Changes

| File | Action | Changes |
|------|--------|---------|
| ... | New/Modify | ... |

---

## 6. Verification Checklist

- [ ] ...

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | ... | Initial draft | Claude Code |
```

---

## Navigation

- [← Back to Index](../_INDEX.md)
- [→ Design Documents](../02-design/_INDEX.md)
