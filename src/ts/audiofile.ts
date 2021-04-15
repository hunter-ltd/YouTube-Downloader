import {join} from "path";
import {shell} from "electron";

/**
 * Represents an audio file
 */
export class AudioFile {
    get filePath(): string {
        return this._filePath;
    }
    private readonly _filePath: string;

    /**
     * Creates a new AudioFile object
     * @param savePath Either the full path to the file or its parent directory
     * @param fileName Optional filename (if it's not provided it will be assumed to be in savePath)
     */
    constructor(savePath: string, fileName?: string) {
        this._filePath = fileName === undefined ? savePath : join(savePath, fileName);
    }

    /**
     * Opens the enclosing folder and highlights the file
     */
    public open() {
        shell.showItemInFolder(this.filePath);
    }
}