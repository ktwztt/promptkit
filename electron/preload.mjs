import { contextBridge, ipcRenderer, shell } from "electron"

// ponytail: minimal preload — expose safe APIs to renderer
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,

  // File system helpers for prompt import/export
  openFile: async () => {
    return ipcRenderer.invoke("dialog:openFile")
  },
  saveFile: async (content, defaultName) => {
    return ipcRenderer.invoke("dialog:saveFile", content, defaultName)
  },

  // External links open in default browser
  openExternal: (url) => shell.openExternal(url),

  // Window controls
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
})
