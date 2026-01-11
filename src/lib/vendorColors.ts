// Vendor color schemes for consistent UI styling across the app

export const VENDOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Google": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "HERE Technologies": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Mapbox": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "NextBillion.ai": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "TomTom": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export function getVendorColor(vendor: string) {
  return VENDOR_COLORS[vendor] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
}
