"use client";

import { motion } from "framer-motion";
import { MapPinIcon, CircleStackIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { ComponentType, SVGProps } from "react";

interface Service {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const SERVICES: Service[] = [
  {
    title: "Map Data, APIs & SDKs License",
    description: "Access to premium map products from leading providers",
    icon: MapPinIcon,
  },
  {
    title: "Custom Data Acquisition",
    description: "Collect and process location data tailored to your needs",
    icon: CircleStackIcon,
  },
  {
    title: "Custom LBS Development",
    description: "End-to-end location-based service development",
    icon: CodeBracketIcon,
  },
];

export default function ServiceList() {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-[#37352f] mb-5">What We Offer</h3>

      {SERVICES.map((service, index) => {
        const IconComponent = service.icon;
        return (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-[#e9e9e7] hover:border-[#d3d3d0] hover:shadow-sm transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-[#f7f6f3] rounded-lg flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-[#37352f]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#37352f] mb-1">{service.title}</h4>
              <p className="text-sm text-[#787774] leading-relaxed">{service.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
