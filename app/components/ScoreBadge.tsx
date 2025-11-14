/**
 * ScoreBadge.tsx
 *
 * A small visual indicator used to describe the quality of a category score.
 *
 * Behavior:
 * - Converts a numeric score (0–100) into a descriptive label:
 *    - > 70  → "Strong" (green)
 *    - > 49 → "Good Start" (yellow)
 *    - else → "Needs Work" (red)
 *
 * - Background and text colors match the sentiment of the score.
 *
 * Props:
 * - `score` (number): Category score that determines the badge style & text.
 *
 * Used in:
 * - Summary.tsx
 * - Any component where a quick score label is needed.
 */

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = "";
  let badgeText = "";

  // Determine color + label based on score thresholds
  if (score > 70) {
    badgeColor = "bg-badge-green text-green-600";
    badgeText = "Strong";
  } else if (score > 49) {
    badgeColor = "bg-badge-yellow text-yellow-600";
    badgeText = "Good Start";
  } else {
    badgeColor = "bg-badge-red text-red-600";
    badgeText = "Needs Work";
  }

  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
