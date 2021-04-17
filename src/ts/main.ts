import {app, BrowserWindow, Menu, shell, ipcMain, dialog} from 'electron';
import * as path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'GitHub Page',
          click() {
            shell.openExternal('https://github.com/hunter-ltd/YouTube-Downloader')
          }
        },
        { label: "About YTDL GUI", role: "about" },
        { type: "separator" },
        {
          label: 'Save folder',
          click() {
            var settingsWindow = new BrowserWindow({
              width: 500,
              height: 450,
              frame: true,
              webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
              }
            });
            // settingsWindow.webContents.openDevTools();
            settingsWindow.on('close', () => {
              settingsWindow = null;
            });
            settingsWindow.loadURL(path.join("file://", __dirname, 'html', 'settings.html'));
            settingsWindow.show()
          }
        },
        {type: 'separator'},
        {
          label: 'Quit',
          accelerator: "CmdOrCtrl+Q",
          click() {
            app.quit();
          }
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);


  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "html", 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle("getPath", async (ev, args) => app.getPath(args));
ipcMain.handle("showOpenDialog", async () => dialog.showOpenDialog({properties: ['openDirectory']}));
