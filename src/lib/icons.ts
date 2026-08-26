import {
  Briefcase,
  Calculator,
  FileSearch,
  FileText,
  Gavel,
  HeartPulse,
  Home,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ className?: string }>;

/**
 * Registry of the Lucide icons referenced by name in data files
 * (services.ts, whitePapers.ts). Named imports keep tree-shaking intact -
 * a namespace import (`import * as Icons`) pulls the entire icon library
 * (~600 kB) into the bundle.
 */
export const ICONS: Record<string, IconComponent | undefined> = {
  Briefcase,
  Calculator,
  FileSearch,
  FileText,
  Gavel,
  HeartPulse,
  Home,
  Scale,
  ShieldCheck,
};
