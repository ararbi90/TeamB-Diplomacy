$ = require('jquery');

//const electron = require('electron');

const ipc = require('electron').ipcRenderer;

// Array of moves
let moves = new Array("Choose...","Holds", "Move");
// Array of units
let supporUnits = new Array("Choose...");
// Array of locations
let moveLocations = new Array("Choose...");
let convoyLocations = new Array("Choose...");
//let secondaryLocations = new Array("Choose...","ADR","AEG","ALB","ANK","APU","ARM","BAL","BAR","BEL","BER","BLA","BOH","BRE","BUD","BUL","BUR","CLY","CON","DEN","EAS","EDI","ENG","FIN","GAL","GAS","GRE","LYO","BOT","HEL","HOL","ION","IRE","IRI","KIE","LVP","LVN","LON","MAR","MAO","MOS","MUN","NAP","NAO","NAF","NTH","NOR","NWG","PAR","PIC","PIE","POR","PRU","ROM","RUH","RUM","SER","SEV","SIL","SKA","SMY","SPA","STP","SWE","SWI","SYR","TRI","TUN","TUS","TYR","TYS","UKR","VEN","VIE","WAL","WAR","WES","YOR");

let secondaryLocations = new Array('Choose...', 'ADR', 'AEG', 'ALB', 'ANK', 'APU', 'ARM', 'BAL', 'BAR', 'BEL', 'BER', 'BLA', 'BOH', 'BOT', 'BRE', 'BUD', 'BUL', 'BUR', 'CLY', 'CON', 'DEN', 'EAS', 'EDI', 'ENG', 'FIN', 'GAL', 'GAS', 'GOL', 'GRE', 'HEL', 'HOL', 'ION', 'IRI', 'KIE', 'LON', 'LVN', 'LVP', 'MAR', 'MID', 'MOS', 'MUN', 'NAF', 'NAP', 'NAT', 'NRG', 'NTH', 'NWY', 'PAR', 'PIC', 'PIE', 'POR', 'PRU', 'ROM', 'RUH', 'RUM', 'SER', 'SEV', 'SIL', 'SKA', 'SMY', 'SPA', 'STP', 'SWE', 'SYR', 'TRI', 'TUN', 'TUS', 'TYN', 'TYR', 'UKR', 'VEN', 'VIE', 'WAL', 'WAR', 'WES', 'YOR');

