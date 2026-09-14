import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import Loading from "@/components/Loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ScrollProgress";

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

/** Re-keys on pathname so routed content replays a subtle fade-up on each navigation. */
function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="kw-page-enter">
      {children}
    </div>
  );
}

/** Resets scroll on client-side navigation; in-page anchor links keep their hash target. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

/** Loads GA4 once (only if VITE_GA_MEASUREMENT_ID is set) and reports an SPA page_view per navigation. */
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
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <AnalyticsTracker />
      <ScrollProgress />
      <Header />
      {/* min-h-screen: the prerendered shells are head-only, so on first paint the
          route content is still a lazy chunk. Without a reserved full viewport the
          footer renders inside the fold and is shoved down when the page arrives -
          a single ~0.33 CLS on every URL (Search Console CWV, Aug 2026). */}
      <main id="main-content" className="flex-1 min-h-screen">
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
