import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import Loading from "@/components/Loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ScrollProgress";

const Home = lazy(() => import("@/pages/Home"));
const Tools = lazy(() => import("@/pages/Tools"));
const DamagesEstimator = lazy(() => import("@/pages/DamagesEstimator"));
const LifeExpectancy = lazy(() => import("@/pages/LifeExpectancy"));
// Public, indexed household-services valuator + its methodology page: both are
// prerendered and listed in the sitemap (scripts/prerender.mjs + generate-sitemap.mjs).
const HouseholdServicesValuator = lazy(() => import("@/pages/HouseholdServicesValuator"));
const HouseholdServicesMethodology = lazy(() => import("@/pages/HouseholdServicesMethodology"));
const About = lazy(() => import("@/pages/About"));
const Team = lazy(() => import("@/pages/Team"));
const Contact = lazy(() => import("@/pages/Contact"));
const Forms = lazy(() => import("@/pages/Forms"));
const PatientFormPage = lazy(() => import("@/pages/PatientFormPage"));
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
const CredentialHub = lazy(() => import("@/pages/templates/CredentialHub"));
const CredentialState = lazy(() => import("@/pages/templates/CredentialState"));
const ExpertProfile = lazy(() => import("@/pages/templates/ExpertProfile"));
const JourneyStage = lazy(() => import("@/pages/templates/JourneyStage"));
const JourneyStageIndex = lazy(() => import("@/pages/templates/JourneyStageIndex"));
const ServiceTransactional = lazy(() => import("@/pages/templates/ServiceTransactional"));
const MethodologyExplainer = lazy(() => import("@/pages/templates/MethodologyExplainer"));

const ExpertDisclosurePillar = lazy(() => import("@/pages/ExpertDisclosurePillar"));
const ExpertDisclosureState = lazy(() => import("@/pages/ExpertDisclosureState"));

const RetainerIntake = lazy(() => import("@/pages/RetainerIntake"));
const Intake = lazy(() => import("@/pages/Intake"));
const SampleReports = lazy(() => import("@/pages/SampleReports"));
const ExpertCVs = lazy(() => import("@/pages/ExpertCVs"));
const Payment = lazy(() => import("@/pages/Payment"));
const Raffle = lazy(() => import("@/pages/Raffle"));

const WhitePapersHub = lazy(() => import("@/pages/WhitePapersHub"));
const WhitePaper = lazy(() => import("@/pages/WhitePaper"));

