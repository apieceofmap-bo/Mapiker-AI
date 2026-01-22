# Product Recommendation Logic - Technical Design

> **Related Plan:** product-recommendation-improvement.plan.md
> **Author:** Claude Code
> **Date:** 2026-01-22
> **Status:** Draft (v1.0)

---

## 1. Current System Analysis

### 1.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT DATA FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend (ChatWindow)
    │
    │ POST /api/chat
    │ {message, conversation_history}
    ▼
┌─────────────────────┐
│   chat_agent.py     │
│   (Gemini LLM)      │
│                     │
│ Extracts:           │
│ - use_case          │
│ - required_features │
│ - application       │
│ - region            │
│ - additional_notes  │  ◄─── Missing: vehicle_types, routing_type
└─────────┬───────────┘
          │
          │ POST /api/products/match
          │ {use_case, required_features, application, region}
          ▼
┌─────────────────────┐      ┌─────────────────────┐
│  products.py        │─────▶│  product_matcher.py │
│  (Router)           │      │  (Service)          │
└─────────────────────┘      └─────────┬───────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    improved_pipeline_v2.py      │
                      │    (Main Recommendation Engine) │
                      │                                 │
                      │  ┌─────────────────────────┐   │
                      │  │ Agent 1: Feature Mapping │   │
                      │  │ (LLM + Algorithm)       │   │
                      │  └───────────┬─────────────┘   │
                      │              │                 │
                      │  ┌───────────▼─────────────┐   │
                      │  │ Pre-Filter              │   │
                      │  │ (database.py)           │   │
                      │  └───────────┬─────────────┘   │
                      │              │                 │
                      │  ┌───────────▼─────────────┐   │
                      │  │ Agent 2: Product Match  │   │  ◄─── Issue: SDK/API priority
                      │  │ (Rule-based)            │   │       not working properly
                      │  └───────────┬─────────────┘   │
                      │              │                 │
                      │  ┌───────────▼─────────────┐   │
                      │  │ Agent 3: Scoring        │   │
                      │  │ (agent3_scorer.py)      │   │
                      │  └───────────┬─────────────┘   │
                      │              │                 │
                      └──────────────┼─────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────────┐
                      │    product_matcher.py           │
                      │    _convert_to_frontend_format  │  ◄─── Issue: Feature inheritance
                      │                                 │       limited, duplicates remain
                      └─────────────────────────────────┘
                                     │
                                     ▼
                              MatchResponse
                              {categories, feature_coverage}
```

### 1.2 Key Data Structures

#### CustomerInput (Current)
```python
class CustomerInput(BaseModel):
    use_case: str                    # "food-delivery"
    map_features: List[str]          # ["routing", "tracking"]
    application: str                 # "mobile-app"
    monthly_requests: int = 10000
    region: str = "global"
    additional_notes: Optional[str]  # Free text
    # MISSING: vehicle_types, routing_type
```

#### Product Schema (Current)
```json
{
  "id": "here_routing_truck",
  "provider": "HERE Technologies",
  "product_name": "Routing - Truck",
  "sub_category": "Routing",
  "feature_category": "Navigation",
  "product_group": "HERE Location Services",
  "description": "Calculate routes for trucks...",
  "key_features": [
    "truck-routing",
    "weight-restrictions",
    "height-restrictions",
    "hazmat-routing"
  ],
  "suitable_for": {
    "use_cases": ["logistics", "fleet-management"],
    "applications": ["backend-operations", "web-dashboard"],
    "regions": ["global"]
  },
  "data_format": "API",
  "document_url": "https://..."
  // MISSING: supported_vehicles, covers_features, excludes_products
}
```

---

## 2. Phase 4: Duplicate Feature Elimination (P0)

### 2.1 Problem Analysis

**현재 문제점:**

```
User selects: Places API (Google)
Places API covers: [places-search, autocomplete, geocoding-lookup, poi-data]

Current behavior:
✗ Geocoding API도 필수로 추천됨 (places-search가 이미 주소 검색 가능)
✗ Maps SDK도 필수로 추천됨 (Places API로 충분한 경우에도)

