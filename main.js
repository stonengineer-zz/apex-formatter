const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const WIDTH = 800;
const HEIGHT = 600;

let currWindow;
let connection;

function start() {
    currWindow = createWindowAt('login.html');
    currWindow.webContents.openDevTools();
}

app.on('login', () => {
    currWindow = createWindowAt('main.html');
})

ipcMain.on('login-successful', () => {
    currWindow = createWindowAt('main.html');
});

function createWindowAt(htmlFile) {
    var newWindow = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        minWidth: WIDTH,
        minHeight: HEIGHT,
        icon: path.join(__dirname, '.images/icon.png')
    });
    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, htmlFile),
        protocol: 'file:',
        slashes:true
    }));
    newWindow.on('closed', function() {
        newWindow = null;
        app.quit();
    });
    return newWindow;
}

app.on('ready', start);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if(currWindow === null) {
        start();
    }
})