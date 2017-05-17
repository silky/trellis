import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron'
import update from './lib/update'

// Load environment variables from .env file
require("dotenv").config()

// Set app for use in browser process
global.app = app

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/)

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
  });

  // Menubar template
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New', accelerator: 'CmdOrCtrl+N', click: (item, focusedWindow) => {
          mainWindow.webContents.send("new")
        }},
        {
          label: 'Open', accelerator: 'CmdOrCtrl+O', click: (item, focusedWindow) => {
          dialog.showOpenDialog((files) => {
            mainWindow.webContents.send("open", files)
          })
        }},
        {
          label: 'Save As', accelerator: 'CmdOrCtrl+S', click: (item, focusedWindow) => {
          dialog.showSaveDialog({ defaultPath: ".trellis" }, (files) => {
            mainWindow.webContents.send("save", files)
          })
        }},
        {
          label: 'Merge', accelerator: 'CmdOrCtrl+M', click: (item, focusedWindow) => {
          dialog.showOpenDialog((files) => {
            mainWindow.webContents.send("merge", files)
          })
        }}
      ]
    }
  ]

  // macOS requires first menu item be name of the app
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {role: 'quit'}
      ]
    })
  }

  // Create the menubar
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Check for app updates
if(!isDevMode) update({ dialog: dialog, updater: autoUpdater })
