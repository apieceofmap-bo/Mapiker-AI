# Product Recommendation Logic Improvement Plan

> **Summary**: 제품 추천 로직 개선 - Vehicle Type 지원, 유사 API 구분, SDK/API 우선순위, 중복 기능 제거, Application 필터 개선, Map Display 자동 추천, 로딩 최적화
>
> **Author**: Claude Code
> **Date**: 2026-01-22
> **Status**: In Progress (v1.3)
>
> **Progress:**
> - ✅ **Phase 4 (P0)**: Duplicate Feature Elimination - COMPLETE
> - ✅ **Phase 1 (P1)**: Vehicle Type Support - COMPLETE
> - ✅ **Phase 1.1 (P0)**: Vehicle Type Boost 버그 수정 - COMPLETE (2026-01-23)
> - ✅ **Phase 3 (P1)**: SDK/API Priority - COMPLETE
> - ✅ **Phase 2 (P2)**: Similar API Differentiation - COMPLETE
> - ✅ **Phase 8.1 (P0)**: db_feature_mappings 자동 생성 - COMPLETE (2026-01-23)
> - ✅ **Phase 6 (P2)**: Map Display Auto-Recommendation - COMPLETE (2026-01-23)
> - 🔄 **Phase 8 (P0)**: Unified Feature System Migration - IN PROGRESS (92%)
> - 🆕 **Phase 7 (P0)**: Loading Time Optimization - PENDING
> - 🆕 **Phase 5 (P1)**: Application Filter Fix (SDK vs API) - PENDING

---

## 1. Current Architecture Overview

### 1.1 Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `improved_pipeline_v2.py` | 메인 추천 파이프라인 (3-Agent Hybrid) | ~1700 |
| `agent3_scorer.py` | 벤더별 점수 계산 (30/20/50 공식) | ~300 |
| `database.py` | 제품 DB 로드 및 필터링 | ~300 |
| `services/product_matcher.py` | 프론트엔드 응답 포맷 변환 | ~500 |
| `services/chat_agent.py` | 챗봇 요구사항 수집 | ~280 |
| `prompts.py` | LLM 프롬프트 및 Feature-Product 힌트 | ~24KB |
| `data/Product_Dsc_All.json` | 제품 데이터베이스 (120+ 제품) | - |

### 1.2 Current Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                                │
│    use_case, features, application, region                  │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FEATURE ENRICHMENT                                        │
│    - Use Case → Vehicle Routing 자동 추가 (제한적)           │
│    - Feature 정규화                                          │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AGENT 1: Feature Mapping (LLM)                           │
│    - 사용자 Feature → DB Feature 매핑                        │
│    - 동의어/유사어 확장                                      │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PRE-FILTER                                                │
│    - Application/Region/Use Case 호환성 필터                 │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AGENT 2: Product Matching                                 │
│    - Feature 매칭 점수 계산                                  │
│    - SDK/API 필터링 (현재: 단순 모바일 체크)                 │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AGENT 3: Scoring & Ranking                                │
│    Score = Coverage(30%) + Regional(20%) + Agent2(50%)      │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. RESPONSE FORMATTING                                       │
│    - Category 그룹핑                                         │
│    - Feature Inheritance (제한적)                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Current Scoring Formula

```
Final_Score = (Feature_Coverage × 0.30) + (Regional_Quality × 0.20) + (Agent2_Score × 0.50)
```

---

## 2. Identified Issues

### 2.1 Required Feature 충족 제품 미추천

**문제:**
- Required Feature를 충족하는 제품이 있음에도 추천되지 않는 경우 발생

**원인 분석:**
1. Agent 1의 Feature Mapping이 DB Feature와 정확히 매칭되지 않음
2. Pre-Filter에서 과도하게 필터링됨
3. Agent 2의 매칭 로직이 일부 제품을 누락

**예시:**
- 사용자: "geocoding" 요청
- DB: "address-geocoding", "forward-geocoding" 등 다양한 표현
- 결과: 일부 Geocoding 제품이 누락됨

---

### 2.2 Vehicle Type 미지원

**문제:**
- 사용자가 "Truck routing", "2-wheeler delivery" 등 Vehicle Type을 언급해도 해당 기능이 있는 제품 우선 추천 안 됨

**현재 상태:**
```python
# improved_pipeline_v2.py
USE_CASE_VEHICLE_MAPPING = {
    "food-delivery": ["bicycle", "scooter", "car"],
    "logistics": ["truck"],
    ...
}
```
- Use Case 기반으로 자동 추가하지만, 명시적 Vehicle Type 입력 미지원
- 챗봇에서 Vehicle Type 질문하지 않음

---

### 2.3 유사 API 구분 미흡

**문제:**
- 같은 벤더 내 기능이 유사한 API들의 우선순위 구분이 없음

**예시:**
| 벤더 | API 1 | API 2 | 차이점 |
|------|-------|-------|--------|
| NextBillion | Directions API | Route Optimization API | 단일 경로 vs 다중 웨이포인트 최적화 |
| Mapbox | Directions API | Matrix API | 단일 경로 vs 다중 Origin-Destination 매트릭스 |
| Google | Compute Routes | Route Optimization | 단일 경로 vs Fleet Routing |
| HERE | Routing API | Matrix Routing | 단일 경로 vs 거리/시간 매트릭스 |

**현재 상태:**
- 모든 라우팅 관련 제품이 동등하게 추천됨
- 사용자의 실제 니즈(단일 경로 vs 최적화)를 구분하지 않음

---

### 2.4 SDK/API 우선순위 미흡

**문제:**
- Mobile 앱 개발 시 SDK가 상단에 배치되지 않음
- Non-mobile 개발 시에도 SDK가 추천됨

**현재 상태:**
```python
# improved_pipeline_v2.py - _run_agent2()
if is_mobile:
    mobile_priority_products = []
    # Navigation SDK > SDK > API 순서
    for cat in ['navigation_sdk', 'sdk', 'api']:
        mobile_priority_products.extend([p for p in filtered if self._get_product_type(p) == cat])
```
- 로직은 존재하나 효과적으로 작동하지 않음
- product type 판별이 부정확함

---

### 2.5 중복 기능 추천

**문제:**
- 한 제품이 이미 커버하는 기능을 다른 제품으로 중복 추천

**예시:**
| 제품 | 포함 기능 | 중복 추천되는 제품 |
|------|----------|------------------|
| Places API | 주소 검색, POI, Autocomplete | Geocoding API (주소 검색 중복) |
| Maps SDK | Map Display, Geocoding, Places | Maps Static API, Geocoding API |
| Navigation SDK | Directions, Turn-by-turn, Map | Directions API, Maps SDK |

**현재 상태:**
```python
# product_matcher.py - _apply_feature_inheritance()
```
- Feature Inheritance 로직이 있으나 제한적
- 제품 간 기능 중복 분석 미흡

---

## 3. Improvement Plan

### 3.1 Phase 1: Vehicle Type Support

**목표:** 사용자가 명시한 Vehicle Type에 맞는 제품 우선 추천

#### 3.1.1 Chat Agent 수정

**File:** `services/chat_agent.py`

**변경:**
1. SYSTEM_PROMPT에 Vehicle Type 질문 추가
2. extracted_requirements에 `vehicle_types` 필드 추가

