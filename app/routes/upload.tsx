/**
 * upload.tsx
 *
 * Upload route for the Resumind app.
 *
 * Responsibilities:
 * - Let the user provide:
 *    - Company name
 *    - Job title
 *    - Job description
 *    - Resume PDF file
 * - Upload the resume + generated image preview to Puter FS.
 * - Store a `Resume` record in Puter KV.
 * - Call AI feedback (via Puter AI) with prepared instructions.
 * - Save the feedback to KV and redirect to `/resume/:id`.
 *
 * User flow:
 * 1. User fills in job details and uploads a resume.
 * 2. Clicks "Analyze Resume".
 * 3. UI walks through steps (uploading, converting, analyzing) with status text.
 * 4. Once done, user is redirected to the resume details page.
 */

import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /**
   * Called whenever the user selects or clears a file in the FileUploader.
   */
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  /**
   * Core pipeline for analyzing the resume:
   * 1. Upload original PDF to Puter FS.
   * 2. Convert the PDF's first page to a PNG preview.
   * 3. Upload the generated image to Puter FS.
   * 4. Store a temporary Resume record in KV (without feedback).
   * 5. Call AI feedback with instructions tailored to the job.
   * 6. Parse AI's JSON response into `feedback` and update KV entry.
   * 7. Redirect user to the resume details page.
   */
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    // 1. Upload original PDF
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");

    // 2. Convert to image
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Error: Failed to convert PDF to image");

    // 3. Upload the PNG preview
    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");

    // 4. Create a basic Resume record in KV (no feedback yet)
    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "", // will be replaced after AI analysis
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    // 5. Run AI feedback on the uploaded resume
    setStatusText("Analyzing...");
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatusText("Error: Failed to analyze resume");

    // 6. Parse AI JSON feedback (string or array-based content)
    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    // 7. Redirect to the resume details page
    setStatusText("Analysis complete, redirecting...");
    navigate(`/resume/${uuid}`);
  };

  /**
   * Form submit handler.
   * - Reads form values (company, job title, job description).
   * - Ensures a file is selected.
   * - Triggers the analyze pipeline.
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    if (!form) return;

    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>

          {/* Processing state: show step text + scanning animation */}
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {/* Show form only when we are NOT currently processing */}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
