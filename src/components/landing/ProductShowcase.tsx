"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PhoneMockup from "./PhoneMockup";
import MapAnimation from "./MapAnimation";
import ServiceList from "./ServiceList";

const VENDORS = [
  { name: "Google Maps", logo: "/logos/google-maps.png" },
  { name: "HERE", logo: "/logos/here.png" },
  { name: "Mapbox", logo: "/logos/mapbox.png" },
  { name: "TomTom", logo: "/logos/tomtom.png" },
];

export default function ProductShowcase() {
  return (
    <section className="py-24 px-8 bg-[#f7f6f3]">
      <div className="max-w-6xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Phone Mockup with Animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <PhoneMockup>
              <MapAnimation />
            </PhoneMockup>
          </motion.div>

          {/* Right - Service List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <ServiceList />
          </motion.div>
        </div>

        {/* Vendor Logos - Notion Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-20 pt-8"
        >
          <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
            {VENDORS.map((vendor, index) => (
              <motion.div
                key={vendor.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
                className="relative h-6 w-20 flex items-center justify-center grayscale opacity-40 hover:opacity-70 hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  width={80}
                  height={24}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "block";
                  }}
                />
                <span
                  className="hidden text-sm font-medium text-[#9b9a97]"
                  style={{ display: "none" }}
                >
                  {vendor.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
