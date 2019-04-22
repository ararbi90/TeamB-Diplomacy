$ = require("jquery");

var urlParams = new URLSearchParams(location.search);
//console.log(urlParams.get("username"));
let username = urlParams.get("username");


//console.log(urlParams.get("getID"));
//let gameID = urlParams.get("getID");

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

// NOTES:
//     - Denmark is adjacent to Kiel.
//     - Sweden adjacent to Denmark not Helgoland Bight.
//     - Baltic Sea not adjacent to Helgoland Bight.
//     - Skaggerak not adjacent to Helgoland Bight.
//     - Aegean Sea is not adjacent to Black Sea.


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
    x.innerHTML = territory;
  
    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);

    // Get data from JSON
    $.getJSON("map.json", function(json) {
        console.log(json[territory]);

        // Outputs name of territory
        console.log("==============");
        console.log(json[territory]["name"].toUpperCase());
        console.log("==============");

        // Outputs names of adjacencies
        json[territory]["adjacencies"].forEach(function(element) {
            console.log(json[element]["name"]);
        });

        // Outputs adjacencies of coasts if they exist
        if (json[territory]["southCoast"] != undefined)
        {
            console.log("............");
            console.log("SOUTH COAST");
            console.log("............");
            json[territory]["southCoast"].forEach(function(element) {
                console.log(json[element]["name"]);
            })
        }
        if (json[territory]["eastCoast"] != undefined)
        {
            console.log("............");
            console.log("EAST COAST");
            console.log("............");
            json[territory]["eastCoast"].forEach(function(element) {
                console.log(json[element]["name"]);
            })
        }
        if (json[territory]["northCoast"] != undefined)
        {
            console.log("............");
            console.log("NORTH COAST");
            console.log("............");
            json[territory]["northCoast"].forEach(function(element) {
                console.log(json[element]["name"]);
            })
        }
    });
}

$("document").ready(function(){
    let timerController = setInterval(controllerTimer, 1000);
})