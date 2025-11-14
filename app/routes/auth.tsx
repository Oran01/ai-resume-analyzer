/**
 * auth.tsx
 *
 * Authentication route for Resumind.
 *
 * Responsibilities:
 * - Let the user log in or log out via Puter auth.
 * - Redirect authenticated users to the `next` URL (if provided) or `/`.
 * - Show a friendly loading state while auth is in progress.
 *
 * Typical flows:
 * - Unauthenticated user hits a protected route → redirected here with `?next=/target`.
 * - After logging in, the user is redirected back to that `next` route.
 */

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

/**
 * Route metadata for the auth page.
 */
export const meta = () => [
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  /**
   * If the user is already authenticated, redirect them immediately
   * to the `next` route (or `/` by default).
   */
  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen  flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          {/* Heading / intro copy */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>

          {/* Auth actions */}
          <div>
            {isLoading ? (
              <button className="auth-button animate-pulse">
                <p>Signing you in ...</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button className="auth-button" onClick={auth.signOut}>
                    <p>Log Out</p>
                  </button>
                ) : (
                  <button className="auth-button" onClick={auth.signIn}>
                    <p>Log In</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
