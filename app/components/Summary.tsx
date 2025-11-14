/**
 * Summary.tsx
 *
 * Component that displays the resume's high-level ATS evaluation summary.
 *
 * Structure:
 * - A ScoreGauge showing the overall resume score.
 * - A list of category-specific scores (Tone & Style, Content, Structure, Skills).
 *
 * Responsibilities:
 * - Provide an at-a-glance visualization of the user's resume performance.
 * - Color-code category scores (red/yellow/green) based on performance.
 *
 * Props:
 * - `feedback`: The full Feedback object returned from the resume analysis.
 *
 * Used in:
 * - /resume route as the top section of the results dashboard.
 */

import ScoreBadge from "~/components/ScoreBadge";
import ScoreGauge from "~/components/ScoreGauge";

/**
 * Category
 *
 * Small reusable sub-component that displays:
 * - The category title (e.g., "Content", "Skills")
 * - A ScoreBadge (visual pill component)
 * - The numeric score out of 100, color-coded based on value
 *
 * Color rules:
 * - > 70  → green (strong)
 * - > 49 → yellow (average)
 * - else → red (needs improvement)
 *
 * @param title - Name of the scoring category.
 * @param score - Score for this category (0–100).
 */
const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70
      ? "text-green-600"
      : score > 49
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-2xl">
          <span className={textColor}>{score}</span>/100
        </p>
      </div>
    </div>
  );
};

/**
 * Summary
 *
 * Displays the main resume summary section. This includes:
 * - A large gauge visualization of the overall score.
 * - A label + description explaining how the score is calculated.
 * - Individual category breakdowns beneath the gauge.
 *
 * @param feedback - Detailed analysis results returned by the ATS evaluation.
 *
 * Example:
 * ```tsx
 * <Summary feedback={analysis.feedback} />
 * ```
 */
const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      {/* Top section with overall score gauge */}
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback.overallScore} />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Your Resume Score </h2>
          <p className="text-sm text-gray-500">
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>

      {/* Category-specific score breakdown */}
      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};

export default Summary;
