/**
 * resume.tsx
 *
 * Resume review route for Resumind.
 *
 * Responsibilities:
 * - Ensure the user is authenticated (redirect to /auth if not).
 * - Load a specific resume (by `id`) from Puter KV.
 * - Fetch the stored PDF + preview image from Puter FS.
 * - Render:
 *    - A sticky preview of the resume on the left.
 *    - AI feedback on the right:
 *        - Summary (overall score + category breakdown)
 *        - ATS block (ATS score + tips)
 *        - Detailed category tips (tone, content, structure, skills)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { usePuterStore } from "~/lib/puter";

/**
 * Route metadata for the review page.
 */
export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  /**
   * Guard: if we're done loading and the user is not authenticated,
   * redirect them to `/auth` and send them back here afterward.
   */
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  /**
   * Load resume data and associated assets (PDF + image) from Puter:
   * - Fetch JSON from KV: `resume:<id>`.
   * - Parse to get `resumePath`, `imagePath`, and `feedback`.
   * - Read PDF + image from FS as blobs and create object URLs.
   * - Store feedback in local state for child components.
   */
  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;

      const data = JSON.parse(resume);

      // Load PDF file and create a URL for opening in a new tab
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      // Load preview image
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;

      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
    };

    loadResume();
  }, [id]);

  return (
    <main className="!pt-0">
      {/* Top navigation back to homepage */}
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left column: sticky resume preview */}
        <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-center rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        {/* Right column: AI feedback (summary, ATS, details) */}
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              {/* Overall score + category breakdown */}
              <Summary feedback={feedback} />

              {/* ATS-specific score + suggestions */}
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />

              {/* Detailed per-category tips & explanations */}
              <Details feedback={feedback} />
            </div>
          ) : (
            // Loading feedback state
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
