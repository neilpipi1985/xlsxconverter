import Emitter from 'events';
import path from 'path';

import { app, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron';

import XlsxConverter from '../src/xlsxconverter';

let mainWindow;

function renderAction(opts = {}) {
  if (mainWindow) {
    mainWindow.webContents.send(opts.key, opts.value);
  }
}

class RenderEmitter extends Emitter {
  leave(room) {
    this.removeListener(room, renderAction);
  }

  join(room) {
    this.on(room, renderAction);
  }
}

async function run() {
  console.log('Initialize Xlsx Converter');

  try {
    const appPath = app.getPath('userData');
    await XlsxConverter.initApp({ appPath });

    return `Xlsx Converter is running on ${process.platform}`;
  } catch (err) {
    return err.message;
  }
}

function createWindow() {
  if (!mainWindow) {
    globalShortcut.register('CommandOrControl+P', () => {
      if (mainWindow && mainWindow.isFocused()) {
        mainWindow.capturePage((img) => {
          XlsxConverter.saveWindowImage({ file: img.toPNG(), ext: '.png', dateTime: new Date() });
        });
      }
    });

    globalShortcut.register('Alt+F4', async () => {
      if (mainWindow && mainWindow.isFocused()) {
        app.quit();
      }
    });

    globalShortcut.register('CommandOrControl+D+T', () => {
      if (mainWindow && mainWindow.isFocused()) {
        // Open the DevTools.
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools();
        } else {
          mainWindow.webContents.openDevTools();
        }
      }
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
      transprent: true,
      frame: false,
      show: false,
      minWidth: 480,
      minHeight: 320,
    });

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.minimize();
      mainWindow.show();
      mainWindow.focus();
    });


    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = undefined;
    });

    // // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    run().then((msg = '') => {
      // and load the index.html of the app.
      const scriptFile = path.resolve(__dirname, `./public/${process.env.ELECTRON_RENDER_FILE}`);
      mainWindow.loadURL(`data:text/html, ${XlsxConverter.render(process.env.ELECTRON_RENDER_FILE)}`, {
        baseURLForDataURL: `file://${scriptFile}`
      });
    }).catch((err) => {
      console.log(`App Error(${err.message})`);
    });
  }
}

app.on('certificate-error', (event, webContents, urls, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!mainWindow) createWindow();
});

XlsxConverter.SocketMgr.addSocket('render', new RenderEmitter());
XlsxConverter.injectSocketEvent(ipcMain);

XlsxConverter.SocketMgr.on(ipcMain, 'setDistPath', async (...para) => {
  const obj = XlsxConverter.SocketMgr.getSocketPara(para, ipcMain);
  const opts = obj.opts || {};
  const dir = dialog.showOpenDialog(mainWindow, {
    title: 'Select Log Path',
    defaultPath: opts.distPath,
    properties: ['openDirectory']
  });
  if (dir) {
    XlsxConverter.SocketMgr.send(obj, 'refreshDialog', {
      type: 'getSysSetting',
      data: { distPath: dir[0] }
    });
  }
});

XlsxConverter.SocketMgr.on(ipcMain, 'exitApp', async () => {
  app.quit();
});
