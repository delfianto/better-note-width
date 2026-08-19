import { type FullWidthRule } from "./settings";

export interface CompiledRule {
  name: string;
  pattern: string;
  regex: RegExp;
}

export interface InvalidRule {
  name: string;
  pattern: string;
  message: string;
}

export interface CompiledRules {
  valid: CompiledRule[];
  invalid: InvalidRule[];
}

export function compileRules(rules: FullWidthRule[], caseSensitive: boolean): CompiledRules {
  const valid: CompiledRule[] = [];
  const invalid: InvalidRule[] = [];
  const flags = caseSensitive ? "" : "i";

  for (const rule of rules) {
    if (rule.pattern.length === 0) {
      invalid.push({ ...rule, message: "Pattern cannot be empty" });
      continue;
    }

    try {
      valid.push({ ...rule, regex: new RegExp(rule.pattern, flags) });
    } catch (error) {
      invalid.push({
        ...rule,
        message: error instanceof Error ? error.message : "Invalid regular expression",
      });
    }
  }

  return { valid, invalid };
}

export function matchingRule(path: string, rules: CompiledRule[]): CompiledRule | null {
  const normalizedPath = path.replaceAll("\\", "/");
  return rules.find((rule) => rule.regex.test(normalizedPath)) ?? null;
}
