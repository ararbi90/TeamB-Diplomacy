const {
    app,
    BrowserWindow,
    Menu
} = require('electron')

const shell = require("electron").shell
global.sharedObj = { prop1: null };
require('electron-reload')("src");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
    })

    // and load the index.html of the app.
    win.loadFile('src/html/index.html')


    // Open the DevTools.
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    var menu = Menu.buildFromTemplate([{
        label: 'Menu',
        submenu: [
            {
                label: 'Exit',
                click() {
                    app.quit();
                }
            }
        ]
    }

    ])

    Menu.setApplicationMenu(menu);


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

global.db = null;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.