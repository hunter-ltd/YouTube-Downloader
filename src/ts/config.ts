import * as path from "path";
import * as fs from "fs";
import { ipcRenderer } from "electron";

interface ConfigData {
  savePath: string;
}

export class UserConfig {
  private readonly _path: string;
  private _data: ConfigData;
  private _savePath: string;

  set data(value: ConfigData) {
    this._data = value;
    this._savePath = value["savePath"];
  }

  get path(): string {
    return this._path;
  }

  get savePath(): string {
    return this._savePath;
  }

  set savePath(path: string) {
    this._savePath = path;
    this._data["savePath"] = path;
    fs.writeFileSync(this.path, JSON.stringify(this._data));
  }

  constructor(path: string) {
    this._path = path;
  }

  public parseDataFile = () => {
    return new Promise<ConfigData>((resolve, _) => {
      try {
        resolve(JSON.parse(fs.readFileSync(this.path).toString()));
      } catch (e) {
        ipcRenderer.invoke("getPath", "downloads").then((result) => {
          let data: ConfigData = {
            savePath: result,
          };
          fs.writeFileSync(this.path, JSON.stringify(data)); // creates and writes to the settings file
          resolve(data);
        });
      }
    });
  };
}

/**
 * Factory function that asynchronously creates a new config object
 * @returns {Promise<UserConfig>} A promise resolving with the UserConfig object and rejecting with an error
 */
export async function makeNewConfig(): Promise<UserConfig> {
  return new Promise<UserConfig>((resolve, reject) => {
    ipcRenderer
      .invoke("getPath", "userData")
      .then(async (value: string) => {
        let config = new UserConfig(path.resolve(value, "userSettings.json"));
        await config.parseDataFile().then((value) => {
          config.data = value;
          resolve(config);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
