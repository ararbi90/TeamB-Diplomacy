$ = require('jquery');

//const electron = require('electron');

const ipc = require('electron').ipcRenderer;

// Array of moves
let moves = new Array("Choose...", "Move");
// Array of locations
let moveLocations = new Array("Choose...");

let gameID = "";
let username = "";

ipc.on('message', (event, message) => {
    var data = message.split(" ");
    var code = data[0];
    username = data[1];
    gameID = data[2];

    document.getElementById("gameID").innerHTML = gameID;
    document.getElementById("username").innerHTML = username;
    
    gameRef.child(gameID).child("players").once("value").then(function (snap)
    {
        let players = {};
        snap.forEach(element => {
            players[element.key] = element.val();
        });

        let forceType = players[username].territories[code].forceType;

        var firstMoveDropdown = document.getElementById("firstMoveSelect");

        for (var i = 0; i < moves.length; i++)
        {
            // Append the element to the end of Array list for the first move
            firstMoveDropdown[firstMoveDropdown.length] = new Option(moves[i], moves[i]);
        }
        firstMoveDropdown.options[0].hidden = "true";

        document.getElementById("label").innerHTML = forceType + ' ' + code;

        $.getJSON("map.json", function(json) {
            var adjs = json[code]["adjacencies"];
        
            for (var i = 0; i < adjs.length; i++)
            {
                var a = adjs[i];

                if (forceType === "F")
                {
                    if (json[a]["type"] === "COASTAL" || json[a]["type"] === "SEA")
                    {
                        moveLocations.push(a);
                    }
                }
                else
                {
                    if (json[a]["type"] === "INLAND" || json[a]["type"] === "COASTAL")
                    {
                        moveLocations.push(a);
                    }
                }
            }
        })
    })
})


// https://stackoverflow.com/questions/3364493/how-do-i-clear-all-options-in-a-dropdown-box
function removeOptions(selectbox)
{
    var i;
    for (i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}

function addLocationsToDropdown(move, locationDropdown)
{
    locationDropdown = document.getElementById("locationSelect");

    for (var i = 0; i < moveLocations.length; ++i)
    {
        // Append the element to the end of Array list
        locationDropdown[locationDropdown.length] = new Option(moveLocations[i], moveLocations[i]);
    }

    locationDropdown.options[0].hidden = "true";
}

function firstMoveChoice(move)
{
    var locationDropdown = document.getElementById("locationSelect");

    // Show location dropdown
    locationDropdown.hidden = false;

    removeOptions(locationDropdown);
    addLocationsToDropdown(move, locationDropdown);
}

function makeToast(data)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = data;

    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

function submitOrder()
{
    var label = document.getElementById("label");
    var firstMove = document.getElementById("firstMoveSelect");
    var location = document.getElementById("locationSelect");

    var x = label.innerHTML.split(" ");
    var thisUnit = x[0] + "_" + x[1];
    var order = label.innerHTML;

    var validOrder = false;

    if (firstMove.value === "Choose...")
    {
        makeToast("Choose a move")
    }
    else
    {
        if (location.value === "Choose...")
        {
            makeToast("Choose a location");
        }
        else
        {
            order += "-" + location.value;
            validOrder = true;
        }
    }

    if (validOrder)
    {
        // pass
        window.close();
    }
}

function disband()
{
    // pass
    window.close();
}
