/**
 * Auto-generated Feature Registry
 * Generated at: 2026-01-22
 * Source: feature_registry.json
 * DO NOT EDIT MANUALLY - Run sync_feature_registry.py to update
 */

// Standard Feature interface
export interface StandardFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  aliases: string[];
}

// Feature Category interface
export interface FeatureCategory {
  description: string;
  features: string[];
}

// Quality Feature interface (for evaluation)
export interface QualityFeature {
  id: string;
  name: string;
  description: string;
}

// Standard Features list
export const STANDARD_FEATURES: StandardFeature[] = [
  {
    "id": "vector-tiles",
    "name": "Vector Tiles",
    "category": "Maps & Visualization",
    "description": "Vector format map data for client-side rendering",
    "aliases": ["vector-tile", "mvt", "mapbox-vector-tile"]
  },
  {
    "id": "raster-tiles",
    "name": "Raster Tiles",
    "category": "Maps & Visualization",
    "description": "Pre-rendered image tiles for map display",
    "aliases": ["raster-tile", "map-tiles", "tile-images"]
  },
  {
    "id": "static-maps",
    "name": "Static Maps",
    "category": "Maps & Visualization",
    "description": "Static map image generation",
    "aliases": ["static-map", "map-image"]
  },
  {
    "id": "photorealistic-3d-maps",
    "name": "Photorealistic 3D Maps",
    "category": "Maps & Visualization",
    "description": "Photorealistic 3D mesh models",
    "aliases": ["3d-maps", "3d-tiles", "immersive-view"]
  },
  {
    "id": "street-view-panoramas",
    "name": "Street View / Panoramas",
    "category": "Maps & Visualization",
    "description": "360-degree street-level imagery",
    "aliases": ["street-view", "panorama", "360-view"]
  },
  {
    "id": "forward-geocoding",
    "name": "Forward Geocoding",
    "category": "Search & Geocoding",
    "description": "Convert addresses to coordinates",
    "aliases": ["geocoding", "geocode", "address-to-coordinates"]
  },
  {
    "id": "reverse-geocoding",
    "name": "Reverse Geocoding",
    "category": "Search & Geocoding",
    "description": "Convert coordinates to addresses",
    "aliases": ["reverse-geocode", "coordinates-to-address"]
  },
  {
    "id": "autocomplete-autosuggest",
    "name": "Autocomplete / Autosuggest",
    "category": "Search & Geocoding",
    "description": "Address and place autocomplete",
    "aliases": ["autocomplete", "autosuggest", "type-ahead"]
  },
  {
    "id": "poi-search-discovery",
    "name": "POI Search & Discovery",
    "category": "Search & Geocoding",
    "description": "Points of interest search",
    "aliases": ["poi-search", "place-search", "nearby-search"]
  },
  {
    "id": "address-validation",
    "name": "Address Validation",
    "category": "Search & Geocoding",
    "description": "Address verification and standardization",
    "aliases": ["address-verify", "address-standardization"]
  },
  {
    "id": "point-to-point-routing",
    "name": "Point-to-Point Routing",
    "category": "Routing & Navigation",
    "description": "Single route calculation from A to B",
    "aliases": ["routing", "directions", "navigation"]
  },
  {
    "id": "matrix-routing",
    "name": "Matrix Routing",
    "category": "Routing & Navigation",
    "description": "Many-to-many distance/time calculation",
    "aliases": ["distance-matrix", "route-matrix", "travel-time-matrix"]
  },
  {
    "id": "isochrone-isoline-routing",
    "name": "Isochrone / Isoline Routing",
    "category": "Routing & Navigation",
    "description": "Reachability and travel time polygon analysis",
    "aliases": ["isochrone", "isoline", "reachability"]
  },
  {
    "id": "route-optimization",
    "name": "Route Optimization",
    "category": "Routing & Navigation",
    "description": "Multi-stop route optimization",
    "aliases": ["tsp", "vrp", "waypoint-optimization", "tour-planning"]
  },
  {
    "id": "map-matching",
    "name": "Map Matching",
    "category": "Routing & Navigation",
    "description": "Snap GPS traces to road network",
    "aliases": ["snap-to-roads", "gps-matching"]
  },
  {
    "id": "ev-routing",
    "name": "EV Routing",
    "category": "Routing & Navigation",
    "description": "Electric vehicle routing with charging stops",
    "aliases": ["electric-vehicle-routing", "ev-route"]
  },
  {
    "id": "truck-routing",
    "name": "Truck Routing",
    "category": "Routing & Navigation",
    "description": "Commercial vehicle routing with restrictions",
    "aliases": ["hgv-routing", "commercial-vehicle-routing"]
  },
  {
    "id": "traffic-flow",
    "name": "Traffic Flow",
    "category": "Traffic & Real-time",
    "description": "Real-time traffic flow data",
    "aliases": ["live-traffic", "real-time-traffic", "traffic-data"]
  },
  {
    "id": "traffic-incidents",
    "name": "Traffic Incidents",
    "category": "Traffic & Real-time",
    "description": "Traffic incidents and events",
    "aliases": ["traffic-events", "road-incidents"]
  },
  {
    "id": "real-time-tracking",
    "name": "Real-time Tracking",
    "category": "Tracking & Fleet",
    "description": "Live location tracking",
    "aliases": ["live-tracking", "location-tracking", "asset-tracking"]
  },
  {
    "id": "fleet-tracking",
    "name": "Fleet Tracking",
    "category": "Tracking & Fleet",
    "description": "Fleet vehicle tracking and management",
    "aliases": ["fleet-management", "vehicle-tracking"]
  },
  {
    "id": "geofencing",
    "name": "Geofencing",
    "category": "Tracking & Fleet",
    "description": "Geographic boundary monitoring",
    "aliases": ["geofence", "boundary-detection"]
  },
  {
    "id": "place-details",
    "name": "Place Details",
    "category": "Place Details",
    "description": "Detailed place information",
    "aliases": ["business-details", "poi-details"]
  },
  {
    "id": "ev-charging-stations",
    "name": "EV Charging Stations",
    "category": "Place Details",
    "description": "Electric vehicle charging station data",
    "aliases": ["ev-chargers", "charging-poi"]
  },
  {
    "id": "fuel-stations",
    "name": "Fuel Stations",
    "category": "Place Details",
    "description": "Fuel/gas station data",
    "aliases": ["gas-stations", "petrol-stations"]
  },
  {
    "id": "toll-calculation",
    "name": "Toll Calculation",
    "category": "Cost & Tolls",
    "description": "Road toll cost calculation",
    "aliases": ["toll-cost", "toll-pricing"]
  },
  {
    "id": "weather-data",
    "name": "Weather Data",
    "category": "Environment",
    "description": "Weather observation and forecast",
    "aliases": ["weather", "forecast"]
  },
  {
    "id": "air-quality",
    "name": "Air Quality",
    "category": "Environment",
    "description": "Air quality index and pollution data",
    "aliases": ["aqi", "pollution"]
  },
  {
    "id": "elevation-data",
    "name": "Elevation Data",
    "category": "Environment",
    "description": "Terrain elevation data",
    "aliases": ["elevation", "terrain-height"]
  }
];

