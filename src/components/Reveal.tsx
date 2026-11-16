import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in milliseconds (use for items within a grid/row). */
  delay?: number;
  /** Render as a different element (default: div). */
  as?: ElementType;
  className?: string;
}

/**
 * Wraps content in a scroll-reveal container: it rises 12px into view once when
 * scrolled to (spec 3.4). Falls back to fully visible with no JS or reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={`kw-reveal ${className}`.trim()}
      style={delay ? { ["--kw-reveal-delay" as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
