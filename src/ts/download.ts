import { makeNewConfig, UserConfig } from "./config";
import ytdl from "ytdl-core";
import { YouTubeVideo } from "./video";
import { File } from "./audiofile";
import { basename } from "path";

const downloadAudioBtn = <HTMLButtonElement>(
  document.getElementById("download-btn-audio")
);
const downloadVideoBtn = <HTMLButtonElement>(
  document.getElementById("download-btn-video")
);
const progressBar = document.getElementById("progress-bar");

/**
 * Update the status element in the GUI
 * @param message Status message
 * @param color Optional text color (defaults to gray)
 */
export const updateProgressBar = (
  message: string,
  color: string = "gray",
  width: number = 100
) => {
  progressBar.style.backgroundColor = color;
  progressBar.innerHTML = message;
  progressBar.style.width = width + "%";
};

/**
 * Removes extra parameters after the watch ID in a YouTube link. The extra information occasionally causes problems
 * with the downloader module
 * @param url URL to be cleaned
 * @returns {string} Cleaned URL
 */
const cleanYtUrl = (url: string) => {
  return /&/.test(url) ? url.split("&")[0] : url;
};

/**
 * Removes characters deemed illegal for file naming by windows (other OS's do this automatically in my experience)
 * @param filename File name to check
 * @returns {string} Cleaned name
 */
const removeIllegalChars = (filename: string) => {
  return /[\\/:*?"<>|]/g.test(filename)
    ? filename.replace(/[\\/:*?"<>|]/g, "")
    : filename;
};

/**
 * Connects all the parts to download a file from the given YouTube link
 * @param video Wether or not to include video
 * @param url YouTube video to download
 * @param fileName Name to save the file as
 * @returns {Promise<File>} The downloaded File object if resolved, the error if otherwise
 */
const download = async (
  includeVideo: boolean,
  url: string,
  fileName: string
): Promise<File> => {
  return await new Promise<File>(async (resolve, reject) => {
    const config = await makeNewConfig()
      .then((config) => config)
      .catch((err) => {
        reject(err);
      });

    updateProgressBar("Retrieving video info...");

    await ytdl
      .getBasicInfo(cleanYtUrl(url))
      .then((info) => {
        const video = new YouTubeVideo(info.videoDetails.video_url);
        fileName = removeIllegalChars(fileName);
        if (fileName.length === 0) {
          fileName = info.videoDetails.title;
        }
        if (!(fileName.endsWith(".mp3") || fileName.endsWith(".wav"))) {
          fileName += ".mp3"; // Append an extension if one isn't given (it's not meant to be)
        }
        if (config instanceof UserConfig) {
          video
            .save(includeVideo, config.savePath, fileName)
            .then((file: File) => resolve(file))
            .catch((err) => reject(err));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

(() => {
  [downloadAudioBtn, downloadVideoBtn].forEach((button) => {
    button.addEventListener("click", (event) => {
      download(
        (<HTMLElement>event.target).id.includes("video"),
        (<HTMLInputElement>document.getElementById("url")).value.trim(),
        (<HTMLInputElement>document.getElementById("file-name")).value.trim()
      )
        .then((file) => {
          updateProgressBar(
            `${basename(file.filePath)} saved successfully`,
            "#00c210"
          );
          file.open();
        })
        .catch((err) => {
          console.error(err);
          let errorMessage: string = /ENOTFOUND/.test(err.message)
            ? "Error: Invalid URL. Check your internet connection"
            : "Error: " + err.message;
          updateProgressBar(errorMessage, "#e01400");
        });
    });
  });

  // Enter key downloads file
  [
    document.getElementById("url"),
    document.getElementById("file-name"),
  ].forEach((element) => {
    element.addEventListener("keyup", (ev) => {
      ev.preventDefault();
      if (ev.key === "Enter") downloadAudioBtn.click();
    });
  });
})();
