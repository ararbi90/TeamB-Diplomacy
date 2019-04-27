$ = require('jquery');

//const electron = require('electron');

const ipc = require('electron').ipcRenderer;

// Array of moves
let moves = new Array("Choose...","Holds", "Move", "Support");
// Array of units
let units = new Array("Choose...");
// Array of locations
let moveLocations = new Array("Choose...");
//let secondaryLocations = new Array("Choose...","ADR","AEG","ALB","ANK","APU","ARM","BAL","BAR","BEL","BER","BLA","BOH","BRE","BUD","BUL","BUR","CLY","CON","DEN","EAS","EDI","ENG","FIN","GAL","GAS","GRE","LYO","BOT","HEL","HOL","ION","IRE","IRI","KIE","LVP","LVN","LON","MAR","MAO","MOS","MUN","NAP","NAO","NAF","NTH","NOR","NWG","PAR","PIC","PIE","POR","PRU","ROM","RUH","RUM","SER","SEV","SIL","SKA","SMY","SPA","STP","SWE","SWI","SYR","TRI","TUN","TUS","TYR","TYS","UKR","VEN","VIE","WAL","WAR","WES","YOR");

let secondaryLocations = new Array('Choose...', 'ADR', 'AEG', 'ALB', 'ANK', 'APU', 'ARM', 'BAL', 'BAR', 'BEL', 'BER', 'BLA', 'BOH', 'BOT', 'BRE', 'BUD', 'BUL', 'BUR', 'CLY', 'CON', 'DEN', 'EAS', 'EDI', 'ENG', 'FIN', 'GAL', 'GAS', 'GOL', 'GRE', 'HEL', 'HOL', 'ION', 'IRI', 'KIE', 'LON', 'LVN', 'LVP', 'MAR', 'MID', 'MOS', 'MUN', 'NAF', 'NAP', 'NAT', 'NRG', 'NTH', 'NWY', 'PAR', 'PIC', 'PIE', 'POR', 'PRU', 'ROM', 'RUH', 'RUM', 'SER', 'SEV', 'SIL', 'SKA', 'SMY', 'SPA', 'STP', 'SWE', 'SYR', 'TRI', 'TUN', 'TUS', 'TYN', 'TYR', 'UKR', 'VEN', 'VIE', 'WAL', 'WAR', 'WES', 'YOR');

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

            //console.log(Object.keys(json));

            // Can only convoy if Fleet on SEA
            if (forceType === "F" && json[code]["type"] === "SEA")
            {
                moves.push("Convoy");
            }

            // All units except for this one
            for (var user in players)
            {
                for (var terr in players[user].territories)
                {
                    var terrType = json[terr]["type"];
                    if (terr !== code)
                    {
                        if (forceType === "F")
                        {
                            // Find common adjacencies
                            var adjs2 = json[terr]["adjacencies"];
                            adjs2.push(terr);

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

                            if (commonAdjs.length > 0)
                            {
                                // Movable if we can move there
                                var movable = false;
                                for (var i = 0; i < commonAdjs.length; i++)
                                {
                                    if (json[commonAdjs[i]]["type"] === "SEA")
                                    {
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
                                    units.push(players[user].territories[terr].forceType + ' ' + terr);
                                }
                            }
                        }
                        else
                        {
                            // Find common adjacencies
                            var adjs2 = json[terr]["adjacencies"];
                            adjs2.push(terr);

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

                            if (commonAdjs.length > 0)
                            {
                                // Movable if we can move there
                                var movable = false;
                                for (var i = 0; i < commonAdjs.length; i++)
                                {
                                    if (json[commonAdjs[i]]["type"] === "INLAND")
                                    {
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
                                    units.push(players[user].territories[terr].forceType + ' ' + terr);
                                }
                            }
                        }
                    }
                }
            }
        
            // Move logic
            for (var i = 0; i < adjs.length; i++)
            {
                a = adjs[i];

                if (forceType === "F")
                {
                    if (json[a]["type"] === "COASTAL" || json[a]["type"] === "SEA")
                    {
                        moveLocations.push(a);
                    }
                }
                else
                {
                    if (json[code]["type"] === "COASTAL")
                    {
                        if (json[a]["type"] === "INLAND")
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
            }
            if (json[code]["type"] === "COASTAL" && forceType === "A")
            {
                var keys = Object.keys(json);
                for (var j = 0; j < keys.length; j++)
                {
                    if (json[keys[j]]["type"] === "COASTAL")
                    {
                        moveLocations.push(keys[j]);
                    }
                }
            }
        });
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

function addUnitsToDropdown(move, unitDropdown)
{
    if (move == "Convoy")
    {
        for (var i = 0; i < units.length; ++i)
        {
            // Add only army units (can't convoy fleet)
            if (units[i].charAt(0) === "A" || units[i] === "Choose...")
            {
                // Append the element to the end of the Array list
                unitDropdown[unitDropdown.length] = new Option(units[i], units[i]);
            }
        }
    }
    else
    {
        // Otherwise add all units
        for (var j = 0; j < units.length; ++j)
        {
            // Append the element to the end of the Array list
            unitDropdown[unitDropdown.length] = new Option(units[j], units[j]);
        }
    }

    unitDropdown.options[0].hidden = "true";
}

function addSecondMovesToDropdown(move, secondMoveDropdown)
{
    if (move == "Convoy")
    {
        for (var i = 0; i < moves.length; ++i)
        {
            // Only valid second move for "Convoy" is "Move"
            if (moves[i] === "Move" || moves[i] === "Choose...")
            {
                // Append the element to the end of Array list for the second move
                secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[i], moves[i]);
            }
        }
    }
    else if (move == "Support")
    {
        for (var i = 0; i < moves.length; ++i)
        {
            // Only valid second moves for "Support" is {"Move", "Hold"}
            if (moves[i] === "Move" || moves[i] === "Holds" || moves[i] === "Choose...")
            {
                // Append the element to the end of Array list for the second move
                secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[i], moves[i]);
            }
        }
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

function addLocationsToDropdown(move, locationDropdown)
{
    locationDropdown = document.getElementById("locationSelect");
    if (move === "Move")
    {
        for (var i = 0; i < moveLocations.length; ++i)
        {
            // Append the element to the end of Array list
            locationDropdown[locationDropdown.length] = new Option(moveLocations[i], moveLocations[i]);
        }
    }
    else
    {
        for (var i = 0; i < secondaryLocations.length; ++i)
        {
            // Append the element to the end of Array list
            locationDropdown[locationDropdown.length] = new Option(secondaryLocations[i], secondaryLocations[i]);
        }
    }

    locationDropdown.options[0].hidden = "true";
}

function firstMoveChoice(move) {
    var unitDropdown = document.getElementById("unitSelect");
    var secondMoveDropdown = document.getElementById("secondMoveSelect");
    var locationDropdown = document.getElementById("locationSelect");

    if (move === "Holds"){
        // Hide all other dropdowns
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = true;
    } else if (move === "Move"){
        // Show only location dropdown
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = false;
    } else if (move === "Convoy"){
        // Show all dropdowns
        unitDropdown.hidden = false;
        secondMoveDropdown.hidden =  false;
        locationDropdown.hidden = false;
    } else if (move === "Support"){
        // Show all dropdowns except for location
        unitDropdown.hidden = false;
        secondMoveDropdown.hidden =  false;
        locationDropdown.hidden = true;
    }

    removeOptions(unitDropdown);
    removeOptions(secondMoveDropdown);
    removeOptions(locationDropdown);
    addUnitsToDropdown(move, unitDropdown);
    addSecondMovesToDropdown(move, secondMoveDropdown);
    addLocationsToDropdown(move, locationDropdown);
}

function secondMoveChoice(move)
{
    var locationDropdown = document.getElementById("locationSelect");

    if (move == "Holds")
    {
        // Hide location dropdown
        locationDropdown.hidden = true;
        
    } 
    else if (move == "Move")
    {
        // Show location dropdown
        locationDropdown.hidden = false;
    }

    removeOptions(locationDropdown);
    addLocationsToDropdown(locationDropdown);
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
    var unit = document.getElementById("unitSelect");
    var secondMove = document.getElementById("secondMoveSelect");
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
        if (firstMove.value == "Holds")
        {
            order += "-HOLDS";
            validOrder = true;
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
                validOrder = true;
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
                        validOrder = true;
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