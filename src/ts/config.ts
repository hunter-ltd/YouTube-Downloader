import * as path from "path";
import * as fs from "fs";
import {ipcRenderer} from "electron";

class UserConfig {
    private readonly _path: string;
    private _data: Object;
    get path(): string {
        return this._path;
    }

    /**
     * Factory function that asynchronously creates a new config object
     * @returns {Promise<UserConfig>} A promise resolving with the UserConfig object and rejecting with an error
     */
    public static makeNewConfig: () => Promise<UserConfig> = async () => {
        return await new Promise<UserConfig>((resolve, reject) => {
            ipcRenderer.invoke("configGetApp").then(value => {
                resolve(new UserConfig(path.resolve(value, "userSettings.json")));
            }).catch(err => {
                reject(err);
            });
        });
    }

    constructor(path: string) {
        this._path = path;
        this._data = this.parseDataFile();
    }

    private parseDataFile = () => {
        try {
            return JSON.parse(fs.readFileSync(this.path).toString());
        } catch (e) {
            let data: Object = {
                savePath: this.path
            }
            fs.writeFileSync(this.path, JSON.stringify(data)); // creates and writes to the settings file
            return data
        }
    }
}

module.exports = UserConfig.makeNewConfig;
