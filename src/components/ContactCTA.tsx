import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";
import { useMagnetic } from "@/hooks/use-pointer-fx";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, telHref } from "@/lib/brand";

interface ContactCTAProps { context?: string; }

export default function ContactCTA({ context }: ContactCTAProps) {
  const magnet = useMagnetic<HTMLAnchorElement>(0.25);
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-r from-navy to-navy-light rounded-xl p-8 text-white">
      <div className="kw-aurora opacity-60" aria-hidden="true" />
      <div className="relative z-10">
        <h3 className="font-serif text-2xl font-bold mb-2">Ready to Get Started{context ? ` on ${context}` : ""}?</h3>
        <p className="text-neutral-300 mb-6">Contact our team to discuss how {ORG_NAME} can support your case with independent economic damages analysis.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link ref={magnet} to="/contact" className="kw-magnetic group inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-teal/20">
            Request a Consultation <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href={telHref(ORG_PHONE)} className="kw-magnetic inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />{ORG_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
