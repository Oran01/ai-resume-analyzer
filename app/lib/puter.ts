/**
 * puter.ts
 *
 * Centralized Zustand store for interacting with the Puter.js runtime.
 * This file wraps all Puter capabilities (auth, filesystem, AI, key-value store)
 * behind a typed React-friendly API.
 *
 * Responsibilities:
 * - Detect whether Puter.js is available in the browser.
 * - Manage auth state (user, sign-in status, loading, errors).
 * - Provide helper methods for:
 *    - `fs`  → reading, writing, uploading and deleting files.
 *    - `ai`  → running chat completions, file-based feedback and img2txt.
 *    - `kv`  → storing and retrieving small key-value data.
 * - Expose a single `usePuterStore` hook that components/routes can use.
 *
 * Usage:
 * - Call `usePuterStore.getState().init()` once (e.g. in a root layout effect)
 *   to start Puter detection and auth check.
 * - Use `const { auth, fs, ai, kv, isLoading, error } = usePuterStore();`
 *   inside React components to access Puter utilities.
 */

import { create } from "zustand";

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<Object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

/**
 * Shape of the global Puter store managed by Zustand.
 *
 * The store is grouped into logical sections:
 * - `auth` → authentication state and helpers (sign in/out, refresh).
 * - `fs`   → high-level wrappers around Puter filesystem operations.
 * - `ai`   → AI helpers (chat, feedback on files, image-to-text).
 * - `kv`   → key-value storage helpers.
 *
 * Top-level flags:
 * - `isLoading`  → true while an async Puter operation is in progress.
 * - `error`      → last error message (if any), can be cleared with `clearError`.
 * - `puterReady` → true once Puter.js has been detected in the browser.
 *
 * Lifecycle helpers:
 * - `init()`     → bootstraps Puter.js detection and initial auth check.
 * - `clearError` → resets the error state to null.
 */
interface PuterStore {
  /** Global loading flag for any async Puter operation. */
  isLoading: boolean;

  /** Last error message (if any). Cleared with `clearError()`. */
  error: string | null;

  /** True once Puter.js is detected and ready to use. */
  puterReady: boolean;

  /** Authentication state and helpers. */
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };

  /** Filesystem helpers for reading/writing/uploading files. */
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };

  /** AI helpers for chat, feedback, image-to-text, etc. */
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
  };

  /** Key-value storage helpers backed by Puter KV. */
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  /** Initializes Puter detection and triggers an initial auth check. */
  init: () => void;

  /** Clears the current error message. */
  clearError: () => void;
}

/**
 * Safely returns the global `window.puter` object if available.
 *
 * This guards against:
 * - Server-side rendering (no `window`).
 * - Cases where Puter.js has not yet been injected/loaded.
 *
 * @returns The `window.puter` object or `null` if not available.
 */
const getPuter = (): typeof window.puter | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;

/**
 * Zustand hook that exposes the full Puter integration layer.
 *
 * This hook:
 * - Keeps track of Puter.js readiness (`puterReady`).
 * - Manages auth state (user, isAuthenticated).
 * - Wraps filesystem (`fs`), AI (`ai`) and key-value (`kv`) APIs
 *   in safe, typed helper functions that handle missing Puter.js and errors.
 *
 * Example:
 * ```ts
 * const { puterReady, isLoading, error, auth, fs, ai, kv, init } = usePuterStore();
 *
 * useEffect(() => {
 *   init(); // Start Puter detection & auth check on app load
 * }, [init]);
 *
 * if (!puterReady) return <Spinner />;
 *
 * if (auth.isAuthenticated) {
 *   // user is logged in
 * }
 * ```
 */
