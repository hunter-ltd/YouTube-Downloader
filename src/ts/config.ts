import * as path from "path";
import * as fs from "fs";
import {ipcRenderer} from "electron";

export class UserConfig {
    private readonly _path: string;
    private readonly _data: Object;
    private _savePath: string;
    get path(): string {
        return this._path;
    }

    get savePath(): string {
        return this._savePath;
    }

    set savePath(path: string) {
        this._savePath = path;
        this._data['savePath'] = path;
        fs.writeFileSync(this.path, JSON.stringify(this._data));
    }

    constructor(path: string) {
        this._path = path;
        this._data = this.parseDataFile();
        this._savePath = this._data['savePath'];
    }

    private parseDataFile = () => {
        try {
            return JSON.parse(fs.readFileSync(this.path).toString());
        } catch (e) {
            return new Promise((resolve, reject) => {
                ipcRenderer.invoke("getPath", "downloads").then(result => {
                    let data: Object = {
                        savePath: result
                    };
                    fs.writeFileSync(this.path, JSON.stringify(data)); // creates and writes to the settings file
                    resolve(data);
                });
            }).then(result => result);
        }
    }
}

/**
 * Factory function that asynchronously creates a new config object
 * @returns {Promise<UserConfig>} A promise resolving with the UserConfig object and rejecting with an error
 */
export async function makeNewConfig(): Promise<UserConfig> {
    return await new Promise<UserConfig>((resolve, reject) => {
        ipcRenderer.invoke("getPath", "userData").then(value => {
            resolve(new UserConfig(path.resolve(value, "userSettings.json")));
        }).catch(err => {
            reject(err);
        });
    });
}
