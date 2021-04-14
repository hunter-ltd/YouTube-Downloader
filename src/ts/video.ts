import * as ffmpeg from "fluent-ffmpeg";
import {path as ffmpegPath} from "@ffmpeg-installer/ffmpeg";
import * as ytdl from "ytdl-core";

ffmpeg.setFfmpegPath(ffmpegPath);

export class YouTubeVideo {
    private readonly _url: string;
    constructor(url: string) {
        this._url = url;
    }

    public save = async (path: string) => {
        return new Promise(async (resolve, reject) => {
            let stream = ytdl(this._url, {filter: "audioonly"}),
                output = ffmpeg(stream).save(path);
            [stream, output].forEach(item => item.on('error', err => reject(err)));
            output.on('start', () => {
                // set start status
            }).on('end', () => resolve(path)); // resolve with a custom audio file class later on
        });
    }
}