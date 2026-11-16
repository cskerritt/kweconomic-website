import { Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import Loading from "@/components/Loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Team = lazy(() => import("@/pages/Team"));
const Contact = lazy(() => import("@/pages/Contact"));
const ServicesHub = lazy(() => import("@/pages/ServicesHub"));
const ServicePillar = lazy(() => import("@/pages/ServicePillar"));
const LocationsHub = lazy(() => import("@/pages/LocationsHub"));
const StateHub = lazy(() => import("@/pages/StateHub"));
const CityPage = lazy(() => import("@/pages/CityPage"));
const ServiceState = lazy(() => import("@/pages/ServiceState"));
const ServiceStateCity = lazy(() => import("@/pages/ServiceStateCity"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const KnowledgeHub = lazy(() => import("@/pages/KnowledgeHub"));
const KnowledgeArticle = lazy(() => import("@/pages/KnowledgeArticle"));
const InsightsHub = lazy(() => import("@/pages/InsightsHub"));
const InsightPost = lazy(() => import("@/pages/InsightPost"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const ScheduleConsultation = lazy(() => import("@/pages/ScheduleConsultation"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PillarGuide = lazy(() => import("@/pages/templates/PillarGuide"));
const Comparison = lazy(() => import("@/pages/templates/Comparison"));
const CaseTypeHub = lazy(() => import("@/pages/templates/CaseTypeHub"));
const CaseTypeState = lazy(() => import("@/pages/templates/CaseTypeState"));
const ServiceCaseType = lazy(() => import("@/pages/templates/ServiceCaseType"));
const ServiceCaseTypeState = lazy(() => import("@/pages/templates/ServiceCaseTypeState"));
const CredentialHub = lazy(() => import("@/pages/templates/CredentialHub"));
const CredentialState = lazy(() => import("@/pages/templates/CredentialState"));
const ExpertProfile = lazy(() => import("@/pages/templates/ExpertProfile"));
const JourneyStage = lazy(() => import("@/pages/templates/JourneyStage"));
const JourneyStageIndex = lazy(() => import("@/pages/templates/JourneyStageIndex"));
const ServiceTransactional = lazy(() => import("@/pages/templates/ServiceTransactional"));
const MethodologyExplainer = lazy(() => import("@/pages/templates/MethodologyExplainer"));



const WhitePapersHub = lazy(() => import("@/pages/WhitePapersHub"));
const WhitePaper = lazy(() => import("@/pages/WhitePaper"));

const CaseTypesHubPage = lazy(() => import("@/pages/hubs/CaseTypesHubPage"));
const CredentialsHubPage = lazy(() => import("@/pages/hubs/CredentialsHubPage"));
const GuidesHubPage = lazy(() => import("@/pages/hubs/GuidesHubPage"));
const ComparisonsHubPage = lazy(() => import("@/pages/hubs/ComparisonsHubPage"));
const MethodsHubPage = lazy(() => import("@/pages/hubs/MethodsHubPage"));
const JurisdictionsHubPage = lazy(() => import("@/pages/hubs/JurisdictionsHubPage"));
const FederalDistrict = lazy(() => import("@/pages/templates/FederalDistrict"));
const AttorneysHubPage = lazy(() => import("@/pages/hubs/AttorneysHubPage"));

/**
 * Re-keys on pathname so the routed content remounts on each navigation (no entrance runs, spec 3.2). ScrollToTop is
 * its first child, so its effect runs once the route's own content, a lazy chunk included, is in the DOM (spec 5.10).
 */
function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname}>
      <ScrollToTop />
      {children}
    </div>
  );
}

/**
 * A client-side navigation lands at once at the top of the new page, or on its fragment's target, 80px down under the
 * scroll padding (spec 5.10): Get a Quote's /contact#request-consultation lands on the form's heading from any page.
 * Back, Forward and the first load keep the browser's own scroll restoration and fragment jump, and a native in-page
 * fragment link (a guide's TOC) arrives as a POP too, so it stays the browser's, smooth where motion is allowed. It
 * renders nothing, so the prerender and hydration are unchanged.
 */
/**
 * The first load mounts with createRoot (src/main.tsx), which replaces the prerendered shell, so the browser's own
 * fragment jump lands on the shell's layout, hundreds of pixels off (2026-11-16 scroll review). A first mount that
 * came from a fresh navigation (not a reload or a history move, whose restored position the browser keeps) and
 * carries a fragment therefore scrolls to its target once, after the route's content is in the DOM.
 */
let firstLoadHandled = false;

/** The element a fragment names, or null; a malformed escape (an inbound "#100%") never throws. */
function fragmentTarget(hash: string): HTMLElement | null {
  if (!hash) return null;
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // keep the raw fragment
  }
  return document.getElementById(id);
}

function navigationKind(): string {
  const entry = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  return entry?.type ?? "navigate";
}

function freshNavigation(): boolean {
  return navigationKind() === "navigate";
}

/**
 * A reload, or a Back or Forward into a fresh document, gets the browser's restored position on the prerendered
 * shell, which createRoot then replaces, so the reader lost their place (2026-11-16 scroll review). The position is
 * kept per page in sessionStorage when the page is left and put back after the first mount; storage that is blocked
 * or empty leaves the browser's own behavior.
 */
const SCROLL_KEY = "kw:scroll:";
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    try {
      sessionStorage.setItem(SCROLL_KEY + location.pathname + location.search, String(Math.round(window.scrollY)));
    } catch {
      // storage blocked: nothing to restore later
    }
  });
}

