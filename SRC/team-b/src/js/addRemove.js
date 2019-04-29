$ = require('jquery');

//const electron = require('electron');

const ipc = require('electron').ipcRenderer;

// Array of moves
let units = new Array("Choose...", "A", "F");

let gameID = "";
let username = "";
let code = "";

ipc.on('message', (event, message) => {
    var data = message.split(" ");
    code = data[0];
    username = data[1];
    gameID = data[2];

    document.getElementById("gameID").innerHTML = gameID;
    document.getElementById("username").innerHTML = username;

    var unitsDropdown = document.getElementById("unitSelect");

    for (var i = 0; i < units.length; i++)
    {
        // Append the element to the end of Array list for the first move
        unitsDropdown[unitsDropdown.length] = new Option(units[i], units[i]);
    }
    unitsDropdown.options[0].hidden = "true";
})

function makeToast(data)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = data;

    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

function add()
{
    var unit = document.getElementById("unitSelect");

    var unitSelected = "";

    var validOrder = false;

    if (unit.value === "Choose...")
    {
        makeToast("Choose a unit")
    }
    else
    {
        unitSelected = unit.value;
        validOrder = true;
    }

    if (validOrder)
    {
        // pass
        window.close();
    }
}

function remove()
{
    // pass
    window.close();
}
