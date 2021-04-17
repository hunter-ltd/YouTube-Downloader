import {makeNewConfig} from "./config";
import {ipcRenderer} from "electron";
import {existsSync} from "fs";

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
    private _config;
    private readonly _folderElement: HTMLInputElement;
    private readonly _saveBtn: HTMLButtonElement;
    private readonly _selectBtn: HTMLLabelElement;
    constructor() {
        this._folderElement = <HTMLInputElement>document.getElementById('save-folder');
        this._saveBtn = <HTMLButtonElement>document.getElementById('save-btn');
        this._selectBtn = <HTMLLabelElement>document.getElementById('save-folder-label'); // makes the label the button
    }

    public initialize = async () => {
        await makeNewConfig().then(config => {
            this._config = config;
            this.folderElement.value = this.config.savePath;
        });

        this.selectBtn.addEventListener('click', ev => {
            ipcRenderer.invoke("showOpenDialog").then(async (result: Electron.OpenDialogReturnValue) => {
                // While the function being called in main.ts technically returns a promise, it automatically resolves
                // with the resulting object
                if (!result.canceled) {
                    let path: string = result.filePaths[0];
                    this.folderElement.value = path;
                    this.config.savePath = path;
                }
            });
        });

        this.saveBtn.addEventListener('click', ev => {
            let newPath = this.folderElement.value;
            if (existsSync(newPath)) this.config.savePath = newPath;
        })
        return this;
    }
}

new SettingsMenu().initialize();
