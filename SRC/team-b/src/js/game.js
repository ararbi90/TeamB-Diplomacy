$ = require("jquery");

var urlParams = new URLSearchParams(location.search);
console.log(urlParams.get("username"));
let username = urlParams.get("username");

document.getElementById("navbarDropdownMenuLink").innerHTML = username;

document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "../html/dashboard.html?username=" + username;
    window.location.href = link;
});
document.getElementById("gameRules").addEventListener("click", function () {
    let link = "../html/rules.html?username=" + username;
    window.location.href = link;
});
document.getElementById("logOut").addEventListener("click", function () {
    let link = "../html/index.html";
    window.location.href = link;
});


// Map of territories and their abbreviations
var territoryCodes = new Map([
    ["Bohemia", "BOH"], ["Budapest", "BUD"], ["Galicia", "GAL"], ["Trieste", "TRI"], ["Tyrolia", "TYR"],
    ["Vienna", "VIE"], ["Clyde", "CLY"], ["Edinburgh", "EDI"], ["Liverpool", "LVP"], ["London", "LON"],
    ["Wales", "WAL"], ["York", "YOR"], ["Brest", "BRE"], ["Burgundy", "BUR"], ["Gascony", "GAS"],
    ["Marseilles", "MAR"], ["Paris", "PAR"], ["Picardy", "PIC"], ["Berlin", "BER"], ["Kiel", "KIE"],
    ["Munich", "MUN"], ["Prussia", "PRU"], ["Ruhr", "RUH"], ["Silesia", "SIL"], ["Apulia", "APU"],
    ["Naples", "NAP"], ["Piedmont", "PIE"], ["Rome", "ROM"], ["Tuscany", "TUS"], ["Venice", "VEN"],
    ["Livonia", "LVN"], ["Moscow", "MOS"], ["Sevastopol", "SEV"], ["St. Petersburg", "STP"], ["Ukraine", "UKR"],
    ["Warsaw", "WAR"], ["Ankara", "ANK"], ["Armenia", "ARM"], ["Constantinople", "CON"], ["Smyrna", "SMY"],
    ["Syria", "SYR"], ["Albania", "ALB"], ["Belgium", "BEL"], ["Bulgaria", "BUL"], ["Denmark", "DEN"],
    ["Finland", "FIN"], ["Greece", "GRE"], ["Holland", "Hol"], ["Norway", "NWY"], ["North Africa", "NAF"],
    ["Portugal", "POR"], ["Romania", "RUM"], ["Serbia", "SER"], ["Spain", "SPA"], ["Sweden", "SWE"], ["Tunisia", "TUN"],
    ["Adriatic Sea", "ADR"], ["Aegean Sea", "AEG"], ["Baltic Sea", "BAL"], ["Barents Sea", "BAR"],
    ["Black Sea", " BLA"], ["Eastern Mediterranean", "EAS"], ["English Channel", "ENG"], ["Gulf of Bothnia", "BOT"],
    ["Gulf of Lyon", "GOL"], ["Helgoland Bight", "HEL"], ["Ionian Sea", "ION"], ["Irish Sea", "IRI"],
    ["Mid - Atlantic Ocean", "MID"], ["North Atlantic Ocean", "NAT"], ["North Sea", "NTH"], ["Norwegian Sea", "NRG"],
    ["Skaggerak", "SKA"], ["Tyrrhenian Sea", "TYN"], ["Western Mediterranean", "WES"]
  ]);

