import React from "react";
import { motion } from "framer-motion";
import {
  Atom,
  Server,
  Database,
  Brain,
  ShieldCheck,
  LineChart as ChartIcon,
  Cloud,
  Cpu,
} from "lucide-react";

const stack = [
  { icon: Atom, name: "React + Vite" },
  { icon: Server, name: "Node.js + Express" },
  { icon: Database, name: "SQLite / PostgreSQL" },
  { icon: Brain, name: "TensorFlow / scikit-learn" },
  { icon: ShieldCheck, name: "JWT + bcrypt" },
  { icon: ChartIcon, name: "Recharts" },
  { icon: Cloud, name: "Free-tier weather & imagery APIs" },
  { icon: Cpu, name: "Framer Motion" },
];

export default function TechStack() {
  return (
    <section className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
      <span className="tag-label">TECH STACK</span>
      <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-mist max-w-2xl">
        Built with a stack any engineer can pick up.
      </h2>

      <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stack.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex flex-col items-center text-center gap-3 border border-ink-line rounded-sm p-6 hover:border-signal/50 transition-colors"
          >
            <t.icon size={24} className="text-signal" />
            <p className="text-sm text-slate-soft">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
