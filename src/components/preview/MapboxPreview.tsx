"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Real POI locations for each city - actual landmarks and addresses
const CITY_POIS = {
  singapore: {
    name: "Singapore",
    center: { lat: 1.2900, lng: 103.8500 },
    landmarks: {
      restaurant: { lat: 1.2805, lng: 103.8504, name: "Lau Pa Sat" },  // Famous hawker center
      customer: { lat: 1.2838, lng: 103.8591, name: "Marina Bay Sands" },
      pickup: { lat: 1.2931, lng: 103.8558, name: "Raffles Place MRT" },
      destination: { lat: 1.3048, lng: 103.8318, name: "Orchard Road" },
      warehouse: { lat: 1.3329, lng: 103.7436, name: "Jurong Industrial" },
      stop1: { lat: 1.3521, lng: 103.9198, name: "Tampines Hub" },
      stop2: { lat: 1.3113, lng: 103.7963, name: "Buona Vista" },
      stop3: { lat: 1.2966, lng: 103.7764, name: "Clementi Mall" },
      store1: { lat: 1.2830, lng: 103.8513, name: "Marina Bay Link Mall" },
      store2: { lat: 1.2932, lng: 103.8558, name: "One Raffles Place" },
      store3: { lat: 1.2903, lng: 103.8466, name: "The Fullerton Hotel" },
    }
  },
  sanfrancisco: {
    name: "San Francisco",
    center: { lat: 37.7849, lng: -122.4094 },
    landmarks: {
      restaurant: { lat: 37.7956, lng: -122.3933, name: "Ferry Building" },
      customer: { lat: 37.7879, lng: -122.4074, name: "Union Square" },
      pickup: { lat: 37.7749, lng: -122.4194, name: "City Hall" },
      destination: { lat: 37.8024, lng: -122.4058, name: "Fisherman's Wharf" },
      warehouse: { lat: 37.7577, lng: -122.3927, name: "Potrero Hill" },
      stop1: { lat: 37.7694, lng: -122.4862, name: "Golden Gate Park" },
      stop2: { lat: 37.7599, lng: -122.4148, name: "Mission District" },
      stop3: { lat: 37.7849, lng: -122.4294, name: "Hayes Valley" },
      store1: { lat: 37.7879, lng: -122.4074, name: "Union Square" },
      store2: { lat: 37.7855, lng: -122.4086, name: "Westfield Centre" },
      store3: { lat: 37.7885, lng: -122.4003, name: "Embarcadero Center" },
    }
  },
  london: {
    name: "London",
    center: { lat: 51.5074, lng: -0.1278 },
    landmarks: {
      restaurant: { lat: 51.5113, lng: -0.1223, name: "Covent Garden" },
      customer: { lat: 51.5007, lng: -0.1246, name: "Westminster" },
      pickup: { lat: 51.5080, lng: -0.0760, name: "Tower Bridge" },
      destination: { lat: 51.5194, lng: -0.1270, name: "King's Cross" },
      warehouse: { lat: 51.5081, lng: -0.0759, name: "Tower Hill" },
      stop1: { lat: 51.5145, lng: -0.1427, name: "Oxford Circus" },
      stop2: { lat: 51.4975, lng: -0.1357, name: "Victoria Station" },
      stop3: { lat: 51.5033, lng: -0.1195, name: "Waterloo" },
      store1: { lat: 51.5145, lng: -0.1427, name: "Oxford Street" },
      store2: { lat: 51.5113, lng: -0.1223, name: "Covent Garden" },
      store3: { lat: 51.5074, lng: -0.1278, name: "Piccadilly Circus" },
    }
  }
};

