"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// Real POI locations for each city - actual landmarks and addresses
const CITY_POIS = {
  singapore: {
    name: "Singapore",
    center: { lat: 1.2900, lng: 103.8500 },
    landmarks: {
      restaurant: { lat: 1.2805, lng: 103.8504, name: "Lau Pa Sat" },
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

  // America regions
  const americaKeywords = ["usa", "us", "united states", "america", "canada", "mexico", "brazil", "argentina", "chile", "colombia", "peru"];
  if (americaKeywords.some(k => regionLower.includes(k))) {
    return CITY_POIS.sanfrancisco;
  }

  // Europe and Africa regions
  const europeAfricaKeywords = ["europe", "uk", "united kingdom", "germany", "france", "spain", "italy", "netherlands", "belgium", "sweden", "norway", "denmark", "finland", "poland", "austria", "switzerland", "portugal", "ireland", "africa", "nigeria", "south africa", "egypt", "kenya", "morocco"];
  if (europeAfricaKeywords.some(k => regionLower.includes(k))) {
    return CITY_POIS.london;
  }

  // Default to Singapore for Asia and others
  return CITY_POIS.singapore;
}

// Use case demo configurations
interface DemoConfig {
  title: string;
  description: string;
  markers: Array<{ lat: number; lng: number; label: string; icon?: string }>;
  route?: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number }; waypoints?: Array<{ lat: number; lng: number }> };
  showTraffic?: boolean;
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
          { lat: landmarks.restaurant.lat, lng: landmarks.restaurant.lng, label: landmarks.restaurant.name, icon: "🍕" },
          { lat: landmarks.customer.lat, lng: landmarks.customer.lng, label: landmarks.customer.name, icon: "🏠" },
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
          { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng, label: "Pickup", icon: "📍" },
          { lat: landmarks.destination.lat, lng: landmarks.destination.lng, label: "Destination", icon: "🎯" },
        ],
        route: {
          origin: { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng },
          destination: { lat: landmarks.destination.lat, lng: landmarks.destination.lng },
        },
      };

    case "logistics":
      return {
        title: "Logistics Demo",
        description: "Multi-stop delivery route optimization",
        markers: [
          { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng, label: "Warehouse", icon: "🏭" },
          { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng, label: landmarks.stop1.name, icon: "📦" },
          { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng, label: landmarks.stop2.name, icon: "📦" },
          { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng, label: landmarks.stop3.name, icon: "📦" },
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
        description: "Real-time vehicle tracking with route",
        markers: [
          { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng, label: "Vehicle 1", icon: "🚛" },
          { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng, label: "Vehicle 2", icon: "🚛" },
          { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng, label: "Vehicle 3", icon: "🚛" },
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

    case "storelocator":
      return {
        title: "Store Locator Demo",
        description: "Nearby store locations",
        markers: [
          { lat: center.lat, lng: center.lng, label: "You", icon: "📍" },
          { lat: landmarks.store1.lat, lng: landmarks.store1.lng, label: landmarks.store1.name, icon: "🏪" },
          { lat: landmarks.store2.lat, lng: landmarks.store2.lng, label: landmarks.store2.name, icon: "🏪" },
          { lat: landmarks.store3.lat, lng: landmarks.store3.lng, label: landmarks.store3.name, icon: "🏪" },
        ],
      };

    case "realestate":
      return {
        title: "Real Estate Demo",
        description: "Property listings with nearby amenities",
        markers: [
          { lat: center.lat, lng: center.lng, label: "Property", icon: "🏠" },
          { lat: landmarks.store1.lat, lng: landmarks.store1.lng, label: "School", icon: "🏫" },
          { lat: landmarks.store2.lat, lng: landmarks.store2.lng, label: "Hospital", icon: "🏥" },
          { lat: landmarks.store3.lat, lng: landmarks.store3.lng, label: "Park", icon: "🌳" },
        ],
      };

    case "ecommerce":
      return {
        title: "E-commerce Demo",
        description: "Delivery zone coverage",
        markers: [
          { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng, label: "Fulfillment Center", icon: "📦" },
        ],
        geofence: { center: { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng }, radius: 5000 },
      };

    case "publictransport":
      return {
        title: "Public Transport Demo",
        description: "Transit route with stops",
        markers: [
          { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng, label: "Station A", icon: "🚉" },
          { lat: center.lat, lng: center.lng, label: "Station B", icon: "🚉" },
          { lat: landmarks.destination.lat, lng: landmarks.destination.lng, label: "Station C", icon: "🚉" },
        ],
        route: {
          origin: { lat: landmarks.pickup.lat, lng: landmarks.pickup.lng },
          destination: { lat: landmarks.destination.lat, lng: landmarks.destination.lng },
          waypoints: [{ lat: center.lat, lng: center.lng }],
        },
      };

    case "fieldservice":
      return {
        title: "Field Service Demo",
        description: "Technician route optimization",
        markers: [
          { lat: landmarks.warehouse.lat, lng: landmarks.warehouse.lng, label: "Base", icon: "🏢" },
          { lat: landmarks.stop1.lat, lng: landmarks.stop1.lng, label: "Job 1", icon: "🔧" },
          { lat: landmarks.stop2.lat, lng: landmarks.stop2.lng, label: "Job 2", icon: "🔧" },
          { lat: landmarks.stop3.lat, lng: landmarks.stop3.lng, label: "Job 3", icon: "🔧" },
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

    default:
      return {
        title: "Map Preview",
        description: "Sample map location",
        markers: [
          { lat: center.lat, lng: center.lng, label: "Location", icon: "📍" },
        ],
      };
  }
}

interface MapPreviewProps {
  useCase: string;
  region: string;
  selectedCategories: string[]; // Categories that user selected products for
  provider: string; // Currently only "google" supported
}

export default function MapPreview({
  useCase,
  region,
  selectedCategories,
  provider,
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Memoize values to prevent infinite loops
  const sampleCity = useMemo(() => getSampleCity(region), [region]);
  const demoConfig = useMemo(() => getUseCaseDemo(useCase, sampleCity), [useCase, sampleCity]);

  // Check if routing is available (user selected routing category)
  const hasRouting = useMemo(() =>
    selectedCategories.some(cat =>
      cat.toLowerCase().includes("routing") || cat.toLowerCase().includes("route")
    ), [selectedCategories]);

  // Load Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (typeof google !== "undefined" && google.maps) {
        resolve();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error("Google Maps API key not configured"));
        return;
      }

      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapReady) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();

        if (!mapRef.current || !isMounted) return;

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: sampleCity.center,
          zoom: 14,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        mapInstanceRef.current = mapInstance;

        // Add markers
        demoConfig.markers.forEach((marker) => {
          new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map: mapInstance,
            label: {
              text: marker.icon || "📍",
              fontSize: "20px",
            },
            title: marker.label,
          });
        });

        // Add geofence circle if configured
        if (demoConfig.geofence) {
          new google.maps.Circle({
            map: mapInstance,
            center: demoConfig.geofence.center,
            radius: demoConfig.geofence.radius,
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            strokeColor: "#3b82f6",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });
        }

        // Add route if configured and routing is selected
        if (demoConfig.route && hasRouting) {
          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#3b82f6",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          });

          const waypoints = demoConfig.route.waypoints?.map((wp) => ({
            location: new google.maps.LatLng(wp.lat, wp.lng),
            stopover: true,
          }));

          directionsService.route(
            {
              origin: demoConfig.route.origin,
              destination: demoConfig.route.destination,
              waypoints: waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                directionsRenderer.setDirections(result);
              }
            }
          );
        }

        if (isMounted) {
          setIsLoading(false);
          setMapReady(true);
        }
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load map");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [loadGoogleMapsScript, sampleCity, demoConfig, hasRouting, mapReady]);

  // Render Mapbox preview
  if (provider === "mapbox") {
    // Dynamic import to avoid SSR issues
    const MapboxPreview = require("./MapboxPreview").default;
    return (
      <MapboxPreview
        useCase={useCase}
        region={region}
        selectedCategories={selectedCategories}
      />
    );
  }

  // Render HERE preview (coming soon)
  if (provider === "here") {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-medium">HERE Maps</p>
          <p className="text-sm">Preview coming soon</p>
        </div>
      </div>
    );
  }

  // Unknown provider
  if (provider !== "google") {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-medium">{provider} Maps</p>
          <p className="text-sm">Preview not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Demo Info */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-gray-700">{demoConfig.title}</span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-gray-500">{sampleCity.name}</span>
        </div>
        {hasRouting && demoConfig.route && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
            Route enabled
          </span>
        )}
      </div>

      {/* Map Container */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading map...</p>
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

        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {demoConfig.markers.map((marker, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-gray-600">
            {marker.icon} {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
}
