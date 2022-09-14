// https://github.com/electron/electron/issues/9920#issuecomment-947170941
// https://stackoverflow.com/questions/48148021/how-to-import-ipcrenderer-in-react/49034244

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {contextBridge, ipcRenderer} = require('electron')

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ['fromMain']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      const validChannels = ['toMain']
      if (!validChannels.includes(channel)) return

      // Deliberately strip event as it includes `sender`
      const listener = (event, ...args) => func(args)
      ipcRenderer.on(channel, listener)
      return () => {
        ipcRenderer.removeListener(channel, listener)
      }
    },
  })
})