```python
# 추가할 Vehicle Types
VEHICLE_TYPES = [
    "car", "truck", "bicycle", "scooter", "motorcycle",
    "taxi", "bus", "pedestrian", "ev"
]

# SYSTEM_PROMPT에 추가
"""
### Step 2.5: Get Vehicle Type (for routing-related use cases)
If the user's use case involves routing/delivery/logistics, ask:
"What type of vehicle will be used for routing?"
Options: Car, Truck, Bicycle/Scooter, Motorcycle, Taxi, Bus, Pedestrian, Electric Vehicle

Store as vehicle_types: ["truck"] or ["bicycle", "scooter"]
"""
```

#### 3.1.2 Requirements Schema 수정

**File:** `pydantic_schemas.py`

```python
class CustomerInput(BaseModel):
    use_case: str
    map_features: List[str]
    application: str
    monthly_requests: int = 10000
    region: str = "global"
    vehicle_types: Optional[List[str]] = None  # NEW
    additional_notes: Optional[str] = None
```

#### 3.1.3 Pipeline 수정

**File:** `improved_pipeline_v2.py`

```python
def _apply_vehicle_type_boost(self, products: List[CandidateProduct], vehicle_types: List[str]) -> List[CandidateProduct]:
    """Vehicle Type에 맞는 제품 점수 부스트"""

    VEHICLE_KEYWORDS = {
        "truck": ["truck", "heavy-vehicle", "commercial-vehicle", "hgv"],
        "bicycle": ["bicycle", "bike", "cycling", "2-wheeler"],
        "scooter": ["scooter", "motorcycle", "2-wheeler"],
        "ev": ["ev", "electric-vehicle", "electric"],
        "taxi": ["taxi", "ride-hailing"],
        "bus": ["bus", "public-transit"],
        "pedestrian": ["pedestrian", "walking", "foot"]
    }

    for product in products:
        for vehicle in vehicle_types:
            keywords = VEHICLE_KEYWORDS.get(vehicle, [vehicle])
            # Check product features and name
            if any(kw in product.product_name.lower() or
                   any(kw in f.lower() for f in product.key_features)
                   for kw in keywords):
                product.feature_match_score += 15  # Boost score
                product.match_reason += f" [Vehicle: {vehicle}]"

    return sorted(products, key=lambda x: x.feature_match_score, reverse=True)
```

#### 3.1.4 Product Data Enhancement

**File:** `data/Product_Dsc_All.json`

각 Routing 제품에 `supported_vehicles` 필드 추가:

```json
{
  "id": "here_routing_truck",
  "product_name": "Routing - Truck",
  "supported_vehicles": ["truck", "heavy-vehicle"],
  "key_features": ["truck-routing", "weight-restrictions", "hazmat-routing"]
}
```

---

### 3.2 Phase 2: Similar API Differentiation

**목표:** 유사 기능 API들을 용도에 따라 구분하여 추천

#### 3.2.1 API Differentiation Matrix

**File:** `prompts.py` 또는 새 파일 `api_differentiation.py`

```python
API_DIFFERENTIATION = {
    "routing": {
        "single_route": {
            "description": "A에서 B로 가는 단일 경로 계산",
            "use_when": ["단순 내비게이션", "1:1 경로 안내"],
            "products": ["Directions API", "Compute Routes", "Routing API"]
        },
        "multi_waypoint": {
            "description": "여러 경유지를 포함한 경로 최적화",
            "use_when": ["배달 경로 최적화", "다중 목적지 방문"],
            "products": ["Route Optimization API", "Fleet Routing", "Tour Planning"]
        },
        "matrix": {
            "description": "다중 출발지-목적지 간 거리/시간 매트릭스",
            "use_when": ["가장 가까운 배달기사 찾기", "배치 거리 계산"],
            "products": ["Matrix API", "Distance Matrix", "Route Matrix"]
        }
    }
}
```

#### 3.2.2 Chat Agent 추가 질문

**File:** `services/chat_agent.py`

```python
# SYSTEM_PROMPT에 추가
"""
### Step 2.6: Clarify Routing Needs (if routing feature selected)
If user needs routing, ask to clarify:
"What type of routing do you need?"
1. Single route (A to B navigation)
2. Multi-stop optimization (visiting multiple waypoints efficiently)
3. Distance matrix (calculating distances between multiple points)

This helps recommend the right API variant.
"""
```

#### 3.2.3 Feature Tagging

**File:** `improved_pipeline_v2.py`

```python
ROUTING_FEATURE_TAGS = {
    "single_route": ["route-calculation", "directions", "navigation", "turn-by-turn"],
    "multi_waypoint": ["route-optimization", "waypoint-sequencing", "tour-planning", "fleet-routing"],
    "matrix": ["distance-matrix", "route-matrix", "isochrone", "travel-time-matrix"]
}

def _tag_routing_type(self, features: List[str]) -> str:
    """Determine routing type from features"""
    for tag, keywords in ROUTING_FEATURE_TAGS.items():
        if any(kw in features for kw in keywords):
            return tag
    return "single_route"  # Default
```

---

### 3.3 Phase 3: SDK/API Priority Enhancement

**목표:** Application 타입에 따른 SDK/API 우선순위 명확화

#### 3.3.1 Product Type Classification

**File:** `improved_pipeline_v2.py`

```python
def _classify_product_type(self, product: dict) -> str:
    """Classify product as SDK, API, or Hybrid"""
    name_lower = product["product_name"].lower()
    data_format = product.get("data_format", "").lower()

    # SDK indicators
    sdk_keywords = ["sdk", "kit", "framework", "library"]
    if any(kw in name_lower for kw in sdk_keywords) or data_format == "sdk":
        if "navigation" in name_lower:
            return "navigation_sdk"
        return "sdk"

    # API indicators
    api_keywords = ["api", "service", "endpoint"]
    if any(kw in name_lower for kw in api_keywords) or data_format == "api":
        return "api"

    return "hybrid"

APPLICATION_PRODUCT_PRIORITY = {
    "mobile-app": ["navigation_sdk", "sdk", "hybrid", "api"],
    "driver-app": ["navigation_sdk", "sdk", "hybrid", "api"],
    "web-app": ["api", "hybrid", "sdk"],
    "web-dashboard": ["api", "hybrid"],
    "backend-operations": ["api"]
}
```

#### 3.3.2 Sorting Enhancement

**File:** `improved_pipeline_v2.py`

```python
def _sort_by_application_priority(self, products: List[CandidateProduct], application: str) -> List[CandidateProduct]:
    """Sort products by application-specific priority"""

    priority_order = APPLICATION_PRODUCT_PRIORITY.get(application, ["api", "sdk"])

    def get_priority(product):
        product_type = self._classify_product_type(product)
        try:
            return priority_order.index(product_type)
        except ValueError:
            return len(priority_order)  # Unknown types last

    # Sort by: 1) Application priority, 2) Match score
    return sorted(products, key=lambda p: (get_priority(p), -p.feature_match_score))
```

---

### 3.4 Phase 4: Duplicate Feature Elimination

**목표:** 한 제품이 커버하는 기능을 중복 추천하지 않음

#### 3.4.1 Feature Coverage Matrix

**File:** 새 파일 `feature_coverage.py`

