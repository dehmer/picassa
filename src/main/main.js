import path from 'path'
import url from 'url'
import { app, BrowserWindow } from 'electron'

// Disable for production:
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow, serverWindow

const createMainWindow = () => {
  const options = {
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  }

  mainWindow = new BrowserWindow(options)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // hot deployment in development mode
  const hotDeployment = () =>
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath)

  const devServer = () => process.argv.indexOf('--noDevServer') === -1

  const indexURL = (hotDeployment() && devServer())
    ? url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
    : url.format({
      protocol: 'file:',
      pathname: path.join(app.getAppPath(), 'dist', 'index.html'),
      slashes: true
    })

  mainWindow.loadURL(indexURL)
  mainWindow.on('close', () => (mainWindow = null))
  mainWindow.once('ready-to-show', () => mainWindow.show())
}

const createServerWindow = () => {
  const options = {
    show: true,
    webPreferences: {
      nodeIntegration: true
    }
  }

  serverWindow = new BrowserWindow(options)
  const indexURL = url.format({
    protocol: 'file:',
    pathname: path.join(app.getAppPath(), 'dist', 'server.html'),
    slashes: true
  })

  serverWindow.loadURL(indexURL)
  serverWindow.on('close', () => (serverWindow = null))
  serverWindow.once('ready-to-show', () => {
    console.log('server ready.')
  })
}

const createWindows = () => {
  createServerWindow()
  createMainWindow()
}

app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createMainWindow()
})