Expected behavior:
✓ Geocoding API는 "Optional" 또는 제외
✓ "이 기능은 Places API에서 이미 제공됩니다" 안내
```

### 2.2 Solution Design

#### 2.2.1 Feature Coverage Matrix

**New File:** `backend/data/feature_coverage.json`

```json
{
  "version": "1.0",
  "description": "Maps which products cover which features and what they make redundant",
  "coverage": {
    "google_maps_sdk_android": {
      "provider": "Google",
      "product_name": "Maps SDK for Android",
      "primary_features": ["map-display", "map-rendering", "interactive-maps"],
      "includes_features": ["basic-geocoding", "map-markers", "info-windows"],
      "makes_optional": ["google_maps_static", "google_maps_embed"],
      "notes": "SDK includes basic geocoding via built-in search"
    },
    "google_places_api": {
      "provider": "Google",
      "product_name": "Places API",
      "primary_features": ["places-search", "poi-data", "autocomplete"],
      "includes_features": ["address-lookup", "place-details", "place-photos"],
      "makes_optional": ["google_geocoding"],
      "notes": "Places API includes address search functionality"
    },
    "google_navigation_sdk": {
      "provider": "Google",
      "product_name": "Navigation SDK",
      "primary_features": ["turn-by-turn-navigation", "voice-guidance", "lane-guidance"],
      "includes_features": ["route-calculation", "map-display", "real-time-traffic", "rerouting"],
      "makes_optional": ["google_routes_compute", "google_maps_sdk_android", "google_maps_sdk_ios"],
      "notes": "Navigation SDK is a complete solution including maps and routing"
    },
    "here_maps_sdk": {
      "provider": "HERE Technologies",
      "product_name": "HERE SDK",
      "primary_features": ["map-display", "map-rendering"],
      "includes_features": ["basic-geocoding", "search", "routing"],
      "makes_optional": ["here_vector_tile", "here_raster_tile"],
      "notes": "SDK bundles multiple APIs"
    },
    "mapbox_navigation_sdk": {
      "provider": "Mapbox",
      "product_name": "Navigation SDK",
      "primary_features": ["turn-by-turn-navigation", "voice-guidance"],
      "includes_features": ["route-calculation", "map-display", "traffic"],
      "makes_optional": ["mapbox_directions_api", "mapbox_gl_js", "mapbox_maps_sdk"],
      "notes": "Complete navigation solution"
    },
    "nextbillion_navigation_sdk": {
      "provider": "NextBillion.ai",
      "product_name": "Navigation SDK",
      "primary_features": ["turn-by-turn-navigation"],
      "includes_features": ["route-calculation", "map-display"],
      "makes_optional": ["nextbillion_directions_api", "nextbillion_maps_sdk"],
      "notes": "Bundled navigation solution"
    }
  }
}
```

#### 2.2.2 Deduplication Logic

**File:** `backend/services/feature_deduplicator.py` (New)

```python
"""
Feature Deduplication Service
Prevents recommending redundant products when features are already covered
"""

