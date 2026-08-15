"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let current = 0;
    
    interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      const val = Math.min(Math.round(current), 100);
      setPct(val);
      
      if (val >= 100) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 500); // Pause at 100%
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getThemeText = () => {
    if (pct < 33) return "Threading the needle";
    if (pct < 66) return "Pressing the linen";
    return "Tucking you in";
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="somnienne-loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* The giant percentage counter */}
          <motion.h1 
            className="text-[8rem] md:text-[12rem] leading-none font-light tracking-tighter text-espresso/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {pct}<span className="text-bronze">%</span>
          </motion.h1>

          {/* The progress bar */}
          <div className="w-64 h-[1px] bg-sand relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-bronze"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* The clothing-themed text */}
          <motion.p 
            className="text-[10px] uppercase tracking-[0.4em] text-taupe"
            key={getThemeText()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {getThemeText()}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}