```python
# 제품별 포함 기능 매트릭스
PRODUCT_FEATURE_COVERAGE = {
    "maps_sdk": {
        "covers": ["map-display", "geocoding", "places-search", "basic-routing"],
        "excludes_need_for": ["maps-static-api", "basic-geocoding-api"]
    },
    "navigation_sdk": {
        "covers": ["map-display", "turn-by-turn", "directions", "route-calculation", "voice-guidance"],
        "excludes_need_for": ["directions-api", "maps-sdk", "maps-static-api"]
    },
    "places_api": {
        "covers": ["places-search", "autocomplete", "poi-data", "address-lookup"],
        "excludes_need_for": ["basic-geocoding"]  # Places already does address search
    }
}

def get_redundant_products(selected_product_id: str, all_products: List[str]) -> List[str]:
    """Get list of products that become redundant when selected_product is chosen"""
    coverage = PRODUCT_FEATURE_COVERAGE.get(selected_product_id, {})
    return coverage.get("excludes_need_for", [])
```

#### 3.4.2 Deduplication Logic

**File:** `product_matcher.py`

```python
def _remove_redundant_products(self, categories: List[dict], selected_products: List[str]) -> List[dict]:
    """Remove products that provide duplicate functionality"""

    # Build coverage map
    covered_features = set()
    redundant_products = set()

    for product_id in selected_products:
        coverage = PRODUCT_FEATURE_COVERAGE.get(product_id, {})
        covered_features.update(coverage.get("covers", []))
        redundant_products.update(coverage.get("excludes_need_for", []))

    # Filter categories
    for category in categories:
        category["products"] = [
            p for p in category["products"]
            if p["id"] not in redundant_products
        ]

        # Mark category as optional if already covered
        if category["required"]:
            category_features = self._get_category_features(category["id"])
            if category_features.issubset(covered_features):
                category["required"] = False
                category["already_covered_by"] = list(selected_products)

    return categories
```

#### 3.4.3 Smart Required/Optional Assignment

**File:** `improved_pipeline_v2.py`

```python
def _assign_required_optional(self, products: List[CandidateProduct], user_features: List[str]) -> Tuple[List, List]:
    """
    Intelligently assign products to Required vs Optional
    - Required: Covers unique features not covered by other selected products
    - Optional: Provides additional/duplicate functionality
    """

    required = []
    optional = []
    covered_features = set()

    # Sort by feature coverage (most features first)
    sorted_products = sorted(products, key=lambda p: len(p.matched_features), reverse=True)

    for product in sorted_products:
        product_features = set(product.matched_features)
        new_features = product_features - covered_features

        if new_features:
            # This product covers new required features
            required.append(product)
            covered_features.update(product_features)
        else:
            # This product's features are already covered
            optional.append(product)

    return required, optional
```

---

## 4. Implementation Priority

| Phase | 항목 | 복잡도 | 우선순위 | 예상 영향 |
|-------|------|--------|----------|----------|
| 4 | 중복 기능 제거 | High | **P0** | 불필요한 추천 제거, 사용자 혼란 감소 |
| 1 | Vehicle Type 지원 | Medium | **P1** | Logistics/Delivery 사용자 만족도 향상 |
| 3 | SDK/API 우선순위 | Medium | **P1** | Mobile 개발자 경험 개선 |
| 2 | 유사 API 구분 | High | **P2** | 정확한 제품 추천 (챗봇 수정 필요) |

---

## 5. File Changes Summary

### Phase 1: Vehicle Type
| File | Action | Changes |
|------|--------|---------|
| `services/chat_agent.py` | Modify | Vehicle Type 질문 추가 |
| `pydantic_schemas.py` | Modify | `vehicle_types` 필드 추가 |
| `improved_pipeline_v2.py` | Modify | Vehicle boost 로직 추가 |
| `data/Product_Dsc_All.json` | Modify | `supported_vehicles` 필드 추가 |

### Phase 2: Similar API Differentiation
| File | Action | Changes |
|------|--------|---------|
| `services/chat_agent.py` | Modify | Routing type 질문 추가 |
| `api_differentiation.py` | **Create** | API 구분 매트릭스 |
| `improved_pipeline_v2.py` | Modify | Routing type 태깅 로직 |

### Phase 3: SDK/API Priority
| File | Action | Changes |
|------|--------|---------|
| `improved_pipeline_v2.py` | Modify | Product type 분류 및 정렬 개선 |

### Phase 4: Duplicate Elimination
| File | Action | Changes |
|------|--------|---------|
| `feature_coverage.py` | **Create** | 제품별 기능 커버리지 매트릭스 |
| `product_matcher.py` | Modify | 중복 제거 로직 |
| `improved_pipeline_v2.py` | Modify | Required/Optional 분류 개선 |

---

## 6. Testing Plan

### 6.1 Test Cases

| # | 시나리오 | 입력 | 예상 결과 |
|---|----------|------|----------|
| T1 | Truck Logistics | use_case: logistics, vehicle: truck | HERE/NextBillion Truck Routing 상단 배치 |
| T2 | 2-Wheeler Delivery | use_case: food-delivery, vehicle: bicycle | Bicycle routing 제품 우선 추천 |
| T3 | Mobile App | application: mobile-app | SDK > API 순서 |
| T4 | Backend | application: backend | API만 추천, SDK 제외 |
| T5 | Places 선택 시 | Places API 선택 | Geocoding API optional로 변경 |
| T6 | Navigation SDK | Nav SDK 선택 | Directions API, Maps SDK 제외 |
| T7 | Multi-stop Delivery | routing_type: multi_waypoint | Route Optimization API 우선 |
| T8 | Distance Matrix 필요 | routing_type: matrix | Matrix API 우선 |

### 6.2 Regression Tests

- 기존 추천 결과와 비교하여 품질 저하 없는지 확인
- Required Feature 커버리지 100% 유지 확인

---

## 7. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Required Feature 커버리지 | ~85% | 100% |
| 중복 제품 추천 비율 | ~30% | <5% |
| Mobile 앱에서 SDK 최상단 배치 | ~50% | 100% |
| Vehicle Type 반영 정확도 | 0% | >90% |

---

## 8. Resolved Questions

| # | 질문 | 답변 |
|---|------|------|
| 1 | Vehicle Type은 챗봇에서 항상 물을지, Routing 관련 시에만 물을지? | **Routing 관련 시에만 질문**. 단, Search/Places API에서 Truck stop, EV charging station 등 Vehicle 관련 POI가 필요한 경우도 고려하여, 대화 중 언급된 Vehicle 키워드로 점수 가중치 적용 |
| 2 | API 구분 질문이 UX를 복잡하게 만들지 않을지? | 일단 적용 후 테스트하고 결과 보고 재검토 |
| 3 | 중복 제거 시 사용자에게 "이미 커버됨" 표시를 어떻게 할지? | **별도 UI 표시 없음**. 중복 제품은 하단 배치 + Optional 분류로만 처리. 기존 Required/Optional Features 패널로 충분 |

### 8.1 추가 고려사항: Vehicle 키워드 기반 POI 제품 추천

Routing 외에도 다음 경우 Vehicle Type이 영향:
- **EV 충전소 검색**: Search/Places API 중 EV charging POI 지원 제품 우선
- **Truck Stop 검색**: Truck-specific POI 지원 제품 우선
- **주유소 검색**: Fuel station POI 지원 제품

**구현 방향:**
```python
# 대화에서 Vehicle 키워드 감지 시 해당 POI 지원 제품에 가중치
VEHICLE_POI_KEYWORDS = {
    "ev": ["ev-charging", "charging-station", "electric-vehicle-poi"],
    "truck": ["truck-stop", "rest-area", "weigh-station", "truck-parking"],
    "fuel": ["gas-station", "fuel-station", "petrol-station"]
}
```