/**
 * Back and Forward inside the app: the browser restores the position while the keyed route is still remounting (a
 * lazy chunk shows its fallback first), so the page is too short and the reader lands hundreds of pixels early
 * (2026-11-16 scroll review). Each history entry's position is recorded as the reader scrolls, under React Router's
 * entry key (or index) in history.state, read at popstate before the new route's layout can clamp it, and put back after the
 * route's content mounts.
 */
const entryPositions = new Map<string, number>();
let popTarget: number | null = null;
// The first entry carries only React Router's index (no key), so the index stands in for it.
const entryKey = (): string | undefined => {
  const state = window.history.state as { key?: string; idx?: number } | null;
  return state?.key ?? (typeof state?.idx === "number" ? `idx:${state.idx}` : undefined);
};
if (typeof window !== "undefined") {
  // This file restores every position itself (a reload or a Back into a fresh document from sessionStorage, an
  // in-app Back or Forward from entryPositions), so the browser's own restore, which lands after it on the
  // pre-remount layout, is switched off.
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  window.addEventListener(
    "scroll",
    () => {
      const key = entryKey();
      if (key) entryPositions.set(key, window.scrollY);
    },
    { passive: true },
  );
  window.addEventListener("popstate", () => {
    const key = entryKey();
    // An entry with nothing recorded was never scrolled, so it goes back to the top; an entry with no key (a native
    // in-page fragment link's) is left to the browser's fragment jump.
    popTarget = key !== undefined ? (entryPositions.get(key) ?? 0) : null;
  });
}

function savedScroll(pathname: string, search: string): number | null {
  try {
    const value = sessionStorage.getItem(SCROLL_KEY + pathname + search);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (!firstLoadHandled) {
      firstLoadHandled = true;
      const first = freshNavigation() ? fragmentTarget(hash) : null;
      if (first) {
        first.scrollIntoView({ block: "start", behavior: "instant" });
        // The content above the target is still settling (web fonts, the lazy route's late layout), and the browser
        // can move the page itself while the load finishes (seen on kweconomics.com/contact#contact-form at 768px, a
        // 79px shift that left the form under the header), so land again once fonts are in and once more shortly
        // after, unless the visitor has scrolled meanwhile: their wheel, touch, key or pointer, never a position
        // change the browser made.
        let visitorMoved = false;
        const VISITOR_INPUT = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
        const markMoved = () => {
          visitorMoved = true;
        };
        for (const type of VISITOR_INPUT) window.addEventListener(type, markMoved, { passive: true, once: true });
        const landAgain = () => {
          if (!visitorMoved) first.scrollIntoView({ block: "start", behavior: "instant" });
        };
        document.fonts?.ready.then(landAgain);
        window.setTimeout(() => {
          landAgain();
          for (const type of VISITOR_INPUT) window.removeEventListener(type, markMoved);
          // index.html turned smooth scrolling off for a load with a fragment, so the browser's own jump to the
          // prerendered shell's layout is instant and never still animating over this landing; it is back on now.
          document.documentElement.style.scrollBehavior = "";
        }, 600);
      } else {
        if (hash) document.documentElement.style.scrollBehavior = "";
        const restore = navigationKind() !== "navigate" ? savedScroll(pathname, search) : null;
        if (restore !== null && Number.isFinite(restore) && restore > 0) {
          window.scrollTo({ top: restore, behavior: "instant" });
          let restoredAt = window.scrollY;
          const restoreAgain = () => {
            if (Math.abs(window.scrollY - restoredAt) >= 2) return;
            window.scrollTo({ top: restore, behavior: "instant" });
            restoredAt = window.scrollY;
          };
          document.fonts?.ready.then(restoreAgain);
          window.setTimeout(restoreAgain, 600);
        }
      }
      return;
    }
    // Back and Forward: put back the position recorded for that entry (an in-page fragment link also arrives as a
    // POP, a new entry with nothing recorded, so the browser's own fragment jump stands).
    if (navigationType === "POP") {
      const restore = popTarget;
      popTarget = null;
      if (restore !== null) {
        window.scrollTo({ top: restore, behavior: "instant" });
        // If the page was still too short to reach it, try once more after layout settles, unless the reader has
        // scrolled meanwhile.
        const landedAt = window.scrollY;
        window.setTimeout(() => {
          if (Math.abs(window.scrollY - landedAt) < 2 && Math.abs(window.scrollY - restore) > 2) {
            window.scrollTo({ top: restore, behavior: "instant" });
          }
        }, 300);
      }
      return;
    }
    const target = fragmentTarget(hash);
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search, hash, navigationType]);
  return null;
}