// Array of territories and their indicies in the adjacency list
var territoryIndicies = new Array(
    "Bohemia", // 0 
    "Budapest", // 1
    "Galicia", // 2
    "Trieste", // 3
    "Tyrolia", // 4
    "Vienna", // 5
    "Clyde", // 6
    "Edinburgh", // 7
    "Liverpool", // 8
    "London", // 9
    "Wales", // 10
    "York", // 11
    "Brest", // 12
    "Burgundy", // 13
    "Gascony", // 14
    "Marseilles", // 15
    "Paris", // 16
    "Picardy", // 17
    "Berlin", // 18
    "Kiel", // 19
    "Munich", // 20
    "Prussia", // 21
    "Ruhr", // 22
    "Silesia", // 23
    "Apulia", // 24
    "Naples", // 25
    "Piedmont", // 26
    "Rome", // 27
    "Tuscany", // 28
    "Venice", // 29
    "Livonia", // 30
    "Moscow", //  31
    "Sevastopol", // 32
    "St. Petersburg", // 33
    "Ukraine", // 34
    "Warsaw", // 35
    "Ankara", // 36
    "Armenia", // 37
    "Constantinople", // 38
    "Smyrna", // 39
    "Syria", // 40
    "Albania", // 41
    "Belgium", // 42
    "Bulgaria", // 43
    "Denmark", // 44
    "Finland", // 45
    "Greece", // 46
    "Holland", // 47
    "Norway", // 48
    "North Africa", // 49
    "Portugal", // 50
    "Romania", // 51
    "Serbia", // 52
    "Spain", // 53
    "Sweden", // 54
    "Tunisia", // 55
    "Adriatic Sea", // 56
    "Aegean Sea", // 57
    "Baltic Sea", // 58
    "Barents Sea", // 59
    "Black Sea", // 60
    "Eastern Mediterranean", // 61
    "English Channel", // 62
    "Gulf of Bothnia", // 63
    "Gulf of Lyon", // 64
    "Helgoland Bight", // 65
    "Ionian Sea", // 66
    "Irish Sea", // 67
    "Mid - Atlantic Ocean", // 68
    "North Atlantic Ocean", // 69
    "North Sea", // 70
    "Norwegian Sea", // 71
    "Skaggerak", // 72
    "Tyrrhenian Sea", // 73
    "Western Mediterranean" // 74
  );

