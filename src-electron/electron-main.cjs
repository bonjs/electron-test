import { app, BrowserWindow, dialog, ipcMain} from "electron";
import path from 'node:path'
import os from 'node:os'


import { createRequire } from 'node:module';

// 使用 createRequire 创建一个 CommonJS 兼容的 require 方法
const require = createRequire(import.meta.url);

// 使用 require 导入 electron-updater
const { autoUpdater } = require('electron-updater');


const log = require("electron-log");

import { fileURLToPath } from 'node:url'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow ;

async function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      )
    }
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      //mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


log.info("Electron App 启动！");
log.info("资源路径:", process.resourcesPath);
log.info("当前环境:", process.env.NODE_ENV);

process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception: ", error);
});

function ipcMainHandle() {

  // 监听获取打印机列表的请求
  ipcMain.handle('get-printers', () => {
    console.log('get-printer')
    return mainWindow.webContents.getPrintersAsync(); // 返回所有可用的打印机
  });

  // 监听打印请求
  ipcMain.on('print-document', (_event, printData) => {
  // 打印页面
    mainWindow.webContents.print({
        silent: false,   // 是否静默打印（不弹出打印对话框）
        deviceName: printData.printerName, // 选择的打印机
        printBackground: true,  // 是否打印背景图
        color: true,     // 是否彩色打印
        margin: {
          marginType: 'default'  // 也可以是 'none', 'printableArea', 'custom'
        },
        landscape: false,  // 是否横向打印
        pagesPerSheet: 1,  // 每张纸打印的页面数
        collate: true,     // 是否自动整理打印顺序
      }, (success, failureReason) => {
        if (!success) console.error('打印失败:', failureReason);
        else console.log('打印任务已发送成功');
      }
    );
  });


  ipcMain.handle("get-data", async (event, url) => {
    log.info("main进程 getdata", url);
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log("error", error);
      return { error: error.message };
    }
  });
}


checkForUpdates();

ipcMain.handle("update", async (event, url) => {
    console.log('main update')
    log.info('main update')
    autoUpdater.checkForUpdates();
});
ipcMain.handle("test-update", async (event, url) => {
    log.info('test update')

    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'bonjs',  // 替换为你的 GitHub 用户名
      repo: 'test-demo',  // 替换为你的仓库名
    });

    console.log('testestseatesat')

    autoUpdater.checkForUpdates();
});

app.whenReady().then(() => {
  createWindow();
  ipcMainHandle();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("web-contents-created", (_, contents) => {
    contents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          ],
        },
      });
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function checkForUpdates() {
  autoUpdater.autoDownload = false; // 设置为手动下载更新
  autoUpdater.on("update-available", (info) => {
    log.info('发现新版本')
    dialog
      .showMessageBox({
        type: "info",
        title: "发现新版本",
        message: `发现新版本 ${info.version}，是否立即更新？`,
        buttons: ["是", "否"],
      })
      .then((result) => {
        log.info('response:' + result.response)
        if (result.response === 0) {
          try {
            autoUpdater.downloadUpdate();
          } catch(e) {
            log.info(e.message);
          }
            
        }
      });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "更新已下载",
        message: "新版本已下载，是否立即安装？",
        buttons: ["是", "稍后"],
      })
      .then((result) => {

        dialog.showMessageBox({
            type: "info",
            title: "aa",
            message: `${result.response}`,
            buttons: ["是", "否"],
        }).then(() => {
            if (result.response === 0) {
                setTimeout(() => {
                    autoUpdater.quitAndInstall(true, true);
                }, 2000); // 等待 2 秒后退出
            }
        })
      });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`下载进度: ${progressObj.percent}%`);
  });

  // **如果没有新版本，提示用户**
  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '检查更新',
      message: '当前已经是最新版本！',
      buttons: ['确定']
    });
  });

  autoUpdater.on("error", (error) => {
    console.error("更新出错:", error);
  });
}