---

## 9. New Issues (2026-01-22 Update)

### 9.1 Phase 5: Application 필터링 개선 (Required Feature 미커버)

**문제:**
- Google Geocoding API 등 핵심 API들이 추천되지 않음
- Time Zone API가 geocoding으로 잘못 매칭됨

**심층 분석 결과: 전체 제품의 57%가 동일 문제 보유**

| 벤더 | 영향 제품 수 | 주요 누락 제품 |
|------|------------|---------------|
| Google | 32개 | Geocoding, Maps SDK, Routes API, Places API |
| HERE | 19개 | Routing APIs, Matrix, Vector Tile |
| Mapbox | 16개 | GL JS, Geocoding, Matrix, Isochrone |
| NextBillion.ai | 1개 | Search Places API |
| **합계** | **68개 (57%)** | |

**시나리오별 테스트 결과:**

| 시나리오 | 통과 제품 | 누락된 핵심 제품 |
|----------|----------|-----------------|
| logistics + backend-operations | 50개 | Google/HERE Routing, 모든 Map SDK |
| food-delivery + mobile-app | 50개 | Google/Mapbox Geocoding, 모든 Route-Optimization |
| ride-hailing + driver-app | 50개 | **모든 Geocoding**, **모든 Route-Optimization** |
| fleet-management + web-dashboard | **17개!** | **거의 모든 핵심 제품** |

**근본 원인: `suitable_for.applications` 데이터가 너무 제한적**

```
# 예시: API인데 특정 application만 지정됨
Google Geocoding:      applications: ["backend-data-processor", "web-tool"]
  → mobile-app, driver-app에서 ❌ 필터링

Route Optimization:    applications: ["backend-vpr-engine", "dispatch-system"]
  → web-dashboard, mobile-app에서 ❌ 필터링

HERE Matrix Routing:   applications: ["backend-optimizer", "data-analysis-tool"]
  → driver-app, mobile-app에서 ❌ 필터링
```

**핵심 통찰: SDK vs API 구분 필요**

| 유형 | 제품 수 | 특성 | Application 필터링 |
|------|--------|------|-------------------|
| **SDK** | 13개 | 플랫폼 종속적 (iOS/Android/Web) | ✅ 필요 |
| **API** | 107개 | 플랫폼 무관 (HTTP 호출) | ❌ 불필요 |

**SDK 제품 목록 (13개):**
- Maps SDKs for Mobile (iOS, Android, Flutter)
- Mapbox GL JS
- Navigation SDK (Google, Mapbox, NextBillion)
- Places UI Kit
- Live Tracking SDK
- Mapbox Geofencing SDK

---

#### 해결 방안: SDK vs API 구분 필터링 + 안전장치

**핵심 아이디어:**
- SDK: 플랫폼 종속적 → application 필터링 유지
- API: 플랫폼 무관 → application 필터링 우회
- **안전장치**: API도 `use_case_relevance` 임계값 적용 (완전 무관 제품 제외)

**⚠️ 안전장치가 필요한 이유:**

단순히 "API는 무조건 통과"로 구현하면 문제 발생:
```
# 문제 시나리오: logistics use case
Weather API (relevance: 0.2) ✓ 통과 → 불필요한 추천
Solar API (relevance: 0.2) ✓ 통과 → 불필요한 추천
Pollen API (relevance: 0.2) ✓ 통과 → 불필요한 추천
Geocoding API (relevance: 0.7) ✓ 통과 → 필요한 추천

→ max_results=30 제한에서 무관한 제품이 관련 제품을 밀어낼 수 있음
```

**코드 변경:**

```python
# database.py - 새 헬퍼 함수 추가

def _is_sdk_product(self, product: Dict) -> bool:
    """SDK 제품인지 판별"""
    data_format = product.get('data_format', '').lower()
    product_name = product.get('product_name', '').lower()

    return ('sdk' in product_name or
            'kit' in product_name or
            'gl js' in product_name or
            data_format == 'sdk')


# database.py - _check_application_match() 수정

def _check_application_match(self, required_apps: List[str],
                              product_apps: List[str],
                              product: Dict,
                              use_case_relevance: float = 0.5) -> bool:
    """
    Application 매칭 체크 (안전장치 포함)

    - SDK: 엄격한 application 매칭
    - API: application 필터 우회하되, use_case_relevance 임계값 적용

    Args:
        required_apps: 요청된 application 타입들
        product_apps: 제품의 지원 application 목록
        product: 제품 전체 정보
        use_case_relevance: use case 관련성 점수 (0.0~1.0)
    """
    # SDK인지 판별
    is_sdk = self._is_sdk_product(product)

    if not is_sdk:
        # API는 application 필터 우회하되,
        # use_case와 전혀 관련 없는 제품은 제외 (임계값: 0.2)
        #
        # 예시:
        # - Geocoding API (relevance 0.7) → ✅ 통과
        # - Routing API (relevance 0.5) → ✅ 통과
        # - Weather API (relevance 0.2) → ❌ 제외
        # - Solar API (relevance 0.2) → ❌ 제외
        if use_case_relevance <= 0.2:
            return False
        return True

    # SDK만 application 매칭 검사
    for req_app in required_apps:
        related_keywords = APP_KEYWORD_MAPPING.get(req_app, [req_app])
        for keyword in related_keywords:
            for prod_app in product_apps:
                if keyword == prod_app or self._fuzzy_match(keyword, prod_app):
                    return True

    return False


# database.py - filter() 함수 수정

def filter(self, use_case, application_environment, regional_coverage,
           max_results=30, feature_db_mappings=None):
    # ...

    for product in all_products:
        suitable_for = product.get('suitable_for', {})

        # 1. Use case 관련성 먼저 계산
        product_use_cases = suitable_for.get('use_cases', [])
        use_case_relevance = self._check_use_case_relevance(use_case, product_use_cases)

        # 2. Application 매칭 (use_case_relevance 전달)
        product_apps = suitable_for.get('applications', [])
        app_match = self._check_application_match(
            application_environment,
            product_apps,
            product,  # 제품 정보 전달
            use_case_relevance  # 관련성 점수 전달
        )

        # 3. Region 매칭
        product_regions = suitable_for.get('regions', ['global'])
        region_match = self._check_region_match(regional_coverage, product_regions)

        if app_match and region_match:
            product['_relevance_score'] = use_case_relevance
            filtered.append(product)

    # ...
```

**효과 비교:**

| 제품 | use_case_relevance | 기존 | Phase 5 (무조건) | Phase 5 (안전장치) |
|------|-------------------|-----|-----------------|------------------|
| Google Geocoding | 0.7 | ❌ 누락 | ✅ 포함 | ✅ 포함 |
| HERE Routing | 0.5 | ❌ 누락 | ✅ 포함 | ✅ 포함 |
| Mapbox Matrix | 0.5 | ❌ 누락 | ✅ 포함 | ✅ 포함 |
| Weather API | 0.2 | ❌ 누락 | ✅ 포함 ⚠️ | ❌ 제외 ✅ |
| Solar API | 0.2 | ❌ 누락 | ✅ 포함 ⚠️ | ❌ 제외 ✅ |
| Pollen API | 0.2 | ❌ 누락 | ✅ 포함 ⚠️ | ❌ 제외 ✅ |

