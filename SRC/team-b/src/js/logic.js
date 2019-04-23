function testLogic( selectedCountry )
{
console.log("Logic testing");
var modal = document.getElementById('actionModal');
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal 
     modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

}


//CONVOY FUNCTION STARTS
function convoy(selectedCountry) {

    var stuff = {
        "BOH": {"name": "Bohemia", "type": "INLAND", "adjacencies": ["GAL", "TYR", "VIE", "MUN", "SIL"]}, 
        "BUD": {"name": "Budapest", "type": "INLAND", "adjacencies": ["GAL", "TRI", "VIE", "RUM", "SER"]}, 
        "GAL": {"name": "Galicia", "type": "INLAND", "adjacencies": ["BOH", "BUD", "VIE", "SIL", "UKR", "WAR", "RUM"]}, 
        "TRI": {"name": "Trieste", "type": "COASTAL", "adjacencies": ["BUD", "TYR", "VIE", "VEN", "ALB", "SER", "ADR"]}, 
        "TYR": {"name": "Tyrolia", "type": "INLAND", "adjacencies": ["BOH", "TRI", "VIE", "MUN", "PIE", "VEN"]}, 
        "VIE": {"name": "Vienna", "type": "INLAND", "adjacencies": ["BOH", "BUD", "GAL", "TRI", "TYR"]}, 
        "CLY": {"name": "Clyde", "type": "COASTAL", "adjacencies": ["EDI", "LVP", "NAT", "NRG"]}, 
        "EDI": {"name": "Edinburgh", "type": "COASTAL", "adjacencies": ["CLY", "LVP", "YOR", "NTH", "NRG"]}, 
        "LVP": {"name": "Liverpool", "type": "COASTAL", "adjacencies": ["CLY", "EDI", "WAL", "YOR", "IRI", "NAT"]}, 
        "LON": {"name": "London", "type": "COASTAL", "adjacencies": ["WAL", "YOR", "ENG", "NTH"]}, 
        "WAL": {"name": "Wales", "type": "COASTAL", "adjacencies": ["LVP", "LON", "YOR", "ENG", "IRI"]}, 
        "YOR": {"name": "York", "type": "COASTAL", "adjacencies": ["EDI", "LVP", "LON", "WAL", "NTH"]}, 
        "BRE": {"name": "Brest", "type": "COASTAL", "adjacencies": ["GAS", "PAR", "PIC", "ENG", "MID"]}, 
        "BUR": {"name": "Burgundy", "type": "INLAND", "adjacencies": ["GAS", "MAR", "PAR", "PIC", "MUN", "RUH", "BEL"]}, 
        "GAS": {"name": "Gascony", "type": "COASTAL", "adjacencies": ["BRE", "BUR", "MAR", "PAR", "SPA", "MID"]}, 
        "MAR": {"name": "Marseilles", "type": "COASTAL", "adjacencies": ["BUR", "GAS", "PIE", "SPA", "GOL"]}, 
        "PAR": {"name": "Paris", "type": "INLAND", "adjacencies": ["BRE", "BUR", "GAS", "PIC"]}, 
        "PIC": {"name": "Picardy", "type": "COASTAL", "adjacencies": ["BRE", "BUR", "PAR", "BEL", "ENG"]}, 
        "BER": {"name": "Berlin", "type": "COASTAL", "adjacencies": ["KIE", "MUN", "PRU", "SIL", "BAL"]}, 
        "KIE": {"name": "Kiel", "type": "COASTAL", "adjacencies": ["BER", "MUN", "RUH", "DEN", "HOL", "BAL", "HEL"]}, 
        "MUN": {"name": "Munich", "type": "INLAND", "adjacencies": ["BOH", "TYR", "BUR", "BER", "KIE", "RUH", "SIL"]}, 
        "PRU": {"name": "Prussia", "type": "COASTAL", "adjacencies": ["BER", "SIL", "LVN", "WAR", "BAL"]}, 
        "RUH": {"name": "Ruhr", "type": "INLAND", "adjacencies": ["BUR", "KIE", "MUN", "BEL", "HOL"]}, 
        "SIL": {"name": "Silesia", "type": "INLAND", "adjacencies": ["BOH", "GAL", "BER", "MUN", "PRU", "WAR"]}, 
        "APU": {"name": "Apulia", "type": "COASTAL", "adjacencies": ["NAP", "ROM", "VEN", "ADR", "ION"]}, 
        "NAP": {"name": "Naples", "type": "COASTAL", "adjacencies": ["APU", "ROM", "ION", "TYN"]}, 
        "PIE": {"name": "Piedmont", "type": "COASTAL", "adjacencies": ["TYR", "MAR", "TUS", "VEN", "GOL"]}, 
        "ROM": {"name": "Rome", "type": "COASTAL", "adjacencies": ["APU", "NAP", "TUS", "VEN", "TYN"]}, 
        "TUS": {"name": "Tuscany", "type": "COASTAL", "adjacencies": ["PIE", "ROM", "VEN", "GOL", "TYN"]}, 
        "VEN": {"name": "Venice", "type": "COASTAL", "adjacencies": ["TRI", "TYR", "APU", "PIE", "ROM", "TUS", "ADR"]}, 
        "LVN": {"name": "Livonia", "type": "COASTAL", "adjacencies": ["PRU", "MOS", "STP", "WAR", "BAL", "BOT"]}, 
        "MOS": {"name": "Moscow", "type": "INLAND", "adjacencies": ["LVN", "SEV", "STP", "UKR", "WAR"]}, 
        "SEV": {"name": "Sevastopol", "type": "COASTAL", "adjacencies": ["MOS", "UKR", "ARM", "RUM", "BLA"]}, 
        "STP": {"name": "St. Petersburg", "type": "COASTAL", "adjacencies": ["LVN", "MOS", "FIN", "NWY", "BAR", "BOT"], 
            "southCoast": ["FIN", "BOT", "LVN"], 
            "northCoast": ["BAR", "NWY"]}, 
        "UKR": {"name": "Ukraine", "type": "INLAND", "adjacencies": ["GAL", "MOS", "SEV", "WAR", "RUM"]}, 
        "WAR": {"name": "Warsaw", "type": "INLAND", "adjacencies": ["GAL", "PRU", "SIL", "LVN", "MOS", "UKR"]}, 
        "ANK": {"name": "Ankara", "type": "COASTAL", "adjacencies": ["ARM", "CON", "SMY", "BLA"]}, 
        "ARM": {"name": "Armenia", "type": "COASTAL", "adjacencies": ["SEV", "ANK", "SMY", "SYR", "BLA"]}, 
        "CON": {"name": "Constantinople", "type": "COASTAL", "adjacencies": ["ANK", "SMY", "BUL", "AEG", "BLA"]}, 
        "SMY": {"name": "Smyrna", "type": "COASTAL", "adjacencies": ["ANK", "ARM", "CON", "SYR", "AEG", "EAS"]}, 
        "SYR": {"name": "Syria", "type": "COASTAL", "adjacencies": ["ARM", "SMY", "EAS"]}, 
        "ALB": {"name": "Albania", "type": "COASTAL", "adjacencies": ["TRI", "GRE", "SER", "ADR", "ION"]}, 
        "BEL": {"name": "Belgium", "type": "COASTAL", "adjacencies": ["BUR", "PIC", "RUH", "HOL", "ENG", "NTH"]}, 
        "BUL": {"name": "Bulgaria", "type": "COASTAL", "adjacencies": ["CON", "GRE", "RUM", "SER", "AEG", "BLA"], 
            "southCoast": ["GRE", "AEG", "CON"], 
            "eastCoast": ["CON", "BLA", "RUM"]}, 
        "DEN": {"name": "Denmark", "type": "COASTAL", "adjacencies": ["KIE", "SWE", "BAL", "HEL", "NTH", "SKA"]}, 
        "FIN": {"name": "Finland", "type": "COASTAL", "adjacencies": ["STP", "NWY", "SWE", "BOT"]}, 
        "GRE": {"name": "Greece", "type": "COASTAL", "adjacencies": ["ALB", "BUL", "SER", "AEG", "ION"]}, 
        "HOL": {"name": "Holland", "type": "COASTAL", "adjacencies": ["KIE", "RUH", "BEL", "HEL", "NTH"]}, 
        "NWY": {"name": "Norway", "type": "COASTAL", "adjacencies": ["STP", "FIN", "SWE", "BAR", "NTH", "NRG", "SKA"]}, 
        "NAF": {"name": "North Africa", "type": "COASTAL", "adjacencies": ["TUN", "MID", "WES"]}, 
        "POR": {"name": "Portugal", "type": "COASTAL", "adjacencies": ["SPA", "MID"]}, 
        "RUM": {"name": "Romania", "type": "COASTAL", "adjacencies": ["BUD", "GAL", "SEV", "UKR", "BUL", "SER", "BLA"]}, 
        "SER": {"name": "Serbia", "type": "INLAND", "adjacencies": ["BUD", "TRI", "ALB", "BUL", "GRE", "RUM"]}, 
        "SPA": {"name": "Spain", "type": "COASTAL", "adjacencies": ["GAS", "MAR", "POR", "GOL", "MID", "WES"], 
            "southCoast": ["MID", "POR", "WES", "GOL", "MAR"], "northCoast": ["GAS", "MID", "POR"]}, 
        "SWE": {"name": "Sweden", "type": "COASTAL", "adjacencies": ["DEN", "FIN", "NWY", "BAL", "BOT", "SKA"]}, 
        "TUN": {"name": "Tunisia", "type": "COASTAL", "adjacencies": ["NAF", "ION", "TYN", "WES"]}, 
        "ADR": {"name": "Adriatic Sea", "type": "SEA", "adjacencies": ["TRI", "APU", "VEN", "ALB", "ION"]}, 
        "AEG": {"name": "Aegean Sea", "type": "SEA", "adjacencies": ["CON", "SMY", "BUL", "GRE", "EAS", "ION"]}, 
        "BAL": {"name": "Baltic Sea", "type": "SEA", "adjacencies": ["BER", "KIE", "PRU", "LVN", "DEN", "SWE", "BOT"]}, 
        "BAR": {"name": "Barents Sea", "type": "SEA", "adjacencies": ["STP", "NWY", "NRG"]}, 
        "BLA": {"name": "Black Sea", "type": "SEA", "adjacencies": ["SEV", "ANK", "ARM", "CON", "BUL", "RUM"]}, 
        "EAS": {"name": "Eastern Mediterranean", "type": "SEA", "adjacencies": ["SMY", "SYR", "AEG", "ION"]}, 
        "ENG": {"name": "English Channel", "type": "SEA", "adjacencies": ["LON", "WAL", "BRE", "PIC", "BEL", "IRI", "MID", "NTH"]}, 
        "BOT": {"name": "Gulf of Bothnia", "type": "SEA", "adjacencies": ["LVN", "STP", "FIN", "SWE", "BAL"]}, 
        "GOL": {"name": "Gulf of Lyon", "type": "SEA", "adjacencies": ["MAR", "PIE", "TUS", "SPA", "TYN", "WES"]}, 
        "HEL": {"name": "Helgoland Bight", "type": "SEA", "adjacencies": ["KIE", "DEN", "HOL", "NTH"]}, 
        "ION": {"name": "Ionian Sea", "type": "SEA", "adjacencies": ["APU", "NAP", "ALB", "GRE", "TUN", "ADR", "AEG", "EAS", "TYN"]}, 
        "IRI": {"name": "Irish Sea", "type": "SEA", "adjacencies": ["LVP", "WAL", "ENG", "MID", "NAT"]}, 
        "MID": {"name": "Mid - Atlantic Ocean", "type": "SEA", "adjacencies": ["BRE", "GAS", "NAF", "POR", "SPA", "ENG", "IRI", "NAT", "WES"]}, 
        "NAT": {"name": "North Atlantic Ocean", "type": "SEA", "adjacencies": ["CLY", "LVP", "IRI", "MID", "NRG"]}, 
        "NTH": {"name": "North Sea", "type": "SEA", "adjacencies": ["EDI", "LON", "YOR", "BEL", "DEN", "HOL", "NWY", "ENG", "HEL", "NRG", "SKA"]}, 
        "NRG": {"name": "Norwegian Sea", "type": "SEA", "adjacencies": ["CLY", "EDI", "NWY", "BAR", "NAT", "NTH"]}, 
        "SKA": {"name": "Skaggerak", "type": "SEA", "adjacencies": ["DEN", "NWY", "SWE", "NTH"]}, 
        "TYN": {"name": "Tyrrhenian Sea", "type": "SEA", "adjacencies": ["NAP", "ROM", "TUS", "TUN", "GOL", "ION", "WES"]}, 
        "WES": {"name": "Western Mediterranean", "type": "SEA", "adjacencies": ["NAF", "SPA", "TUN", "GOL", "MID", "TYN"]}
    }

//data to be pulled from firebase
//player clicks on their army to get possible action: Move, Convoy, Hold
var army = ['LON', 'YOR', 'EDI'];
//list of all convoys the player hold
var conv = ['NAT','NTH', 'MID', 'NRG'];
var inUse = []; //todo
//list of convoy that can be chained together, need better name.
var zoneList = [];
//list of area user can land on based on their convoy chain.
var landingZone = [];

console.log("Country Selected: " + selectedCountry);
for(var ocean in conv)
{
    if(stuff[selectedCountry]["adjacencies"].includes(conv[ocean].toString()))
    {
        zoneList.push(conv[ocean]);
    }
}

//Loop through conv list and connect all adj ocean.
for(var i = 0; i <= conv.length; i++)
{
    for(var ocean in conv)
    {
        for( var zone in zoneList)
        {
            if(conv[ocean] != zoneList[zone]){
                if(stuff[conv[ocean]]["adjacencies"].includes(zoneList[zone].toString())){
                    if(!zoneList.includes(conv[ocean])){
                        zoneList.push(conv[ocean])
                    }
                }
            }
        }
    }
}
console.log("Convoy Chain:");
console.log(zoneList.toString());
for(var ocean in zoneList)
{
    stuff[zoneList[ocean]]["adjacencies"].forEach(function(element)
    {
        if(stuff[element]["type"] == "COASTAL"){
            if(!landingZone.includes(stuff[element]["name"])){
                landingZone.push(stuff[element]["name"]);
            }
        }
    });
}
//To be placed in dropdown menu for possible move
console.log("Landing Zones:");
console.log(landingZone.toString());
var theDiv = document.getElementById('convoyDropDown');
theDiv.innerHTML += '<select id="landingZone"><option>Choose Landing Zone</option></select>';

var optionbox = document.getElementById("landingZone");
for(var zone in landingZone){
    var opt = landingZone[zone];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    optionbox.appendChild(el);
}

// secondDiv.innerHTML += '<button type="test" onclick="' + issueOrder() + '">Submit Order</button>';

}

function issueOrder(moveType, location)
{
    var selector = document.getElementById('landingZone');
    var value = selector[selector.selectedIndex].value;
    console.log(moveType + " ARMY " + location + " MOV " + value);
}