import { Link } from "react-router-dom";

/**
 * The one-line privacy notice printed at every public form, beside the submit
 * button. A statement of use with a link to the policy - deliberately not
 * "by submitting you agree" wording, and no checkbox.
 */
export default function PrivacyNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-neutral-500 ${className}`.trim()}>
      We use this information to respond to your request. See our{" "}
      <Link to="/privacy" className="underline hover:text-teal transition-colors">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
