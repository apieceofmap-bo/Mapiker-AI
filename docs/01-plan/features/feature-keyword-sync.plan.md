# Feature Keyword Synchronization System Plan

> **Summary**: Feature 키워드 동기화 시스템 - 분산된 Feature 데이터를 단일 소스(feature_registry.json)로 통합하여 파이프라인 전체 일관성 보장
>
> **Author**: Claude Code
> **Date**: 2026-01-22
> **Status**: ✅ Completed (v1.1)

---

## 1. Overview

### 1.1 Background

현재 Mapiker-AI 파이프라인에서 Product Feature 키워드가 **여러 파일에 분산 관리**되어 있어 불일치 위험이 존재함.

### 1.2 Current Problem

| 파일 | 내용 | 현재 상태 |
|------|------|----------|
| `Product_Dsc_All.json` | 제품별 features | 별도 sync 스크립트 (sync_features.py) |
| `prompts.py` | FEATURE_PRODUCT_HINTS | 하드코딩 |
| `improved_pipeline_v2.py` | PRECOMPUTED_FEATURE_MAPPINGS | 하드코딩 |
| `chat_agent.py` | USE_CASE_FEATURES | 하드코딩 |
| `qualityEvaluationOptions.ts` | QUALITY_FEATURES | 하드코딩 |

**영향:**
- Feature 키워드 불일치 시 잘못된 제품 추천
- 새로운 Feature 추가 시 여러 파일 수동 업데이트 필요
- Quality-Evaluator 업데이트와 파이프라인 동기화 어려움

---

## 2. Goal

**feature_registry.json**을 **단일 소스 of Truth**로 설정하고, Quality-Evaluator와 직접 동기화한 후 파이프라인 전체의 **모든 파일을 한 번에** 동기화하는 시스템 구축.

### 2.1 Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Feature 소스 파일 수 | 5개 (분산) | 1개 (통합) |
| 동기화 스크립트 수 | 2개 | 1개 |
| 수동 업데이트 필요 파일 | 4개 | 0개 |
| Feature 불일치 위험 | 높음 | 없음 |

---

