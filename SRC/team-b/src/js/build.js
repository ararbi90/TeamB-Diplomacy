// SOURCE CODE CORRESPONDING TO: build.html

$ = require('jquery');

const ipc = require('electron').ipcRenderer; // ipc for getting the message sent to this pop up

// GLOBAL VARIABLES
let moves = new Array("Choose...","Holds", "Move"); // Array of valid moves
let supportUnits = new Array("Choose...");          // Array of supportable units
let moveLocations = new Array("Choose...");         // Array of valid move locations
let convoyLocations = new Array("Choose...");       // Array of convoy locations
let coastalConvoyTerrs = {};                        // Every coastal territory mapped to the fleets that can convoy it
let gameID = "";                                    // gameID for the game this popup came from
let username = "";                                  // username for the user who clicked on the map
let code = "";                                      // three letter code for the territory that was clicked on

// Get the message
ipc.on('message', (event, message) => {
    var data = message.split(" ");

    // Assign the message data to the global variables
    code = data[0];
    username = data[1];
    gameID = data[2];
    
    // For getting all players in the game
    gameRef.child(gameID).child("players").once("value").then(function (snap)
    {
        let players = {};
        snap.forEach(element => {
            players[element.key] = element.val();
        });

        // Force type {'A', 'F'} of the unit on this territory
        let forceType = players[username].territories[code].forceType;

        var firstMoveDropdown = document.getElementById("firstMoveSelect");

        for (var i = 0; i < moves.length; i++)
        {
            // Append the element to the end of Array list.
            firstMoveDropdown[firstMoveDropdown.length] = new Option(moves[i], moves[i]);
        }
        firstMoveDropdown.options[0].hidden = "true"; // Hide the first dropdown element ("Choose...")

        // Set the label.
        document.getElementById("label").innerHTML = forceType + ' ' + code;

        // Note about "map.json": This file contains a JSON with every territory code as a key and the name of this
        // territory, its type, and its adjacencies (codes) as the value.
        $.getJSON("map.json", function(json)
        {
            var adjs = json[code]["adjacencies"]; // Adjacencies of this territory
            var supportable = false;              // For determining if this unit can support any other units

            // Find supportable units
            for (var user in players)
            {
                for (var terr in players[user].territories)
                {
                    if (terr !== code)
                    {
                        // Retrieve all territories with units, except for this one.
                        var terrType = players[user].territories[terr].forceType;

                        // Find common adjacencies
                        var commonAdjs = new Array();
                        var adjs2 = json[terr]["adjacencies"];
                        adjs2.push(terr); // Can support this terr as well

                        for (var i = 0; i < adjs.length; i++)
                        {
                            var adj1 = adjs[i];

                            for (var j = 0; j < adjs2.length; j++)
                            {
                                var adj2 = adjs2[j];

                                if (adj1 === adj2)
                                {
                                    commonAdjs.push(adj1);
                                }
                            }
                        }

                        if (forceType === "F")
                        {
                            // Supportable if both units can move there
                            var movable = false;
                            for (var i = 0; i < commonAdjs.length; i++)
                            {
                                if (json[commonAdjs[i]]["type"] === "SEA")
                                {
                                    // Both must be fleets
                                    if (terrType === "F")
                                    {
                                        movable = true;
                                    }
                                }
                                else if (json[commonAdjs[i]]["type"] === "COASTAL")
                                {
                                    movable = true;
                                }
                            }

                            if (movable)
                            {
                                supportUnits.push(terrType + ' ' + terr);
                                supportable = true;
                            }
                        }
                        else
                        {
                            var movable = false;
                            for (var i = 0; i < commonAdjs.length; i++)
                            {
                                if (json[commonAdjs[i]]["type"] === "INLAND")
                                {
                                    // Both must be armies
                                    if (terrType === "A")
                                    {
                                        movable = true;
                                    }
                                }
                                else if (json[commonAdjs[i]]["type"] === "COASTAL")
                                {
                                    movable = true;
                                }
                            }

                            if (movable)
                            {
                                supportUnits.push(terrType + ' ' + terr);
                                supportable = true;
                            }
                        }
                    }
                }
            }

            // Add support option if we added a supportable unit
            if (supportable)
            {
                firstMoveDropdown[firstMoveDropdown.length] = new Option("Support", "Support");
                moves.push("Support");
            }
        
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

            // Get coastal convoy terrs: every army on the coast and the fleets that convoy them.
            for (var user in players)
            {
                var territories = players[user].territories;
                for (var t in territories)
                {
                    var uType = territories[t].forceType;
                    var tType = json[t]["type"];

                    if (tType === "COASTAL" && uType === "A") // All armies on coasts
                    {
                        var convoyTerrs = new Array();   // Keeps track of the fleets that can convoy this army
                        var terrsToCheck = new Array(t); // Start checking the coastal army

                        while (true)
                        {
                            var newTerrsToCheck = new Array(); // Every loop, determine the new terrs to check

                            for (var i = 0; i < terrsToCheck.length; i++)
                            {
                                var check = terrsToCheck[i];       // Territory we're checking
                                adjs = json[check]["adjacencies"]; // Adjacencies of the territory to check

                                for (var user in players)
                                {
                                    for (var terr in players[user].territories)
                                    {
                                        if (terr !== check)
                                        {
                                            // Get every territory in the game that's not the one we're checking
                                            var unitType = players[user].territories[terr].forceType;
                                            var terrType = json[terr]["type"];

                                            if (terrType === "SEA" && unitType === "F") // All fleets on water
                                            {
                                                // Determine if it is in the adjacencies of the territory we're checking
                                                var inAdjs = false;
                                                for (var j = 0; j < adjs.length; j++)
                                                {
                                                    if (adjs[j] === terr)
                                                    {
                                                        inAdjs = true;
                                                    }
                                                }

                                                // Fleet can convoy the army
                                                if (inAdjs)
                                                {
                                                    // Determine if it is already in the array of convoy territories,
                                                    // add if it is not.
                                                    var inArray = false;
                                                    for (var j = 0; j < convoyTerrs.length; j++)
                                                    {
                                                        if (convoyTerrs[j] === terr)
                                                        {
                                                            inArray = true;
                                                        }
                                                    }

                                                    if (!inArray)
                                                    {
                                                        convoyTerrs.push(terr);
                                                        newTerrsToCheck.push(terr);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            // Assign new territories to check, break the while loop if it is empty.
                            terrsToCheck = newTerrsToCheck;
                            if (terrsToCheck.length === 0)
                            {
                                break;
                            }
                        }
                        // Create the map entry.
                        coastalConvoyTerrs[t] = convoyTerrs;
                    }
                    
                }
            }

            // Can only convoy if fleet in an ocean and in coastalConvoyTerrs.
            if (forceType === "F" && json[code]["type"] === "SEA")
            {
                var keys = Object.keys(coastalConvoyTerrs); // All armies on coasts

                var inCCT = false;
        
                for (var i = 0; i < keys.length; i++)
                {
                    var data = coastalConvoyTerrs[keys[i]]; // Fleets that can convoy the army

                    var inData = false;
                    for (var j = 0; j < data.length; j++)
                    {
                        if (data[j] === code)
                        {
                            inData = true;
                        }
                    }

                    if (inData)
                    {
                        inCCT = true;
                    }
                }

                if (inCCT)
                {
                    firstMoveDropdown[firstMoveDropdown.length] = new Option("Convoy", "Convoy");
                    moves.push("Convoy");
                }
            }
            
            // If army on the coast, add more move locations.
            if (json[code]["type"] === "COASTAL" && forceType === "A")
            {
                var convoyTerrs = coastalConvoyTerrs[code]; // Fleets that can convoy this army
                
                for (var i = 0; i < convoyTerrs.length; i++)
                {
                    var convoyAdjs = json[convoyTerrs[i]]["adjacencies"]; // Adjacencies for the fleet

                    for (var j = 0; j < convoyAdjs.length; j++)
                    {
                        if (convoyAdjs[j] !== code)
                        {
                            // Find coastal adjacencies that are not this territory
                            if (json[convoyAdjs[j]][["type"]] === "COASTAL")
                            {
                                // Determine if the adjacency is already in the moves, add it if it is not.
                                var inMoves = false;
                                for (var k = 0; k < moveLocations.length; k++)
                                {
                                    if (moveLocations[k] === convoyAdjs[j])
                                    {
                                        inMoves = true;
                                    }
                                }

                                if (!inMoves)
                                {
                                    moveLocations.push(convoyAdjs[j]);
                                }
                            }
                        }
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

// Function for units to the "unitDropdown" based on the first "move" selected.
function addUnitsToDropdown(move, unitDropdown)
{
    unitDropdown[unitDropdown.length] = new Option(supportUnits[0], supportUnits[0]);

    if (move == "Convoy")
    {
        var label = document.getElementById("label");
        var thisUnit = label.innerHTML.split(" ");  // Arrays of this unit with unit type in the first position
                                                    // and unit location in the second position.

        var keys = Object.keys(coastalConvoyTerrs); // All coastal armies
        
        for (var i = 0; i < keys.length; i++)
        {
            var data = coastalConvoyTerrs[keys[i]]; // Fleets that can convoy the army

            // Determine if this fleet can convoy the army
            var inData = false;
            for (var j = 0; j < data.length; j++)
            {
                if (data[j] === thisUnit[1])
                {
                    inData = true;
                }
            }

            if (inData)
            {
                // Add to the unitDropdown if it can
                var unit = "A " + keys[i];
                unitDropdown[unitDropdown.length] = new Option(unit, unit);
            }
        }
    }
    else
    {
        // Otherwise add all support units
        for (var j = 1; j < supportUnits.length; ++j)
        {
            unitDropdown[unitDropdown.length] = new Option(supportUnits[j], supportUnits[j]);
        }
    }

    unitDropdown.options[0].hidden = "true";
}

// Function for adding second move locations to the "secondMoveDropdown" given the "unit" and the first "move".
function addSecondMovesToDropdown(unit, move, secondMoveDropdown)
{
    var label = document.getElementById("label");

    if (move == "Convoy")
    {
        for (var i = 0; i < moves.length; ++i)
        {
            // Only valid second move for "Convoy" is "Move"
            if (moves[i] === "Move" || moves[i] === "Choose...")
            {
                secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[i], moves[i]);
            }
        }
    }
    else if (move == "Support")
    {
        secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[0], moves[0]);

        // Arrays of the two units involved in the order with unit type in the first position
        // and unit location in the second position.
        var thisUnit = label.innerHTML.split(" ");
        var thatUnit = unit.split(" ");

        var holdSupportable = false;

        $.getJSON("map.json", function(json)
        {
            var adjs = json[thisUnit[1]]["adjacencies"];

            // thatUnit must be in thisUnit's adjacencies for hold to be supportable
            for (var i = 0; i < adjs.length; i++)
            {
                if (adjs[i] === thatUnit[1])
                {
                    holdSupportable = true;
                }
            }
            if (holdSupportable)
            {
                secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[1], moves[1]);
            }
        })

        secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[2], moves[2]);
    }
    else
    {
        // Otherwise add all options (it will be hidden)
        for (var i = 0; i < moves.length; ++i)
        {
            // Append the element to the end of Array list for the second move
            secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[i], moves[i]);
        }
    }

    secondMoveDropdown.options[0].hidden = "true";
}

// Function for adding move locations to the "locationDropdown".
function addMoveLocationsToDropdown(locationDropdown)
{
    locationDropdown = document.getElementById("locationSelect");

    for (var i = 0; i < moveLocations.length; ++i)
    {
        locationDropdown[locationDropdown.length] = new Option(moveLocations[i], moveLocations[i]);
    }

    locationDropdown.options[0].hidden = "true";
}

// Function for adding support locations of the "unit" to the "locationDropdown".
function addSupportLocationsToDropdown(unit, locationDropdown)
{
    var label = document.getElementById("label");

    // Add the "Choose..." option to the location dropdown
    locationDropdown[locationDropdown.length] = new Option(moveLocations[0], moveLocations[0]);

    // Arrays of the two units involved in the order with unit type in the first position
    // and unit location in the second position.
    var thisUnit = label.innerHTML.split(" ");
    var thatUnit = unit.split(" ");

    $.getJSON("map.json", function(json)
    {
        var adjs = json[thisUnit[1]]["adjacencies"];
        var adjs2 = json[thatUnit[1]]["adjacencies"];

        // Find common adjacencies
        var commonAdjs = new Array();
        for (var i = 0; i < adjs.length; i++)
        {
            var adj1 = adjs[i];

            for (var j = 0; j < adjs2.length; j++)
            {
                var adj2 = adjs2[j];

                if (adj1 === adj2)
                {
                    commonAdjs.push(adj1);
                }
            }
        }

        // Find common movable adjacencies, these are the locations to add.
        var commonMovableAdjs = new Array();
        var thisType = thisUnit[0];
        var thatType = thatUnit[0];

        if (thisType === "F")
        {
            for (var i = 0; i < commonAdjs.length; i++)
            {
                if (json[commonAdjs[i]]["type"] === "SEA")
                {
                    // Both must be fleets
                    if (thatType === "F")
                    {
                        commonMovableAdjs.push(commonAdjs[i]);
                    }
                }
                else if (json[commonAdjs[i]]["type"] === "COASTAL")
                {
                    commonMovableAdjs.push(commonAdjs[i]);
                }
            }
        }
        else
        {
            for (var i = 0; i < commonAdjs.length; i++)
            {
                if (json[commonAdjs[i]]["type"] === "INLAND")
                {
                    // Both must be armies
                    if (thatType === "A")
                    {
                        commonMovableAdjs.push(commonAdjs[i]);
                    }
                }
                else if (json[commonAdjs[i]]["type"] === "COASTAL")
                {
                    commonMovableAdjs.push(commonAdjs[i]);
                }
            }
        }

        for (var i = 0; i < commonMovableAdjs.length; i++)
        {
            locationDropdown[locationDropdown.length] = new Option(commonMovableAdjs[i], commonMovableAdjs[i]);
        }
    })

    locationDropdown.options[0].hidden = "true";
}

// Function for adding convoy locations to the "locationDropdown".
function addConvoyLocationsToDropdown(locationDropdown)
{
    var unitDropdown = document.getElementById("unitSelect");

    var army = unitDropdown.value.split(" ")[1]; // Location of the army that was selected
    var convoys = coastalConvoyTerrs[army];      // Fleets that can convoy this army
    convoyLocations = ["Choose..."];             // Reset convoy locations

    $.getJSON("map.json", function(json)
    {
        // Add all convoy adjacencies except for army territory
        for (var i = 0; i < convoys.length; i++)
        {
            var terrAdjs = json[convoys[i]]["adjacencies"]; // Adjacencies of this fleet

            for (var j = 0; j < terrAdjs.length; j++)
            {
                if (json[terrAdjs[j]]["type"] === "COASTAL" && terrAdjs[j] !== army)
                {
                    convoyLocations.push(terrAdjs[j]);
                }
            }
        }

        for (var i = 0; i < convoyLocations.length; i++)
        {
            locationDropdown[locationDropdown.length] = new Option(convoyLocations[i], convoyLocations[i]);
        }

        locationDropdown.options[0].hidden = "true";
    })
}

// Function executed on the first move choice.
// -- Determines what dropdowns to hide/unhide, adds move locations and units to the dropdowns
// -- as these may have been unhidden.
function firstMoveChoice(move)
{
    var unitDropdown = document.getElementById("unitSelect");
    var secondMoveDropdown = document.getElementById("secondMoveSelect");
    var locationDropdown = document.getElementById("locationSelect");

    if (move === "Holds")
    {
        // Hide all other dropdowns
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = true;
    }
    else if (move === "Move")
    {
        // Show only location dropdown
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = false;
    }
    else if (move === "Convoy")
    {
        // Show all dropdowns
        unitDropdown.hidden = false;
        locationDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
    }
    else if (move === "Support")
    {
        // Show all dropdowns except for location
        unitDropdown.hidden = false;
        locationDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
    }

    // Before adding options to a dropdown, we must remove the options already in the dropdown.
    removeOptions(unitDropdown);
    removeOptions(locationDropdown);
    addUnitsToDropdown(move, unitDropdown);
    addMoveLocationsToDropdown(locationDropdown);
}

// Function executed on the second move choice.
// -- Determines what locations to add to the location dropdown based on the
// -- first and second move choices.
function secondMoveChoice(move)
{
    var locationDropdown = document.getElementById("locationSelect");
    var unitDropdown = document.getElementById("unitSelect");
    var firstMoveDropdown = document.getElementById("firstMoveSelect");

    removeOptions(locationDropdown);

    if (move == "Holds")
    {
        // Hide location dropdown
        locationDropdown.hidden = true;

        addMoveLocationsToDropdown(locationDropdown);
    } 
    else if (move == "Move")
    {
        // Show location dropdown
        locationDropdown.hidden = false;

        if (firstMoveDropdown.value === "Convoy")
        {
            addConvoyLocationsToDropdown(locationDropdown);
        }
        else
        {
            addSupportLocationsToDropdown(unitDropdown.value, locationDropdown);
        }
    }
}

// Function acitvated on the unit choice when convoying or supporting.
// -- Unhides second move dropdown and adds moves to it.
function unitChoice(unit)
{
    var secondMoveDropdown = document.getElementById("secondMoveSelect");
    var firstMoveDropdown = document.getElementById("firstMoveSelect");
    var locationDropdown = document.getElementById("locationSelect");

    // Show the second move dropdown. Hide the location dropdown.
    secondMoveDropdown.hidden = false;
    locationDropdown.hidden = true;

    removeOptions(secondMoveDropdown);
    addSecondMovesToDropdown(unit, firstMoveDropdown.value, secondMoveDropdown);
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
// -- Takes the data in the dropdown(s) and adds the resulting order into the DB ("orders_temp").
function submitOrder()
{
    // All dropdowns.
    var firstMove = document.getElementById("firstMoveSelect");
    var unit = document.getElementById("unitSelect");
    var secondMove = document.getElementById("secondMoveSelect");
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
        if (firstMove.value == "Holds")
        {
            order += "-HOLDS";
            validOrder = true; // Other dropdowns are hidden
        }
        else if (firstMove.value == "Move")
        {
            if (location.value === "Choose...")
            {
                makeToast("Choose a location");
            }
            else
            {
                order += "-" + location.value;
                validOrder = true; // Other dropdowns are hidden
            }
        }
        else if (firstMove.value == "Support")
        {
            if (unit.value === "Choose...")
            {
                makeToast("Choose a unit");
            }
            else
            {
                if (secondMove.value === "Choose...")
                {
                    makeToast("Choose the move to support");
                }
                else
                {
                    if (secondMove.value === "Holds")
                    {
                        order += " S " + unit.value + "-HOLDS";
                        validOrder = true; // Other dropdowns are hidden
                    }
                    else if (secondMove.value === "Move")
                    {
                        if (location.value === "Choose...")
                        {
                            makeToast("Choose a location")
                        }
                        else
                        {
                            order += " S " + unit.value + "-" + location.value;
                            validOrder = true;
                        }
                    }
                }
            }
        }
        else if (firstMove.value == "Convoy")
        {
            if (unit.value === "Choose...")
            {
                makeToast("Choose a unit");
            }
            else
            {
                if (secondMove.value === "Choose...")
                {
                    makeToast("Choose the unit's move");
                }
                else
                {
                    if (location.value === "Choose...")
                    {
                        makeToast("Choose a location");
                    }
                    else
                    {
                        order += " C " + unit.value + "-" + location.value;
                        validOrder = true;
                    }
                }
            }
        }
    }

    if (validOrder)
    {
        // Put order in DB
        var ref = gameRef.child(gameID).child("players").child(username).child("orders_temp");

        ref.child(thisUnit).set({
            order: order
        });

        window.close();
    }
}