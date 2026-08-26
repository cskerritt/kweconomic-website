import { useEffect, useRef } from "react";

// Cloudflare Turnstile widget. Renders nothing when VITE_TURNSTILE_SITE_KEY is
// unset (local dev / pre-key deploy), so the form keeps working until the keys
// land. When set, it loads the CF script once, renders the widget, and reports
// the token up via onToken (cleared on expiry/error).
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
};

function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

interface Props {
  onToken: (token: string) => void;
}

export default function Turnstile({ onToken }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const renderWidget = () => {
      const api = getTurnstile();
      if (cancelled || !api || !ref.current || rendered.current) return;
      rendered.current = true;
      api.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (getTurnstile()) {
      renderWidget();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderWidget);

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderWidget);
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="my-2" />;
}
