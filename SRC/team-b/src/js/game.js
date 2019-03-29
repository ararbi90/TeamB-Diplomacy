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
    ["Adriatic Sea", "ADR"], ["Aegean Sea", "AEG"], ["Baltic Sea", "BAL"], ["Barrents Sea", "BAR"],
    ["Black Sea", " BLA"], ["Eastern Mediterranean", "EAS"], ["English Channel", "ENG"], ["Gulf of Bothnia", "BOT"],
    ["Gulf of Lyon", "GOL"], ["Helgoland Bight", "HEL"], ["Ionian Sea", "ION"], ["Irish Sea", "IRI"],
    ["Mid - Atlantic Ocean", "MID"], ["North Atlantic Ocean", "NAT"], ["North Sea", "NTH"], ["Norwegian Sea", "NRG"],
    ["Skaggerak", "SKA"], ["Tyrrhenian Sea", "TYN"], ["West Mediterranean", "WES"]
  ]);

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
}

$("document").ready(function(){
    let timerController = setInterval(controllerTimer, 1000);
})