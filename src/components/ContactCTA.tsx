import { Link } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, telHref } from "@/lib/brand";

interface ContactCTAProps { context?: string; }

export default function ContactCTA({ context }: ContactCTAProps) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 text-white">
      <div className="relative z-10">
        <h3 className="font-serif text-2xl font-semibold mb-2">Ready to Get Started{context ? ` on ${context}` : ""}?</h3>
        <p className="text-neutral-300 mb-6">Contact our team to discuss how {ORG_NAME} can support your case with independent economic damages analysis.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/contact" className="group kw-press rounded-lg min-h-11 bg-amber-dark text-white font-semibold hover:bg-amber-darker active:bg-amber-darker inline-flex items-center justify-center gap-2 px-6 py-3 text-balance leading-snug">
            Request a Consultation <ArrowRight className="w-4 h-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
          <a href={telHref(ORG_PHONE)} className="kw-press rounded-lg min-h-11 border border-white/30 text-white hover:bg-white/10 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 text-balance leading-snug">
            <Phone className="w-4 h-4" />{ORG_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
}
