"use client";

import { useState } from "react";

interface CoordinatePickerProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function CoordinatePicker({ children, enabled = true }: CoordinatePickerProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<{ x: number; y: number }[]>([]);

  if (!enabled) return <>{children}</>;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setCoords({ x, y });
    setHistory(prev => [...prev.slice(-9), { x, y }]);
    console.log(`Clicked: { x: ${x}, y: ${y} }`);
  };

  return (
    <div className="relative w-full h-full" onClick={handleClick}>
      {children}

      {/* 좌표 표시 오버레이 */}
      <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded z-50 font-mono pointer-events-none">
        <div>클릭: {coords ? `(${coords.x}, ${coords.y})` : "지도를 클릭하세요"}</div>
        {history.length > 0 && (
          <div className="mt-1 text-[10px] text-gray-300 max-h-24 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i}>{`{ x: ${h.x}, y: ${h.y} }`}</div>
            ))}
          </div>
        )}
      </div>

      {/* 클릭 위치 마커 */}
      {coords && (
        <div
          className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full -translate-x-1.5 -translate-y-1.5 z-50 pointer-events-none shadow-md"
          style={{ left: coords.x, top: coords.y }}
        />
      )}

      {/* 히스토리 마커들 */}
      {history.slice(0, -1).map((h, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 border border-white rounded-full -translate-x-1 -translate-y-1 z-40 pointer-events-none opacity-60"
          style={{ left: h.x, top: h.y }}
        />
      ))}
    </div>
  );
}
