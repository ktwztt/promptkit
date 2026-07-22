// ponytail: type-safe wrapper for Electron preload API

interface ElectronAPI {
  platform: string
  isElectron: boolean
  openFile: () => Promise<{ path: string; content: string } | null>
  saveFile: (content: string, defaultName?: string) => Promise<boolean>
  openExternal: (url: string) => void
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export function getElectronAPI(): ElectronAPI | null {
  return typeof window !== "undefined" ? window.electronAPI || null : null
}

export function isElectron(): boolean {
  return getElectronAPI()?.isElectron ?? false
}
