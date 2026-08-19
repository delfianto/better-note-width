export type WidthUnit = "ch" | "px" | "%";

export interface FullWidthRule {
  name: string;
  pattern: string;
}

export interface BetterNoteWidthSettings {
  width: number;
  unit: WidthUnit;
  caseSensitive: boolean;
  fullWidthRules: FullWidthRule[];
}

export const DEFAULT_SETTINGS: BetterNoteWidthSettings = {
  width: 80,
  unit: "ch",
  caseSensitive: false,
  fullWidthRules: [
    { name: "Claude instructions", pattern: "(^|/)CLAUDE\\.md$" },
    { name: "Agent instructions", pattern: "(^|/)AGENTS\\.md$" },
    { name: "README files", pattern: "(^|/)README\\.md$" },
  ],
};

const VALID_UNITS = new Set<WidthUnit>(["ch", "px", "%"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRules(value: unknown): FullWidthRule[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.fullWidthRules.map((rule) => ({ ...rule }));

  return value.flatMap((rule) => {
    if (!isRecord(rule) || typeof rule.name !== "string" || typeof rule.pattern !== "string") {
      return [];
    }
    return [{ name: rule.name, pattern: rule.pattern }];
  });
}

export function normalizeSettings(value: unknown): BetterNoteWidthSettings {
  if (!isRecord(value)) {
    return {
      ...DEFAULT_SETTINGS,
      fullWidthRules: DEFAULT_SETTINGS.fullWidthRules.map((rule) => ({ ...rule })),
    };
  }

  const width =
    typeof value.width === "number" && Number.isFinite(value.width)
      ? value.width
      : DEFAULT_SETTINGS.width;
  const unit =
    typeof value.unit === "string" && VALID_UNITS.has(value.unit as WidthUnit)
      ? (value.unit as WidthUnit)
      : DEFAULT_SETTINGS.unit;

  return {
    width,
    unit,
    caseSensitive:
      typeof value.caseSensitive === "boolean"
        ? value.caseSensitive
        : DEFAULT_SETTINGS.caseSensitive,
    fullWidthRules: normalizeRules(value.fullWidthRules),
  };
}

export function widthToCss(settings: Pick<BetterNoteWidthSettings, "unit" | "width">): string {
  return `${settings.width}${settings.unit}`;
}
