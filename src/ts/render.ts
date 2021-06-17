import { makeNewConfig } from "./config";
import ytdl from "ytdl-core";
import { YouTubeVideo } from "./video";
import { File } from "./file";
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
const cleanYtUrl = (url: string): string => {
  return /&/.test(url) ? url.split("&")[0] : url;
};

/**
 * Removes characters deemed illegal for file naming by windows (other OS's do this automatically in my experience)
 * @param filename File name to check
 * @returns {string} Cleaned name
 */
const removeIllegalChars = (filename: string): string => {
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
async function download(
  includeVideo: boolean,
  url: string,
  fileName: string
): Promise<File> {
  const config = await makeNewConfig();

  updateProgressBar("Retrieving video info...");
  const info = await ytdl.getBasicInfo(cleanYtUrl(url));

  const video = new YouTubeVideo(info?.videoDetails.video_url);
  fileName = removeIllegalChars(fileName);
  if (fileName.length === 0) {
    fileName = info?.videoDetails.title;
  }
  if (!(fileName.endsWith(".mp3") || fileName.endsWith(".wav"))) {
    fileName += ".mp3";
  }
  return await video.save(includeVideo, config?.savePath, fileName);
}

(() => {
  [downloadAudioBtn, downloadVideoBtn].forEach((button) => {
    button.addEventListener("click", async (event) => {
      try {
        const file = await download(
          (<HTMLElement>event.target).id.includes("video"),
          (<HTMLInputElement>document.getElementById("url")).value.trim(),
          (<HTMLInputElement>document.getElementById("file-name")).value.trim()
        );
        updateProgressBar(
          `${basename(file.filePath)} saved successfully`,
          "#00c210"
        );
        file.open();
      } catch (err) {
        console.error(err);
        let errorMessage: string = /ENOTFOUND/.test(err.message)
          ? "Error: Invalid URL. Check your internet connection"
          : "Error: " + err.message;
        updateProgressBar(errorMessage, "#e01400");
      }
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
