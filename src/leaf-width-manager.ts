import { type BetterNoteWidthSettings, widthToCss } from "./settings";
import { type CompiledRules, compileRules, matchingRule } from "./rule-matcher";
import { MarkdownView, type Workspace } from "obsidian";

const READABLE_CLASS = "better-note-width-readable";
const FULL_WIDTH_CLASS = "better-note-width-full";
const RULE_ATTRIBUTE = "betterNoteWidthRule";

export class LeafWidthManager {
  private compiledRules: CompiledRules = { valid: [], invalid: [] };

  constructor(
    private readonly workspace: Workspace,
    private settings: BetterNoteWidthSettings,
  ) {
    this.compile();
  }

  updateSettings(settings: BetterNoteWidthSettings): void {
    this.settings = settings;
    this.compile();
    this.applyAll();
  }

  applyAll(): void {
    this.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (!(leaf.view instanceof MarkdownView)) return;

      const container = leaf.view.containerEl;
      const { file } = leaf.view;
      if (!file) {
        this.clearContainer(container);
        return;
      }

      const rule = matchingRule(file.path, this.compiledRules.valid);
      container.classList.toggle(FULL_WIDTH_CLASS, rule !== null);
      container.classList.toggle(READABLE_CLASS, rule === null);
      container.style.setProperty(
        "--file-line-width",
        rule ? "100%" : widthToCss(this.settings),
        "important",
      );

      if (rule) container.dataset[RULE_ATTRIBUTE] = rule.name;
      else delete container.dataset[RULE_ATTRIBUTE];
    });
  }

  clearAll(): void {
    this.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof MarkdownView) this.clearContainer(leaf.view.containerEl);
    });
  }

  getInvalidRulePatterns(): Set<string> {
    return new Set(this.compiledRules.invalid.map((rule) => rule.pattern));
  }

  private compile(): void {
    this.compiledRules = compileRules(this.settings.fullWidthRules, this.settings.caseSensitive);
  }

  private clearContainer(container: HTMLElement): void {
    container.classList.remove(READABLE_CLASS, FULL_WIDTH_CLASS);
    container.style.removeProperty("--file-line-width");
    delete container.dataset[RULE_ATTRIBUTE];
  }
}
