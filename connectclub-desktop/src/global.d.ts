import {IpcRenderer} from 'electron'

interface ElectronApi {
  send(type: string, args?: any)
  receive(type: string, listener: (args?: any) => void): () => void
}

// For typescript
// https://github.com/electron/electron/issues/9920#issuecomment-947170941
declare global {
  interface Window {
    api: ElectronApi
  }
}