// Adjacency list
var adjacencyList = new Array(
    [2, 4, 5, 20, 23], // Bohemia - 0
    [2, 3, 5, 51, 52], // Budapest - 1
    [0, 1, 5, 23, 34, 35, 51], // Galicia - 2
    [1, 4, 5, 29, 41, 52, 56], // Trieste - 3
    [0, 3, 5, 20, 26, 29], // Tyrolia - 4
    [0, 1, 2, 3, 4], // Vienna - 5
    [7, 8, 69, 71], // Clyde - 6
    [6, 8, 11, 70, 71], // Edinburgh - 7
    [6, 7, 10, 11, 67, 69], // Liverpool - 8
    [10, 11, 62, 70], // London - 9
    [8, 9, 11, 62, 67], // Wales - 10
    [7, 8, 9, 10, 70], // York - 11
    [14, 16, 17, 62, 68], // Brest - 12
    [14, 15, 16, 17, 20, 22, 42], // Burgundy - 13
    [12, 13, 15, 16, 53, 68], // Gascony - 14
    [13, 14, 26, 53, 64], // Marseilles - 15
    [12, 13, 14, 17], // Paris - 16
    [12, 13, 16, 42, 62], // Picardy - 17
    [19, 20, 21, 23, 58], // Berlin - 18
    [18, 20, 22, 44, 47, 58, 65], // Kiel - 19
    [0, 4, 13, 18, 19, 22, 23], // Munich - 20
    [18, 23, 30, 35, 58], // Prussia - 21
    [13, 19, 20, 42, 47], // Ruhr - 22
    [0, 2, 18, 20, 21, 35], // Silesia - 23
    [25, 27, 29, 56, 66], // Apulia - 24
    [24, 27, 66, 73], // Naples - 25
    [4, 15, 28, 29, 64], // Piedmont - 26
    [24, 25, 28, 29, 73], // Rome - 27
    [26, 27, 29, 64, 73], // Tuscany - 28
    [3, 4, 24, 26, 27, 28, 56], // Venice - 29
    [21, 31, 33, 35, 58, 63], // Livonia - 30
    [30, 32, 33, 34, 35], // Moscow - 31
    [31, 34, 37, 51, 60], // Sevastopol - 32
    [30, 31, 45, 48, 59, 63], // St. Petersburg - 33
    [2, 31, 32, 35, 51], // Ukraine - 34
    [2, 21, 23, 30, 31, 34], // Warsaw - 35
    [37, 38, 39, 60], // Ankara - 36
    [32, 36, 39, 40, 60], // Armenia - 37
    [36, 39, 43, 57, 60], // Constantinople - 38
    [36, 37, 38, 40, 57, 61], // Smyrna - 39
    [37, 39, 61], // Syria - 40
    [3, 46, 52, 56, 66], // Albania - 41
    [13, 17, 22, 47, 62, 70], // Belgium - 42
    [38, 46, 51, 52, 57, 60], // Bulgaria - 43
    [19, 54, 58, 65, 70, 72], // Denmark - 44 (See Notes...)
    [33, 48, 54, 63], // Finland - 45
    [41, 43, 52, 57, 66], // Greece - 46
    [19, 22, 42, 65, 70], // Holland - 47
    [33, 45, 54, 59, 70, 71, 72], // Norway - 48
    [55, 68, 74], // North Africa - 49
    [53, 68], // Portugal - 50
    [1, 2, 32, 34, 43, 52, 60], // Romania - 51
    [1, 3, 41, 43, 46, 51], // Serbia - 52
    [14, 15, 50, 64, 68, 74], // Spain - 53
    [44, 45, 48, 58, 63, 72], // Sweden - 54 (See Notes...)
    [49, 66, 73, 74], // Tunisia - 55
    [3, 24, 29, 41, 66], // Adriatic Sea - 56
    [38, 39, 43, 46, 60, 61, 66], // Aegean Sea - 57
    [18, 19, 21, 30, 44, 54, 63], // Baltic Sea - 58 (See Notes...)
    [33, 48, 71], // Barents Sea - 59
    [32, 36, 37, 38, 43, 51, 57], // Black Sea - 60
    [39, 40, 57, 66], // Eastern Mediterranean - 61
    [9, 10, 12, 17, 42, 67, 68, 70], // English Channel - 62
    [30, 33, 45, 54, 58], // Gulf of Bothnia - 63
    [15, 26, 28, 53, 73, 74], // Gulf of Lyon - 64
    [19, 44, 47, 70], // Helgoland Bight - 65 (See Notes...)
    [24, 25, 41, 46, 55, 56, 57, 61, 73], // Ionian Sea - 66
    [8, 10, 62, 68, 69], // Irish Sea - 67
    [12, 14, 49, 50, 53, 62, 67, 69, 74], // Mid - Atlantic Ocean - 68
    [6, 8, 67, 68, 71], // North Atlantic Ocean - 69
    [7, 9, 11, 42, 44, 47, 48, 62, 65, 71, 72], // North Sea - 70
    [6, 7, 48, 59, 69, 70], // Norwegian Sea - 71
    [44, 48, 54, 70], // Skaggerak - 72 (See Notes...)
    [25, 27, 28, 55, 64, 66, 74], // Tyrrhenian Sea - 73
    [49, 53, 55, 64, 68, 73] // Western Mediterranean - 74
);

// NOTES:
//     - Sweden adjacent to Denmark not Helgoland Bight.
//     - Baltic Sea not adjacent to Helgoland Bight.
//     - Skaggerak not adjacent to Helgoland Bight.

