/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getData: (data) => ipcRenderer.invoke('get-data', data), // 发送请求并返回结果
  update: (data) => ipcRenderer.invoke('update', data), // 发送请求并返回结果
  testUpdate: (data) => ipcRenderer.invoke('test-update', data), // 发送请求并返回结果
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printDocument: (data) => ipcRenderer.send('print-document', data),
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  invokeMessage: (channel, data) => ipcRenderer.invoke(channel, data),
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron Preload Loaded");
});
