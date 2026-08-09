"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertOctagon, Sparkles } from "lucide-react";

export type TerrariumState = "idle" | "sealing" | "running" | "safe" | "warning" | "dangerous" | "failed";

interface TerrariumJarProps {
  state: TerrariumState;
  dangerScore?: number;
  dangerReason?: string;
  executionTimeMs?: number;
}

export const TerrariumJar: React.FC<TerrariumJarProps> = ({
  state,
  dangerScore = 0,
  dangerReason,
  executionTimeMs
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeState, setActiveState] = useState<TerrariumState>(state);
  // Mount guard: useReducedMotion returns null on the server and true/false on the
  // client, which causes a mismatched SVG tree and a hydration error. We defer the
  // reduced-motion branch until after the first client paint.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveState(state);
  }, [state]);

  // Accent colors based on state
  const isSafe = activeState === "safe" || (dangerScore > 0 && dangerScore < 30);
  const isWarning = activeState === "warning" || (dangerScore >= 30 && dangerScore < 60);
  const isDangerous = activeState === "dangerous" || activeState === "failed" || dangerScore >= 60;
  const isRunning = activeState === "running" || activeState === "sealing";

  const glowColor = isSafe
    ? "rgba(107, 143, 113, 0.45)"
    : isWarning
    ? "rgba(232, 168, 124, 0.5)"
    : isDangerous
    ? "rgba(217, 119, 106, 0.55)"
    : "rgba(107, 143, 113, 0.15)";

  const borderColor = isSafe
    ? "#6B8F71"
    : isWarning
    ? "#E8A87C"
    : isDangerous
    ? "#D9776A"
    : "rgba(107, 143, 113, 0.3)";

  // Only switch to the reduced-motion branch after mount to avoid server/client mismatch
  if (isMounted && shouldReduceMotion) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center border text-center shadow-terrarium">
        <div
          className="w-24 h-32 rounded-2xl border-4 flex items-center justify-center relative mb-4 bg-white/40"
          style={{ borderColor }}
        >
          {isSafe && <ShieldCheck className="w-10 h-10 text-sage-green" />}
          {isWarning && <AlertTriangle className="w-10 h-10 text-clay-peach" />}
          {isDangerous && <AlertOctagon className="w-10 h-10 text-brick-dusty" />}
          {activeState === "idle" && <Sparkles className="w-8 h-8 text-sage-green/60" />}
        </div>
        <h3 className="font-serif text-xl text-forest-ink font-semibold">
          {isRunning ? "Testing in Isolation..." : isSafe ? "Safe Migration (Bloomed)" : isWarning ? "Caution Detected" : isDangerous ? "High Risk Detected" : "Ready for Test"}
        </h3>
        {dangerReason && <p className="text-sm text-forest-ink/70 mt-1 max-w-xs">{dangerReason}</p>}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-terrarium">
      {/* Background ambient aura glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{
          background: glowColor,
          scale: isRunning ? [0.9, 1.15, 0.9] : 1,
        }}
        transition={{ duration: 3, repeat: isRunning ? Infinity : 0, ease: "easeInOut" }}
      />

      {/* Terrarium Glass Dome SVG Jar */}
      <div className="relative w-48 h-56 flex items-end justify-center py-2">
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Glass Gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="50%" stopColor="rgba(244, 247, 241, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
            </linearGradient>

            {/* Inner Soil Gradient */}
            <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A3B32" />
              <stop offset="100%" stopColor="#2A201A" />
            </linearGradient>

            {/* Moss Gradient */}
            <linearGradient id="mossGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6B8F71" />
              <stop offset="100%" stopColor="#4B6850" />
            </linearGradient>
          </defs>

          {/* 1. Terrarium Wooden Base */}
          <rect x="25" y="210" width="150" height="18" rx="6" fill="#3D2B1F" />
          <rect x="30" y="208" width="140" height="4" rx="2" fill="#5C4230" />

          {/* 2. Soil & Moss Layer */}
          <path d="M 36 195 Q 100 190 164 195 L 164 208 Q 100 212 36 208 Z" fill="url(#soilGrad)" />
          <path d="M 36 195 Q 70 190 100 193 Q 130 188 164 195 Q 130 198 100 196 Q 70 199 36 195 Z" fill="url(#mossGrad)" />

          {/* 3. Soil Pebbles */}
          <circle cx="55" cy="202" r="3" fill="#6B5949" />
          <circle cx="85" cy="204" r="2.5" fill="#8C7663" />
          <circle cx="120" cy="201" r="3.5" fill="#6B5949" />
          <circle cx="145" cy="203" r="2" fill="#8C7663" />

          {/* 4. Plant Stem & Bloom/Wilt Animation */}
          <g transform="translate(100, 192)">
            {/* Sprout Stem */}
            <motion.path
              d="M 0 0 Q -2 -25 0 -50 Q 2 -75 0 -90"
              fill="none"
              stroke={isDangerous ? "#A86B5A" : "#6B8F71"}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0.2 }}
              animate={{
                pathLength: isRunning ? [0.3, 0.6, 0.4] : 1,
                rotate: isDangerous ? [0, 15, 20] : isSafe ? [0, -3, 3, 0] : 0,
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Leaves */}
            <motion.path
              d="M 0 -35 Q -18 -45 -22 -30 Q -10 -20 0 -35 Z"
              fill={isDangerous ? "#C48574" : "#6B8F71"}
              animate={{
                scale: isRunning ? [0.6, 0.9, 0.7] : isSafe ? 1.2 : isDangerous ? 0.8 : 1,
                rotate: isDangerous ? 40 : 0,
              }}
              transition={{ duration: 1.5 }}
            />

            <motion.path
              d="M 0 -50 Q 18 -60 22 -45 Q 10 -35 0 -50 Z"
              fill={isDangerous ? "#B87A68" : "#4B6850"}
              animate={{
                scale: isRunning ? [0.6, 0.9, 0.7] : isSafe ? 1.2 : isDangerous ? 0.8 : 1,
                rotate: isDangerous ? -30 : 0,
              }}
              transition={{ duration: 1.5 }}
            />

            {/* Bloom Flower (Safe State) */}
            {isSafe && (
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                transform="translate(0, -92)"
              >
                {/* Petals */}
                {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                  <ellipse
                    key={idx}
                    cx="0"
                    cy="-10"
                    rx="6"
                    ry="12"
                    fill="#8FBA95"
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle cx="0" cy="0" r="7" fill="#E8C36B" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              </motion.g>
            )}

            {/* Wilting Flower / Droop (Dangerous State) */}
            {isDangerous && (
              <motion.g
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: 15, rotate: 60 }}
                transition={{ duration: 0.8 }}
                transform="translate(0, -85)"
              >
                <ellipse cx="0" cy="-6" rx="4" ry="9" fill="#D9776A" />
                <ellipse cx="6" cy="-4" rx="4" ry="9" fill="#B85E52" />
                <ellipse cx="-6" cy="-4" rx="4" ry="9" fill="#E8A87C" />
                <circle cx="0" cy="0" r="5" fill="#5C4230" />
              </motion.g>
            )}
          </g>

          {/* 5. Ambient Mist Rising Animation (While Running) */}
          {isRunning && (
            <g>
              {[
                { cx: 70, cy: 160, r: 14 },
                { cx: 120, cy: 140, r: 18 },
                { cx: 90, cy: 110, r: 16 },
              ].map((mist, idx) => (
                <motion.circle
                  key={idx}
                  cx={mist.cx}
                  cy={mist.cy}
                  r={mist.r}
                  fill="rgba(255, 255, 255, 0.45)"
                  filter="blur(4px)"
                  animate={{
                    y: [-10, -40, -10],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2.5 + idx * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </g>
          )}

          {/* 6. Glass Dome Body */}
          <path
            d="M 35 208 L 35 110 A 65 65 0 0 1 165 110 L 165 208 Z"
            fill="url(#glassGrad)"
            stroke={borderColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* 7. Glass Dome Cork/Sealing Dome Top */}
          <motion.path
            d="M 80 46 Q 100 40 120 46 L 122 55 L 78 55 Z"
            fill="#5C4230"
            stroke="#3D2B1F"
            strokeWidth="2"
            animate={{
              y: isRunning ? [ -15, 0 ] : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <ellipse cx="100" cy="46" rx="20" ry="4" fill="#7A5941" />

          {/* 8. Specular Glass Highlights */}
          <path
            d="M 45 190 L 45 115 A 55 55 0 0 1 85 58"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 155 180 L 155 130"
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Status Badge & Label */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border glass-card shadow-sm">
          {isSafe && (
            <>
              <span className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
              <span className="text-forest-ink font-semibold">Bloom State — Safe Migration</span>
            </>
          )}
          {isWarning && (
            <>
              <span className="w-2 h-2 rounded-full bg-clay-peach animate-pulse" />
              <span className="text-forest-ink font-semibold">Wilt State — Caution Advised</span>
            </>
          )}
          {isDangerous && (
            <>
              <span className="w-2 h-2 rounded-full bg-brick-dusty animate-pulse" />
              <span className="text-brick-dusty font-semibold">Wilt State — High Risk Lock</span>
            </>
          )}
          {isRunning && (
            <>
              <span className="w-2 h-2 rounded-full bg-honey-yellow animate-ping" />
              <span className="text-forest-ink">Dome Sealed — Executing Test...</span>
            </>
          )}
          {activeState === "idle" && (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sage-green" />
              <span className="text-forest-ink/80">Glass Jar Ready</span>
            </>
          )}
        </div>

        {dangerReason && (
          <p className="text-xs text-forest-ink/80 mt-2 max-w-sm px-2 line-clamp-2">
            {dangerReason}
          </p>
        )}

        {executionTimeMs !== undefined && executionTimeMs > 0 && (
          <span className="text-[11px] font-mono text-forest-ink/60 mt-1 block">
            Isolated Sandbox Runtime: {executionTimeMs}ms
          </span>
        )}
      </div>
    </div>
  );
};