const CaseTypesHubPage = lazy(() => import("@/pages/hubs/CaseTypesHubPage"));
const CredentialsHubPage = lazy(() => import("@/pages/hubs/CredentialsHubPage"));
const GuidesHubPage = lazy(() => import("@/pages/hubs/GuidesHubPage"));
const ComparisonsHubPage = lazy(() => import("@/pages/hubs/ComparisonsHubPage"));
const MethodsHubPage = lazy(() => import("@/pages/hubs/MethodsHubPage"));
const JurisdictionsHubPage = lazy(() => import("@/pages/hubs/JurisdictionsHubPage"));
const AttorneysHubPage = lazy(() => import("@/pages/hubs/AttorneysHubPage"));
const Review = lazy(() => import("@/pages/Review"));
const Agreement = lazy(() => import("@/pages/Agreement"));

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
        <Route path="/forms" element={<Forms />} />
        <Route path="/phq-form-english" element={<PatientFormPage formId="phq-english" />} />
        <Route path="/phq-form-spanish" element={<PatientFormPage formId="phq-spanish" />} />
        <Route path="/hipaa-english" element={<PatientFormPage formId="hipaa-english" />} />
        <Route path="/hipaa-spanish" element={<PatientFormPage formId="hipaa-spanish" />} />
        <Route path="/services" element={<ServicesHub />} />
        <Route path="/services/:serviceSlug" element={<ServicePillar />} />

        {/* Expert Disclosure pillar + per-state. Declared BEFORE the wildcard /services/:serviceSlug/:stateSlug so they take precedence. */}
        <Route path="/services/expert-disclosure" element={<ExpertDisclosurePillar />} />
        <Route path="/services/expert-disclosure/:stateSlug" element={<ExpertDisclosureState />} />

        {/* Legacy /services/affidavit-report and /services/short-form-report
            URLs are 301-redirected to /services in server.js (product retired). */}
        {/* Public intake is ONE unified form (spec 2026-07-16): the case-type
            dropdown routes to standard/matrimonial/wpec server-side. The old
            PI + Matrimonial direct routes 301 to this one in server.js. */}
        <Route path="/contact/intake" element={<RetainerIntake slug="unified" />} />
        {/* Unlisted direct-link retainer forms for Non-Metro + Consulting clients:
            noindex + not in the nav/sitemap (via CLIENT_ONLY_ROUTES in server.js). */}
        <Route path="/contact/nonmetro-intake" element={<RetainerIntake slug="nonmetro" />} />
        <Route path="/contact/consulting-intake" element={<RetainerIntake slug="consulting" />} />
        {/* Short shared link for the Non-Metro intake form (kwvrs.com/nm). */}
        <Route path="/nm" element={<RetainerIntake slug="nonmetro" />} />

        {/* Standalone intake chooser (both forms). Indexed + in the sitemap. */}
        <Route path="/intake" element={<Intake />} />
        {/* Unlisted document libraries: noindex + slug-only. Not in the nav or
            sitemap; served with X-Robots-Tag: noindex via CLIENT_ONLY_ROUTES. */}
        <Route path="/samples" element={<SampleReports />} />
        <Route path="/cv" element={<ExpertCVs />} />
        {/* Unlisted Zelle payment page: noindex + link-only. Not in the nav or
            sitemap; served with X-Robots-Tag: noindex via CLIENT_ONLY_ROUTES. */}
        <Route path="/payment" element={<Payment />} />
        {/* Unlisted conference QR raffle page: noindex + link-only, reached only
            from a printed QR code (?event=<slug>). Not in the nav or sitemap;
            served with X-Robots-Tag: noindex via CLIENT_ONLY_ROUTES. */}
        <Route path="/raffle" element={<Raffle />} />

        <Route path="/services/:serviceSlug/:stateSlug" element={<ServiceState />} />
        <Route path="/services/:serviceSlug/:stateSlug/:citySlug" element={<ServiceStateCity />} />
        <Route path="/locations" element={<LocationsHub />} />
        <Route path="/locations/:stateSlug" element={<StateHub />} />
        <Route path="/locations/:stateSlug/:citySlug" element={<CityPage />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/economic-damages-estimator" element={<DamagesEstimator />} />
        <Route path="/tools/life-expectancy" element={<LifeExpectancy />} />
        {/* Public, indexed valuator: prerendered + in the sitemap (NOT in server.js
            CLIENT_ONLY_ROUTES). Served as a static 200 with index,follow. */}
        <Route path="/tools/household-services" element={<HouseholdServicesValuator />} />
        <Route path="/tools/household-services/methodology" element={<HouseholdServicesMethodology />} />
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
        <Route path="/attorneys" element={<AttorneysHubPage />} />
        {/* Internal content-audit/QA dashboard - dev only. Never mounted in the
            production build, so it isn't reachable on the live site. */}
        {import.meta.env.DEV && <Route path="/review" element={<Review />} />}
        <Route path="/agreements/:slug" element={<Agreement />} />

        {/* New landing-page templates */}
        <Route path="/guides/:slug" element={<PillarGuide />} />
        <Route path="/compare/:slug" element={<Comparison />} />
        <Route path="/case-types/:slug" element={<CaseTypeHub />} />
        <Route path="/case-types/:typeSlug/:stateSlug" element={<CaseTypeState />} />
        <Route path="/services/:serviceSlug/case/:typeSlug" element={<ServiceCaseType />} />
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
