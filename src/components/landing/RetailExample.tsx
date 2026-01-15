"use client";

import { motion } from "framer-motion";
import MapBackground from "./MapBackground";
import CoordinatePicker from "./CoordinatePicker";

// 화면 정중앙 기준 5분 도보 반경
// Container size: 280x560
const CENTER = { x: 140, y: 280 };

// 5분 도보 반경 (줌 ~14 기준, 약 60px)
const WALKING_RADIUS = 70;

// 편의점 - 반경 내 5개
const storesInside = [
  { x: 165, y: 235, delay: 0 },
  { x: 95, y: 260, delay: 0.15 },
  { x: 180, y: 295, delay: 0.3 },
  { x: 120, y: 330, delay: 0.45 },
  { x: 160, y: 320, delay: 0.6 },
];

// 편의점 - 반경 외 5개
const storesOutside = [
  { x: 50, y: 180, delay: 0.1 },
  { x: 230, y: 200, delay: 0.25 },
  { x: 40, y: 380, delay: 0.4 },
  { x: 220, y: 400, delay: 0.55 },
  { x: 140, y: 450, delay: 0.7 },
];

// 좌표 피커 비활성화 (측정 완료)
const ENABLE_COORDINATE_PICKER = false;

export default function RetailExample() {
  return (
    <CoordinatePicker enabled={ENABLE_COORDINATE_PICKER}>
      <div className="relative w-full h-full overflow-hidden">
      {/* Map Background */}
      <MapBackground />

      {/* 5-min Walking Radius Circle - Animated */}
      {/* 반경: 174px = 약 417m = 5분 도보 거리 */}
      <motion.div
        className="absolute z-10"
        style={{ left: CENTER.x, top: CENTER.y }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Outer ring with pulse */}
          <motion.div
            className="absolute rounded-full border-2 border-[#9b59b6]/40"
            style={{
              width: WALKING_RADIUS * 2,
              height: WALKING_RADIUS * 2,
              left: -WALKING_RADIUS,
              top: -WALKING_RADIUS,
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Inner fill */}
          <div
            className="absolute rounded-full bg-[#9b59b6]/15"
            style={{
              width: WALKING_RADIUS * 2,
              height: WALKING_RADIUS * 2,
              left: -WALKING_RADIUS,
              top: -WALKING_RADIUS,
            }}
          />
        </div>
      </motion.div>

      {/* 5min label */}
      <motion.div
        className="absolute z-20"
        style={{ left: CENTER.x - 30, top: CENTER.y - WALKING_RADIUS - 20 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="bg-[#9b59b6] text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md">
          5min walk
        </div>
      </motion.div>

      {/* Current Location Marker */}
      <motion.div
        className="absolute z-20"
        style={{ left: CENTER.x - 8, top: CENTER.y - 8 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {/* Pulse effect */}
          <motion.div
            className="absolute w-8 h-8 -left-2 -top-2 bg-[#2eaadc]/30 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Marker */}
          <div className="w-4 h-4 bg-[#2eaadc] rounded-full border-2 border-white shadow-lg" />
        </div>
      </motion.div>

      {/* Store POI Markers - Inside radius */}
      {storesInside.map((store, index) => (
        <motion.div
          key={`in-${index}`}
          className="absolute text-sm z-10"
          style={{ left: store.x - 10, top: store.y - 10 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 + store.delay, type: "spring", stiffness: 200 }}
        >
          <div className="bg-white rounded p-0.5 shadow-sm">
            <span role="img" aria-label="store">🏪</span>
          </div>
        </motion.div>
      ))}

      {/* Store POI Markers - Outside radius (dimmed) */}
      {storesOutside.map((store, index) => (
        <motion.div
          key={`out-${index}`}
          className="absolute text-sm z-10"
          style={{ left: store.x - 10, top: store.y - 10 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ delay: 1.2 + store.delay, type: "spring", stiffness: 200 }}
        >
          <div className="bg-white rounded p-0.5 shadow-sm">
            <span role="img" aria-label="store">🏪</span>
          </div>
        </motion.div>
      ))}
      </div>
    </CoordinatePicker>
  );
}
