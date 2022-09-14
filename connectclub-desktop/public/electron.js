const {app, shell, BrowserWindow, ipcMain, dialog} = require('electron')
const {setupMainWindow} = require('./setup')

let isDebug =
  process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'development'

const path = require('path')
const WINDOW_WIDTH = 1194
const WINDOW_HEIGHT = 834

let mainWindow
let splash
let deepLinkUrl

if (isDebug) {
  app.commandLine.appendSwitch('remote-debugging-port', '9222')
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('cnnctvp', process.execPath, [
      path.resolve(process.argv[1]),
    ])
  }
} else {
  app.setAsDefaultProtocolClient('cnnctvp')
}

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock()
if (gotTheLock || isDebug) {
  app.on('second-instance', (e, argv) => {
    // TODO: test on windows and built app
    if (process.platform === 'win32') {
      // Keep only command line / deep linked arguments
      deepLinkUrl = argv.slice(1)
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
} else {
  app.quit()
}

function createMain() {
  console.log('electron debug mode:', isDebug)
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    resizable: false,
    show: false,
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true,
    },
  })
  mainWindow.loadURL(
    isDebug
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  )
  mainWindow.on('closed', () => (mainWindow = null))
  setupMainWindow(mainWindow)
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url)
    return {action: 'deny'}
  })
  if (isDebug) {
    mainWindow.webContents.openDevTools({mode: 'detach'})
  }
  ipcMain.on('fromMain', (event, args) => {
    console.log('event received', 'args', JSON.stringify(args))
    switch (args.type) {
      case 'requestDeeplink':
        if (deepLinkUrl) {
          mainWindow?.webContents.send('toMain', {
            type: 'receivedDeeplink',
            data: deepLinkUrl,
          })
        }
        deepLinkUrl = null
        break
    }
  })
}

function createSplash() {
  splash = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    transparent: true,
    frame: false,
    alwaysOnTop: !isDebug,
  })

  splash.loadURL(`file://${path.join(__dirname, '../build/splash.html')}`)
}

function showApp() {
  createSplash()
  createMain(false)

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy()
      mainWindow.show()
    }, 1000)
  })
}

app.on('ready', () => {
  showApp()
})

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    showApp()
  }
})

app.on('will-finish-launching', function () {
  // Protocol handler for osx
  app.on('open-url', function (event, url) {
    console.log('got open-url event', url)
    event.preventDefault()
    deepLinkUrl = url
    mainWindow?.webContents.send('toMain', {
      type: 'receivedDeeplink',
      data: url,
    })
    if (isDebug) {
      dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    }
  })
})