/** Loads GA4 once (only if VITE_GA_MEASUREMENT_ID is set, and never for a GPC/DNT browser or after an opt-out: src/lib/analytics.ts) and reports an SPA page_view per navigation. */
function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    initAnalytics();
  }, []);
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AnalyticsTracker />
      <Header />
      {/* min-h-screen: the prerendered shells are head-only, so on first paint the
          route content is still a lazy chunk. Without a reserved full viewport the
          footer renders inside the fold and is shoved down when the page arrives -
          a single ~0.33 CLS on every URL (Search Console CWV, Aug 2026). */}
      <main id="main-content" className="flex-1 min-h-svh">
        <Suspense fallback={<Loading />}>
          <PageTransition>
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<ServicesHub />} />
        <Route path="/services/:serviceSlug" element={<ServicePillar />} />

        {/* Retired vocational-site surfaces (intake, PSA agreements, payment, raffle,
            document libraries, expert-disclosure, economic tools) are NOT
            registered on this site; server.js 404s or redirects them. */}
        <Route path="/services/:serviceSlug/:stateSlug" element={<ServiceState />} />
        <Route path="/services/:serviceSlug/:stateSlug/:citySlug" element={<ServiceStateCity />} />
        <Route path="/locations" element={<LocationsHub />} />
        <Route path="/locations/:stateSlug" element={<StateHub />} />
        <Route path="/locations/:stateSlug/:citySlug" element={<CityPage />} />
        <Route path="/resources/faq" element={<FAQ />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
        <Route path="/knowledge/:slug" element={<KnowledgeArticle />} />
        <Route path="/white-papers" element={<WhitePapersHub />} />
        <Route path="/white-papers/:slug" element={<WhitePaper />} />
        <Route path="/insights" element={<InsightsHub />} />
        <Route path="/insights/:slug" element={<InsightPost />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/schedule-consultation" element={<ScheduleConsultation />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* New landing-page hubs */}
        <Route path="/case-types" element={<CaseTypesHubPage />} />
        <Route path="/credentials" element={<CredentialsHubPage />} />
        <Route path="/guides" element={<GuidesHubPage />} />
        <Route path="/compare" element={<ComparisonsHubPage />} />
        <Route path="/methods" element={<MethodsHubPage />} />
        <Route path="/jurisdictions" element={<JurisdictionsHubPage />} />
        {/* One page per federal district court (wave 1, 2026-09-07). */}
        <Route path="/jurisdictions/federal/:districtSlug" element={<FederalDistrict />} />
        <Route path="/attorneys" element={<AttorneysHubPage />} />

        {/* New landing-page templates */}
        <Route path="/guides/:slug" element={<PillarGuide />} />
        <Route path="/compare/:slug" element={<Comparison />} />
        <Route path="/case-types/:slug" element={<CaseTypeHub />} />
        <Route path="/case-types/:typeSlug/:stateSlug" element={<CaseTypeState />} />
        <Route path="/services/:serviceSlug/case/:typeSlug" element={<ServiceCaseType />} />
        {/* Service x case type x state (wave 2, 2026-09-14): the declared pair
            composed with the state's courts and damages framework; released
            one state batch per wave (src/data/serviceCaseTypeStates.ts). */}
        <Route path="/services/:serviceSlug/case/:typeSlug/:stateSlug" element={<ServiceCaseTypeState />} />
        <Route path="/credentials/:slug" element={<CredentialHub />} />
        <Route path="/credentials/:credSlug/:stateSlug" element={<CredentialState />} />
        <Route path="/team/:slug" element={<ExpertProfile />} />
        {/* Stage index pages (/attorneys/considering|retaining|preparing-deposition|trial):
            the journey pages' breadcrumbs link here, so these must be real routes. */}
        <Route path="/attorneys/:stage" element={<JourneyStageIndex />} />
        <Route path="/attorneys/:stage/:caseTypeSlug" element={<JourneyStage />} />
        <Route path="/services/:serviceSlug/cost" element={<ServiceTransactional variant="cost" />} />
        <Route path="/services/:serviceSlug/process" element={<ServiceTransactional variant="process" />} />
        <Route path="/services/:serviceSlug/timeline" element={<ServiceTransactional variant="timeline" />} />
        <Route path="/methods/:slug" element={<MethodologyExplainer />} />

        <Route path="*" element={<NotFound />} />
          </Routes>
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
