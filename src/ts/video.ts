import * as ffmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import * as ytdl from "ytdl-core";
import {join} from "path";
import {AudioFile} from "./audiofile";

ffmpeg.setFfmpegPath(ffmpegPath);

export class YouTubeVideo {
    private readonly _url: string;
    constructor(url: string) {
        this._url = url;
    }

    /**
     * Downloads and saves the video from YouTube
     * @param path Where to save the video
     * @param fileName Optional file name (otherwise assumed to be included in path)
     */
    public save = async (path: string, fileName?: string) => {
        path = fileName === undefined ? path : join(path, fileName);
        return new Promise(async (resolve, reject) => {
            let stream = ytdl(this._url, {filter: "audioonly"})
                .on('error', err => reject(err))
                .on('progress', (_, current, total) => {
                    document.getElementById('status').innerHTML = `${Math.round(100 * (current / total))} % downloaded`
                })
                ffmpeg(stream)
                    .on('start', () => {
                    console.log(`ffmpeg started: ${this._url} >> ${path}`);
                })
                    .on('end', () => resolve(new AudioFile(path)))
                    .on('error', err => reject(err))
                    .save(path);
        });
    }
}
