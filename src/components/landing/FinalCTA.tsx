"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="py-20 px-8 bg-[#37352f]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to find your perfect map solution?
        </h2>
        <p className="text-lg text-white/70 mb-8">
          Start your free analysis and get personalized recommendations in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/project/new"
            className="px-8 py-4 bg-white hover:bg-[#f7f6f3] text-[#37352f] font-semibold rounded-lg transition-colors text-lg"
          >
            Start Free Analysis
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <span className="text-sm">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="text-sm">Results in minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span className="text-sm">100+ products compared</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
