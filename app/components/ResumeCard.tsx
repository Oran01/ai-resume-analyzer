/**
 * ResumeCard.tsx
 *
 * Displays a single resume entry inside a list/grid view.
 *
 * Features:
 * - Shows job/company metadata (if available).
 * - Displays the resume's overall score using a ScoreCircle.
 * - Loads the resume preview image from Puter FS.
 * - Links to the full resume analysis page (`/resume/:id`).
 *
 * How it works:
 * - Uses `fs.read(imagePath)` from the Puter store to fetch the stored image.
 * - Converts Blob → Object URL for rendering in <img>.
 * - Falls back to a generic "Resume" title if no metadata exists.
 *
 * Props:
 * - `resume` (Resume): Full resume object with metadata and paths.
 *
 * Used in:
 * - Resume list/grid components
 * - Dashboard or history screens
 */

import { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  /**
   * Load the preview image for the resume.
   *
   * `imagePath` refers to a file stored in Puter FS.
   * We fetch it as a Blob and convert it into a usable browser URL.
   */
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };

    loadResume();
  }, [imagePath]);

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      {/* Header with titles and score */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="!text-black font-bold break-words">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
          )}

          {/* Fallback if company/job metadata is missing */}
          {!companyName && !jobTitle && (
            <h2 className="!text-black font-bold">Resume</h2>
          )}
        </div>

        {/* Score visualization */}
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {/* Resume preview image */}
      {resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
    </Link>
  );
};

export default ResumeCard;
