const {app, Menu} = require('electron')

function setupMainWindow(window) {
  if (process.platform === 'darwin') {
    buildMenu()
  } else {
    window.setMenu(null)
  }
  window.on('minimize', () => {
    window?.webContents.send('toMain', {
      type: 'hide-video',
    })
  })
  window.on('restore', () => {
    window?.webContents.send('toMain', {
      type: 'restore-video',
    })
  })

  // window.on('hide', () => {
  //   window?.webContents.send('toMain', {
  //     type: 'hide-video',
  //   })
  // })
  // window.on('show', () => {
  //   window?.webContents.send('toMain', {
  //     type: 'restore-video',
  //   })
  // })
}

function buildMenu() {
  const template = [
    {
      label: 'Connect.Club',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit(),
          role: 'quit',
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const {shell} = require('electron')
            await shell.openExternal('https://connect.club/')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = {setupMainWindow}
