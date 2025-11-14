/**
 * Navbar.tsx
 *
 * The main navigation bar for the Resumind application.
 *
 * Features:
 * - Brand logo/title linking back to the home page.
 * - A primary action button linking to the resume upload page.
 *
 * Purpose:
 * - Provide consistent navigation across all app pages.
 * - Give users quick access to upload a new resume.
 *
 * Uses:
 * - `react-router` <Link> for client-side navigation.
 *
 * Styling:
 * - `.navbar` → container styling (flex, spacing, layout)
 * - `.text-gradient` → gradient-styled brand text
 * - `.primary-button` → reusable CTA button style
 */

import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Brand / Home link */}
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>

      {/* Call-to-action: upload a new resume */}
      <Link to="/upload" className="primary-button w-fit">
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