**예상 결과:**

| 시나리오 | 현재 | 수정 후 |
|----------|------|--------|
| logistics + backend | 50개 | ~85개 (무관 제품 제외) |
| food-delivery + mobile | 50개 | ~90개 |
| ride-hailing + driver-app | 50개 | ~90개 |
| fleet-management + dashboard | 17개 | ~80개 |

**장점:**
1. 핵심 API가 추천 후보에 포함 (Geocoding, Routing, Matrix 등)
2. 완전 무관한 API 제외 (Weather, Solar, Pollen 등)
3. SDK는 여전히 플랫폼 적합성 검사
4. 기존 Product DB 데이터 수정 불필요
5. max_results 제한에서 관련 제품이 밀리지 않음

**파일 변경:**

| 파일 | 변경 내용 |
|------|----------|
| `database.py` | `_is_sdk_product()` 헬퍼 함수 추가 |
| `database.py` | `_check_application_match()` 수정 - SDK vs API 구분 + 안전장치 |
| `database.py` | `filter()` - use_case_relevance를 application 매칭에 전달 |

---

### 9.2 Phase 6: Map Display 자동 추천

> **Status**: ✅ COMPLETE (2026-01-23)
>
> **구현 위치**: `services/product_matcher.py`
> - `_should_auto_add_map_display()` - SDK 유무 확인
> - `_apply_auto_map_display()` - auto_recommended=True 적용
> - `_add_map_display_products()` - Map Display 제품 추가

**문제:**
- Maps SDK나 Navigation SDK를 선택하지 않은 경우, Routing/Search API들은 배경 지도를 포함하지 않음
- 사용자가 별도로 Map Display 요청하지 않아도 Optional Features로 자동 추천되어야 함

**현재 상태:**
- Routing API (Directions, Route Optimization 등) → 지도 없음
- Search API (Geocoding, Places 등) → 지도 없음
- SDK (Maps SDK, Navigation SDK) → 지도 포함

**예상 시나리오:**
| 사용자 선택 | Map Display 필요? |
|------------|------------------|
| Navigation SDK | ❌ (SDK에 포함) |
| Maps SDK | ❌ (SDK에 포함) |
| Directions API only | ✅ Map Display 필요 |
| Route Optimization API | ✅ Map Display 필요 |
| Geocoding API + Places API | ✅ Map Display 필요 |

---

#### 해결 방안: Auto-inject Map Display Category

**코드 변경:**

```python
# services/product_matcher.py - _categorize_products() 수정

# SDK 식별자
SDK_WITH_MAP_DISPLAY = [
    "maps_sdk", "navigation_sdk", "mapbox_maps_sdks",
    "mapbox_mapbox_gl_js", "google_maps_sdk", "nextbillion_maps_sdk",
    "here_sdk", "mapbox_navigation_sdk", "google_navigation_sdk"
]

def _should_auto_add_map_display(self, categories: List[dict]) -> bool:
    """
    Map Display 카테고리 자동 추가 여부 결정

    Returns:
        True if user selected API-only products without Map SDK
    """
    # 현재 선택된 모든 제품 ID 수집
    all_product_ids = []
    for cat in categories:
        if cat.get('required', False):
            for prod in cat.get('products', []):
                all_product_ids.append(prod['id'].lower())

    # SDK 선택 여부 확인
    has_map_sdk = any(
        any(sdk_id in p_id for sdk_id in ['sdk', 'gl_js', 'gl-js'])
        for p_id in all_product_ids
    )

    # Map Display 카테고리가 이미 Required인지 확인
    has_map_category = any(
        cat['id'] == 'map_display' and cat.get('required', False)
        for cat in categories
    )

    return not has_map_sdk and not has_map_category


def _categorize_products(self, ...):
    # ... 기존 로직 ...

    # Map Display 자동 추가 체크
    if self._should_auto_add_map_display(categories):
        # map_display 카테고리를 Optional → Required로 변경하거나
        # 없으면 새로 추가
        for cat in categories:
            if cat['id'] == 'map_display':
                cat['auto_recommended'] = True
                cat['auto_recommend_reason'] = "APIs require a map display layer"
                break

    return categories
```

**프론트엔드 UI 처리:**

```typescript
// CategoryGroup.tsx 수정
{category.auto_recommended && (
  <Badge variant="warning" className="ml-2">
    💡 {category.auto_recommend_reason || "Recommended"}
  </Badge>
)}
```

**파일 변경:**

| 파일 | 변경 내용 |
|------|----------|
| `services/product_matcher.py` | `_should_auto_add_map_display()` 추가 |
| `services/product_matcher.py` | `_categorize_products()` 수정 |
| `frontend/src/components/products/CategoryGroup.tsx` | auto_recommended 뱃지 표시 |
| `frontend/src/lib/types.ts` | Category 타입에 `auto_recommended`, `auto_recommend_reason` 추가 |

---

### 9.3 Phase 7: 로딩 시간 최적화 (P0 - 심각)

**문제:**
- 제품 추천 API 응답 시간: **1분 44초** (측정값)
- 사용자 경험 심각하게 저하

**원인 분석:**

| 단계 | 예상 시간 | 원인 |
|------|----------|------|
| Agent 1 (LLM) | ~90초 | 각 feature별 Gemini API 호출 (3-step workflow × N features) |
| Pre-Filter | <1초 | DB 필터링 (빠름) |
| Agent 2 | <1초 | Rule-based 매칭 (빠름) |
| Agent 3 | <1초 | Rule-based 스코어링 (빠름) |

**병목: Agent 1의 LLM 호출**
- 3-step workflow: Synonym Extraction → DB Search → LLM Ranking
- Feature 6개 × API 호출 2회(Step 1, Step 3) = 12회 API 호출
- 각 호출 ~5-10초 → 총 60-120초

**해결 방안:**

#### 방안 A: Agent 1 캐싱 (권장 - 즉시 적용 가능)
```python
# improved_pipeline_v2.py 또는 새 파일 feature_cache.py

import hashlib
import json
from functools import lru_cache

# 메모리 캐시 (서버 재시작 시 초기화)
FEATURE_MAPPING_CACHE = {}

def _get_feature_mapping_cached(self, user_feature: str) -> List[str]:
    """
    Feature → DB features 매핑 캐싱
    동일 feature에 대해 LLM 재호출 방지
    """
    cache_key = user_feature.lower().strip()

    if cache_key in FEATURE_MAPPING_CACHE:
        print(f"   📦 Cache HIT: {user_feature}")
        return FEATURE_MAPPING_CACHE[cache_key]

    # Cache miss - LLM 호출
    print(f"   🔄 Cache MISS: {user_feature}")
    db_features = self._run_agent1_for_feature(user_feature)

    FEATURE_MAPPING_CACHE[cache_key] = db_features
    return db_features
```

**예상 효과:**
- 첫 요청: ~90초 (동일)
- 반복 요청 (같은 features): ~1-2초 (90%+ 단축)

#### 방안 B: Parallel LLM 호출 (추가 최적화)
```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def _run_agent1_parallel(self, features: List[str]) -> List[FeatureDBMapping]:
    """
    여러 feature를 병렬로 처리
    """
    with ThreadPoolExecutor(max_workers=3) as executor:
        loop = asyncio.get_event_loop()
        tasks = [
            loop.run_in_executor(executor, self._get_feature_mapping_cached, f)
            for f in features
        ]
        results = await asyncio.gather(*tasks)
    return results
```