// Array of moves
var moves = new Array("Choose...","Hold", "Move", "Convoy", "Support");
// Array of units (TODO: pull the units from the database)
var units = new Array("Choose...","A PAR", "A BUR", "A PIC", "F ENG", "A BRE");
// Array of locations
var locations = new Array("Choose...","ADR","AEG","ALB","ANK","APU","ARM","BAL","BAR","BEL","BER","BLA","BOH","BRE","BUD",
    "BUL","BUR","CLY","CON","DEN","EAS","EDI","ENG","FIN","GAL","GAS","GRE","LYO","BOT","HEL","HOL","ION","IRE","IRI","KIE",
    "LVP","LVN","LON","MAR","MAO","MOS","MUN","NAP","NAO","NAF","NTH","NOR","NWG","PAR","PIC","PIE","POR","PRU","ROM","RUH",
    "RUM","SER","SEV","SIL","SKA","SMY","SPA","STP","SWE","SWI","SYR","TRI","TUN","TUS","TYR","TYS","UKR","VEN","VIE","WAL",
    "WAR","WES","YOR");

// Get first move dropdown element from DOM
var firstMoveDropdowns = document.getElementsByClassName("firstMoveSelect");

// Loop through each first move dropdown
for (var i = 0; i < firstMoveDropdowns.length; ++i) {
    var dropdown = firstMoveDropdowns[i];
    for (var j = 0; j < moves.length; ++j) {
        // Append the element to the end of Array list for the first move
        dropdown[dropdown.length] = new Option(moves[j], moves[j]);
    }
    dropdown.options[0].hidden = "true";
}

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
            if (moves[i] === "Move" || moves[i] === "Hold" || moves[i] === "Choose...")
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

function addLocationsToDropdown(locationDropdown)
{   
    for (var i = 0; i < locations.length; ++i)
    {
        // Append the element to the end of Array list
        locationDropdown[locationDropdown.length] = new Option(locations[i], locations[i]);
    }

    locationDropdown.options[0].hidden = "true";
}

function firstMoveChoice(move, index) {
    var unitDropdown = document.getElementById("unitSelect" + index);
    var secondMoveDropdown = document.getElementById("secondMoveSelect" + index);
    var locationDropdown = document.getElementById("locationSelect" + index);

    if (move == "Hold"){
        // Hide all other dropdowns
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = true;
    } else if (move == "Move"){
        // Show only location dropdown
        unitDropdown.hidden = true;
        secondMoveDropdown.hidden =  true;
        locationDropdown.hidden = false;
    } else if (move == "Convoy"){
        // Show all dropdowns
        unitDropdown.hidden = false;
        secondMoveDropdown.hidden =  false;
        locationDropdown.hidden = false;
    } else if (move == "Support"){
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
    addLocationsToDropdown(locationDropdown);
}

function secondMoveChoice(move, index)
{
    var locationDropdown = document.getElementById("locationSelect" + index);

    if (move == "Hold")
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

function controllerTimer(){
    let t = $("#timer").html();
    let hr = parseInt(t.substring(0, t.indexOf(":")));
    let min = parseInt(t.substring(t.indexOf(":") + 1));
    let newMin = min - 1;
    let newHr = hr;
    if(newMin < 0){
        newHr = hr - 1;
        newMin = 59;
    }
    if(newMin >= 10 && newHr >= 10){
        $("#timer").html(newHr + ":" + newMin);
    }
    else if(newMin >= 10){
        $("#timer").html("0" + newHr + ":" + newMin);
    }
    else if(newHr >= 10){
        $("#timer").html(newHr + ":0" + newMin);
    }
    else{
        $("#timer").html("0" + newHr + ":0" + newMin);
    }
}

function makeToast(territory)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = territory + " (" + territoryCodes.get(territory) + ")";
  
    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);

    var index = territoryIndicies.indexOf(territory);

    console.log("===============");

    for (var i = 0; i < adjacencyList[index].length; ++i)
    {
        console.log(territoryIndicies[adjacencyList[index][i]]);
    }
}

$("document").ready(function(){
    let timerController = setInterval(controllerTimer, 1000);
})