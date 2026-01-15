"use client";

import { motion } from "framer-motion";
import MapBackground from "./MapBackground";
import CoordinatePicker from "./CoordinatePicker";

// 좌표 피커로 측정 완료
// 트럭 이동 경로 (배달 지점 포함)
const ROUTE_POINTS = [
  { x: 208, y: 429 },  // Start
  { x: 203, y: 438 },  // Waypoint1
  { x: 173, y: 419 },  // Waypoint2
  { x: 156, y: 401 },  // Waypoint3
  { x: 128, y: 371 },  // Waypoint4
  { x: 122, y: 375 },  // ParcelDelivery1
  { x: 128, y: 371 },  // Waypoint5 (back)
  { x: 81, y: 309 },   // Waypoint6
  { x: 119, y: 243 },  // Waypoint7
  { x: 106, y: 236 },  // ParcelDelivery2
  { x: 119, y: 243 },  // Waypoint8 (back)
  { x: 160, y: 173 },  // Waypoint9
  { x: 171, y: 179 },  // ParcelDelivery3
  { x: 160, y: 173 },  // Waypoint10 (back)
  { x: 180, y: 139 },  // Waypoint11
  { x: 235, y: 169 },  // End
];

// 출발지 (물류창고)
const START_POINT = { x: 208, y: 429 };

// 최종 목적지
const END_POINT = { x: 235, y: 169, label: "D" };

// 배달 지점 (마커 표시용)
const DELIVERY_STOPS = [
  { x: 122, y: 375, label: "A" },
  { x: 106, y: 236, label: "B" },
  { x: 171, y: 179, label: "C" },
];

// Generate SVG path from route points
const pathD = ROUTE_POINTS.map((point, i) =>
  `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
).join(' ');

// 좌표 피커 비활성화 (측정 완료)
const ENABLE_COORDINATE_PICKER = false;

export default function LogisticsExample() {
  return (
    <CoordinatePicker enabled={ENABLE_COORDINATE_PICKER}>
      <div className="relative w-full h-full overflow-hidden">
      {/* Map Background */}
      <MapBackground />

      {/* Route Path */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 280 560" preserveAspectRatio="none">
        {/* Route background */}
        <path
          d={pathD}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Animated route */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#0f7b6c"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 9, ease: "linear" }}
        />
      </svg>

      {/* Start Point - Warehouse */}
      <motion.div
        className="absolute z-10"
        style={{ left: START_POINT.x - 14, top: START_POINT.y - 14 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center">
          <span className="text-base" role="img" aria-label="warehouse">🏢</span>
        </div>
      </motion.div>

      {/* Delivery Stop Markers A, B, C */}
      {DELIVERY_STOPS.map((stop, index) => (
        <motion.div
          key={stop.label}
          className="absolute z-10"
          style={{ left: stop.x - 12, top: stop.y - 12 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border-2 border-[#0f7b6c]">
            <span className="text-xs font-bold text-[#0f7b6c]">{stop.label}</span>
          </div>
          {/* Package icon next to stop */}
          <div className="absolute -right-1 -top-1 text-xs">
            <span role="img" aria-label="package">📦</span>
          </div>
        </motion.div>
      ))}

      {/* End Point - Final Delivery D */}
      <motion.div
        className="absolute z-10"
        style={{ left: END_POINT.x - 12, top: END_POINT.y - 12 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <div className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border-2 border-[#0f7b6c]">
          <span className="text-xs font-bold text-[#0f7b6c]">{END_POINT.label}</span>
        </div>
        <div className="absolute -right-1 -top-1 text-xs">
          <span role="img" aria-label="package">📦</span>
        </div>
      </motion.div>

      {/* Truck Animation */}
      <motion.div
        className="absolute z-20"
        initial={{ left: ROUTE_POINTS[0].x - 15, top: ROUTE_POINTS[0].y - 15 }}
        animate={{
          left: ROUTE_POINTS.map(p => p.x - 15),
          top: ROUTE_POINTS.map(p => p.y - 15),
        }}
        transition={{
          duration: 9,
          ease: "linear",
        }}
      >
        <span className="text-2xl drop-shadow-lg" role="img" aria-label="truck">🚛</span>
      </motion.div>
      </div>
    </CoordinatePicker>
  );
}