// Feature Categories
export const FEATURE_CATEGORIES: Record<string, FeatureCategory> = {
  "Maps & Visualization": {
    "description": "Map display and rendering",
    "features": ["vector-tiles", "raster-tiles", "static-maps", "photorealistic-3d-maps", "street-view-panoramas"]
  },
  "Search & Geocoding": {
    "description": "Location search and address conversion",
    "features": ["forward-geocoding", "reverse-geocoding", "autocomplete-autosuggest", "poi-search-discovery", "address-validation"]
  },
  "Routing & Navigation": {
    "description": "Route calculation and navigation",
    "features": ["point-to-point-routing", "matrix-routing", "isochrone-isoline-routing", "route-optimization", "map-matching", "ev-routing", "truck-routing"]
  },
  "Traffic & Real-time": {
    "description": "Real-time traffic data",
    "features": ["traffic-flow", "traffic-incidents"]
  },
  "Tracking & Fleet": {
    "description": "Location tracking and fleet management",
    "features": ["real-time-tracking", "fleet-tracking", "geofencing"]
  },
  "Place Details": {
    "description": "Detailed place information",
    "features": ["place-details", "ev-charging-stations", "fuel-stations"]
  },
  "Cost & Tolls": {
    "description": "Cost calculation",
    "features": ["toll-calculation"]
  },
  "Environment": {
    "description": "Environmental data",
    "features": ["weather-data", "air-quality", "elevation-data"]
  }
};

// Quality Features for evaluation
export const QUALITY_FEATURES: QualityFeature[] = [
  {
    "id": "geocoding_accuracy",
    "name": "Geocoding Accuracy",
    "description": "Address-to-coordinate precision and reverse geocoding quality"
  },
  {
    "id": "routing_quality",
    "name": "Routing Quality",
    "description": "Route optimization, ETA accuracy, and turn-by-turn navigation precision"
  },
  {
    "id": "poi_coverage",
    "name": "POI Coverage",
    "description": "Points of interest database completeness and freshness"
  },
  {
    "id": "map_freshness",
    "name": "Map Data Freshness",
    "description": "How frequently the map data is updated with road changes"
  },
  {
    "id": "traffic_accuracy",
    "name": "Traffic Data Accuracy",
    "description": "Real-time and predictive traffic data quality"
  },
  {
    "id": "address_validation",
    "name": "Address Validation",
    "description": "Address formatting and deliverability verification"
  },
  {
    "id": "ev_charging",
    "name": "EV Charging Coverage",
    "description": "Electric vehicle charging station data availability"
  },
  {
    "id": "truck_routing",
    "name": "Truck Routing",
    "description": "Commercial vehicle routing with restrictions and attributes"
  }
];

// Helper: Get feature by ID
export function getFeatureById(id: string): StandardFeature | undefined {
  return STANDARD_FEATURES.find(f => f.id === id);
}

// Helper: Get feature by name
export function getFeatureByName(name: string): StandardFeature | undefined {
  return STANDARD_FEATURES.find(f => f.name === name);
}

// Helper: Get features by category
export function getFeaturesByCategory(category: string): StandardFeature[] {
  const cat = FEATURE_CATEGORIES[category];
  if (!cat) return [];
  return cat.features
    .map(id => getFeatureById(id))
    .filter((f): f is StandardFeature => f !== undefined);
}

// Helper: Get all category names
export function getAllCategories(): string[] {
  return Object.keys(FEATURE_CATEGORIES);
}

// Feature name to ID mapping
export const FEATURE_NAME_TO_ID: Record<string, string> = STANDARD_FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.name]: f.id }),
  {} as Record<string, string>
);
