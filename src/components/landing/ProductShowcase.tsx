"use client";

import { motion } from "framer-motion";

const PRODUCT_TYPES = [
  {
    icon: "🗺️",
    title: "Map Data",
    description: "Geocoding, Routing, Places, Traffic, and more",
    features: ["Forward/Reverse Geocoding", "Route Optimization", "POI Search", "Real-time Traffic"],
    color: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    hoverBorder: "hover:border-blue-300",
  },
  {
    icon: "⚡",
    title: "APIs",
    description: "RESTful APIs for seamless integration",
    features: ["REST & GraphQL", "Webhooks", "Batch Processing", "Real-time Streaming"],
    color: "from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    hoverBorder: "hover:border-amber-300",
  },
  {
    icon: "📦",
    title: "SDKs",
    description: "Native SDKs for all platforms",
    features: ["iOS & Android", "Web/JavaScript", "React Native", "Flutter"],
    color: "from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    hoverBorder: "hover:border-emerald-300",
  },
];

const VENDORS = ["Google", "HERE", "Mapbox", "TomTom"];

export default function ProductShowcase() {
  return (
    <section className="py-20 px-8 bg-[#f7f6f3]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#37352f] mb-3">
            We Help You Find the Right
          </h2>
          <p className="text-2xl font-bold text-[#787774]">
            Map Data, APIs & SDKs
          </p>
        </motion.div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRODUCT_TYPES.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-gradient-to-br ${product.color} rounded-xl p-6 border-2 ${product.borderColor} ${product.hoverBorder} transition-all cursor-default`}
            >
              <div className="text-4xl mb-4">{product.icon}</div>
              <h3 className="text-xl font-bold text-[#37352f] mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-[#787774] mb-4">{product.description}</p>

              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[#37352f]"
                  >
                    <span className="text-[#0f7b6c]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Vendor Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-[#9b9a97] mb-4">
            Covering products from leading providers
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12">
            {VENDORS.map((vendor, index) => (
              <motion.span
                key={vendor}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="text-lg font-semibold text-[#9b9a97] hover:text-[#37352f] transition-colors"
              >
                {vendor}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
