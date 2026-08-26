import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

export type RevealVariant = "up" | "left" | "right" | "scale";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "",
  left: "kw-reveal--left",
  right: "kw-reveal--right",
  scale: "kw-reveal--scale",
};

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in milliseconds (use for items within a grid/row). */
  delay?: number;
  /** Entrance direction. Defaults to "up". */
  variant?: RevealVariant;
  /** Render as a different element (default: div). */
  as?: ElementType;
  className?: string;
}

/**
 * Wraps content in a scroll-reveal container. Fades/slides into view once when
 * scrolled to. Falls back to fully visible with no JS or reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={`kw-reveal ${VARIANT_CLASS[variant]} ${className}`.trim()}
      style={delay ? { ["--kw-reveal-delay" as string]: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
