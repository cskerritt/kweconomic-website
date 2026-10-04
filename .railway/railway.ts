// Railway Infrastructure as Code for the kweconomics.com website: the one service this
// repository deploys ("kweconomic-website" in the Railway project "KWVRS Website"), declared
// as the named partial "kweconomic-website" so this file owns only that service. The project's
// other services (kwvrs-site, workflow-kwvrs-site, documenso-web, kwlcp-website, kalshi-agent),
// its Postgres database and that database's volume belong to other repositories or the
// dashboard and are never declared here: a named partial leaves everything it does not
// declare alone.
//
// This file replaces the deprecated railway.json (Config as Code), which Railway stops reading
// on 2026-12-01. Every value below is what the service runs with today: the railway.json
// settings (builder, Dockerfile path, healthcheck path and timeout) plus the stored settings
// railway.json never set (source, replicas, domains, variables), exactly as `railway config
// pull` rendered them. Railway does not read .railway/ during deploys; the Railway CLI
// evaluates it: `railway config plan` previews the diff against the live environment and
// `railway config apply` makes the environment match after confirmation.
//
// Variables: every variable the service has is listed as preserve(), which means "keep the
// value already set in Railway". No value lives in this repository, an apply never rewrites
// one, and a variable missing from this list would be proposed for DELETION by the next plan,
// so a new variable is added here as preserve() too.
import { defineRailway, github, preserve, project, service } from "railway/iac";

export const partial = "kweconomic-website";

export default defineRailway(() => {
  const kweconomicWebsite = service("kweconomic-website", {
    // Deploys from this repository's main branch; the trigger does not wait for GitHub
    // check suites (stored setting, as pulled).
    source: github("cskerritt/kweconomic-website", { checkSuites: false }),
    // From railway.json: build with the root Dockerfile. The stored builder was Railpack,
    // which railway.json overrode on every deploy.
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    // From railway.json: server.js answers GET /healthz; Railway waits up to 100 s for it.
    healthcheck: "/healthz",
    healthcheckTimeout: 100,
    // Restart on failure with up to 10 retries (railway.json's value) is Railway's default.
    // Railway reports a default as unset, so declaring it would leave every plan showing the
    // same change; it is deliberately not declared.
    replicas: { "sfo": 1 },
    domains: ["kweconomics.com", "www.kweconomics.com"],
    env: {
      CANONICAL_HOST: preserve(),
      LEAD_FROM: preserve(),
      LEAD_RECIPIENTS: preserve(),
      RESEND_API_KEY: preserve(),
    },
  });

  return project("KWVRS Website", {
    resources: [kweconomicWebsite],
  });
});
