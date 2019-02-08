const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const jsforce = require('jsforce');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const WIDTH = 800;
const HEIGHT = 600;

let currWindow;
let sfconn;

function start() {
    currWindow = createWindowAt('login.html');
}

ipcMain.on('login-successful', (event, conn) => {
    sfconn = conn;
    console.log(sfconn);
    currWindow = createWindowAt('main.html');
});

ipcMain.on('run-apex', (event, code) => {
    sfconn.tooling = new jsforce.Tooling({
        conn: sfconn
    });
    console.log(sfconn);
    sfconn.tooling.executeAnonymous(code, function(err, res) {
        if (err) { return console.error(err); }
        console.log("compiled?: " + res.compiled); // compiled successfully
        console.log("executed?: " + res.success); // executed successfully
        console.log('response: '+JSON.stringify(res));
    });
});

ipcMain.on('logout-pressed', () => {
    var conn = new jsforce.Connection({
        sessionId: sfconn.accessToken,
        serverURL: sfconn.instanceURL
    });
    conn.logoutByOAuth2(function(error) {
        if(error) {
            console.log(error);
        } else {
            console.log('logout successful');
        }
    });
    currWindow = createWindowAt('login.html');
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