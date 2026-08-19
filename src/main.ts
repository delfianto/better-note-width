import "./styles.css";
import { type BetterNoteWidthSettings, normalizeSettings } from "./settings";
import { BetterNoteWidthSettingTab } from "./settings-tab";
import { LeafWidthManager } from "./leaf-width-manager";
import { Plugin } from "obsidian";

export default class BetterNoteWidthPlugin extends Plugin {
  pluginSettings!: BetterNoteWidthSettings;
  widthManager!: LeafWidthManager;

  override async onload(): Promise<void> {
    this.pluginSettings = normalizeSettings(await this.loadData());
    this.widthManager = new LeafWidthManager(this.app.workspace, this.pluginSettings);
    this.addSettingTab(new BetterNoteWidthSettingTab(this.app, this));

    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.applyWidthsSoon()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.applyWidthsSoon()));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.widthManager.applyAll()));
    this.registerEvent(this.app.vault.on("rename", () => this.applyWidthsSoon()));

    this.app.workspace.onLayoutReady(() => this.applyWidthsSoon());
  }

  override onunload(): void {
    this.widthManager.clearAll();
  }

  async updateSettings(changes: Partial<BetterNoteWidthSettings>): Promise<void> {
    this.pluginSettings = normalizeSettings({ ...this.pluginSettings, ...changes });
    await this.saveData(this.pluginSettings);
    this.widthManager.updateSettings(this.pluginSettings);
  }

  private applyWidthsSoon(): void {
    this.widthManager.applyAll();
    globalThis.requestAnimationFrame(() => this.widthManager.applyAll());
  }
}
