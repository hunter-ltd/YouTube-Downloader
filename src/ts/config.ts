import * as path from "path";
import * as fsAsync from "fs/promises";
import { writeFileSync } from "fs";
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
    writeFileSync(this.path, JSON.stringify(this._data));
  }

  constructor(path: string) {
    this._path = path;
  }

  public async parseDataFile(): Promise<ConfigData> {
    try {
      return JSON.parse(
        (await fsAsync.readFile(this.path)).toString()
      ) as ConfigData;
    } catch (err) {
      const data: ConfigData = {
        savePath: await ipcRenderer.invoke("getPath", "downloads"),
      };
      await fsAsync.writeFile(this.path, JSON.stringify(data));
      return data;
    }
  }
}

/**
 * Factory function that asynchronously creates a new config object
 * @returns {Promise<UserConfig>} A promise resolving with the UserConfig object and rejecting with an error
 */
export async function makeNewConfig(): Promise<UserConfig> {
  const userDataFolder = await ipcRenderer.invoke("getPath", "userData");
  const config = new UserConfig(
    path.resolve(userDataFolder, "sswSettings.json")
  );
  config.data = await config.parseDataFile();
  return config;
}
