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
        const progressBar = document.getElementById('progress-bar');
        return new Promise<AudioFile>(async (resolve, reject) => {
            let stream = ytdl(this._url, {filter: "audioonly"})
                .on('error', err => reject(err))
                .on('progress', (_, current, total) => {
                    let percentComplete = Math.round(100 * (current / total));
                    document.getElementById('status').innerHTML = "";
                    progressBar.style.width = percentComplete + "%";
                    progressBar.innerHTML = percentComplete + "%"
                })

            // TODO: progress bar change to green on finish (do away with old text-based status indicator)

                ffmpeg(stream)
                    .on('start', () => {
                    console.log(`ffmpeg started: ${this._url} >> ${path}`);
                })
                    .on('end', () => resolve(new AudioFile(path)))
                    .on('error', (err: Error) => reject(err))
                    .save(path);
        });
    }
}
