/**
 * routes.ts
 *
 * This file defines the full routing table for the Resumind application using
 * React Router v7's file-based route configuration.
 *
 * Responsibilities:
 * - Map URL paths to the corresponding route components in `routes/`.
 * - Declare dynamic parameterized routes (e.g., `/resume/:id`).
 * - Identify the index (home) route.
 *
 * Structure:
 * - index() → sets the default route (`/`)
 * - route(path, componentPath) → explicitly maps paths to route components
 *
 * All routes satisfy the `RouteConfig` type required by React Router.
 */

import { type RouteConfig, index, route } from "@react-router/dev/routes";

/**
 * Route Definitions
 *
 * 1. `/` (Home)
 *    - The main dashboard where users see uploaded resumes and scores.
 *
 * 2. `/auth`
 *    - Authentication page. Handles login via Puter.js.
 *    - Redirects to the `next` query param after login.
 *
 * 3. `/upload`
 *    - The resume upload page.
 *    - Users submit their resume + job details for AI analysis.
 *
 * 4. `/resume/:id`
 *    - Dynamic route displaying the detailed resume review.
 *    - Shows summary, ATS score, tips, and rendered PDF preview.
 *
 * 5. `/wipe`
 *    - Utility/debug page.
 *    - Allows wiping all Puter FS + KV data for the logged-in user.
 */
export default [
  index("routes/home.tsx"),
  route("/auth", "routes/auth.tsx"),
  route("/upload", "routes/upload.tsx"),
  route("/resume/:id", "routes/resume.tsx"),
  route("/wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