import json
import logging
from typing import List, Dict, Set, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class FeatureDeduplicator:
    """Handles feature coverage analysis and duplicate elimination"""

    def __init__(self):
        self.coverage_data = self._load_coverage_data()

    def _load_coverage_data(self) -> Dict:
        """Load feature coverage matrix from JSON"""
        coverage_path = Path(__file__).parent.parent / "data" / "feature_coverage.json"
        try:
            with open(coverage_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning("Feature coverage data not found, using empty coverage")
            return {"coverage": {}}

    def get_covered_features(self, product_id: str) -> Set[str]:
        """Get all features covered by a product (primary + included)"""
        product_coverage = self.coverage_data.get("coverage", {}).get(product_id, {})
        primary = set(product_coverage.get("primary_features", []))
        included = set(product_coverage.get("includes_features", []))
        return primary | included

    def get_redundant_products(self, product_id: str) -> List[str]:
        """Get products that become optional when this product is selected"""
        product_coverage = self.coverage_data.get("coverage", {}).get(product_id, {})
        return product_coverage.get("makes_optional", [])

    def analyze_selection(
        self,
        selected_product_ids: List[str],
        all_products: List[Dict]
    ) -> Tuple[List[Dict], List[Dict], Dict[str, str]]:
        """
        Analyze product selection for redundancy

        Returns:
            - required_products: Products that provide unique features
            - optional_products: Products whose features are already covered
            - coverage_notes: {product_id: "Covered by X"}
        """
        covered_features = set()
        redundant_product_ids = set()
        coverage_notes = {}

        # Phase 1: Collect coverage from selected products
        for product_id in selected_product_ids:
            features = self.get_covered_features(product_id)
            covered_features.update(features)

            redundant = self.get_redundant_products(product_id)
            for r_id in redundant:
                redundant_product_ids.add(r_id)
                coverage_notes[r_id] = f"Already covered by {product_id}"

        # Phase 2: Classify products
        required_products = []
        optional_products = []

        for product in all_products:
            pid = product.get("id", "")

            if pid in redundant_product_ids:
                product["redundancy_note"] = coverage_notes.get(pid, "Feature already covered")
                optional_products.append(product)
            else:
                # Check if this product's features are subset of covered
                product_features = set(product.get("matched_features", []))
                if product_features and product_features.issubset(covered_features):
                    product["redundancy_note"] = "All features already covered by other selections"
                    optional_products.append(product)
                else:
                    required_products.append(product)

        return required_products, optional_products, coverage_notes

    def suggest_optimal_selection(
        self,
        products: List[Dict],
        required_features: List[str]
    ) -> List[Dict]:
        """
        Suggest optimal product selection that covers all features
        with minimum redundancy

        Uses greedy set cover algorithm
        """
        remaining_features = set(required_features)
        selected = []
        available = list(products)

        while remaining_features and available:
            # Find product that covers most remaining features
            best_product = None
            best_coverage = 0
            best_new_features = set()

            for product in available:
                product_features = set(product.get("matched_features", []))
                new_features = product_features & remaining_features

                if len(new_features) > best_coverage:
                    best_coverage = len(new_features)
                    best_product = product
                    best_new_features = new_features

            if best_product:
                selected.append(best_product)
                remaining_features -= best_new_features
                available.remove(best_product)

                # Also remove redundant products
                redundant = self.get_redundant_products(best_product.get("id", ""))
                available = [p for p in available if p.get("id") not in redundant]
            else:
                break

        return selected
```

#### 2.2.3 Integration with ProductMatcher

**File:** `backend/services/product_matcher.py` (Modify)

```python
# Add to imports
from services.feature_deduplicator import FeatureDeduplicator

class ProductMatcher:
    def __init__(self):
        self.pipeline = ImprovedMapRecommendationPipeline()
        self.deduplicator = FeatureDeduplicator()  # NEW

    def _convert_to_frontend_format(self, pipeline_result, requirements):
        # ... existing code ...

        # NEW: Apply deduplication before returning
        categories = self._apply_deduplication(categories, requirements)

        return {
            "categories": categories,
            "total_matched": total_matched,
            "feature_coverage": feature_coverage,
            "required_features": requirements.get("required_features", [])
        }

    def _apply_deduplication(self, categories: List[Dict], requirements: Dict) -> List[Dict]:
        """Apply feature deduplication to categories"""

        # Collect all products across categories
        all_products = []
        for cat in categories:
            all_products.extend(cat.get("products", []))

        # Get top products (highest scores) as "selected"
        selected_ids = [p["id"] for p in sorted(
            all_products,
            key=lambda x: x.get("match_score", 0),
            reverse=True
        )[:5]]  # Top 5 as implicit selection

        # Analyze for redundancy
        required, optional, notes = self.deduplicator.analyze_selection(
            selected_ids, all_products
        )

        # Update categories with redundancy info
        for cat in categories:
            for product in cat.get("products", []):
                if product["id"] in notes:
                    product["redundancy_note"] = notes[product["id"]]
                    product["is_redundant"] = True

            # Re-sort: non-redundant first
            cat["products"] = sorted(
                cat["products"],
                key=lambda x: (x.get("is_redundant", False), -x.get("match_score", 0))
            )

        return categories
```

---

## 3. Phase 1: Vehicle Type Support (P1)

### 3.1 Schema Changes

**File:** `backend/pydantic_schemas.py` (Modify)

```python
from typing import List, Optional
from pydantic import BaseModel

VALID_VEHICLE_TYPES = [
    "car", "truck", "bicycle", "scooter", "motorcycle",
    "taxi", "bus", "pedestrian", "ev", "2-wheeler"
]

class CustomerInput(BaseModel):
    use_case: str
    map_features: List[str]
    application: str
    monthly_requests: int = 10000
    region: str = "global"
    vehicle_types: Optional[List[str]] = None  # NEW
    routing_type: Optional[str] = None  # NEW: "single_route", "multi_waypoint", "matrix"
    additional_notes: Optional[str] = None

    @validator('vehicle_types')
    def validate_vehicle_types(cls, v):
        if v:
            invalid = [vt for vt in v if vt not in VALID_VEHICLE_TYPES]
            if invalid:
                raise ValueError(f"Invalid vehicle types: {invalid}")
        return v
```

### 3.2 Chat Agent Changes

**File:** `backend/services/chat_agent.py` (Modify)

Add to SYSTEM_PROMPT after Step 3 (Finalize Features):

```python
SYSTEM_PROMPT = """
...existing prompt...

### Step 3.5: Get Vehicle Type (CONDITIONAL)
If the user's use case involves routing, delivery, or logistics, AND they selected routing-related features, ask:

"What type of vehicles will be used for routing/delivery?"
Options:
- Car (standard passenger vehicles)
- Truck (commercial/heavy vehicles)
- Bicycle/Scooter (2-wheelers)
- Motorcycle
- Electric Vehicle (EV)
- Pedestrian (walking routes)
- Multiple types (specify)

Skip this question if:
- Use case is not routing-related (e.g., store-locator)
- No routing features were selected

Store the response in vehicle_types array.
Example: vehicle_types: ["truck"] or vehicle_types: ["bicycle", "scooter"]

...rest of prompt...

When requirements are complete, include vehicle_types in the JSON:
```json
{
  "use_case": "logistics",
  "use_case_description": "Truck delivery routing",
  "required_features": ["route-optimization", "truck-routing"],
  "application": "backend-operations",
  "region": "south-korea",
  "vehicle_types": ["truck"],
  "additional_notes": null
}
```
"""
```

### 3.3 Pipeline Vehicle Boost

**File:** `backend/improved_pipeline_v2.py` (Modify)

```python
# Add near top of file
VEHICLE_FEATURE_KEYWORDS = {
    "truck": [
        "truck", "heavy-vehicle", "commercial-vehicle", "hgv", "lgv",
        "weight-restriction", "height-restriction", "hazmat"
    ],
    "bicycle": [
        "bicycle", "bike", "cycling", "cycle", "2-wheeler"
    ],
    "scooter": [
        "scooter", "moped", "motorcycle", "2-wheeler"
    ],
    "ev": [
        "ev", "electric-vehicle", "electric", "ev-routing",
        "charging-station", "range-anxiety"
    ],
    "taxi": [
        "taxi", "cab", "ride-hailing", "rideshare"
    ],
    "bus": [
        "bus", "public-transit", "transit", "coach"
    ],
    "pedestrian": [
        "pedestrian", "walking", "foot", "walk", "sidewalk"
    ],
    "car": [
        "car", "automobile", "vehicle", "driving"
    ]
}

# Vehicle-related POI keywords for Search/Places API boosting
VEHICLE_POI_KEYWORDS = {
    "ev": [
        "ev-charging", "charging-station", "electric-vehicle-poi",
        "ev-charge-points", "charging-infrastructure"
    ],
    "truck": [
        "truck-stop", "rest-area", "weigh-station", "truck-parking",
        "truck-service", "commercial-vehicle-poi"
    ],
    "fuel": [
        "gas-station", "fuel-station", "petrol-station",
        "fuel-prices", "fuel-poi"
    ]
}


class ImprovedMapRecommendationPipeline:
    # ... existing code ...

    def _apply_vehicle_boost(
        self,
        products: List[CandidateProduct],
        vehicle_types: List[str]
    ) -> List[CandidateProduct]:
        """
        Boost scores for products that support specified vehicle types
        """
        if not vehicle_types:
            return products

        BOOST_SCORE = 15  # Points to add for vehicle match

        for product in products:
            product_text = (
                product.product_name.lower() + " " +
                " ".join(product.key_features).lower()
            )

            for vehicle in vehicle_types:
                keywords = VEHICLE_FEATURE_KEYWORDS.get(vehicle, [vehicle])

                if any(kw in product_text for kw in keywords):
                    product.feature_match_score += BOOST_SCORE
                    if not hasattr(product, 'vehicle_match'):
                        product.vehicle_match = []
                    product.vehicle_match.append(vehicle)
                    logger.debug(f"Vehicle boost applied: {product.product_name} +{BOOST_SCORE} for {vehicle}")

        # Re-sort by score
        return sorted(products, key=lambda x: x.feature_match_score, reverse=True)

    def run(self, customer_input: CustomerInput) -> FinalRecommendations:
        # ... existing steps ...

        # After Agent 2, before Agent 3:
        if customer_input.vehicle_types:
            for vendor, products in vendor_candidates.items():
                vendor_candidates[vendor] = self._apply_vehicle_boost(
                    products,
                    customer_input.vehicle_types
                )

        # ... rest of pipeline ...
```

### 3.4 Product Data Enhancement

**File:** `backend/data/Product_Dsc_All.json` (Modify)

Add `supported_vehicles` to routing products:

```json
{
  "id": "here_routing_truck",
  "product_name": "Routing - Truck",
  "supported_vehicles": ["truck", "heavy-vehicle", "commercial-vehicle"],
  "key_features": ["truck-routing", "weight-restrictions", "height-restrictions"]
},
{
  "id": "here_routing_bicycle",
  "product_name": "Routing - Bicycle",
  "supported_vehicles": ["bicycle", "2-wheeler"],
  "key_features": ["bicycle-routing", "bike-lanes", "elevation-aware"]
},
{
  "id": "google_routes_compute_pro",
  "product_name": "Routes: Compute Routes Pro",
  "supported_vehicles": ["car", "truck", "bicycle", "pedestrian"],
  "key_features": ["route-calculation", "truck-routing", "bicycle-routing", "walking-routes"]
}
```

---

## 4. Phase 3: SDK/API Priority (P1)

### 4.1 Product Type Classification

**File:** `backend/improved_pipeline_v2.py` (Modify)

```python
# Add near top
PRODUCT_TYPE_INDICATORS = {
    "navigation_sdk": {
        "name_keywords": ["navigation sdk", "nav sdk", "turn-by-turn sdk"],
        "feature_keywords": ["turn-by-turn-navigation", "voice-guidance", "lane-guidance"],
        "data_formats": ["SDK"]
    },
    "sdk": {
        "name_keywords": ["sdk", "kit", "framework", "library"],
        "feature_keywords": ["mobile-integration", "native-sdk"],
        "data_formats": ["SDK"]
    },
    "api": {
        "name_keywords": ["api", "service", "endpoint", "rest"],
        "feature_keywords": ["rest-api", "http-api"],
        "data_formats": ["API", "REST"]
    }
}

APPLICATION_PRIORITY_ORDER = {
    "mobile-app": ["navigation_sdk", "sdk", "api"],
    "driver-app": ["navigation_sdk", "sdk", "api"],
    "web-app": ["api", "sdk"],
    "web-dashboard": ["api"],
    "backend-operations": ["api"]
}


class ImprovedMapRecommendationPipeline:
    # ... existing code ...

    def _classify_product_type(self, product: Dict) -> str:
        """Classify product as navigation_sdk, sdk, or api"""
        name_lower = product.get("product_name", "").lower()
        features = [f.lower() for f in product.get("key_features", [])]
        data_format = product.get("data_format", "").upper()

        # Check Navigation SDK first (most specific)
        nav_indicators = PRODUCT_TYPE_INDICATORS["navigation_sdk"]
        if any(kw in name_lower for kw in nav_indicators["name_keywords"]):
            return "navigation_sdk"
        if any(kw in features for kw in nav_indicators["feature_keywords"]):
            return "navigation_sdk"

        # Check SDK
        sdk_indicators = PRODUCT_TYPE_INDICATORS["sdk"]
        if any(kw in name_lower for kw in sdk_indicators["name_keywords"]):
            return "sdk"
        if data_format in sdk_indicators["data_formats"]:
            return "sdk"

        # Default to API
        return "api"

    def _sort_by_application_priority(
        self,
        products: List[CandidateProduct],
        application: str
    ) -> List[CandidateProduct]:
        """Sort products based on application type priority"""

        priority_order = APPLICATION_PRIORITY_ORDER.get(
            application,
            ["api", "sdk"]  # Default
        )

        def get_sort_key(product):
            product_type = self._classify_product_type(product.__dict__)
            try:
                type_priority = priority_order.index(product_type)
            except ValueError:
                type_priority = len(priority_order)

            # Secondary sort by score (descending)
            return (type_priority, -product.feature_match_score)

        return sorted(products, key=get_sort_key)

    def _run_agent2(self, ...):
        # ... existing code ...

        # Before returning, apply application-based sorting
        for vendor in vendor_candidates:
            vendor_candidates[vendor] = self._sort_by_application_priority(
                vendor_candidates[vendor],
                analyzed.application_environment[0] if analyzed.application_environment else "api"
            )

        return vendor_candidates
```

---

## 5. Phase 2: Similar API Differentiation (P2)

### 5.1 API Differentiation Matrix

**File:** `backend/data/api_differentiation.json` (New)

```json
{
  "version": "1.0",
  "routing_api_types": {
    "single_route": {
      "description": "Calculate a single route from A to B",
      "use_cases": ["simple-navigation", "point-to-point", "driving-directions"],
      "question_triggers": ["단순 경로", "A에서 B로", "single route", "one route"],
      "products": {
        "Google": ["google_routes_compute_essentials", "google_routes_compute_pro"],
        "HERE": ["here_routing_car", "here_routing_truck", "here_routing_bicycle"],
        "Mapbox": ["mapbox_directions_api"],
        "NextBillion.ai": ["nextbillion_directions_api"]
      }
    },
    "multi_waypoint": {
      "description": "Optimize routes with multiple stops/waypoints",
      "use_cases": ["delivery-optimization", "multi-stop", "waypoint-sequencing", "tour-planning"],
      "question_triggers": ["여러 경유지", "배달 최적화", "multiple stops", "optimize route"],
      "products": {
        "Google": ["google_route_optimization_single", "google_route_optimization_fleet"],
        "HERE": ["here_waypoints_sequencing", "here_tour_planning"],
        "Mapbox": ["mapbox_optimization_api"],
        "NextBillion.ai": ["nextbillion_route_optimization", "nextbillion_route_optimization_trucking"]
      }
    },
    "matrix": {
      "description": "Calculate distances/times between multiple origins and destinations",
      "use_cases": ["nearest-driver", "batch-distance", "coverage-analysis", "isochrone"],
      "question_triggers": ["거리 매트릭스", "가장 가까운", "distance matrix", "nearest"],
      "products": {
        "Google": ["google_routes_matrix_essentials", "google_routes_matrix_pro"],
        "HERE": ["here_matrix_routing", "here_isoline_routing"],
        "Mapbox": ["mapbox_matrix_api", "mapbox_isochrone_api"],
        "NextBillion.ai": ["nextbillion_distance_matrix"]
      }
    }
  }
}
```

### 5.2 Chat Agent Routing Clarification

**File:** `backend/services/chat_agent.py` (Modify)

Add to SYSTEM_PROMPT:

```python
"""
### Step 3.6: Clarify Routing Type (CONDITIONAL)
If user selected routing-related features (routing, directions, route-optimization, etc.), ask:

"What type of routing calculation do you need?"

1. **Single Route** - Calculate one route from point A to B
   - Example: Navigation app showing driving directions
   - Example: Finding route to nearest store

2. **Multi-Stop Optimization** - Optimize routes with multiple destinations
   - Example: Delivery driver visiting 10 customers efficiently
   - Example: Field service technician route planning

3. **Distance Matrix** - Calculate distances between many points at once
   - Example: Finding the nearest available driver
   - Example: Analyzing delivery coverage zones

Store as routing_type: "single_route" | "multi_waypoint" | "matrix"

Skip this question if no routing features were selected.
"""
```

### 5.3 Pipeline Routing Type Filter

**File:** `backend/improved_pipeline_v2.py` (Modify)

```python
import json
from pathlib import Path

class ImprovedMapRecommendationPipeline:

    def __init__(self):
        # ... existing init ...
        self.api_differentiation = self._load_api_differentiation()

    def _load_api_differentiation(self) -> Dict:
        """Load API differentiation matrix"""
        path = Path(__file__).parent / "data" / "api_differentiation.json"
        try:
            with open(path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def _apply_routing_type_filter(
        self,
        products: List[CandidateProduct],
        routing_type: str,
        vendor: str
    ) -> List[CandidateProduct]:
        """
        Boost products matching the specified routing type
        """
        if not routing_type:
            return products

        routing_types = self.api_differentiation.get("routing_api_types", {})
        type_config = routing_types.get(routing_type, {})
        preferred_products = type_config.get("products", {}).get(vendor, [])

        ROUTING_TYPE_BOOST = 20

        for product in products:
            if product.product_id in preferred_products:
                product.feature_match_score += ROUTING_TYPE_BOOST
                product.match_reason += f" [Routing: {routing_type}]"

        return sorted(products, key=lambda x: x.feature_match_score, reverse=True)
```

---

## 6. Frontend Type Updates

**File:** `frontend/src/lib/types.ts` (Modify)

```typescript
export interface Requirements {
  use_case: string;
  use_case_description?: string;
  required_features: string[];
  application: string | string[];
  region: string;
  vehicle_types?: string[];    // NEW
  routing_type?: string;       // NEW: "single_route" | "multi_waypoint" | "matrix"
  additional_notes?: string;
}

export interface Product {
  id: string;
  provider: string;
  product_name: string;
  description: string;
  key_features: string[];
  matched_features: string[];
  match_score: number;
  document_url: string;
  data_format: string;
  similar_products?: SimilarProduct[];
  // NEW fields
  vehicle_match?: string[];
  redundancy_note?: string;
  is_redundant?: boolean;
  product_type?: "navigation_sdk" | "sdk" | "api";
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```python
# tests/test_feature_deduplicator.py

def test_navigation_sdk_makes_directions_optional():
    dedup = FeatureDeduplicator()
    selected = ["google_navigation_sdk"]
    redundant = dedup.get_redundant_products("google_navigation_sdk")
    assert "google_routes_compute" in redundant
    assert "google_maps_sdk_android" in redundant

def test_places_api_covers_geocoding():
    dedup = FeatureDeduplicator()
    covered = dedup.get_covered_features("google_places_api")
    assert "address-lookup" in covered

def test_optimal_selection_minimizes_redundancy():
    dedup = FeatureDeduplicator()
    products = [...]  # Mock products
    required = ["map-display", "routing", "places-search"]
    optimal = dedup.suggest_optimal_selection(products, required)
    # Should select Navigation SDK (covers map + routing) + Places API
    assert len(optimal) <= 2

# tests/test_vehicle_boost.py

def test_truck_vehicle_boost():
    pipeline = ImprovedMapRecommendationPipeline()
    products = [
        CandidateProduct(product_name="Routing - Truck", feature_match_score=80),
        CandidateProduct(product_name="Routing - Car", feature_match_score=85),
    ]
    boosted = pipeline._apply_vehicle_boost(products, ["truck"])
    assert boosted[0].product_name == "Routing - Truck"
    assert boosted[0].feature_match_score == 95  # 80 + 15 boost
```

### 7.2 Integration Tests

```python
# tests/test_recommendation_integration.py

def test_mobile_app_sdk_priority():
    matcher = ProductMatcher()
    result = matcher.match_products({
        "use_case": "food-delivery",
        "required_features": ["routing", "map-display"],
        "application": "mobile-app",
        "region": "global"
    })

    # First routing product should be SDK
    routing_cat = next(c for c in result["categories"] if c["id"] == "routing")
    first_product = routing_cat["products"][0]
    assert "sdk" in first_product["product_name"].lower() or \
           first_product["data_format"] == "SDK"

def test_backend_api_priority():
    matcher = ProductMatcher()
    result = matcher.match_products({
        "use_case": "logistics",
        "required_features": ["routing"],
        "application": "backend-operations",
        "region": "global"
    })

    routing_cat = next(c for c in result["categories"] if c["id"] == "routing")
    # Should not have SDK products at top
    for product in routing_cat["products"][:3]:
        assert product["data_format"] != "SDK"
```

---

## 8. Migration Plan

### 8.1 Data Migration

1. **feature_coverage.json** - New file, no migration needed
2. **api_differentiation.json** - New file, no migration needed
3. **Product_Dsc_All.json** - Add `supported_vehicles` field to routing products

### 8.2 Rollout

| Step | Action | Risk |
|------|--------|------|
| 1 | Deploy feature_coverage.json + FeatureDeduplicator | Low - additive |
| 2 | Enable deduplication in ProductMatcher | Medium - may change recommendations |
| 3 | Deploy vehicle type support (chat + pipeline) | Low - opt-in feature |
| 4 | Deploy SDK/API priority enhancement | Medium - changes sorting |
| 5 | Deploy routing type differentiation | Low - opt-in feature |

---

## 9. Feature Synchronization Architecture

### 9.1 Overview

Feature 키워드 동기화 시스템은 Quality-Evaluator와 파이프라인 전체의 Feature 데이터 일관성을 보장합니다.

### 9.2 Feature Data Flow

```
Quality-Evaluator (External)
        │
        │ product_feature_report.json
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
                          │ sync_feature_registry.py
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ Product_    │   │ Backend Python  │   │ Frontend TS      │
│ Dsc_All.json│   │ Modules         │   │                  │
│             │   │ (런타임 로드)   │   │ featureRegistry  │
│ features[]  │   │                 │   │ .ts (자동 생성)  │
│ 필드 동기화 │   │ prompts.py      │   │                  │
│             │   │ pipeline_v2.py  │   │ qualityEvaluation│
│             │   │ chat_agent.py   │   │ Options.ts       │
└─────────────┘   └─────────────────┘   └──────────────────┘
```

### 9.3 Registry Item Connections

| Registry 항목 | 동기화 대상 파일 | 사용 방식 |
|--------------|-----------------|----------|
| **standard_features** | `featureRegistry.ts` | Feature 목록 타입 생성 |
| **product_features** | `Product_Dsc_All.json` | 제품별 `features[]` 필드 동기화 |
| **db_feature_mappings** | `improved_pipeline_v2.py` | 표준 Feature → DB 변형 이름 매핑 |
| **use_case_features** | `chat_agent.py` | 사용 사례별 필수/선택 Feature 추천 |
| **vendor_product_hints** | `prompts.py` | Feature별 벤더 제품 힌트 |
| **categories** | `qualityEvaluationOptions.ts` | QA 평가용 Feature 카테고리 |

### 9.4 Target File Roles in Pipeline

| 파일 | 파이프라인 역할 |
|------|---------------|
| **Product_Dsc_All.json** | 제품 DB - Agent1/2/3가 제품 검색/매칭 시 참조 |
| **improved_pipeline_v2.py** | 파이프라인 코어 - Feature 변형 이름 매칭 |
| **chat_agent.py** | 챗봇 - 사용 사례별 Feature 자동 추천 |
| **prompts.py** | LLM 프롬프트 - Feature→제품 힌트 제공 |
| **featureRegistry.ts** | FE 타입 - Feature 표시 일관성 |
| **qualityEvaluationOptions.ts** | 품질 평가 - Feature 카테고리 그룹화 |

### 9.5 Pipeline Feature Usage Flow

```
User Message
     │
     ▼
┌─────────────────┐
│   Chat Agent    │ ←── use_case_features (사용 사례별 Feature 추천)
│ (요구사항 수집)  │
└────────┬────────┘
         │ extracted features
         ▼
┌─────────────────┐
│  Agent 1: RAG   │ ←── Product_Dsc_All.json (제품별 features 검색)
│ (후보 제품 선별) │
└────────┬────────┘
         │ candidate products
         ▼
┌─────────────────┐
│  Agent 2: Match │ ←── db_feature_mappings (Feature 변형 매칭)
│ (Feature 매칭)   │     vendor_product_hints (LLM 힌트)
└────────┬────────┘
         │ scored products
         ▼
┌─────────────────┐
│ Agent 3: Scorer │ ←── Product_Dsc_All.json (Feature Coverage 계산)
│  (최종 순위)     │
└────────┬────────┘
         │
         ▼
    Frontend       ←── featureRegistry.ts (Feature 표시)
                       qualityEvaluationOptions.ts (품질 평가)
```

### 9.6 Feature Naming Convention

| Format | Usage | Example |
|--------|-------|---------|
| Title Case | Standard name (display) | "Forward Geocoding" |
| kebab-case | ID (internal) | "forward-geocoding" |
| DB variations | Matching aliases | "Geocoding", "Geocode API" |

### 9.7 Synchronization Workflow

```bash
# Quality-Evaluator 업데이트 후 - 단일 명령으로 전체 동기화
python scripts/sync_feature_registry.py

# dry-run으로 미리보기
python scripts/sync_feature_registry.py --dry-run
```

| Component | Sync Method | Trigger |
|-----------|-------------|---------|
| feature_registry.json | Direct from QE | Manual |
| Product_Dsc_All.json | From registry | Auto with registry |
| Backend modules | Runtime load | Server start |
| featureRegistry.ts | Generated | Auto with registry |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-22 | Initial design | Claude Code |
| 1.1 | 2026-01-22 | Added Feature Synchronization Architecture (Section 9) | Claude Code |