// Region to sample city mapping
function getSampleCity(region: string): typeof CITY_POIS.singapore {
  const regionLower = region.toLowerCase();

  const americaKeywords = ["usa", "us", "united states", "america", "canada", "mexico", "brazil", "argentina", "chile", "colombia", "peru"];
  if (americaKeywords.some(k => regionLower.includes(k))) {
    return CITY_POIS.sanfrancisco;
  }

  const europeAfricaKeywords = ["europe", "uk", "united kingdom", "germany", "france", "spain", "italy", "netherlands", "belgium", "sweden", "norway", "denmark", "finland", "poland", "austria", "switzerland", "portugal", "ireland", "africa", "nigeria", "south africa", "egypt", "kenya", "morocco"];
  if (europeAfricaKeywords.some(k => regionLower.includes(k))) {
    return CITY_POIS.london;
  }

  return CITY_POIS.singapore;
}

// Demo configuration
interface DemoConfig {
  title: string;
  description: string;
  markers: Array<{ lat: number; lng: number; label: string; icon?: string; color?: string }>;
  route?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number }>;
  };
  geofence?: { center: { lat: number; lng: number }; radius: number };
}

function getUseCaseDemo(useCase: string, city: typeof CITY_POIS.singapore): DemoConfig {
  const { landmarks, center } = city;

  switch (useCase.toLowerCase().replace(/[_-]/g, "")) {
    case "fooddelivery":
      return {
        title: "Food Delivery Demo",
        description: `${landmarks.restaurant.name} to ${landmarks.customer.name}`,
        markers: [
          { lat: landmarks.restaurant.lat, lng: landmarks.restaurant.lng, label: landmarks.restaurant.name, color: "#ef4444" },
          { lat: landmarks.customer.lat, lng: landmarks.customer.lng, label: landmarks.customer.name, color: "#22c55e" },
        ],
        route: {
          origin: { lat: landmarks.restaurant.lat, lng: landmarks.restaurant.lng },
          destination: { lat: landmarks.customer.lat, lng: landmarks.customer.lng },
        },
      };

    case "ridehailing":
      return {
        title: "Ride Hailing Demo",
        description: `${landmarks.pickup.name} to ${landmarks.destination.name}`,
        markers: [
          { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng, label: "Pickup", color: "#3b82f6" },
          { lat: landmarks.destination.lat, lng: landmarks.destination.lng, label: "Destination", color: "#22c55e" },
        ],
        route: {
          origin: { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng },
          destination: { lat: landmarks.destination.lat, lng: landmarks.destination.lng },
        },
      };

    case "logistics":
      return {
        title: "Logistics Demo",
        description: "Multi-stop delivery route",
        markers: [
          { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng, label: "Warehouse", color: "#6366f1" },
          { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng, label: landmarks.stop1.name, color: "#22c55e" },
          { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng, label: landmarks.stop2.name, color: "#22c55e" },
          { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng, label: landmarks.stop3.name, color: "#22c55e" },
        ],
        route: {
          origin: { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng },
          destination: { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng },
          waypoints: [
            { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng },
            { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng },
          ],
        },
      };

    case "fleetmanagement":
      return {
        title: "Fleet Management Demo",
        description: "Vehicle tracking with geofence",
        markers: [
          { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng, label: "Vehicle 1", color: "#f59e0b" },
          { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng, label: "Vehicle 2", color: "#f59e0b" },
          { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng, label: "Vehicle 3", color: "#f59e0b" },
        ],
        geofence: { center: center, radius: 3000 },
      };

    case "storelocator":
      return {
        title: "Store Locator Demo",
        description: "Nearby store locations",
        markers: [
          { lat: center.lat, lng: center.lng, label: "You", color: "#3b82f6" },
          { lat: landmarks.store1.lat, lng: landmarks.store1.lng, label: landmarks.store1.name, color: "#22c55e" },
          { lat: landmarks.store2.lat, lng: landmarks.store2.lng, label: landmarks.store2.name, color: "#22c55e" },
          { lat: landmarks.store3.lat, lng: landmarks.store3.lng, label: landmarks.store3.name, color: "#22c55e" },
        ],
      };

    default:
      return {
        title: "Map Preview",
        description: "Sample location",
        markers: [
          { lat: center.lat, lng: center.lng, label: "Location", color: "#3b82f6" },
        ],
      };
  }
}

