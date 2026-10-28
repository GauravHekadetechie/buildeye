import React from "react";
import { Github, Mail } from "lucide-react";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-ink-line px-6 md:px-10 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-soft max-w-xs">
            AI construction management — roadmaps, progress verification and
            risk alerts, without site hardware.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="tag-label mb-3">PROJECT</p>
            <p className="text-slate-soft">Problem ID: [PS Code]</p>
            <p className="text-slate-soft mt-1">Buildeye v1.0</p>
          </div>
          <div>
            <p className="tag-label mb-3">CONTACT</p>
            <a href="mailto:team@buildeye.app" className="flex items-center gap-2 text-slate-soft hover:text-signal">
              <Mail size={14} /> team@buildeye.app
            </a>
          </div>
          <div>
            <p className="tag-label mb-3">REPOSITORY</p>
            <a
              href="https://github.com/[your-org]/buildeye"
              className="flex items-center gap-2 text-slate-soft hover:text-signal"
            >
              <Github size={14} /> [GitHub repo link]
            </a>
          </div>
        </div>
      </div>

      <p className="max-w-7xl mx-auto mt-10 tag-label text-slate-soft/60">
        © {new Date().getFullYear()} BUILDEYE. BUILT FOR DEMONSTRATION PURPOSES — SEE README FOR MOCK VS. REAL DATA.
      </p>
    </footer>
  );
}
