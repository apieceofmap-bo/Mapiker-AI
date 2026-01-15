"use client";

import { motion } from "framer-motion";
import MapBackground from "./MapBackground";
import CoordinatePicker from "./CoordinatePicker";

// Coordinates matched to Singapore Marina Bay map roads
// Container size: 280x560 (PhoneMockup screen area - exact match with map image)
// Route: Bottom left → up Straits View → right on connector → up Marina View
// 좌표 피커로 측정 완료
const ROUTE = {
  start: { x: 161, y: 432 },      // 출발점 (레스토랑)
  waypoint1: { x: 155, y: 427 },  // 도로 따라 이동
  waypoint2: { x: 168, y: 414 },  // 방향 전환
  waypoint3: { x: 80, y: 310 },   // 큰 도로로 이동
  waypoint4: { x: 172, y: 152 },  // 목적지 근처
  end: { x: 179, y: 156 },        // 도착점 (집)
};

// 좌표 피커 비활성화 (측정 완료)
const ENABLE_COORDINATE_PICKER = false;

export default function DeliveryExample() {
  return (
    <CoordinatePicker enabled={ENABLE_COORDINATE_PICKER}>
      <div className="relative w-full h-full overflow-hidden">
      {/* Map Background */}
      <MapBackground />

      {/* Restaurant Icon - at start point */}
      <div
        className="absolute z-10"
        style={{ left: ROUTE.start.x - 16, top: ROUTE.start.y - 16 }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
          <span className="text-xl" role="img" aria-label="restaurant">🍕</span>
        </div>
      </div>

      {/* Home Icon - at end point */}
      <div
        className="absolute z-10"
        style={{ left: ROUTE.end.x - 16, top: ROUTE.end.y - 16 }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
          <span className="text-xl" role="img" aria-label="home">🏠</span>
        </div>
      </div>

      {/* Delivery Path - Animated along roads */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 280 560" preserveAspectRatio="none">
        <motion.path
          d={`M ${ROUTE.start.x} ${ROUTE.start.y}
              L ${ROUTE.waypoint1.x} ${ROUTE.waypoint1.y}
              L ${ROUTE.waypoint2.x} ${ROUTE.waypoint2.y}
              L ${ROUTE.waypoint3.x} ${ROUTE.waypoint3.y}
              L ${ROUTE.waypoint4.x} ${ROUTE.waypoint4.y}
              L ${ROUTE.end.x} ${ROUTE.end.y}`}
          fill="none"
          stroke="#2eaadc"
          strokeWidth="3"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Delivery Bike - Animated along path */}
      <motion.div
        className="absolute z-20"
        initial={{ left: ROUTE.start.x - 15, top: ROUTE.start.y - 15 }}
        animate={{
          left: [
            ROUTE.start.x - 15,
            ROUTE.waypoint1.x - 15,
            ROUTE.waypoint2.x - 15,
            ROUTE.waypoint3.x - 15,
            ROUTE.waypoint4.x - 15,
            ROUTE.end.x - 15,
          ],
          top: [
            ROUTE.start.y - 15,
            ROUTE.waypoint1.y - 15,
            ROUTE.waypoint2.y - 15,
            ROUTE.waypoint3.y - 15,
            ROUTE.waypoint4.y - 15,
            ROUTE.end.y - 15,
          ],
        }}
        transition={{
          duration: 4.5,
          ease: "easeInOut",
          times: [0, 0.1, 0.2, 0.5, 0.85, 1],
        }}
      >
        <span className="text-3xl drop-shadow-lg" role="img" aria-label="delivery">🏍️</span>
      </motion.div>
      </div>
    </CoordinatePicker>
  );
}
