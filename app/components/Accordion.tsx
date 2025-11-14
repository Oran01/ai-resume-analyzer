/**
 * Accordion.tsx
 *
 * A headless, reusable Accordion component system built with React context.
 *
 * Components:
 * - <Accordion>        → Top-level provider that manages open/closed state.
 * - <AccordionItem>    → Wraps each individual accordion section.
 * - <AccordionHeader>  → Clickable header that toggles its section.
 * - <AccordionContent> → Collapsible content area for each section.
 *
 * Features:
 * - Supports single-open or multi-open modes (via `allowMultiple`).
 * - Simple API: identify sections by a stable `itemId` string.
 * - Customizable header icon (default chevron with rotation).
 *
 * Usage example:
 * ```tsx
 * <Accordion defaultOpen="item-1">
 *   <AccordionItem id="item-1">
 *     <AccordionHeader itemId="item-1">Section 1</AccordionHeader>
 *     <AccordionContent itemId="item-1">
 *       Content for section 1
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */

import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

/**
 * Internal context shape for tracking active accordion items.
 */
interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

/**
 * Convenience hook for reading the Accordion context.
 * Throws an error if used outside of <Accordion>.
 */
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

/**
 * Accordion
 *
 * Top-level container that:
 * - Manages open/close state for all items.
 * - Provides context to `AccordionHeader` and `AccordionContent`.
 *
 * Props:
 * - `children`       → One or more AccordionItem components.
 * - `defaultOpen`    → ID of the item that should be open by default.
 * - `allowMultiple`  → If true, allows multiple items to be open at once.
 * - `className`      → Optional custom class for the wrapper.
 */
interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(
    defaultOpen ? [defaultOpen] : []
  );

  /**
   * Toggles a specific item by its ID.
   * - In single mode (default): only one ID is active at a time.
   * - In multiple mode: can add/remove IDs in the active array.
   */
  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  /** Returns true if the given item ID is active/open. */
  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider
      value={{ activeItems, toggleItem, isItemActive }}
    >
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

/**
 * AccordionItem
 *
 * Visual wrapper for a single accordion section.
 * Note: The `id` prop is mainly used for semantics and pairing with
 *       `itemId` on the header/content, but the toggling is done via `itemId`.
 *
 * Props:
 * - `id`        → Unique identifier for the item (also useful for testing/DOM).
 * - `children`  → Typically a Header + Content pair.
 * - `className` → Optional extra classes for the outer container.
 */
interface AccordionItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className = "",
}) => {
  return (
    <div className={`overflow-hidden border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

/**
 * AccordionHeader
 *
 * Clickable header that toggles an accordion section open/closed.
 *
 * Props:
 * - `itemId`       → ID used to link this header to its content.
 * - `children`     → Header label/content (e.g., title, summary).
 * - `className`    → Extra classes for the header button.
 * - `icon`         → Optional custom icon element.
 * - `iconPosition` → "left" or "right" (default "right").
 */
interface AccordionHeaderProps {
  itemId: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  // Default chevron icon that rotates when active
  const defaultIcon = (
    <svg
      className={cn("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive,
      })}
      fill="none"
      stroke="#98A2B3"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const handleClick = () => {
    toggleItem(itemId);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {iconPosition === "left" && (icon || defaultIcon)}
        <div className="flex-1">{children}</div>
      </div>
      {iconPosition === "right" && (icon || defaultIcon)}
    </button>
  );
};

/**
 * AccordionContent
 *
 * Collapsible content container for an accordion section.
 * Uses CSS transitions for height and opacity to animate open/close.
 *
 * Props:
 * - `itemId`    → ID that links this content to its header.
 * - `children`  → The content to show when the item is active.
 * - `className` → Extra classes for the outer container.
 */
interface AccordionContentProps {
  itemId: string;
  children: ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  itemId,
  children,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);

  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `}
    >
      <div className="px-4 py-3 ">{children}</div>
    </div>
  );
};
