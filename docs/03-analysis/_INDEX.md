# Analysis Documents Index

> **Phase**: Check/Analysis (검증)
> **Last Updated**: 2026-01-22

---

## Purpose

Analysis 문서는 PDCA 사이클의 세 번째 단계로, 구현 후 검증 및 분석 결과를 기록합니다.

### Analysis 문서에 포함되는 내용

- 설계-구현 갭 분석
- 코드 품질 검토
- 테스트 결과
- 성능 분석
- 발견된 이슈 및 해결 방안

---

## Document List

### Pending Analysis

| Feature | Implementation Status | Notes |
|---------|----------------------|-------|
| chatbot-improvements | 40% 구현 | 분석 대기 |
| user-journey-enhancements | 30% 구현 | 분석 대기 |
| vendor-comparison | 70% 구현 | 분석 대기 |
| product-recommendation | 60% 구현 | 분석 대기 |

---

## Analysis Types

### Gap Analysis (갭 분석)

설계 문서와 실제 구현 간의 차이를 분석합니다.

```markdown
## Gap Analysis: [Feature Name]

### 1. Design vs Implementation

| 설계 항목 | 구현 상태 | 차이점 |
|----------|----------|--------|
| ... | ✅/❌/🔶 | ... |

### 2. Missing Items
- ...

### 3. Additional Implementations
- ...

### 4. Action Items
- [ ] ...
```

### Code Quality Analysis (코드 품질)

코드 품질, 보안, 성능 이슈를 분석합니다.

```markdown
## Code Quality: [Feature Name]

### 1. Code Review Summary

| Category | Score | Notes |
|----------|-------|-------|
| Readability | A/B/C | ... |
| Performance | A/B/C | ... |
| Security | A/B/C | ... |

### 2. Issues Found
- ...

### 3. Recommendations
- ...
```

---

## Template

새 Analysis 문서 작성 시 아래 템플릿을 사용합니다:

```markdown
# [Feature Name] Analysis

> **Summary**: [한 줄 요약]
>
> **Author**: Claude Code
> **Date**: [YYYY-MM-DD]
> **Status**: Analyzing (v0.1)
> **Related**: [Plan](link) | [Design](link)

---

## 1. Analysis Scope

### 1.1 Analyzed Components
- ...

### 1.2 Analysis Period
[YYYY-MM-DD] ~ [YYYY-MM-DD]

---

## 2. Design-Implementation Gap

### 2.1 Comparison Matrix

| Design Item | Implemented | Gap |
|-------------|-------------|-----|
| ... | ✅/❌/🔶 | ... |

### 2.2 Gap Details
[상세 분석]

---

## 3. Code Quality

### 3.1 Metrics

| Metric | Value | Target |
|--------|-------|--------|
| ... | ... | ... |

### 3.2 Issues
[발견된 이슈]

---

## 4. Test Results

### 4.1 Test Coverage
[테스트 커버리지]

### 4.2 Failed Tests
[실패한 테스트]

---

## 5. Performance

### 5.1 Benchmarks
[성능 측정 결과]

### 5.2 Bottlenecks
[병목 지점]

---

## 6. Recommendations

### 6.1 Must Fix
- ...

### 6.2 Should Fix
- ...

### 6.3 Nice to Have
- ...

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | ... | Initial draft | Claude Code |
```

---

## Navigation

- [← Design Documents](../02-design/_INDEX.md)
- [→ Reports](../04-report/_INDEX.md)
