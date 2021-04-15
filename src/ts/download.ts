import {makeNewConfig, UserConfig} from "./config";
import * as ytdl from "ytdl-core";
import {YouTubeVideo} from "./video";

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

const download = async (url: string) => {
    return await new Promise(async (resolve, reject) => {
        const config = await makeNewConfig().then(config => config).catch(err => {
            reject(err);
        });

        await ytdl.getBasicInfo(cleanYtUrl(url)).then(info => {
            const video = new YouTubeVideo(info.videoDetails.video_url);
            let fileName: string = (<HTMLInputElement>document.getElementById('file-name')).value.trim();
            if (fileName.length === 0) {
                fileName = info.videoDetails.title;
            }
            fileName += ".mp3"; // Appends the file extension after it is cleaned and fully set
            if (config instanceof UserConfig) {
                video.save(config.savePath, fileName).then(file => {
                    // later on this will be an AudioFile class
                    console.log("done!");
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            }
        });
    });
}
