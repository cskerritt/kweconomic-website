import { createContext } from "react";
import type { PageMeta } from "@/types";

/**
 * Build-time collector for a page's meta. src/entry-server.tsx provides a
 * function here and usePageMeta calls it during render, because the effect
 * the hook uses in the browser never runs in a server render. The browser
 * never provides one (null).
 */
export type PageMetaCollector = (meta: PageMeta) => void;
export const PageMetaContext = createContext<PageMetaCollector | null>(null);
