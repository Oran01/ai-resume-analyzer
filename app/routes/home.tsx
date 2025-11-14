/**
 * home.tsx
 *
 * Home route for the Resumind app.
 *
 * Responsibilities:
 * - Ensure the user is authenticated (redirects to /auth if not).
 * - Load all saved resumes from Puter KV storage.
 * - Display:
 *    - A list of <ResumeCard /> components when resumes exist.
 *    - A friendly empty state with "Upload Resume" CTA when none exist.
 *    - A loading animation while resumes are being fetched.
 *
 * Data source:
 * - Resumes are stored in Puter KV under keys matching: "resume:*"
 *   Each value is a JSON-stringified `Resume`.
 */

import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

/**
 * Route metadata for the <head> section.
 * Sets the page title and description for SEO and social previews.
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

/**
 * Home
 *
 * Main landing page after authentication.
 *
 * Behavior:
 * - If the user is not authenticated → redirect to `/auth?next=/`.
 * - If authenticated → load all resumes from KV and show:
 *    - Loading state while fetching.
 *    - Resume cards if any resumes exist.
 *    - Empty state + button when no resumes exist.
 */
export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  /**
   * Guard: if the user is not authenticated, redirect them to the auth screen.
   * The `next=/` query param ensures they return to home after logging in.
   */
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  /**
   * Fetch all stored resumes from Puter KV when the page first loads.
   *
   * Resumes are stored under keys matching "resume:*", with values
   * being JSON-encoded `Resume` objects.
   */
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      // Request keys + values from KV (returnValues = true)
      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        {/* Page heading / hero copy */}
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {/* Loading state: show scanning GIF while resumes are being fetched */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {/* Resumes list */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Empty state: no resumes yet */}
        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
