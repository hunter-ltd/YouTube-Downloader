import * as ffmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import * as ytdl from "ytdl-core";
import {join} from "path";

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
            let stream = ytdl(this._url, {filter: "audioonly"}),
                output = ffmpeg(stream).save(path);
            [stream, output].forEach(item => item.on('error', err => reject(err)));
            output.on('start', () => {
                // TODO: set start status
                console.log("downloading...")
            }).on('end', () => resolve(path)); // TODO: resolve with a custom audio file class later on
        });
    }
}
