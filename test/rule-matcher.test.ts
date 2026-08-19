import { compileRules, matchingRule } from "src/rule-matcher";

describe("full-width rule matching", () => {
  const rules = [
    { name: "Readmes", pattern: "(^|/)README\\.md$" },
    { name: "Agent files", pattern: "(^|/)(CLAUDE|AGENTS)\\.md$" },
  ];

  it("matches file names at the root and in folders", () => {
    const compiled = compileRules(rules, false);

    expect(matchingRule("README.md", compiled.valid)?.name).toBe("Readmes");
    expect(matchingRule("docs/README.md", compiled.valid)?.name).toBe("Readmes");
    expect(matchingRule("notes/AGENTS.md", compiled.valid)?.name).toBe("Agent files");
  });

  it("does not match suffixes or similar names", () => {
    const compiled = compileRules(rules, false);

    expect(matchingRule("README.md.bak", compiled.valid)).toBeNull();
    expect(matchingRule("MYREADME.md", compiled.valid)).toBeNull();
  });

  it("normalizes Windows-style path separators", () => {
    const compiled = compileRules(rules, false);
    expect(matchingRule(String.raw`docs\README.md`, compiled.valid)?.name).toBe("Readmes");
  });

  it("supports case-sensitive and case-insensitive matching", () => {
    expect(matchingRule("readme.md", compileRules(rules, false).valid)).not.toBeNull();
    expect(matchingRule("readme.md", compileRules(rules, true).valid)).toBeNull();
  });

  it("reports malformed expressions without disabling valid rules", () => {
    const compiled = compileRules([...rules, { name: "Broken", pattern: "[" }], false);

    expect(compiled.valid).toHaveLength(2);
    expect(compiled.invalid).toHaveLength(1);
    expect(compiled.invalid[0]?.name).toBe("Broken");
  });

  it("treats an empty pattern as invalid so a new rule cannot match everything", () => {
    const compiled = compileRules([{ name: "New rule", pattern: "" }], false);
    expect(compiled.valid).toHaveLength(0);
    expect(compiled.invalid[0]?.message).toBe("Pattern cannot be empty");
  });
});
