import {makeNewConfig, UserConfig} from "./config";
import * as ytdl from "ytdl-core";
import {YouTubeVideo} from "./video";
import {AudioFile} from "./audiofile";

/**
 * Removes extra parameters after the watch ID in a YouTube link. The extra information occasionally causes problems
 * with the downloader module
 * @param url URL to be cleaned
 * @returns {string} Cleaned URL
 */
const cleanYtUrl = (url: string) => {
    return /&/.test(url) ? url.split('&')[0] : url;
}

/**
 * Removes characters deemed illegal for file naming by windows (other OS's do this automatically in my experience)
 * @param filename File name to check
 * @returns {string} Cleaned name
 */
const removeIllegalChars = (filename: string) => {
    return /[\\/:*?"<>|]/g.test(filename) ? filename.replace(/[\\/:*?"<>|]/g, "") : filename;
}

/**
 * Connects all the parts to download a file from the given YouTube link
 * @param url YouTube video to download
 * @returns {Promise<AudioFile>} The downloaded AudioFile if resolved, the error if otherwise
 */
const download = async (url: string) => {
    return await new Promise<AudioFile>(async (resolve, reject) => {
        const config = await makeNewConfig().then(config => config).catch(err => {
            reject(err);
        });

        await ytdl.getBasicInfo(cleanYtUrl(url)).then(info => {
            const video = new YouTubeVideo(info.videoDetails.video_url);
            let fileName: string = removeIllegalChars((<HTMLInputElement>document.getElementById('file-name')).value.trim());
            if (fileName.length === 0) {
                fileName = info.videoDetails.title;
            }
            if (!(fileName.endsWith('.mp3') || fileName.endsWith('.wav'))) {
                fileName += '.mp3'; // Append an extension if one isn't given (it's not meant to be)
            }
            if (config instanceof UserConfig) {
                video.save(config.savePath, fileName)
                    .then((file: AudioFile) => resolve(file))
                    .catch(err => reject(err));
            }
        }).catch(err => {
            // TODO: if ENOTFOUND in message, check internet connection
            reject(err);
        });
    });
}

(() => {
    document.getElementById('download-btn').addEventListener('click', ev => {
        download((<HTMLInputElement>document.getElementById('url')).value);
    });
})();
