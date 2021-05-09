# YouTube Downloader

This is a full TypeScript rewrite of my original ytdl-gui Electron app. This one now has limited video support as well

## Known Issues

* An issue with ffmpeg is causing video downloads to have lower audio quality despite using the same function as the download audio button internally.
  I'll probably have to pass ffmpeg some arguments forcing the quality to not become degraded

* Some videos still cannot be downloaded, however this will always be the case. Various region, copyright, age, and other restrictions prevent various videos from being downloaded 
