import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ytdl from "ytdl-core";
import { join } from "path";
import { File } from "./audiofile";
import { unlink } from "fs";
import { updateProgressBar } from "./download";

ffmpeg.setFfmpegPath(ffmpegPath);

export class YouTubeVideo {
  private readonly _url: string;
  constructor(url: string) {
    this._url = url;
  }

  /**
   * Downloads and saves the YouTube video to the given file, optionally including video
   * @param video Whether or not to include video
   * @param path Path to save data to
   * @param fileName Optional file name. Otherwise, `path` is assumed to have it
   * @returns Promise resolving with file and rejecting with error
   */
  public save = async (video: boolean, path: string, fileName?: string) => {
    return video
      ? this.saveVideo(path, fileName)
      : this.saveAudio(path, fileName);
  };

  private saveVideo = async (path: string, fileName?: string) => {
    return new Promise<File>(async (resolveOuter, rejectOuter) => {
      this.saveAudio(path, fileName).then((file) => {
        path = file.filePath.replace(".mp3", ".mp4");
        const videoStream = ytdl(this._url, {
          filter: "videoonly",
          quality: "highestvideo",
        })
          .on("error", (err) => rejectOuter(err))
          .on("progress", (_, current, total) => {
            let percentComplete = Math.round(100 * (current / total));
            updateProgressBar(
              "Video: " + percentComplete + "%",
              "#e01400",
              percentComplete
            );
          });

        ffmpeg(videoStream)
          .input(file.filePath)
          .on("end", () => {
            unlink(file.filePath, (err) => {
              if (err) {
                rejectOuter(err);
              }
              resolveOuter(new File(path));
            });
          })
          .on("error", (err) => rejectOuter(err))
          .save(path);
      });
    });
  };

  private saveAudio = async (path: string, fileName?: string) => {
    path = fileName === undefined ? path : join(path, fileName);
    return new Promise<File>(async (resolve, reject) => {
      const stream = ytdl(this._url, { filter: "audioonly" })
        .on("error", (err) => reject(err))
        .on("progress", (_, current, total) => {
          let percentComplete = Math.round(100 * (current / total));
          updateProgressBar(
            "Audio: " + percentComplete + "%",
            "#e01400",
            percentComplete
          );
        });

      ffmpeg(stream)
        .on("start", () => {
          console.log(`ffmpeg started: ${this._url} >> ${path}`);
        })
        .on("end", () => resolve(new File(path)))
        .on("error", (err: Error) => reject(err))
        .save(path);
    });
  };
}
