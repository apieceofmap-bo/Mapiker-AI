"use client";

export default function MapBackground() {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        backgroundImage: "url('/images/map-singapore.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }}
    />
  );
}