**예상 효과:**
- 6개 feature 순차: ~90초
- 6개 feature 병렬 (3 workers): ~30초

#### 방안 C: Pre-computed Feature Mapping (장기)
```python
# 자주 사용되는 feature들에 대해 미리 매핑 저장
PRECOMPUTED_MAPPINGS = {
    "geocoding": ["geocoding", "address-geocoding", "forward-geocoding", ...],
    "route-optimization": ["route-optimization", "multi-stop-optimization", ...],
    "fleet-tracking": ["fleet-tracking", "vehicle-tracking", ...],
    # ... 상위 20개 feature
}

def _get_feature_mapping(self, user_feature: str) -> List[str]:
    # 1. Pre-computed 확인
    if user_feature in PRECOMPUTED_MAPPINGS:
        return PRECOMPUTED_MAPPINGS[user_feature]

    # 2. 캐시 확인
    if user_feature in FEATURE_MAPPING_CACHE:
        return FEATURE_MAPPING_CACHE[user_feature]

    # 3. LLM 호출 (fallback)
    return self._run_llm_mapping(user_feature)
```

**예상 효과:**
- 상위 20개 feature 사용 시: ~1-2초 (pre-computed)
- 새로운 feature: ~10-15초 (LLM 호출)

#### 방안 D: Streaming Response (UX 개선)
```python
# FastAPI streaming response
from fastapi.responses import StreamingResponse

@router.post("/match-streaming")
async def match_products_streaming(request: RequirementsRequest):
    async def generate():
        yield json.dumps({"status": "processing", "step": "Agent 1 starting..."})

        # Agent 1
        agent1_result = pipeline.run_agent1(...)
        yield json.dumps({"status": "processing", "step": "Features mapped",
                         "features": agent1_result.normalized_features})

        # Agent 2
        agent2_result = pipeline.run_agent2(...)
        yield json.dumps({"status": "processing", "step": "Products matched"})

        # Final result
        yield json.dumps({"status": "complete", "result": final_result})

    return StreamingResponse(generate(), media_type="application/x-ndjson")
```

**권장 구현 순서:**
1. **Phase 1 (즉시)**: 방안 A - Feature 캐싱 (1-2일)
2. **Phase 2 (단기)**: 방안 C - Pre-computed 매핑 추가 (2-3일)
3. **Phase 3 (중기)**: 방안 B - 병렬 처리 (3-5일)
4. **Phase 4 (선택)**: 방안 D - Streaming UX (2-3일)

---

## 10. Updated Implementation Priority

| Phase | 항목 | 복잡도 | 우선순위 | 상태 |
|-------|------|--------|----------|------|
| 4 | 중복 기능 제거 | High | P0 | ✅ COMPLETE |
| 1 | Vehicle Type 지원 | Medium | P1 | ✅ COMPLETE |
| 3 | SDK/API 우선순위 | Medium | P1 | ✅ COMPLETE |
| 2 | 유사 API 구분 | High | P2 | ✅ COMPLETE |
| **8** | **key_features → features 마이그레이션** | High | **P0** | 🔄 IN PROGRESS |
| **7** | **로딩 시간 최적화 (캐싱)** | Medium | **P0** | 🆕 NEW |
| **5** | **Required Feature 미커버 수정** | Medium | **P1** | 🆕 NEW |
| **6** | **Map Display 자동 추천** | Low | **P2** | 🆕 NEW |

---

## 11. Phase 8: Unified Feature System Migration (P0 - Critical)

### 11.1 배경 및 목표

**문제점:**
- 현재 `key_features`는 단순 문자열 배열 (kebab-case) - 벤더별 명명 불일치
- 챗봇 `USE_CASE_FEATURES`는 추상적 Feature (kebab-case) - DB와 매칭 어려움
- `PRECOMPUTED_FEATURE_MAPPINGS`는 kebab-case → kebab-case 매핑 - 새 DB와 불일치
- Semantic Mismatch: `delivery-failure-reduction` → `delivery-management`로 잘못 매칭
- DB에 없는 Feature를 챗봇이 제안 (`delivery-management`, `proof-of-delivery` 등)

**목표: 파이프라인 전체에 통일된 Feature System 적용**

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED FEATURE SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│  Source: Feature Matrix (feature_matrix_2026.01.3.html)         │
│  Format: Title Case, Vendor-neutral                             │
│  Categories: 8개 (Maps, Geocoding, Routing, Traffic, Tracking,  │
│              Places, Cost, Environment)                          │
│  Features: 28개 표준 Feature                                     │
└─────────────────────────────────────────────────────────────────┘
              ↓                    ↓                    ↓
     ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
     │   Chatbot     │    │   Pipeline    │    │   Product DB  │
     │ USE_CASE_     │    │ PRECOMPUTED_  │    │   features    │
     │ FEATURES      │    │ MAPPINGS      │    │   field       │
     └───────────────┘    └───────────────┘    └───────────────┘
