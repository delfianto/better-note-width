import { type App, PluginSettingTab, Setting, type TextComponent } from "obsidian";
import { type FullWidthRule, type WidthUnit } from "./settings";
import { type default as BetterNoteWidthPlugin } from "./main";

const UNIT_DEFAULTS: Record<WidthUnit, number> = {
  ch: 80,
  px: 700,
  "%": 70,
};

export class BetterNoteWidthSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: BetterNoteWidthPlugin,
  ) {
    super(app, plugin);
  }

  override display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Readable line length").setHeading();

    new Setting(containerEl)
      .setName("Global width")
      .setDesc("The readable width used by every Markdown note that does not match a rule.")
      .addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.min = "1";
        text.setValue(String(this.plugin.pluginSettings.width)).onChange(async (value) => {
          const width = Number(value);
          if (!Number.isFinite(width) || width <= 0) return;
          await this.plugin.updateSettings({ width });
        });
      })
      .addDropdown((dropdown) => {
        dropdown
          .addOption("ch", "characters (ch)")
          .addOption("px", "pixels (px)")
          .addOption("%", "percent (%)")
          .setValue(this.plugin.pluginSettings.unit)
          .onChange(async (value) => {
            const unit = value as WidthUnit;
            await this.plugin.updateSettings({ unit, width: UNIT_DEFAULTS[unit] });
            this.display();
          });
      });

    new Setting(containerEl).setName("Full-width rules").setHeading();
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Rules are regular expressions matched against the full vault-relative path. Matching notes use the full editor width. Expressions omit surrounding / characters.",
    });

    new Setting(containerEl)
      .setName("Case-sensitive matching")
      .setDesc("When off, README.md and readme.md are treated alike.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.pluginSettings.caseSensitive)
          .onChange(async (caseSensitive) => {
            await this.plugin.updateSettings({ caseSensitive });
            this.display();
          });
      });

    this.plugin.pluginSettings.fullWidthRules.forEach((rule, index) => {
      this.addRuleSetting(containerEl, rule, index);
    });

    new Setting(containerEl)
      .setName("Add another exception")
      .setDesc("Add a named regular expression for notes that should use the full pane width.")
      .addButton((button) => {
        button
          .setButtonText("Add rule")
          .setCta()
          .onClick(async () => {
            const rules = [
              ...this.plugin.pluginSettings.fullWidthRules,
              { name: "New rule", pattern: "" },
            ];
            await this.plugin.updateSettings({ fullWidthRules: rules });
            this.display();
          });
      });
  }

  private addRuleSetting(container: HTMLElement, rule: FullWidthRule, index: number): void {
    const setting = new Setting(container).setName(rule.name || `Rule ${index + 1}`);
    let patternInput: TextComponent;

    setting
      .addText((text) => {
        text
          .setPlaceholder("Rule name")
          .setValue(rule.name)
          .onChange(async (name) => {
            await this.updateRule(index, { name });
            setting.setName(name || `Rule ${index + 1}`);
          });
      })
      .addText((text) => {
        patternInput = text;
        text
          .setPlaceholder(String.raw`(^|/)README\.md$`)
          .setValue(rule.pattern)
          .onChange(async (pattern) => {
            await this.updateRule(index, { pattern });
            this.markPatternValidity(patternInput, pattern);
          });
      })
      .addExtraButton((button) => {
        button
          .setIcon("trash")
          .setTooltip(`Remove ${rule.name || "rule"}`)
          .onClick(async () => {
            const rules = this.plugin.pluginSettings.fullWidthRules.filter(
              (_, ruleIndex) => ruleIndex !== index,
            );
            await this.plugin.updateSettings({ fullWidthRules: rules });
            this.display();
          });
      });

    this.markPatternValidity(patternInput!, rule.pattern);
  }

  private markPatternValidity(input: TextComponent, pattern: string): void {
    const invalid = this.plugin.widthManager.getInvalidRulePatterns().has(pattern);
    input.inputEl.classList.toggle("better-note-width-invalid-pattern", invalid);
    input.inputEl.setAttribute("aria-invalid", String(invalid));
    input.inputEl.setAttribute(
      "title",
      invalid ? "Invalid regular expression; this rule is ignored" : "",
    );
  }

  private async updateRule(index: number, changes: Partial<FullWidthRule>): Promise<void> {
    const rules = this.plugin.pluginSettings.fullWidthRules.map((current, ruleIndex) =>
      ruleIndex === index ? { ...current, ...changes } : current,
    );
    await this.plugin.updateSettings({ fullWidthRules: rules });
  }
}