export const usePuterStore = create<PuterStore>((set, get) => {
  /**
   * Convenience helper for setting an error message and resetting auth state.
   *
   * This also:
   * - Sets `isLoading` to false.
   * - Clears the current user and marks `isAuthenticated` as false.
   */
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser,
      },
    });
  };

  /**
   * Checks whether the user is currently signed in to Puter.
   *
   * Behavior:
   * - If Puter.js is not available → sets an error and returns false.
   * - If signed in → fetches the current user and updates auth state.
   * - If not signed in → clears user and marks `isAuthenticated` as false.
   *
   * @returns `true` if the user is authenticated, otherwise `false`.
   */
  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user,
          },
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null,
          },
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };

  /**
   * Triggers the Puter auth sign-in flow.
   *
   * After a successful sign-in, this calls `checkAuthStatus()` to refresh
   * the stored user data and auth flags.
   */
  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };

  /**
   * Signs the current user out of Puter.
   *
   * On success:
   * - Clears the user object.
   * - Marks `isAuthenticated` as false.
   */
  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };

  /**
   * Refreshes the authenticated Puter user from the backend.
   *
   * Useful when user data might have changed during the session.
   */
  const refreshUser = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user,
        },
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };

  /**
   * Initializes Puter integration.
   *
   * Responsibilities:
   * - Checks immediately if `window.puter` is already available.
   * - If not, polls every 100ms until Puter.js is injected or
   *   until a 10 second timeout is reached.
   * - Once Puter is ready, sets `puterReady` to true and calls `checkAuthStatus()`.
   *
   * If Puter.js fails to load within 10 seconds, an error is set.
   */
  const init = (): void => {
    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 10000);
  };

  // ------------- Filesystem helpers (Puter.fs) -------------

  /**
   * Writes data to a file at the given path in the user's Puter filesystem.
   *
   * @param path - Target path in Puter (e.g. "/resumes/123.pdf")
   * @param data - String, File or Blob to write.
   */
  const write = async (path: string, data: string | File | Blob) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };

  /** Reads the contents of a directory from the Puter filesystem. */
  const readDir = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };

  /** Reads a file from the Puter filesystem as a Blob. */
  const readFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };

  /** Uploads one or more files/blobs to Puter and returns the created FSItem. */
  const upload = async (files: File[] | Blob[]) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };

  /** Deletes a file at the provided path from the Puter filesystem. */
  const deleteFile = async (path: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };

  // ------------- AI helpers (Puter.ai) -------------

  /**
   * Low-level wrapper around `puter.ai.chat`.
   *
   * Accepts either:
   * - A string prompt, or
   * - An array of ChatMessage objects for multi-turn conversations.
   *
   * Returns the typed `AIResponse` when available.
   */
  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string | PuterChatOptions,
    testMode?: boolean,
    options?: PuterChatOptions
  ) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    // return puter.ai.chat(prompt, imageURL, testMode, options);
    return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
      AIResponse | undefined
    >;
  };

  /**
   * Requests AI feedback on a specific file stored in Puter.
   *
   * The file is referenced by its `puter_path`, and a message is sent
   * alongside it (e.g. "Analyze this resume for ATS compatibility").
   */
  const feedback = async (path: string, message: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: path,
            },
            {
              type: "text",
              text: message,
            },
          ],
        },
      ],
      { model: "claude-3-7-sonnet" }
    ) as Promise<AIResponse | undefined>;
  };

  /**
   * Runs image-to-text (OCR / captioning) on an image using Puter AI.
   */
  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };

  // ------------- Key-Value helpers (Puter.kv) -------------

  /** Gets a value from the Puter key-value store for the given key. */
  const getKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };

  /** Sets a value in the Puter key-value store. */
  const setKV = async (key: string, value: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };

  /** Deletes a single key from the Puter key-value store. */
  const deleteKV = async (key: string) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.delete(key);
  };

  /**
   * Lists keys (and optionally values) that match a given pattern.
   *
   * @param pattern - Pattern to match keys (e.g. "resume:*").
   * @param returnValues - If true, returns KVItem[] instead of just keys.
   */
  const listKV = async (pattern: string, returnValues?: boolean) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === undefined) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };

  /** Clears all keys from the Puter key-value store. */
  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    ai: {
      chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
      ) => chat(prompt, imageURL, testMode, options),
      feedback: (path: string, message: string) => feedback(path, message),
      img2txt: (image: string | File | Blob, testMode?: boolean) =>
        img2txt(image, testMode),
    },
    kv: {
      get: (key: string) => getKV(key),
      set: (key: string, value: string) => setKV(key, value),
      delete: (key: string) => deleteKV(key),
      list: (pattern: string, returnValues?: boolean) =>
        listKV(pattern, returnValues),
      flush: () => flushKV(),
    },
    init,
    clearError: () => set({ error: null }),
  };
});
