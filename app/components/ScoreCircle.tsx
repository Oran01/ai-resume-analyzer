/**
 * ScoreCircle.tsx
 *
 * A circular progress indicator used to visualize a resume score (0–100).
 *
 * Features:
 * - Circular progress ring with gradient stroke.
 * - Background ring for contrast.
 * - Centered numeric score label.
 *
 * How it works:
 * - The circle's stroke length is calculated using its circumference.
 * - Progress is shown by adjusting `strokeDashoffset`.
 *
 * Props:
 * - `score` (number): The score value displayed inside the circle.
 *
 * Used in:
 * - Additional scoring components (e.g., category breakdowns)
 * - Compact summary UIs where a full gauge would be too large
 */

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 40;
  const stroke = 8;

  // The radius must be reduced by half the stroke width,
  // otherwise the stroke clips outside the SVG viewbox.
  const normalizedRadius = radius - stroke / 2;

  // Total length of the circle's stroke
  const circumference = 2 * Math.PI * normalizedRadius;

  // Convert score to a 0–1 progress value
  const progress = score / 100;

  // Controls how much of the circle is "filled" based on progress
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />

        {/* Gradient definition for the progress ring */}
        <defs>
          <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF97AD" /> {/* pink */}
            <stop offset="100%" stopColor="#5171FF" /> {/* blue */}
          </linearGradient>
        </defs>

        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center label showing score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold text-sm">{`${score}/100`}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
