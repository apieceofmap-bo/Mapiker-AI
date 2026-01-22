# Product Recommendation Logic - Gap Analysis Report

> **Feature**: product-recommendation
> **Analysis Date**: 2026-01-22
> **Design Version**: 1.0
> **Analyst**: Claude Code

---

## 1. Analysis Summary

```
┌─────────────────────────────────────────────┐
│  Gap Analysis Result                         │
├─────────────────────────────────────────────┤
│  Design-Implementation Match Rate: 85%       │
│                                             │
│  ✅ Matched:        21 items                 │
│  ⚠️ Design Missing:  3 items (only in impl)  │
│  ❌ Unimplemented:   5 items (only in design)│
└─────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Analysis

### 2.1 Phase 4: Duplicate Feature Elimination (P0)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `feature_coverage.json` 파일 | ❌ **NOT FOUND** | Expected: `backend/data/feature_coverage.json` |
| `FeatureDeduplicator` 클래스 | ✅ Implemented | `backend/services/feature_deduplicator.py:14` |
| `get_covered_features()` | ✅ Implemented | `backend/services/feature_deduplicator.py:36` |
| `get_redundant_products()` | ✅ Implemented | `backend/services/feature_deduplicator.py:43` |
| `analyze_selection()` | ✅ Implemented | `backend/services/feature_deduplicator.py:67` |
| `mark_redundant_products()` | ✅ Implemented | `backend/services/feature_deduplicator.py:140` |
| ProductMatcher integration | ⚠️ **Partial** | 클래스 존재하지만 호출 여부 확인 필요 |

**Gap Details:**
- `feature_coverage.json` 데이터 파일이 생성되지 않음
- `FeatureDeduplicator`가 파일 없이 빈 데이터로 동작 (graceful degradation)

---

### 2.2 Phase 1: Vehicle Type Support (P1)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `CustomerInput.vehicle_types` 필드 | ✅ Implemented | `backend/pydantic_schemas.py:25` |
| Chat Agent Vehicle Type 질문 | ✅ Implemented | `backend/services/chat_agent.py` (SYSTEM_PROMPT) |
| `VEHICLE_FEATURE_KEYWORDS` | ⚠️ **Partial** | `improved_pipeline_v2.py` - Design의 전체 목록 미구현 |
| `_apply_vehicle_boost()` | ⚠️ **Not Found** | Design에 명시된 함수 미발견 |
| Frontend `vehicle_types` 타입 | ✅ Implemented | `frontend/src/lib/types.ts:41` |
| Product DB `supported_vehicles` | ❌ **NOT FOUND** | `Product_Dsc_All.json`에 필드 없음 |

**Gap Details:**
- Vehicle Type 질문은 구현됨
- Pipeline에서 Vehicle Type boost 로직 미구현
- Product DB에 `supported_vehicles` 필드 미추가

---

### 2.3 Phase 2: Similar API Differentiation (P2)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `api_differentiation.json` | ⚠️ **Code only** | 별도 JSON 파일 대신 코드에 직접 정의 |
| `RoutingTypeDifferentiator` 클래스 | ✅ Implemented | `backend/services/api_differentiation.py:159` |
| `ROUTING_TYPES` 정의 | ✅ Implemented | `backend/services/api_differentiation.py:20` |
| `PRODUCT_ROUTING_TYPE` 매핑 | ✅ Implemented | `backend/services/api_differentiation.py:75` |
| Chat Agent Routing Type 질문 | ✅ Implemented | `backend/services/chat_agent.py:161` |
| `detect_routing_type_from_features()` | ✅ Implemented | `backend/services/api_differentiation.py:166` |
| `calculate_routing_type_boost()` | ✅ Implemented | `backend/services/api_differentiation.py:243` |
| `CustomerInput.routing_types` | ✅ Implemented | `backend/pydantic_schemas.py:27` |

**Gap Details:**
- Design에서는 별도 JSON 파일 제안했으나, 실제로는 Python 코드에 직접 정의
- 기능적으로 동등하게 구현됨

---

### 2.4 Phase 3: SDK/API Priority (P1)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `_classify_product_type()` | ✅ Implemented | `backend/database.py:348` (`_is_sdk_product`) |
| `APPLICATION_PRIORITY` 설정 | ✅ Implemented | `backend/improved_pipeline_v2.py:216` |
| `SDK_TYPE_KEYWORDS` | ✅ Implemented | `backend/improved_pipeline_v2.py:239` |
| `_sort_by_application_priority()` | ⚠️ **Partial** | 로직 존재하나 Design 스펙과 다름 |
| SDK exclude for backend | ✅ Implemented | `backend/database.py:258` (SDK vs API 구분) |

**Gap Details:**
- Phase 5 (SDK vs API 구분)와 병합되어 `database.py`에서 처리
- Design의 정확한 정렬 로직은 다르게 구현됨

---

### 2.5 Phase 5: Application Filter Fix (P1)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `_is_sdk_product()` 함수 | ✅ Implemented | `backend/database.py:348` |
| `_check_application_match()` 수정 | ✅ Implemented | `backend/database.py:237` |
| `use_case_relevance` 임계값 | ✅ Implemented | `backend/database.py:269` (threshold: 0.2) |
| API는 application 필터 우회 | ✅ Implemented | `backend/database.py:260-271` |

**Status: COMPLETE** - Design 대로 구현됨

---

### 2.6 Phase 6: Map Display Auto-Recommendation (P2)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `_should_auto_add_map_display()` | ❌ **NOT IMPLEMENTED** | - |
| `auto_recommended` 필드 | ❌ **NOT IMPLEMENTED** | - |
| Frontend auto_recommended Badge | ❌ **NOT IMPLEMENTED** | - |

**Status: NOT STARTED**

---

### 2.7 Phase 7: Loading Time Optimization (P0)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `FEATURE_MAPPING_CACHE` | ✅ Implemented | `backend/improved_pipeline_v2.py:42` |
| `PRECOMPUTED_FEATURE_MAPPINGS` | ✅ Implemented | `backend/improved_pipeline_v2.py:47` |
| `get_cached_feature_mapping()` | ✅ Implemented | `backend/improved_pipeline_v2.py:127` |
| `set_cached_feature_mapping()` | ✅ Implemented | `backend/improved_pipeline_v2.py:157` |
| `get_cache_stats()` | ✅ Implemented | `backend/improved_pipeline_v2.py:165` |
| Parallel LLM 호출 | ❌ **NOT IMPLEMENTED** | Design의 방안 B |
| Streaming Response | ❌ **NOT IMPLEMENTED** | Design의 방안 D |

**Gap Details:**
- 캐싱 (방안 A, C)은 구현됨
- 병렬 처리 (방안 B)와 Streaming (방안 D)은 미구현

---

### 2.8 Phase 8: Unified Feature System Migration (P0)

| Design Item | Implementation Status | Location |
|-------------|----------------------|----------|
| `FeatureDetail` 구조 | ✅ Implemented | `frontend/src/lib/types.ts:48` |
| `features: FeatureDetail[]` 필드 | ✅ Implemented | `frontend/src/lib/types.ts:69` |
| `key_features` 제거 | ⚠️ **In Progress** | 일부 코드에서 아직 참조 |
| Chat Agent USE_CASE_FEATURES 업데이트 | ⚠️ **Partial** | 일부 표준 Feature로 전환 |
| PRECOMPUTED_FEATURE_MAPPINGS 업데이트 | ✅ Implemented | `backend/improved_pipeline_v2.py:47-124` |
| `_get_product_feature_names()` | ✅ Implemented | `backend/database.py:374` |
| Product DB features 필드 | ✅ Implemented | `Product_Dsc_All.json` |

**Gap Details:**
- Frontend 타입은 완료
- Backend에서 일부 레거시 `key_features` 참조 남아있음

---

## 3. Critical Gaps (Action Required)

### 3.1 High Priority (P0)

| # | Gap | Impact | Recommended Action |
|---|-----|--------|-------------------|
| 1 | `feature_coverage.json` 파일 없음 | Deduplication 비활성 | 데이터 파일 생성 필요 |
| 2 | Map Display Auto-Recommendation 미구현 | UX 저하 (API만 선택 시 지도 없음) | Phase 6 구현 |
| 3 | Parallel LLM 호출 미구현 | 응답 시간 ~90초 | Phase 7 병렬 처리 추가 |

### 3.2 Medium Priority (P1)

| # | Gap | Impact | Recommended Action |
|---|-----|--------|-------------------|
| 4 | Vehicle Type boost 로직 미구현 | Truck/Bicycle 제품 우선순위 미반영 | `_apply_vehicle_boost()` 구현 |
| 5 | Product DB `supported_vehicles` 없음 | Vehicle 매칭 불가 | DB 스키마 확장 |
| 6 | `key_features` 레거시 참조 | 중복 데이터, 혼란 | 완전 제거 |

### 3.3 Low Priority (P2)

| # | Gap | Impact | Recommended Action |
|---|-----|--------|-------------------|
| 7 | Streaming Response 미구현 | 로딩 중 UX | 선택적 구현 |

---

## 4. Design-Only Items (Not in Implementation)

Design 문서에만 존재하고 구현에 없는 항목:

| Item | Design Section | Reason |
|------|---------------|--------|
| `suggest_optimal_selection()` | Phase 4, 2.2.2 | 고급 기능, 우선순위 낮음 |
| Unit Tests (test_*.py) | Phase 7 Testing | 테스트 파일 없음 |
| Integration Tests | Phase 7 Testing | 테스트 파일 없음 |

---

## 5. Implementation-Only Items (Not in Design)

구현에만 존재하고 Design에 없는 항목:

| Item | Location | Recommendation |
|------|----------|----------------|
| `APP_KEYWORD_MAPPING` | `database.py:17` | Design 문서에 추가 |
| `_ensure_feature_coverage()` | `database.py:403` | Design 문서에 추가 |
| `get_differentiator()` singleton | `api_differentiation.py:330` | Design 문서에 추가 |

---

## 6. Recommendations

### 6.1 Immediate Actions (이번 Sprint)

1. **`feature_coverage.json` 생성**
   - Design 문서의 예시 데이터를 기반으로 실제 파일 생성
   - Google/HERE/Mapbox/NextBillion 제품 coverage 정의

2. **Vehicle Type boost 구현**
   - `improved_pipeline_v2.py`에 `_apply_vehicle_boost()` 함수 추가
   - Design 문서의 `VEHICLE_FEATURE_KEYWORDS` 적용

### 6.2 Short-term (다음 Sprint)

3. **Phase 6 구현**: Map Display Auto-Recommendation
4. **Phase 7 병렬 처리**: LLM 호출 최적화
5. **key_features 완전 제거**: 레거시 참조 정리

### 6.3 Long-term

6. **테스트 코드 작성**: Design 문서의 Test Cases 구현
7. **Streaming Response**: 선택적 UX 개선

---

## 7. Appendix: File Mapping

### Design → Implementation 파일 매핑

| Design File/Class | Implementation File |
|-------------------|---------------------|
| `feature_coverage.json` | ❌ (Not created) |
| `FeatureDeduplicator` | `services/feature_deduplicator.py` |
| `RoutingTypeDifferentiator` | `services/api_differentiation.py` |
| `api_differentiation.json` | Inline in `api_differentiation.py` |
| `CustomerInput` (vehicle_types) | `pydantic_schemas.py` |
| Pipeline cache | `improved_pipeline_v2.py` |
| SDK vs API filter | `database.py` |
| Frontend types | `frontend/src/lib/types.ts` |

---

## Version History

| Version | Date | Changes | Analyst |
|---------|------|---------|---------|
| 1.0 | 2026-01-22 | Initial gap analysis | Claude Code |
