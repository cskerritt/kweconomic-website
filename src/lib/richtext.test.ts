import { describe, it, expect } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { renderTextWithLinks, isAllowedRoute } from "./richtext";

// Flatten the node array back to its visible text (elements contribute their
// anchor children) so passthrough assertions are easy to read.
function toText(nodes: ReturnType<typeof renderTextWithLinks>): string {
  return nodes
    .map((n) => {
      if (typeof n === "string") return n;
      if (isValidElement(n)) return String((n as ReactElement<{ children?: string }>).props.children ?? "");
      return "";
    })
    .join("");
}

function links(nodes: ReturnType<typeof renderTextWithLinks>): ReactElement<{ to: string; children: string }>[] {
  return nodes.filter(
    (n): n is ReactElement<{ to: string; children: string }> => isValidElement(n) && n.type === Link,
  );
}

describe("renderTextWithLinks - marker parsing", () => {
  it("converts a valid marker into an internal Link with the right route and anchor", () => {
    const nodes = renderTextWithLinks("See our [[/methods/transferable-skills-analysis|TSA method]] for detail.");
    expect(nodes[0]).toBe("See our ");
    const ls = links(nodes);
    expect(ls).toHaveLength(1);
    expect(ls[0].type).toBe(Link);
    expect(ls[0].props.to).toBe("/methods/transferable-skills-analysis");
    expect(ls[0].props.children).toBe("TSA method");
    expect(nodes[nodes.length - 1]).toBe(" for detail.");
  });

  it("handles multiple markers and preserves surrounding text order", () => {
    const nodes = renderTextWithLinks("A [[/guides/x|one]] B [[/methods/y|two]] C");
    expect(links(nodes)).toHaveLength(2);
    expect(links(nodes).map((l) => l.props.to)).toEqual(["/guides/x", "/methods/y"]);
    expect(toText(nodes)).toBe("A one B two C");
  });
});

describe("renderTextWithLinks - rejection of bad routes", () => {
  it("rejects an uppercase/underscore route and keeps the literal marker text", () => {
    const nodes = renderTextWithLinks("bad [[/Bad_Route|x]] end");
    expect(links(nodes)).toHaveLength(0);
    expect(toText(nodes)).toBe("bad [[/Bad_Route|x]] end");
  });

  it("rejects a protocol-relative target (contains a dot) - no link, no external escape", () => {
    const nodes = renderTextWithLinks("[[//evil.com|click]]");
    expect(links(nodes)).toHaveLength(0);
    expect(toText(nodes)).toBe("[[//evil.com|click]]");
  });

  it("does not match a route missing the leading slash", () => {
    const input = "[[methods/x|y]]";
    const nodes = renderTextWithLinks(input);
    expect(links(nodes)).toHaveLength(0);
    expect(nodes).toEqual([input]);
  });

  it("isAllowedRoute enforces the ^/[a-z0-9/-]*$ allow-list", () => {
    expect(isAllowedRoute("/methods/transferable-skills-analysis")).toBe(true);
    expect(isAllowedRoute("/")).toBe(true);
    expect(isAllowedRoute("/services/life-care-planning/cost")).toBe(true);
    expect(isAllowedRoute("/Bad")).toBe(false);
    expect(isAllowedRoute("/a.b")).toBe(false);
    expect(isAllowedRoute("javascript:alert(1)")).toBe(false);
    expect(isAllowedRoute("//evil.com")).toBe(false);
  });
});

describe("renderTextWithLinks - plain text passthrough", () => {
  it("returns plain text unchanged when there are no markers", () => {
    const nodes = renderTextWithLinks("Just an objective sentence with no links.");
    expect(nodes).toEqual(["Just an objective sentence with no links."]);
    expect(links(nodes)).toHaveLength(0);
  });

  it("passes an empty string through without throwing", () => {
    expect(renderTextWithLinks("")).toEqual([""]);
  });
});
