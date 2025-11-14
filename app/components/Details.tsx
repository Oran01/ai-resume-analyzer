/**
 * Details.tsx
 *
 * Displays an in-depth breakdown of the resume feedback using an accordion layout.
 *
 * Structure:
 * - One accordion item per category:
 *    - Tone & Style
 *    - Content
 *    - Structure
 *    - Skills
 *
 * Each category includes:
 * - A header with the category title and a score badge.
 * - A content section with:
 *    - A compact list of tips (good/improve).
 *    - Detailed cards explaining each tip.
 *
 * Props:
 * - `feedback` (Feedback): Full analysis results returned by the ATS evaluation.
 *
 * Used in:
 * - Resume details page (/resume/:id) as the "deep dive" section.
 */

import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

/**
 * ScoreBadge
 *
 * Displays a small pill showing the numeric score for a category (e.g., 78/100),
 * with background/text colors that reflect how good the score is.
 *
 * Color rules:
 * - > 69 → green (strong)
 * - > 39 → yellow (average)
 * - else → red (needs improvement)
 *
 * @param score - Category score between 0 and 100.
 */
const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
        score > 69
          ? "bg-badge-green"
          : score > 39
            ? "bg-badge-yellow"
            : "bg-badge-red"
      )}
    >
      <img
        src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
        alt="score"
        className="size-4"
      />
      <p
        className={cn(
          "text-sm font-medium",
          score > 69
            ? "text-badge-green-text"
            : score > 39
              ? "text-badge-yellow-text"
              : "text-badge-red-text"
        )}
      >
        {score}/100
      </p>
    </div>
  );
};

/**
 * CategoryHeader
 *
 * Renders the accordion header row for a single category.
 * Shows:
 * - Category title (e.g., "Content")
 * - Category ScoreBadge (numeric + color-coded)
 *
 * @param title - The name of the category.
 * @param categoryScore - Score for that category (0–100).
 */
const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-2xl font-semibold">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

/**
 * CategoryContent
 *
 * Shows detailed feedback for a single category, split into two sections:
 *
 * 1. Compact list:
 *    - A grid of 2 columns listing each tip with an icon (check/warning)
 *      and a short label.
 *
 * 2. Detailed explanations:
 *    - Each tip rendered as a colored card (green for "good", yellow for "improve")
 *      including:
 *        - Tip title
 *        - Explanation text
 *
 * @param tips - Array of feedback tips for this category.
 */
const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {/* Compact tips overview */}
      <div className="bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            <img
              src={
                tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"
              }
              alt="score"
              className="size-5"
            />
            <p className="text-xl text-gray-500 ">{tip.tip}</p>
          </div>
        ))}
      </div>

      {/* Detailed tip cards */}
      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-2 rounded-2xl p-4",
              tip.type === "good"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
            )}
          >
            <div className="flex flex-row gap-2 items-center">
              <img
                src={
                  tip.type === "good"
                    ? "/icons/check.svg"
                    : "/icons/warning.svg"
                }
                alt="score"
                className="size-5"
              />
              <p className="text-xl font-semibold">{tip.tip}</p>
            </div>
            <p>{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Details
 *
 * Main container component for the detailed resume feedback section.
 *
 * Behavior:
 * - Renders an accordion with 4 items:
 *    - Tone & Style
 *    - Content
 *    - Structure
 *    - Skills
 * - Each item uses:
 *    - CategoryHeader for the title & score
 *    - CategoryContent for tips & explanations
 *
 * @param feedback - Full feedback object containing category scores + tips.
 *
 * Example:
 * ```tsx
 * <Details feedback={analysis.feedback} />
 * ```
 */
const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        {/* Tone & Style */}
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Content */}
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title="Content"
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Structure */}
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title="Skills"
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;