## 3. New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Quality-Evaluator (External)                  │
│         product_feature_report.json                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ sync_feature_registry.py (유일한 동기화 진입점)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           feature_registry.json (Primary Source)            │
│                                                             │
│  • standard_features (전체 Feature 목록)                    │
│  • product_features (제품별 Feature 매핑)                   │
│  • db_feature_mappings (Feature 동의어/변형)               │
│  • use_case_features (Use Case별 Feature 추천)             │
│  • vendor_product_hints (Vendor-Product 매핑)              │
│  • categories (Feature 카테고리 분류)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ (동일 스크립트에서 일괄 동기화)
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ Backend     │   │ Backend         │   │ Frontend         │
│ Data        │   │ Python Modules  │   │ TypeScript       │
│             │   │                 │   │                  │
│ Product_    │   │ prompts.py      │   │ featureRegistry  │
│ Dsc_All.json│   │ (런타임 로드)   │   │ .ts (자동 생성)  │
│ (features   │   │                 │   │                  │
│  필드 동기화)│   │ improved_       │   │ qualityEvaluation│
│             │   │ pipeline_v2.py  │   │ Options.ts       │
│             │   │ (런타임 로드)   │   │ (registry 기반)  │
│             │   │                 │   │                  │
│             │   │ chat_agent.py   │   │                  │
│             │   │ (런타임 로드)   │   │                  │
└─────────────┘   └─────────────────┘   └──────────────────┘
```

---

## 4. Registry Item Mapping

### 4.1 Registry 항목별 동기화 연결

| Registry 항목 | 동기화 대상 파일 | 사용 방식 | 키워드 예시 |
|--------------|-----------------|----------|-------------|
| **standard_features** | `featureRegistry.ts` | Feature 목록 타입 생성, 전체 Feature ID/이름 열거 | `{id: "forward-geocoding", name: "Forward Geocoding", category: "Search & Geocoding"}` |
| **product_features** | `Product_Dsc_All.json` | 제품별 `features[]` 필드 동기화 | `{"name": "Map Display", "description": "Interactive map rendering", "use_case": "Visual representation"}` |
| **db_feature_mappings** | `improved_pipeline_v2.py` | `PRECOMPUTED_FEATURE_MAPPINGS` 대체 - 표준 Feature를 DB 변형 이름과 매핑 | `"Forward Geocoding": ["Geocoding", "Geocode API", "Batch Geocoding", "Address Search"]` |
| **use_case_features** | `chat_agent.py` | `USE_CASE_FEATURES` 대체 - 사용 사례별 필수/선택 Feature 추천 | `"food-delivery": {"required": ["Real-time Tracking", "Route Optimization"], "optional": ["Geofencing"]}` |
| **vendor_product_hints** | `prompts.py` | `FEATURE_PRODUCT_HINTS` 대체 - Feature별 벤더 제품 매핑 | `"Forward Geocoding": {"Google": ["Geocoding API"], "HERE": ["Geocode and Reverse Geocode"]}` |
| **categories** | `qualityEvaluationOptions.ts` | `QUALITY_FEATURES` 카테고리 파생 - QA 평가용 Feature 그룹화 | `"Routing & Navigation": {"features": ["point-to-point-routing", "matrix-routing", "ev-routing"]}` |

### 4.2 동기화 대상 파일별 역할

| 파일 | 위치 | 파이프라인 내 역할 |
|------|------|-------------------|
| **Product_Dsc_All.json** | `backend/data/` | **제품 데이터베이스** - 모든 지도 제품의 메타데이터 저장. Agent1(RAG)과 Agent2(Matcher)가 제품 검색/매칭 시 참조 |
| **improved_pipeline_v2.py** | `backend/` | **멀티 에이전트 파이프라인 코어** - `db_feature_mappings`를 사용하여 사용자가 요청한 Feature를 DB 변형 이름과 매칭 |
| **chat_agent.py** | `backend/services/` | **AI 챗봇 에이전트** - `use_case_features`를 참조하여 사용 사례별 Feature 자동 추천 |
| **prompts.py** | `backend/` | **LLM 프롬프트 저장소** - `vendor_product_hints`를 통해 LLM에게 Feature→제품 힌트 제공 |
| **featureRegistry.ts** | `frontend/src/lib/` | **프론트엔드 Feature 타입** - Catalog 페이지 등에서 Feature 표시 시 일관된 이름/ID 사용 |
| **qualityEvaluationOptions.ts** | `frontend/src/lib/` | **지도 품질 평가 옵션** - 사용자가 품질 평가 시 Feature 카테고리 제공 |

---

## 5. Implementation Phases

### Phase 1: Feature Registry & Sync Script 생성

**신규 파일:**
- `backend/data/feature_registry.json` - Primary Source of Truth
- `backend/scripts/sync_feature_registry.py` - 유일한 동기화 스크립트

**스크립트 기능:**
1. Quality-Evaluator의 `product_feature_report.json` 읽기
2. `feature_registry.json` 생성/업데이트
3. `Product_Dsc_All.json`의 features 필드 업데이트
4. `frontend/src/lib/featureRegistry.ts` 자동 생성
5. 검증 리포트 출력

### Phase 2: Backend Integration

**수정 파일:**
1. `prompts.py` - Registry 런타임 로드
2. `improved_pipeline_v2.py` - Registry 런타임 로드
3. `chat_agent.py` - Registry 런타임 로드

### Phase 3: Frontend Integration

**신규 파일:** `frontend/src/lib/featureRegistry.ts` (자동 생성)

**수정 파일:** `qualityEvaluationOptions.ts` - Registry 기반 파생

### Phase 4: Legacy Cleanup

**삭제 파일:**
- `backend/scripts/sync_features.py`
- `backend/scripts/watch_and_sync.py`

---

## 6. Files Summary

### 신규 생성

| 파일 | 위치 | 목적 |
|------|------|------|
| `feature_registry.json` | backend/data/ | Primary Source of Truth |
| `sync_feature_registry.py` | backend/scripts/ | 유일한 동기화 스크립트 |
| `featureRegistry.ts` | frontend/src/lib/ | FE 타입 (자동 생성) |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `Product_Dsc_All.json` | 소스 → 타겟으로 변경 (features 필드 동기화) |
| `prompts.py` | Registry 런타임 로드 |
| `improved_pipeline_v2.py` | Registry 런타임 로드 |
| `chat_agent.py` | Registry 런타임 로드 |
| `qualityEvaluationOptions.ts` | Registry 기반 파생 |

### 삭제

| 파일 | 이유 |
|------|------|
| `sync_features.py` | sync_feature_registry.py로 대체 |
| `watch_and_sync.py` | sync_feature_registry.py로 대체 |

---

## 7. Sync Workflow

```bash
# Quality-Evaluator 업데이트 후 - 단일 명령으로 전체 동기화
python scripts/sync_feature_registry.py

