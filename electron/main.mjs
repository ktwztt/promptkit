import { app, BrowserWindow, Menu, Tray, shell, dialog, nativeImage, ipcMain } from "electron"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import { spawn } from "node:child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged

let mainWindow = null
let tray = null
let nextServer = null

function startNextServer() {
  return new Promise((resolve, reject) => {
    // ponytail: use packaged node_modules/.bin/next or system npx
    const nextBin = path.join(__dirname, "..", "node_modules", ".bin", "next")
    const cmd = process.platform === "win32" ? `${nextBin}.cmd` : nextBin

    nextServer = spawn(cmd, ["start", "-p", "3000"], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    })

    nextServer.stdout.on("data", (data) => {
      const output = data.toString()
      // Next.js ready signal
      if (output.includes("started server") || output.includes("Ready")) {
        resolve(true)
      }
    })

    nextServer.stderr.on("data", (data) => {
      console.error("[next]", data.toString())
    })

    nextServer.on("error", reject)

    // Fallback: resolve after 10s even if no signal
    setTimeout(() => resolve(true), 10000)
  })
}

async function createWindow() {
  if (!isDev) {
    await startNextServer()
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "PromptKit",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
  })

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools({ mode: "detach" })
  } else {
    // Wait a moment for server to be ready
    await new Promise(r => setTimeout(r, 2000))
    mainWindow.loadURL("http://localhost:3000")
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

function createMenu() {
  const template = [
    {
      label: "PromptKit",
      submenu: [
        { label: "About PromptKit", role: "about" },
        { type: "separator" },
        { label: "Settings", accelerator: "CmdOrCtrl+,", click: () => mainWindow?.loadURL(
          isDev ? "http://localhost:3000/settings" : `file://${path.join(__dirname, "..", "out", "settings.html")}`
        )},
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "Tools",
      submenu: [
        { label: "Prompt Cleaner", accelerator: "CmdOrCtrl+1", click: () => navigate("/tools/cleaner") },
        { label: "Prompt Optimizer", accelerator: "CmdOrCtrl+2", click: () => navigate("/tools/optimizer") },
        { label: "Prompt Translator", accelerator: "CmdOrCtrl+3", click: () => navigate("/tools/translator") },
        { label: "Token Counter", accelerator: "CmdOrCtrl+4", click: () => navigate("/tools/token-counter") },
        { type: "separator" },
        { label: "Prompt Splitter", click: () => navigate("/tools/splitter") },
        { label: "Prompt Diff", click: () => navigate("/tools/diff") },
        { label: "Prompt Formatter", click: () => navigate("/tools/formatter") },
        { label: "AI Generator", click: () => navigate("/tools/generator") },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Dashboard", click: () => navigate("/dashboard") },
        { label: "Library", click: () => navigate("/library") },
        { label: "Templates", click: () => navigate("/templates") },
        { type: "separator" },
        { label: "Toggle Full Screen", role: "togglefullscreen" },
        { label: "Zoom In", role: "zoomIn" },
        { label: "Zoom Out", role: "zoomOut" },
        { label: "Reset Zoom", role: "resetZoom" },
        { type: "separator" },
        { label: "Toggle DevTools", accelerator: "F12", role: "toggleDevTools" },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "PromptKit on GitHub", click: () => shell.openExternal("https://github.com/ktwztt/promptkit") },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function navigate(route) {
  if (!mainWindow) return
  const base = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "..", "out")}`
  mainWindow.loadURL(`${base}${route}`)
}

function createTray() {
  // ponytail: system tray icon for quick access
  const iconPath = path.join(__dirname, "icon.png")
  if (!fs.existsSync(iconPath)) return

  tray = new Tray(nativeImage.createFromPath(iconPath))
  tray.setToolTip("PromptKit")
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Show PromptKit", click: () => mainWindow?.show() },
    { label: "Quick Clean", click: () => { mainWindow?.show(); navigate("/tools/cleaner") } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]))
  tray.on("double-click", () => mainWindow?.show())
}

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// IPC handlers for preload
ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt", "md", "json", "csv"] },
      { name: "All Files", extensions: ["*"] },
    ],
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const content = fs.readFileSync(result.filePaths[0], "utf-8")
  return { path: result.filePaths[0], content }
})

ipcMain.handle("dialog:saveFile", async (_event, content, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || "prompt.txt",
    filters: [
      { name: "Text Files", extensions: ["txt", "md"] },
      { name: "All Files", extensions: ["*"] },
    ],
  })
  if (result.canceled || !result.filePath) return false
  fs.writeFileSync(result.filePath, content, "utf-8")
  return true
})

ipcMain.handle("window:minimize", () => mainWindow?.minimize())
ipcMain.handle("window:maximize", () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize()
})
ipcMain.handle("window:close", () => mainWindow?.close())

app.whenReady().then(() => {
  createMenu()
  createWindow()
  // createTray() // ponytail: enable when we have an icon

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill()
    nextServer = null
  }
  tray?.destroy()
})
