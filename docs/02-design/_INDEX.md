# Design Documents Index

> **Phase**: Design (설계)
> **Last Updated**: 2026-01-22

---

## Purpose

Design 문서는 PDCA 사이클의 두 번째 단계로, 기술적인 설계 상세를 정의합니다.

### Design 문서에 포함되는 내용

- 아키텍처 설계
- API 스키마 정의
- 컴포넌트 구조
- 데이터 모델
- 시퀀스 다이어그램
- 코드 예시

---

## Document List

### Active Designs

| Feature | Status | Related Plan |
|---------|--------|--------------|
| [product-recommendation](./features/product-recommendation.design.md) | In Progress | [Plan](../01-plan/features/product-recommendation.plan.md) |

### Pending Designs

| Feature | Plan Status | Notes |
|---------|-------------|-------|
| chatbot-improvements | Plan Complete | 설계 작성 필요 |
| user-journey-enhancements | Plan Complete | 설계 작성 필요 |
| vendor-comparison | Plan Complete | 설계 작성 필요 |

---

## Template

새 Design 문서 작성 시 아래 템플릿을 사용합니다:

```markdown
# [Feature Name] Design

> **Summary**: [한 줄 요약]
>
> **Author**: Claude Code
> **Date**: [YYYY-MM-DD]
> **Status**: Designing (v0.1)
> **Related Plan**: [plan-link]

---

## 1. Architecture

### 1.1 System Context
[시스템 컨텍스트 다이어그램]

### 1.2 Component Diagram
[컴포넌트 다이어그램]

---

## 2. API Design

### 2.1 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/... | ... |

### 2.2 Request/Response Schema

```typescript
interface RequestBody {
  // ...
}

interface ResponseBody {
  // ...
}
```

---

## 3. Data Model

### 3.1 Database Schema
[ERD 또는 테이블 정의]

### 3.2 TypeScript Types
[타입 정의]

---

## 4. Component Design

### 4.1 Component Tree
[컴포넌트 구조]

### 4.2 Props/State
[각 컴포넌트의 Props와 State]

---

## 5. Sequence Diagram

[시퀀스 다이어그램]

---

## 6. Error Handling

| Error | HTTP Code | Response |
|-------|-----------|----------|
| ... | 400 | ... |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | ... | Initial draft | Claude Code |
```

---

## Navigation

- [← Plan Documents](../01-plan/_INDEX.md)
- [→ Analysis Documents](../03-analysis/_INDEX.md)
