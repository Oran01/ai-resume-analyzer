/**
 * ScoreGauge.tsx
 *
 * A semicircle gauge visualization used to display a resume score (0–100).
 *
 * Features:
 * - Animated arc that fills based on the score percentage.
 * - Smooth gradient from purple → red.
 * - Text overlay showing the numeric score.
 *
 * How it works:
 * - The SVG arc path is measured on mount using `getTotalLength()`.
 * - The strokeDashoffset is calculated dynamically to reveal the arc.
 *
 * Props:
 * - `score` (number): Resume score out of 100.
 *
 * Used in:
 * - Summary.tsx (top-level resume score gauge)
 */

import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  // Normalize score to a 0–1 percentage
  const percentage = score / 100;

  /**
   * Measure the SVG arc path length on mount.
   * Needed so we can control the reveal animation using strokeDashoffset.
   */
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20">
        {/* Main semicircle gauge */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Gradient used for the foreground arc */}
          <defs>
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#a78bfa" /> {/* Purple */}
              <stop offset="100%" stopColor="#fca5a5" /> {/* Red */}
            </linearGradient>
          </defs>

          {/* Background arc (light gray) */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Foreground arc representing the score */}
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
          />
        </svg>

        {/* Score text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-xl font-semibold pt-4">{score}/100</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
