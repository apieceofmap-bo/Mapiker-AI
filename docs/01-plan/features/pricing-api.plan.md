# Pricing API Planning Document

> **Summary**: 지도 제품 가격 계산 API 개발 및 가격 데이터 업데이트
>
> **Author**: Claude Code
> **Date**: 2026-01-16
> **Status**: Complete

---

## 1. Overview

### 1.1 Purpose

지도 서비스 제품들의 월간 사용량 기반 비용을 계산하는 API를 제공하여, 사용자가 다양한 벤더의 제품 가격을 쉽게 비교할 수 있도록 한다.

### 1.2 Background

- Mapiker-AI의 핵심 기능 중 하나는 가격 비교
- Google Maps, Mapbox, HERE, TomTom 등 다양한 벤더의 가격 체계가 상이함
- Free tier, 구간별 요금, Contact Sales 등 복잡한 가격 구조 처리 필요
- 정확한 가격 정보 제공을 위한 주기적인 업데이트 필요

### 1.3 Related Documents

- Data: `data/pricing_db.json`
- Calculator: `original_pipeline/pricing_calculator.py`

---

## 2. Scope

### 2.1 In Scope

- [x] 단일 제품 가격 계산 API (`GET /pricing/product/{id}`)
- [x] 복수 제품 일괄 가격 계산 API (`POST /pricing/calculate`)
- [x] 벤더별 총 비용 계산 API (`POST /pricing/vendor`)
- [x] 가격 DB 정보 조회 API (`GET /pricing/info`)
- [x] Free tier 적용 로직
- [x] 구간별 요금 계산 (tier breakdown)
- [x] Google Maps Platform 가격 업데이트
- [x] Mapbox 가격 업데이트 (v3.3.0)
- [x] 새로운 가격 구조 지원 (MAU, trips, destinations)

### 2.2 Out of Scope

- 실시간 가격 크롤링 (수동 업데이트)
- 환율 변환 (USD 고정)
- 할인/계약 가격

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 월간 요청 수 기반 비용 계산 | High | Complete |
| FR-02 | Free tier 자동 차감 | High | Complete |
| FR-03 | 구간별 요금 breakdown 제공 | Medium | Complete |
| FR-04 | Contact Sales 필요 여부 표시 | Medium | Complete |
| FR-05 | 벤더별 총 비용 비교 | High | Complete |
| FR-06 | 다양한 billing unit 지원 (requests, MAU, trips) | High | Complete |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 응답 시간 < 500ms | 로그 분석 |
| Accuracy | 공식 가격표 대비 오차 < 1% | 수동 검증 |
| Availability | API 가용성 99% | 모니터링 |

---

## 4. API Endpoints

### 4.1 Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pricing/product/{product_id}` | 단일 제품 가격 조회 |
| POST | `/pricing/calculate` | 복수 제품 일괄 계산 |
| POST | `/pricing/vendor` | 벤더별 총 비용 계산 |
| GET | `/pricing/info` | 가격 DB 메타정보 |

### 4.2 Request/Response Models

**BulkPricingRequest:**
```python
{
    "product_ids": ["google-maps-directions", "mapbox-directions"],
    "monthly_requests": 100000,
    "monthly_mau": 10000,        # optional
    "monthly_trips": 5000,       # optional
    "monthly_destinations": 3    # optional
}
```

**ProductCostResponse:**
```python
{
    "product_id": "google-maps-directions",
    "product_name": "Google Maps Directions API",
    "billing_unit": "requests",
    "monthly_usage": 100000,
    "estimated_cost": 500.00,
    "free_tier_applied": true,
    "free_tier": 10000,
    "contact_sales_required": false,
    "tier_breakdown": [...]
}
```

---

## 5. Success Criteria

### 5.1 Definition of Done

- [x] 모든 API 엔드포인트 구현
- [x] Google Maps 21개 제품 가격 업데이트
- [x] Mapbox v3.3.0 가격 반영
- [x] Free tier 로직 검증
- [x] API 문서화

### 5.2 Quality Criteria

- [x] 에러 핸들링 구현
- [x] 로깅 추가
- [x] Pydantic 모델 검증

---

## 6. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2024-12 | Initial API design | - |
| 1.0 | 2026-01 | Price updates complete | Claude Code |
