$ = require('jquery');

//const electron = require('electron');

const ipc = require('electron').ipcRenderer;

ipc.on('message', (event, message) => {
    document.getElementById("this").innerHTML = message;
})