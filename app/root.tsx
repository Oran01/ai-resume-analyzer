/**
 * root.tsx
 *
 * Root entry point for the Resumind application.
 *
 * Responsibilities:
 * - Define global <html> layout (head, body, scripts).
 * - Load Puter.js globally and initialize the Puter store.
 * - Provide shared <Meta>, <Links>, <Scripts>, and scroll restoration.
 * - Define the root <Outlet /> where route components are rendered.
 * - Provide a global ErrorBoundary to handle route-level errors.
 */

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";

/**
 * links
 *
 * Declares global <link> tags inserted into the <head>.
 * - Preconnects to Google Fonts domains.
 * - Loads the Inter font family for the entire app.
 */
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/**
 * Layout
 *
 * Wraps all route content with the global HTML structure.
 *
 * Responsibilities:
 * - Initialize Puter integration (via `init()`).
 * - Render global <head> tags and meta.
 * - Inject the Puter.js script into the page.
 * - Include scroll restoration and React Router scripts.
 *
 * Props:
 * - `children` → The rendered route tree (usually <Outlet />).
 */
export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = usePuterStore();

  /**
   * Initialize Puter when the layout mounts.
   * - Attempts to detect when `window.puter` is ready.
   * - Sets up auth state and marks `puterReady` in the store.
   */
  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="en">
      <head>
        {/* Basic document metadata */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Route-level metadata + links */}
        <Meta />
        <Links />
      </head>
      <body>
        {/* Load Puter.js SDK globally so `window.puter` becomes available */}
        <script src="https://js.puter.com/v2/"></script>

        {/* Render the active route tree */}
        {children}

        {/* React Router utilities */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * App
 *
 * Root app component used by React Router.
 * Simply renders the current route via <Outlet />.
 */
export default function App() {
  return <Outlet />;
}

/**
 * ErrorBoundary
 *
 * Global error boundary for route errors.
 *
 * Behavior:
 * - If the error is a Route Error Response:
 *    - For 404 → display "404" with a not-found message.
 *    - For other statuses → display generic error and status text.
 * - In DEV mode, for regular Errors:
 *    - Show the error message and stack trace for easier debugging.
 *
 * Props:
 * - `error` → The error object provided by React Router.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>

      {/* In development, show the stack trace for debugging */}
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
