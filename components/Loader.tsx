"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from 'next/navigation'

export default function Loader() {
  const pathname = usePathname()
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      const val = Math.min(Math.round(current), 100);
      setPct(val);
      if (val >= 100) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 500);
      }
    }, 50);
    // Failsafe: the curtain MUST lift, even if something misbehaves
    const failsafe = setTimeout(() => setDone(true), 6000);
    return () => { clearInterval(interval); clearTimeout(failsafe); };
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const themeText = pct < 33 ? "Threading the needle" : pct < 66 ? "Pressing the linen" : "Tucking you in";

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="somnienne-loader" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {/* Plain DOM — visible even if animation never runs */}
          <p className="text-[8rem] md:text-[12rem] leading-none font-light tracking-tighter text-espresso/5 select-none">
            {pct}<span className="text-bronze">%</span>
          </p>
          <div className="w-64 h-[1px] bg-sand relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-bronze" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-taupe">{themeText}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}