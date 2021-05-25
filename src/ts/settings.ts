import { makeNewConfig, UserConfig } from "./config";
import { ipcRenderer } from "electron";
import { existsSync } from "fs";

class SettingsMenu {
  set config(value) {
    this._config = value;
  }
  get config() {
    return this._config;
  }

  get folderElement(): HTMLInputElement {
    return this._folderElement;
  }

  get saveBtn(): HTMLButtonElement {
    return this._saveBtn;
  }

  get selectBtn(): HTMLLabelElement {
    return this._selectBtn;
  }
  private _config: UserConfig;
  private readonly _folderElement: HTMLInputElement;
  private readonly _saveBtn: HTMLButtonElement;
  private readonly _selectBtn: HTMLLabelElement;
  constructor() {
    this._folderElement = <HTMLInputElement>(
      document.getElementById("save-folder")
    );
    this._saveBtn = <HTMLButtonElement>document.getElementById("save-btn");
    this._selectBtn = <HTMLLabelElement>(
      document.getElementById("save-folder-label")
    ); // makes the label the button
  }

  public initialize = async () => {
    this._config = await makeNewConfig();
    this.folderElement.value = this.config?.savePath;

    this.selectBtn.addEventListener("click", async (_) => {
      const result: Electron.OpenDialogReturnValue = await ipcRenderer.invoke(
        "showOpenDialog"
      );
      if (result.canceled) return;
      let path: string = result.filePaths[0];
      this.folderElement.value = path;
      this.config.savePath = path;
    });

    this.saveBtn.addEventListener("click", (_) => {
      let newPath = this.folderElement.value;
      if (existsSync(newPath)) this.config.savePath = newPath;
    });
    return this;
  };
}

new SettingsMenu().initialize();