```

**핵심 결정:**
1. Feature Matrix의 표준 Feature 목록을 전체 파이프라인에 적용
2. `key_features` 필드 제거 → `features` 필드만 사용
3. 제품 `description` 및 기타 메타데이터는 그대로 유지

---

### 11.2 표준 Feature List (Feature Matrix 기반)

**Source**: `feature_matrix_2026.01.3.html` (Quality Evaluator 산출물)

#### 8개 카테고리, 28개 표준 Feature

| Category | Feature | Description | Vendor Coverage |
|----------|---------|-------------|-----------------|
| **Maps & Visualization** | Vector Tiles | 벡터 포맷 지도 데이터, 클라이언트 렌더링 | Google ✓, HERE ✓, Mapbox ✓ |
| | Raster Tiles | 래스터 이미지 타일 | Google ✓, HERE ✓, Mapbox ✓ |
| | Static Maps | 정적 지도 이미지 생성 | Google ✓, HERE ✓, Mapbox ✓ |
| | Photorealistic 3D Maps | 실사 3D 메시 모델 | Google ✓, HERE △, Mapbox △ |
| | Street View / Panoramas | 360도 스트리트뷰 파노라마 | Google ✓ only |
| **Search & Geocoding** | Forward Geocoding | 주소 → 좌표 변환 | All ✓ |
| | Reverse Geocoding | 좌표 → 주소 변환 | All ✓ |
| | Autocomplete / Autosuggest | 입력 자동완성 | All ✓ |
| | POI Search & Discovery | 장소/POI 검색 | All ✓ |
| | Address Validation | 주소 검증 및 표준화 | Google ✓, HERE △, Mapbox ✗ |
| **Routing & Navigation** | Point-to-Point Routing | A→B 경로 계산 | All ✓ |
| | Matrix Routing | M×N 거리/시간 매트릭스 | All ✓ |
| | Isochrone / Isoline Routing | 도달권 분석 | HERE ✓, Mapbox ✓, Google ✗ |
| | Route Optimization | 경로 최적화, 차량 경로 문제 | All ✓ |
| | Map Matching | GPS 트레이스 → 도로 스냅 | All ✓ |
| | EV Routing | 전기차 전용 경로 (충전소 포함) | Google ✓, HERE ✓, Mapbox ✗ |
| | Truck Routing | 트럭 전용 경로 (제한 고려) | HERE ✓, Google △, Mapbox △ |
| **Traffic & Real-time** | Traffic Flow | 실시간 교통 흐름 | All ✓ |
| | Traffic Incidents | 사고/공사 정보 | HERE ✓, Mapbox ✓, Google ✗ |
| **Tracking & Fleet** | Real-time Tracking | 실시간 위치 추적 | NextBillion ✓ only |
| | Fleet Tracking | 차량 플릿 추적 | NextBillion ✓ only |
| | Geofencing | 지오펜스 설정/모니터링 | Mapbox ✓, NextBillion ✓ |
| **Place Details** | Place Details | 장소 상세 정보 | All ✓ |
| | EV Charging Stations | 전기차 충전소 POI | Google ✓, HERE ✓, Mapbox ✗ |
| | Fuel Stations | 주유소 POI | Google ✓, HERE ✓, Mapbox ✗ |
| **Cost & Tolls** | Toll Calculation | 통행료 계산 | HERE ✓, Google △ |
| **Environment** | Weather Data | 날씨 데이터 | Google ✓, HERE ✓, Mapbox △ |
| | Air Quality | 대기질 정보 | Google ✓, HERE △ |
| | Elevation Data | 고도 데이터 | Google ✓, Mapbox ✓ |

---

### 11.3 현재 시스템 사용 현황 (교체 대상)

| 파일 | 사용 위치 | 현재 상태 | 변경 내용 |
|------|----------|----------|----------|
| `services/chat_agent.py` | USE_CASE_FEATURES | kebab-case 추상 Feature | 표준 Feature로 교체 |
| `improved_pipeline_v2.py` | PRECOMPUTED_FEATURE_MAPPINGS | kebab-case → kebab-case | 표준 Feature → DB features.name |
| `improved_pipeline_v2.py` | Feature 매칭 로직 | key_features 참조 | features.name 참조 |
| `database.py` | Feature 검색 | key_features 검색 | features.name 검색 |
| `agent3_scorer.py` | 점수 계산 | key_features 기반 | features.name 기반 |
| `services/product_matcher.py` | 응답 포맷 | key_features 반환 | features 반환 |
| `routers/products.py` | API 스키마 | key_features: List[str] | features: List[FeatureDetail] |
| `prompts.py` | FEATURE_PRODUCT_HINTS | kebab-case 키 | 표준 Feature 키 |
| `data/Product_Dsc_All.json` | 제품 데이터 | key_features + features | features만 유지 |

---

### 11.4 데이터 보존 정책

**제거되는 필드:**
- `key_features` (구 Feature 목록) → 완전 제거

**유지되는 필드:**
```json
{
  "id": "mapbox_navigation_sdk_metered_trips",
  "provider": "Mapbox",
  "product_name": "Navigation SDK - Metered Trips",
  "description": "A mobile SDK for building turn-by-turn navigation...",  // ✅ 유지
  "suitable_for": { "use_cases": [...], "applications": [...] },          // ✅ 유지
  "data_format": "SDK",                                                   // ✅ 유지
  "document_url": "https://docs.mapbox.com/...",                         // ✅ 유지
  "feature_category": "Navigation",                                       // ✅ 유지
  "features": [                                                           // ✅ Primary
    {"name": "...", "description": "...", "use_case": "..."}
  ]
}
```

> **중요**: 제품 `description`은 Feature 시스템과 독립적으로 관리되며 영향 없음

---

### 11.5 통합 구현 계획

#### 11.5.1 챗봇 USE_CASE_FEATURES 업데이트

**파일**: `services/chat_agent.py`

**변경**: 표준 Feature 목록으로 교체

```python
# 기존 (kebab-case, DB에 없는 Feature 포함)
USE_CASE_FEATURES = {
    "logistics": {
        "required": ["route-optimization", "fleet-tracking", "geocoding", "delivery-management"],
        ...
    }
}

# 신규 (표준 Feature, Feature Matrix 기반)
USE_CASE_FEATURES = {
    "food-delivery": {
        "required": ["Real-time Tracking", "Route Optimization", "Forward Geocoding", "Traffic Flow"],
        "optional": ["Geofencing", "POI Search & Discovery"]
    },
    "ride-hailing": {
        "required": ["Real-time Tracking", "Point-to-Point Routing", "Forward Geocoding", "Matrix Routing"],
        "optional": ["Traffic Flow", "POI Search & Discovery"]
    },
    "logistics": {
        "required": ["Route Optimization", "Fleet Tracking", "Forward Geocoding", "Truck Routing"],
        "optional": ["Traffic Flow", "Geofencing", "Toll Calculation"]
    },
    "fleet-management": {
        "required": ["Fleet Tracking", "Route Optimization", "Geofencing"],
        "optional": ["Traffic Flow", "Toll Calculation"]
    },
    "store-locator": {
        "required": ["Forward Geocoding", "POI Search & Discovery", "Static Maps"],
        "optional": ["Point-to-Point Routing", "Place Details"]
    },
    "real-estate": {
        "required": ["Static Maps", "Forward Geocoding", "POI Search & Discovery"],
        "optional": ["Street View / Panoramas", "Photorealistic 3D Maps"]
    },
    "e-commerce": {
        "required": ["Forward Geocoding", "Address Validation", "Geofencing"],
        "optional": ["Route Optimization", "Traffic Flow"]
    },
    "public-transport": {
        "required": ["Point-to-Point Routing", "Traffic Flow", "Vector Tiles"],
        "optional": ["Isochrone / Isoline Routing"]
    },
    "field-service": {
        "required": ["Route Optimization", "Forward Geocoding", "Real-time Tracking"],
        "optional": ["Geofencing", "Traffic Flow"]
    },
    "other": {
        "required": ["Vector Tiles", "Forward Geocoding"],
        "optional": ["Point-to-Point Routing", "POI Search & Discovery"]
    }
}
```

#### 11.5.2 PRECOMPUTED_FEATURE_MAPPINGS 업데이트

**파일**: `improved_pipeline_v2.py`

**변경**: 표준 Feature → DB features.name 매핑

```python
# 표준 Feature를 DB의 다양한 features.name에 매핑
PRECOMPUTED_FEATURE_MAPPINGS = {
    # Maps & Visualization
    "Vector Tiles": ["Vector Tile Retrieval", "Mapbox Vector Tile (MVT) Support", "Vector Tiles"],
    "Raster Tiles": ["Raster Map Tiles", "Raster Tiles", "Map Tile Retrieval"],
    "Static Maps": ["Static Map Image Retrieval", "Static Images API"],
    "Street View / Panoramas": ["360° Panoramic Views", "Street View"],

    # Search & Geocoding
    "Forward Geocoding": ["Forward Geocoding", "Geocoding", "Geocode and Reverse Geocode"],
    "Reverse Geocoding": ["Reverse Geocoding", "Geocode and Reverse Geocode"],
    "Autocomplete / Autosuggest": ["Autocomplete", "Autosuggest", "Query Autocompletion"],
    "POI Search & Discovery": ["Nearby Search", "POI Search", "Discover", "Place Search"],
    "Address Validation": ["Address Validation", "Address Standardization", "Component-level Validation"],

    # Routing & Navigation
    "Point-to-Point Routing": ["Car Routing", "Route Calculation", "Directions", "Routing"],
    "Matrix Routing": ["Matrix Routing", "Distance Matrix", "Route Matrix"],
    "Isochrone / Isoline Routing": ["Isoline Routing", "Isochrone"],
    "Route Optimization": ["Route Optimization", "Waypoint Sequencing", "Tour Planning", "Fleet Routing"],
    "Map Matching": ["Map Matching", "Route Matching"],
    "EV Routing": ["Electric Vehicle (EV) Routing", "EV Route Calculation"],
    "Truck Routing": ["Truck Routing", "Vehicle Restrictions", "HGV Routing"],

    # Traffic & Real-time
    "Traffic Flow": ["Traffic Flow", "Real-Time Traffic", "Traffic-aware Routing"],
    "Traffic Incidents": ["Traffic Incidents"],

    # Tracking & Fleet
    "Real-time Tracking": ["Real Time Tracking", "Live Tracking", "Real Time Location"],
    "Fleet Tracking": ["Fleet Tracking", "Fleet Visibility"],
    "Geofencing": ["Geofencing", "Geofence Creation", "Entry Exit Detection"],

    # Place Details
    "Place Details": ["Place Details", "Business Status", "Opening Hours"],
    "EV Charging Stations": ["EV Charging Stations", "Geospatial Search", "Connector Type Filtering"],
    "Fuel Stations": ["Fuel Stations", "Fuel Type Filtering"],

    # Cost & Tolls
    "Toll Calculation": ["Toll Cost Calculation", "Calculate Toll Costs"],

    # Environment
    "Weather Data": ["Weather Observation", "Current Conditions", "Hourly Forecast"],
    "Air Quality": ["Air Quality Indexes (AQIs)", "Pollutant Details"],
    "Elevation Data": ["Elevation data retrieval", "Sampled elevation data along paths"]
}
```

#### 11.5.2.1 db_feature_mappings 자동 생성 (✅ 완료 - 2026-01-23)

**문제점:**
- 기존 db_feature_mappings에 171개 변형만 정의
- Product DB의 828개 Feature 중 73개(8.8%)만 교차
- 제품 추천 시 대부분의 Feature가 매칭되지 않음

**해결책:**
- `scripts/generate_feature_mappings.py` 스크립트 작성
- Gemini API (gemini-2.5-flash)를 사용하여 828개 Product Feature를 29개 Standard Feature에 자동 매핑
- 배치 처리 (80개/배치)로 755개 미매핑 Feature 분류

**결과:**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| 커버리지 | 8.8% | 74.9% | +66.1%p |
| 매핑 값 수 | 171 | 718 | +547 |
| 교차 Feature | 73 | 620 | +547 |
| 미매핑 Feature | 755 | 208 | -547 |

**수정 파일:**
- `backend/data/feature_registry.json` - db_feature_mappings 확장 (171→718개)
- `backend/scripts/generate_feature_mappings.py` - 신규 생성

**추가 변경 (Route Optimization 이름 정리):**
- "Route Optimization (TSP/VRP)" → "Route Optimization" 으로 통일
- 수정 파일: feature_registry.json, improved_pipeline_v2.py, featureRegistry.ts, feature_registry_loader.py

---

#### 11.5.3 Feature 매칭 로직 수정

**파일**: `improved_pipeline_v2.py`, `database.py`, `agent3_scorer.py`

```python
# 공통 헬퍼 함수 추가 (utils.py 또는 각 파일에)
def get_product_feature_names(product: Dict) -> List[str]:
    """제품의 features 배열에서 name 목록 추출"""
    return [f.get('name', '') for f in product.get('features', [])]