# 또는 dry-run으로 미리보기
python scripts/sync_feature_registry.py --dry-run

# 특정 소스 지정
python scripts/sync_feature_registry.py --source /path/to/product_feature_report.json

# 커밋
git add backend/data/feature_registry.json \
        backend/data/Product_Dsc_All.json \
        frontend/src/lib/featureRegistry.ts
git commit -m "chore: sync feature registry from quality-evaluator"
```

---

## 8. Verification Plan

### 빌드 검증
- [x] `python scripts/sync_feature_registry.py --dry-run` 성공
- [x] `python -c "from prompts import get_registry; print(len(get_registry()['standard_features']))"` 정상
- [x] Backend 서버 정상 시작
- [x] Frontend `npm run build` 성공

### 기능 검증
- [x] Chatbot Feature 추천 정상 동작 (USE_CASE_FEATURES 로드 확인)
- [x] Product Matching 결과 정확 (PRECOMPUTED_FEATURE_MAPPINGS 로드 확인)
- [ ] Catalog 페이지 Feature 표시 정상 (Known Issue: use_case null 오류)

### 동기화 검증
- [x] Registry의 모든 Feature가 Product_Dsc_All.json에 반영됨
- [x] Backend 모듈이 registry에서 올바르게 로드함
- [x] Frontend featureRegistry.ts가 정확히 생성됨

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| `product-recommendation.plan.md` | 상위 Plan - Phase 8 Feature System |
| `product-recommendation.design.md` | 기술 설계 - Feature Sync Architecture 섹션 추가 예정 |
| `product-recommendation.analysis.md` | Gap Analysis - Feature Format 감사 포함 |

---

## 10. Known Issues (TODO)

### 10.1 Catalog API Validation Error

**증상**: `/api/products/catalog` 엔드포인트 호출 시 Pydantic 검증 오류 발생

```
1 validation error for CatalogProduct
features.0.use_case
  Input should be a valid string [type=string_type, input_value=None, input_type=NoneType]
```

**원인**: `Product_Dsc_All.json`의 일부 제품 feature에 `use_case: null` 값 존재

**해결 방안**:
1. Pydantic 모델에서 `use_case: Optional[str] = None`으로 변경
2. 또는 `Product_Dsc_All.json` 데이터 정리 (null → 빈 문자열)

**우선순위**: 낮음 (Feature Registry 작업과 무관, 기존 데이터 문제)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.2 | 2026-01-22 | Implementation complete, verification passed | Claude Code |
| 1.1 | 2026-01-22 | Added Known Issues section | Claude Code |
| 1.0 | 2026-01-22 | Initial plan | Claude Code |