let coastalConvoyTerrs = {};

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
            var supportable = false;

            // All terrs except for this one
            for (var user in players)
            {
                for (var terr in players[user].territories)
                {
                    var terrType = players[user].territories[terr].forceType;
                    if (terr !== code)
                    {
                        if (forceType === "F")
                        {
                            // Find common adjacencies
                            var adjs2 = json[terr]["adjacencies"];
                            adjs2.push(terr); // Can support this terr as well

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
                                    supporUnits.push(terrType + ' ' + terr);
                                    supportable = true;
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
                                    supporUnits.push(terrType + ' ' + terr);
                                    supportable = true;
                                }
                            }
                        }
                    }
                }
            }

            // Move logic
            if (supportable)
            {
                firstMoveDropdown[firstMoveDropdown.length] = new Option("Support", "Support");
                moves.push("Support");
            }
        
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

            // Get coastal convoy terrs
            for (var user in players)
            {
                var territories = players[user].territories;
                for (var t in territories)
                {
                    var uType = territories[t].forceType;
                    var tType = json[t]["type"];

                    if (tType === "COASTAL" && uType === "A") // All armies on coasts
                    {
                        var convoyTerrs = new Array();
                        var terrsToCheck = new Array(t);
                        while (true)
                        {
                            var newTerrsToCheck = new Array();
                            for (var i = 0; i < terrsToCheck.length; i++)
                            {
                                var c = terrsToCheck[i];
                                adjs = json[c]["adjacencies"];

                                for (var user in players)
                                {
                                    for (var terr in players[user].territories)
                                    {
                                        var unitType = players[user].territories[terr].forceType;
                                        var terrType = json[terr]["type"];
                                        if (terr !== c)
                                        {
                                            if (terrType === "SEA" && unitType === "F") // All fleets on water
                                            {
                                                var inAdjs = false;

                                                for (var j = 0; j < adjs.length; j++)
                                                {
                                                    if (adjs[j] === terr)
                                                    {
                                                        inAdjs = true;
                                                    }
                                                }

                                                if (inAdjs) // Fleet can convoy the army
                                                {
                                                    var adjs2 = json[terr]["adjacencies"];

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
                            terrsToCheck = newTerrsToCheck;
                            if (terrsToCheck.length === 0)
                            {
                                break;
                            }
                        }
                        coastalConvoyTerrs[t] = convoyTerrs;
                    }
                    
                }
            }

            // Can only convoy if in coastalConvoyTerrs
            if (forceType === "F" && json[code]["type"] === "SEA")
            {
                var keys = Object.keys(coastalConvoyTerrs);

                var inCCT = false;
        
                for (var i = 0; i < keys.length; i++)
                {
                    var data = coastalConvoyTerrs[keys[i]];

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
            
            // If army on the coast
            if (json[code]["type"] === "COASTAL" && forceType === "A")
            {
                var convoyTerrs = coastalConvoyTerrs[code];
                
                for (var i = 0; i < convoyTerrs.length; i++)
                {
                    var convoyAdjs = json[convoyTerrs[i]]["adjacencies"];

                    for (var j = 0; j < convoyAdjs.length; j++)
                    {
                        if (convoyAdjs[j] !== code)
                        {
                            if (json[convoyAdjs[j]][["type"]] === "COASTAL")
                            {
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

function addUnitsToDropdown(move, unitDropdown)
{
    unitDropdown[unitDropdown.length] = new Option(supporUnits[0], supporUnits[0]);

    if (move == "Convoy")
    {
        var label = document.getElementById("label");
        var thisUnit = label.innerHTML.split(" ");

        var keys = Object.keys(coastalConvoyTerrs);
        
        for (var i = 0; i < keys.length; i++)
        {
            var data = coastalConvoyTerrs[keys[i]];

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
                var unit = "A " + keys[i];
                unitDropdown[unitDropdown.length] = new Option(unit, unit);
            }
        }
    }
    else
    {
        // Otherwise add all support units
        for (var j = 1; j < supporUnits.length; ++j)
        {
            // Append the element to the end of the Array list
            unitDropdown[unitDropdown.length] = new Option(supporUnits[j], supporUnits[j]);
        }
    }

    unitDropdown.options[0].hidden = "true";
}

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
                // Append the element to the end of Array list for the second move
                secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[i], moves[i]);
            }
        }
    }
    else if (move == "Support")
    {
        secondMoveDropdown[secondMoveDropdown.length] = new Option(moves[0], moves[0]);

        var thisUnit = label.innerHTML.split(" ");
        var thatUnit = unit.split(" ");

        var holdSupportable = false;

        $.getJSON("map.json", function(json) {
            var adjs = json[thisUnit[1]]["adjacencies"];

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

function addSupportLocationsToDropdown(unit, locationDropdown)
{
    locationDropdown = document.getElementById("locationSelect");
    var label = document.getElementById("label");

    locationDropdown[locationDropdown.length] = new Option(secondaryLocations[0], secondaryLocations[0]);

    var thisUnit = label.innerHTML.split(" ");
    var thatUnit = unit.split(" ");

    $.getJSON("map.json", function(json) {
        var adjs = json[thisUnit[1]]["adjacencies"];
        var adjs2 = json[thatUnit[1]]["adjacencies"];

        var forceType = thisUnit[0];
        var terrType = thatUnit[0];

        var commonAdjs = new Array();
        var commonMovableAdjs = new Array();

        if (forceType === "F")
        {
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
                for (var i = 0; i < commonAdjs.length; i++)
                {
                    if (json[commonAdjs[i]]["type"] === "SEA")
                    {
                        if (terrType === "F")
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
        }
        else
        {
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
                for (var i = 0; i < commonAdjs.length; i++)
                {
                    if (json[commonAdjs[i]]["type"] === "INLAND")
                    {
                        if (terrType === "A")
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
        }

        for (var i = 0; i < commonMovableAdjs.length; i++)
        {
            locationDropdown[locationDropdown.length] = new Option(commonMovableAdjs[i], commonMovableAdjs[i]);
        }
    })

    locationDropdown.options[0].hidden = "true";
}

function addConvoyLocationsToDropdown(locationDropdown)
{
    var unitDropdown = document.getElementById("unitSelect");
    var label = document.getElementById("label");
    var army = unitDropdown.value.split(" ")[1];
    var fleet = label.innerHTML.split(" ")[1];

    var convoys = coastalConvoyTerrs[army];

    var adjsToAdd = new Array();


    $.getJSON("map.json", function(json) {
        // Add all convoy adjacencies except for army
        for (var i = 0; i < convoys.length; i++)
        {
            terr = convoys[i];
            terrAdjs = json[terr]["adjacencies"];
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

        // var branches = new Array();

        // var adjs = json[army]["adjacencies"];
        
        // var inAdjs = false;

        // // Checks adjacencies, finds territories that are in convoys
        // for (var i = 0; i < adjs.length; i++)
        // {
        //     var terr = adjs[i];

        //     var inConvoys = false;

        //     for (var j = 0; j < convoys.length; j++)
        //     {
        //         if (convoys[j] === terr)
        //         {
        //             inConvoys = true;
        //         }
        //     }

        //     if (inConvoys)
        //     {
        //         if (terr === fleet)
        //         {
        //             inAdjs = true;
        //             var newConvoys = new Array();
        //             for (var j = 0; j < convoys.length; j++)
        //             {
        //                 if (convoys[j] !== terr)
        //                 {
        //                     newConvoys.push(convoys[j]);
        //                 }
        //             }
        //             convoys = newConvoys;
        //             break;
        //         }
        //         else
        //         {
        //             var newConvoys = new Array();
        //             for (var j = 0; j < convoys.length; j++)
        //             {
        //                 if (convoys[j] !== terr)
        //                 {
        //                     newConvoys.push(convoys[j]);
        //                 }
        //             }
        //             convoys = newConvoys;
        //         }
        //     }
        // }

        // console.log(convoys);
    })
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
        locationDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
    } else if (move === "Support"){
        // Show all dropdowns except for location
        unitDropdown.hidden = false;
        locationDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
    }

    removeOptions(unitDropdown);
    removeOptions(locationDropdown);
    addUnitsToDropdown(move, unitDropdown);
    addLocationsToDropdown(move, locationDropdown);
}

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
        addLocationsToDropdown(locationDropdown);
    } 
    else if (move == "Move")
    {
        // Show location dropdown
        if (firstMoveDropdown.value === "Convoy")
        {
            locationDropdown.hidden = false;
            //addLocationsToDropdown(locationDropdown);
            addConvoyLocationsToDropdown(locationDropdown);
        }
        else
        {
            locationDropdown.hidden = false;
            addSupportLocationsToDropdown(unitDropdown.value, locationDropdown);
        }
    }
}

function unitChoice(unit)
{
    var secondMoveDropdown = document.getElementById("secondMoveSelect");
    var firstMoveDropdown = document.getElementById("firstMoveSelect");
    var locationDropdown = document.getElementById("locationSelect");

    secondMoveDropdown.hidden = false;
    locationDropdown.hidden = true;

    removeOptions(secondMoveDropdown);
    addSecondMovesToDropdown(unit, firstMoveDropdown.value, secondMoveDropdown);
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
