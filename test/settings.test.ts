import { DEFAULT_SETTINGS, normalizeSettings, widthToCss } from "src/settings";

describe("settings", () => {
  it("creates independent defaults for missing data", () => {
    const first = normalizeSettings(null);
    first.fullWidthRules[0]!.name = "Changed";

    expect(normalizeSettings(undefined).fullWidthRules[0]!.name).toBe("Claude instructions");
  });

  it("keeps valid stored values and filters malformed rules", () => {
    const settings = normalizeSettings({
      width: 900,
      unit: "px",
      caseSensitive: true,
      fullWidthRules: [
        { name: "Canvas", pattern: "\\.canvas$" },
        { name: 42, pattern: "invalid" },
      ],
    });

    expect(settings).toEqual({
      width: 900,
      unit: "px",
      caseSensitive: true,
      fullWidthRules: [{ name: "Canvas", pattern: "\\.canvas$" }],
    });
  });

  it("falls back when stored primitives are invalid", () => {
    const settings = normalizeSettings({ width: Number.NaN, unit: "em" });
    expect(settings.width).toBe(DEFAULT_SETTINGS.width);
    expect(settings.unit).toBe(DEFAULT_SETTINGS.unit);
  });

  it("renders width values as CSS", () => {
    expect(widthToCss({ width: 72, unit: "ch" })).toBe("72ch");
    expect(widthToCss({ width: 65, unit: "%" })).toBe("65%");
  });
});
