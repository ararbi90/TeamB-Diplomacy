// SOURCE CODE CORRESPONDING TO: retreatDisband.html 

$ = require('jquery');

const ipc = require('electron').ipcRenderer; // ipc for getting the message sent to this pop up

// GLOBAL VARIABLES
let moves = new Array("Choose...", "Move"); // Array of moves (can only move if retreating)
let moveLocations = new Array("Choose..."); // Array of locations
let gameID = "";                            // gameID for the game this popup came from
let username = "";                          // username for the user who clicked on the map
let code = "";                              // three letter code for the territory that was clicked on

// Get the message
ipc.on('message', (event, message) => {
    var data = message.split(" ");

    // Assign the message data to the global variables
    code = data[0];
    username = data[1];
    gameID = data[2];
    
    gameRef.child(gameID).child("players").once("value").then(function (snap)
    {
        // All players.
        let players = {};
        snap.forEach(element => {
            players[element.key] = element.val();
        });

        let forceType = players[username].territories[code].forceType;

        // Append the moves to the dropdown.
        var firstMoveDropdown = document.getElementById("firstMoveSelect");
        for (var i = 0; i < moves.length; i++)
        {
            firstMoveDropdown[firstMoveDropdown.length] = new Option(moves[i], moves[i]);
        }
        firstMoveDropdown.options[0].hidden = "true";

        // Set the label.
        document.getElementById("label").innerHTML = forceType + ' ' + code;

        $.getJSON("map.json", function(json) {
            var adjs = json[code]["adjacencies"];
        
             // Find move locations
            for (var i = 0; i < adjs.length; i++)
            {
                var a = adjs[i];

                if (forceType === "F") // Fleet can move to an adjacent coast or sea
                {
                    if (json[a]["type"] === "COASTAL" || json[a]["type"] === "SEA")
                    {
                        moveLocations.push(a);
                    }
                }
                else // Army can move to an adjacent inland or coast
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

// Function for adding locations to the "locationDropdown".
function addLocationsToDropdown(locationDropdown)
{
    locationDropdown = document.getElementById("locationSelect");

    for (var i = 0; i < moveLocations.length; ++i)
    {
        locationDropdown[locationDropdown.length] = new Option(moveLocations[i], moveLocations[i]);
    }

    locationDropdown.options[0].hidden = "true";
}

// Function executed on the first move choice.
// -- Unhides the locations and calls the function to add locations to the dropdown.
function firstMoveChoice()
{
    var locationDropdown = document.getElementById("locationSelect");

    // Show location dropdown
    locationDropdown.hidden = false;

    removeOptions(locationDropdown);
    addLocationsToDropdown(locationDropdown);
}

// Function for creating a toast/temporary message lasting 1.5 seconds.
function makeToast(data)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = data;

    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

// Function executed when the user clicks submit.
// -- Takes the data in the dropdown(s) and adds the resulting order into the DB ("retreat_orders_temp").
function submitOrder()
{
    // All dropdowns.
    var firstMove = document.getElementById("firstMoveSelect");
    var location = document.getElementById("locationSelect");

    // Use the label to get information on this territory.
    var label = document.getElementById("label");
    var x = label.innerHTML.split(" ");
    var thisUnit = x[0] + "_" + x[1]; // Key for this unit in the DB.
    var order = label.innerHTML;      // Order we will be building, same as game rules, starting value = label.

    var validOrder = false;

    // If any of the dropdowns have the value "Choose...", the order is not valid. Displays a message
    // informing the user of this fact.
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
        var ref = gameRef.child(gameID).child("players").child(username);

        // Put order in DB
        ref.child("retreat_orders_temp").child(thisUnit).set({
            order: order
        });

        // Remove th unit rom the units left to retreat in the DB
        ref.child("retreat_units_temp").child(thisUnit).remove();

        window.close();
    }
}

// Function executed when the user clicks disband.
// -- Builds a disband order (same order as last round).
function disband()
{
    // Use the label to get information on this territory.
    var label = document.getElementById("label");
    var x = label.innerHTML.split(" ");
    var thisUnit = x[0] + "_" + x[1];   // Key for this unit in the DB.

    // Get a current snapshot of the game
    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        // User's temp orders
        var orders_t = res.players[username].orders_temp;

        var keys = Object.keys(orders_t);

        var order = "";
    
        for (var i = 0; i < keys.length; i++)
        {
            if (keys[i] === thisUnit)
            {
                order = orders_t[keys[i]].order;
            }
        }

        var ref = gameRef.child(gameID).child("players").child(username);

        // Put order in DB
        ref.child("retreat_orders_temp").child(thisUnit).set({
            order: order
        });
    
        // Remove th unit rom the units left to retreat in the DB
        ref.child("retreat_units_temp").child(thisUnit).remove();

        window.close();

    }).fail(function (err) {
        console.log(err);
    })
}
