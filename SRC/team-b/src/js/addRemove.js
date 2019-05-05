// SOURCE CODE CORRESPONDING TO: addRemove.html

$ = require('jquery');

const ipc = require('electron').ipcRenderer;  // ipc for getting the message sent to this pop up

// GLOBAL VARIABLES
let units = new Array("Choose...", "A", "F"); // Array of unit types
let gameID = "";    // gameID for the game this popup came from
let username = "";  // username for the user who clicked on the map
let code = "";      // three letter code for the territory that was clicked on

// Get the message
ipc.on('message', (event, message) => {
    var data = message.split(" ");

    // Assign the message data to the global variables
    code = data[0];
    username = data[1];
    gameID = data[2];

    // Get game info res from backend
    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        var terrs = Object.keys(res.players[username].territories); // territories the user owns

        // Determine if the territory that was clicked on is in the user's territories
        var inTerrs = false;

        for (var i = 0; i < terrs.length; i++)
        {
            if (terrs[i] === code)
            {
                inTerrs = true;
            }
        }

        if (inTerrs)
        {
            // If it is, they have the option of removing it
            document.getElementById("remove_unit").hidden = false;
            document.getElementById("add_unit").hidden = true;
        }
        else
        {
            // Otherwise, they have the option of adding a unit there
            document.getElementById("remove_unit").hidden = true;
            document.getElementById("add_unit").hidden = false;
        }

    }).fail(function (err)
    {
        console.log(err);
    })

    // Add units to the dropdown
    var unitsDropdown = document.getElementById("unitSelect");

    for (var i = 0; i < units.length; i++)
    {
        unitsDropdown[unitsDropdown.length] = new Option(units[i], units[i]);
    }

    unitsDropdown.options[0].hidden = "true"; // "Choose..." is hidden from the options
})

// Function for creating a toast/temporary message lasting 1.5 seconds
function makeToast(data)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = data;

    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

// Function executed when the use clicks submit when the add section of the html is unhidden.
// -- Takes the data from the dropdown and builds an order in the DB ("build_orders_temp").
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
        var ref = gameRef.child(gameID).child("players").child(username);

        // Data as it will be stored in the JSON.
        ref.child("build_orders_temp").child(code).set({
            territory: code,
            command: "BUILD",
            buildType: unitSelected
        });

        window.close();
    }
}

// Function executed when the user clicks submit when the add section of the html is unhidden.
// -- Builds a remove order in the DB ("build_orders_temp").
function remove()
{
    var ref = gameRef.child(gameID).child("players").child(username);

    // Data as it will be stored in the JSON.
    ref.child("build_orders_temp").child(code).set({
        territory: code,
        command: "REMOVE"
    });

    window.close();
}
