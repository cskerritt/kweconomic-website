import { Link } from "react-router-dom";
import { INTAKE_DISCLOSURE, INTAKE_POLICY_LINK_TEXT } from "@/data/intake";

/**
 * The intake note under the contact and consultation forms (src/data/intake.ts),
 * with its closing "Privacy Policy" rendered as a link to /privacy. The text is
 * the shared string, unchanged, so the forms, the shells, and the tests agree.
 */
export default function IntakeDisclosure() {
  const at = INTAKE_DISCLOSURE.lastIndexOf(INTAKE_POLICY_LINK_TEXT);
  if (at < 0) return <>{INTAKE_DISCLOSURE}</>;
  return (
    <>
      {INTAKE_DISCLOSURE.slice(0, at)}
      <Link to="/privacy" className="underline hover:text-teal transition-colors">
        {INTAKE_POLICY_LINK_TEXT}
      </Link>
      {INTAKE_DISCLOSURE.slice(at + INTAKE_POLICY_LINK_TEXT.length)}
    </>
  );
}