def get_product_feature_descriptions(product: Dict) -> List[str]:
    """제품의 features 배열에서 description 목록 추출"""
    return [f.get('description', '') for f in product.get('features', [])]

# 모든 key_features 참조를 features.name으로 변경
# 기존: product.get('key_features', [])
# 신규: get_product_feature_names(product)
```

---

#### 11.5.4 API 스키마 및 프론트엔드 업데이트

**파일**: `routers/products.py`, `pydantic_schemas.py`

```python
class FeatureDetail(BaseModel):
    name: str
    description: str = ""
    use_case: str = ""

class ProductResponse(BaseModel):
    id: str
    product_name: str
    features: List[FeatureDetail]  # key_features 대체
    feature_count: int = 0
```

**파일**: `frontend/src/lib/types.ts`

```typescript
export interface FeatureDetail {
  name: string;
  description: string;
  use_case: string;
}

export interface Product {
  id: string;
  product_name: string;
  features: FeatureDetail[];  // 변경: string[] → FeatureDetail[]
  feature_count: number;
  // ...
}
```

---

### 11.7 마이그레이션 단계

| 단계 | 작업 | 영향 범위 |
|------|------|----------|
| 1 | Product_Dsc_All.json에 features 필드 추가 | ✅ 완료 (sync 스크립트) |
| 2 | PRECOMPUTED_FEATURE_MAPPINGS 재작성 | improved_pipeline_v2.py |
| 3 | database.py Feature 검색 로직 수정 | database.py |
| 4 | agent3_scorer.py 점수 계산 수정 | agent3_scorer.py |
| 5 | product_matcher.py 응답 포맷 수정 | services/product_matcher.py |
| 6 | API 스키마 수정 | routers/products.py |
| 7 | LLM 프롬프트 수정 | prompts.py |
| 8 | Frontend 타입 및 컴포넌트 수정 | frontend/* |
| 9 | key_features 필드 제거 (최종) | Product_Dsc_All.json |

---

### 11.8 롤백 계획

1. **단계별 배포**: 각 단계 완료 후 테스트, 문제 시 해당 단계만 롤백
2. **key_features 유지**: 마이그레이션 완료까지 key_features 필드 삭제하지 않음
3. **Feature Flag**: 필요 시 `USE_NEW_FEATURES=true/false` 환경변수로 전환

---

### 11.9 테스트 계획

| 테스트 | 검증 내용 |
|--------|----------|
| T1 | "geocoding" 검색 → Forward/Reverse Geocoding 제품 매칭 |
| T2 | "delivery-management" → Address Validation 매칭 안됨 (semantic 개선 확인) |
| T3 | "real-time-tracking" → NextBillion Live Tracking 매칭 |
| T4 | PRECOMPUTED_MAPPINGS 캐시 히트율 |
| T5 | API 응답 시간 (기존 대비 변화) |
| T6 | 프론트엔드 Feature 표시 정상 |

---

### 11.10 예상 효과

| 항목 | 현재 | 수정 후 |
|------|------|--------|
| Semantic Mismatch | Address Validation → delivery-management ❌ | 없음 ✅ |
| Feature 정보 | 이름만 | 이름 + 설명 + 용도 |
| 모호한 Feature | 6% | 4% |
| LLM 매칭 정확도 | ~85% | ~95% (description 활용) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-22 | Initial plan | Claude Code |
| 1.1 | 2026-01-22 | Added Phase 1-4 completion status | Claude Code |
| 1.2 | 2026-01-22 | Added Phase 5-7: SDK vs API 필터 개선 (57% 제품 누락 해결), Map Display 자동 추천, 로딩 시간 최적화 (캐싱/병렬처리) | Claude Code |
| 1.3 | 2026-01-22 | Phase 5 안전장치 추가: use_case_relevance 임계값으로 무관 제품(Weather, Solar 등) 제외 | Claude Code |
| 1.4 | 2026-01-22 | Phase 8 추가: key_features → features 마이그레이션 계획 (6개 백엔드 파일 + 프론트엔드 수정) | Claude Code |