interface MapboxPreviewProps {
  useCase: string;
  region: string;
  selectedCategories: string[];
}

export default function MapboxPreview({
  useCase,
  region,
  selectedCategories,
}: MapboxPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const sampleCity = useMemo(() => getSampleCity(region), [region]);
  const demoConfig = useMemo(() => getUseCaseDemo(useCase, sampleCity), [useCase, sampleCity]);

  const hasRouting = useMemo(() =>
    selectedCategories.some(cat =>
      cat.toLowerCase().includes("routing") || cat.toLowerCase().includes("route")
    ), [selectedCategories]);

  // Fetch actual route from Mapbox Directions API
  const fetchRoute = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>,
    accessToken?: string
  ): Promise<Array<[number, number]> | null> => {
    if (!accessToken) return null;

    try {
      // Build coordinates string: origin;waypoint1;waypoint2;...;destination
      let coordsString = `${origin.lng},${origin.lat}`;
      if (waypoints && waypoints.length > 0) {
        for (const wp of waypoints) {
          coordsString += `;${wp.lng},${wp.lat}`;
        }
      }
      coordsString += `;${destination.lng},${destination.lat}`;

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${accessToken}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error("Mapbox Directions API error:", response.status);
        return null;
      }

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch route:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken || accessToken === "여기에_토큰_입력") {
      setError("Mapbox access token not configured");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = accessToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [sampleCity.center.lng, sampleCity.center.lat],
        zoom: 13,
      });

      map.current.on("load", async () => {
        if (!map.current) return;

        // Add markers
        demoConfig.markers.forEach((marker) => {
          const el = document.createElement("div");
          el.className = "mapbox-marker";
          el.style.width = "30px";
          el.style.height = "30px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = marker.color || "#3b82f6";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
          el.style.cursor = "pointer";

          new mapboxgl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(marker.label))
            .addTo(map.current!);
        });

        // Add route if configured and routing is selected - fetch actual route from Directions API
        if (demoConfig.route && hasRouting && map.current) {
          setRouteLoading(true);
          const routeCoordinates = await fetchRoute(
            demoConfig.route.origin,
            demoConfig.route.destination,
            demoConfig.route.waypoints,
            accessToken
          );
          setRouteLoading(false);

          if (routeCoordinates && map.current) {
            map.current.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
              },
            });

            map.current.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.8,
              },
            });
          }
        }

        // Add geofence if configured
        if (demoConfig.geofence && map.current) {
          const center = demoConfig.geofence.center;
          const radiusInKm = demoConfig.geofence.radius / 1000;
          const points = 64;
          const coords: [number, number][] = [];

          for (let i = 0; i < points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const dx = radiusInKm * Math.cos(angle) / 111.32;
            const dy = radiusInKm * Math.sin(angle) / (111.32 * Math.cos(center.lat * Math.PI / 180));
            coords.push([center.lng + dx, center.lat + dy]);
          }
          coords.push(coords[0]); // Close the circle

          map.current.addSource("geofence", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [coords],
              },
            },
          });

          map.current.addLayer({
            id: "geofence-fill",
            type: "fill",
            source: "geofence",
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": 0.15,
            },
          });

          map.current.addLayer({
            id: "geofence-line",
            type: "line",
            source: "geofence",
            paint: {
              "line-color": "#3b82f6",
              "line-width": 2,
            },
          });
        }

        setIsLoading(false);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setError("Failed to load map");
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Failed to initialize Mapbox:", err);
      setError("Failed to initialize map");
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [sampleCity, demoConfig, hasRouting, fetchRoute]);

  return (
    <div className="space-y-2">
      {/* Demo Info */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-gray-700">{demoConfig.title}</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-gray-500">{sampleCity.name}</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-purple-600 font-medium">Mapbox</span>
        </div>
        {hasRouting && demoConfig.route && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
            Route enabled
          </span>
        )}
      </div>

      {/* Map Container */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading Mapbox...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {demoConfig.markers.map((marker, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-gray-600 flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: marker.color || "#3b82f6" }}
            />
            {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
}
