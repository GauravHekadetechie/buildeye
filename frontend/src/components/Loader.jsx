import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-ink overflow-hidden">
      <div className="absolute inset-0 bg-blueprint bg-grid opacity-40" />

      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="#1E2A3F"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="#2F80ED"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="214"
            initial={{ strokeDashoffset: 214 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="12"
            fill="#F2994A"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          />
        </svg>
      </div>

      <motion.p
        className="mt-6 tag-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        BUILDEYE // CALIBRATING SITE VISION
      </motion.p>
    </div>
  );
}
