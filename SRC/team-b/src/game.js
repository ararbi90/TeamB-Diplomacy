$ = require("jquery");

var urlParams = new URLSearchParams(location.search);
console.log(urlParams.get("username"));
let username = urlParams.get("username");

document.getElementById("navbarDropdownMenuLink").innerHTML = username;

document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "dashboard.html?username=" + username;
    window.location.href = link;
});

document.getElementById("logOut").addEventListener("click", function () {
    let link = "index.html";
    window.location.href = link;
});

document.getElementById("newGame").addEventListener("click", function(){
    let link = "invite.html?username=" + username;
    window.location.href = link;
});

// Array of moves
var moves = new Array("Hold", "Move", "Convoy", "Support");
// Get dropdown element from DOM
var moveDropdowns = document.getElementsByClassName("moveSelect");

// Loop through each dropdown
for (var i = 0; i < moveDropdowns.length; ++i) {
    var dropdown = moveDropdowns[i];
    for (var j = 0; j < moves.length; ++j) {
        // Append the element to the end of Array list
        dropdown[dropdown.length] = new Option(moves[j], moves[j]);
    }
}

// Array of locations
var locations = new Array("ADR","AEG","ALB","ANK","APU","ARM","BAL","BAR","BEL","BER","BLA","BOH","BRE","BUD","BUL","BUR","CLY","CON","DEN","EAS","EDI","ENG","FIN","GAL","GAS","GRE","LYO","BOT","HEL","HOL","ION","IRE","IRI","KIE","LVP","LVN","LON","MAR","MAO","MOS","MUN","NAP","NAO","NAF","NTH","NOR","NWG","PAR","PIC","PIE","POR","PRU","ROM","RUH","RUM","SER","SEV","SIL","SKA","SMY","SPA","STP","SWE","SWI","SYR","TRI","TUN","TUS","TYR","TYS","UKR","VEN","VIE","WAL","WAR","WES","YOR");
// Get dropdown element from DOM
var locationDropdowns = document.getElementsByClassName("locationSelect");

// Loop through each dropdown
for (var i = 0; i < locationDropdowns.length; ++i) {
    var dropdown = locationDropdowns[i];
    for (var j = 0; j < locations.length; ++j) {
        // Append the element to the end of the Array list
        dropdown[dropdown.length] = new Option(locations[j], locations[j]);
    }
}

// Array of units
// TODO: pull the units from the database
var units = new Array("A PAR", "A BUR", "A PIC", "F ENG", "A BRE");
// Get dropdown element from DOM
var unitDropdowns = document.getElementsByClassName("unitSelect");

// Loop through each dropdown
for (var i = 0; i < unitDropdowns.length; ++i) {
    var dropdown = unitDropdowns[i];
    for (var j = 0; j < units.length; ++j) {
        // Append the element to the end of the Array list
        dropdown[dropdown.length] = new Option(units[j], units[j]);
    }
}

function moveChoice(move, index) {
    var unitDropdown = document.getElementById("unitSelect" + index);
    var locationDropdown = document.getElementById("locationSelect" + index);
    var moveSelect = document.getElementById("moveSelect" + index + "b");

    if(move=="Hold"){
        //Hide all other dropdowns
        unitDropdown.hidden = true;
        locationDropdown.hidden = true;
        moveSelect.hidden =  true;
        
    } else if(move == "Move"){
        //Show only location dropdown
        unitDropdown.hidden = true;
        locationDropdown.hidden = false;
        moveSelect.hidden =  true;
    } else if(move == "Convoy"){
        //Show all dropdowns
        unitDropdown.hidden = false;
        locationDropdown.hidden = false;
        moveSelect.hidden =  false;
    } else if(move == "Support"){
        //Show all dropdowns
        unitDropdown.hidden = false;
        locationDropdown.hidden = false;
        moveSelect.hidden =  false;
    }
}