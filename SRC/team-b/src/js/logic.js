function testLogic( selectedCountry )
{
    $(document).ready(function(){
console.log("Logic testing");
var modal = document.getElementById('actionModal');
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal 
     modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        $("#availableFleet").html("");
        $("#convoyDropDown").html("");
        modal.style.display = "none";

    }

    // // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //         modal.style.display = "none";
    //     }
    // }
});
}

function convoy()
{
    var availableConvoy = ['NAT','NTH', 'MID', 'NRG', 'BAR']; //get from FireBase
    $(document).ready(function(){
        $("#availableFleet").append('<select id="fleet"></select>');
        for(fleet in availableConvoy){
            $("#fleet").append(new Option(availableConvoy[fleet], availableConvoy[fleet]));
        }
        $("#availableFleet").append('<p>Fleet selected</p>');
        $("#availableFleet").append('<p id="selectedFleet"></p>');
        $("#availableFleet").append('<button id="addFleet" onclick="addFleetToConvoy(document.getElementById(' + " 'armySelected').innerHTML) " + ' ">Add</button>');

     });
}

function addFleetToConvoy(selectedCountry)
{
    $(document).ready(function(){
        var selectedValue =$( "#fleet" ).find(":selected").text();
        var selectedConvoy = ($('#selectedFleet').text()).split(" ");
        // selectedConvoy.pop();
        if( selectedConvoy.includes(selectedValue) === false ){
            $("#selectedFleet").append(selectedValue + " ");
        }
    });
    calculateConvoy(selectedCountry);
}

//calculateConvoy FUNCTION STARTS
function calculateConvoy(selectedCountry) {
    $(document).ready(function(){
            //Adj List
            var stuff = {
                "BOH": {"name": "Bohemia", "val": "BOH", "type": "INLAND", "adjacencies": ["GAL", "TYR", "VIE", "MUN", "SIL"]}, 
                "BUD": {"name": "Budapest", "val": "BUD","type": "INLAND", "adjacencies": ["GAL", "TRI", "VIE", "RUM", "SER"]}, 
                "GAL": {"name": "Galicia", "val": "GAL", "type": "INLAND", "adjacencies": ["BOH", "BUD", "VIE", "SIL", "UKR", "WAR", "RUM"]}, 
                "TRI": {"name": "Trieste", "val": "TRI", "type": "COASTAL", "adjacencies": ["BUD", "TYR", "VIE", "VEN", "ALB", "SER", "ADR"]}, 
                "TYR": {"name": "Tyrolia", "val": "TYR", "type": "INLAND", "adjacencies": ["BOH", "TRI", "VIE", "MUN", "PIE", "VEN"]}, 
                "VIE": {"name": "Vienna", "val": "VIE", "type": "INLAND", "adjacencies": ["BOH", "BUD", "GAL", "TRI", "TYR"]}, 
                "CLY": {"name": "Clyde", "val": "CLY", "type": "COASTAL", "adjacencies": ["EDI", "LVP", "NAT", "NRG"]}, 
                "EDI": {"name": "Edinburgh", "val": "EDI", "type": "COASTAL", "adjacencies": ["CLY", "LVP", "YOR", "NTH", "NRG"]}, 
                "LVP": {"name": "Liverpool", "val": "LVP", "type": "COASTAL", "adjacencies": ["CLY", "EDI", "WAL", "YOR", "IRI", "NAT"]}, 
                "LON": {"name": "London", "val": "LON", "type": "COASTAL", "adjacencies": ["WAL", "YOR", "ENG", "NTH"]}, 
                "WAL": {"name": "Wales", "val": "WAL", "type": "COASTAL", "adjacencies": ["LVP", "LON", "YOR", "ENG", "IRI"]}, 
                "YOR": {"name": "York", "val": "YOR", "type": "COASTAL", "adjacencies": ["EDI", "LVP", "LON", "WAL", "NTH"]}, 
                "BRE": {"name": "Brest", "val": "BRE", "type": "COASTAL", "adjacencies": ["GAS", "PAR", "PIC", "ENG", "MID"]}, 
                "BUR": {"name": "Burgundy", "val": "BUR", "type": "INLAND", "adjacencies": ["GAS", "MAR", "PAR", "PIC", "MUN", "RUH", "BEL"]}, 
                "GAS": {"name": "Gascony", "val": "GAS", "type": "COASTAL", "adjacencies": ["BRE", "BUR", "MAR", "PAR", "SPA", "MID"]}, 
                "MAR": {"name": "Marseilles", "val": "MAR", "type": "COASTAL", "adjacencies": ["BUR", "GAS", "PIE", "SPA", "GOL"]}, 
                "PAR": {"name": "Paris", "val": "PAR", "type": "INLAND", "adjacencies": ["BRE", "BUR", "GAS", "PIC"]}, 
                "PIC": {"name": "Picardy", "val": "PIC", "type": "COASTAL", "adjacencies": ["BRE", "BUR", "PAR", "BEL", "ENG"]}, 
                "BER": {"name": "Berlin", "val": "BER", "type": "COASTAL", "adjacencies": ["KIE", "MUN", "PRU", "SIL", "BAL"]}, 
                "KIE": {"name": "Kiel", "val": "KIE", "type": "COASTAL", "adjacencies": ["BER", "MUN", "RUH", "DEN", "HOL", "BAL", "HEL"]}, 
                "MUN": {"name": "Munich", "val": "MUN", "type": "INLAND", "adjacencies": ["BOH", "TYR", "BUR", "BER", "KIE", "RUH", "SIL"]}, 
                "PRU": {"name": "Prussia", "val": "PRU", "type": "COASTAL", "adjacencies": ["BER", "SIL", "LVN", "WAR", "BAL"]}, 
                "RUH": {"name": "Ruhr", "val": "RUH", "type": "INLAND", "adjacencies": ["BUR", "KIE", "MUN", "BEL", "HOL"]}, 
                "SIL": {"name": "Silesia", "val": "SIL", "type": "INLAND", "adjacencies": ["BOH", "GAL", "BER", "MUN", "PRU", "WAR"]}, 
                "APU": {"name": "Apulia", "val": "APU", "type": "COASTAL", "adjacencies": ["NAP", "ROM", "VEN", "ADR", "ION"]}, 
                "NAP": {"name": "Naples", "val": "NAP", "type": "COASTAL", "adjacencies": ["APU", "ROM", "ION", "TYN"]}, 
                "PIE": {"name": "Piedmont", "val": "PIE", "type": "COASTAL", "adjacencies": ["TYR", "MAR", "TUS", "VEN", "GOL"]}, 
                "ROM": {"name": "Rome", "val": "ROM", "type": "COASTAL", "adjacencies": ["APU", "NAP", "TUS", "VEN", "TYN"]}, 
                "TUS": {"name": "Tuscany", "val": "TUS", "type": "COASTAL", "adjacencies": ["PIE", "ROM", "VEN", "GOL", "TYN"]}, 
                "VEN": {"name": "Venice", "val": "VEN", "type": "COASTAL", "adjacencies": ["TRI", "TYR", "APU", "PIE", "ROM", "TUS", "ADR"]}, 
                "LVN": {"name": "Livonia", "val": "LVN", "type": "COASTAL", "adjacencies": ["PRU", "MOS", "STP", "WAR", "BAL", "BOT"]}, 
                "MOS": {"name": "Moscow", "val": "MOS", "type": "INLAND", "adjacencies": ["LVN", "SEV", "STP", "UKR", "WAR"]}, 
                "SEV": {"name": "Sevastopol", "val": "SEV", "type": "COASTAL", "adjacencies": ["MOS", "UKR", "ARM", "RUM", "BLA"]}, 
                "STP": {"name": "St. Petersburg", "val": "STP", "type": "COASTAL", "adjacencies": ["LVN", "MOS", "FIN", "NWY", "BAR", "BOT"], 
                    "southCoast": ["FIN", "BOT", "LVN"], 
                    "northCoast": ["BAR", "NWY"]}, 
                "UKR": {"name": "Ukraine", "val": "UKR", "type": "INLAND", "adjacencies": ["GAL", "MOS", "SEV", "WAR", "RUM"]}, 
                "WAR": {"name": "Warsaw", "val": "WAR", "type": "INLAND", "adjacencies": ["GAL", "PRU", "SIL", "LVN", "MOS", "UKR"]}, 
                "ANK": {"name": "Ankara", "val": "ANK", "type": "COASTAL", "adjacencies": ["ARM", "CON", "SMY", "BLA"]}, 
                "ARM": {"name": "Armenia", "val": "ARM", "type": "COASTAL", "adjacencies": ["SEV", "ANK", "SMY", "SYR", "BLA"]}, 
                "CON": {"name": "Constantinople", "val": "CON", "type": "COASTAL", "adjacencies": ["ANK", "SMY", "BUL", "AEG", "BLA"]}, 
                "SMY": {"name": "Smyrna", "val": "SMY", "type": "COASTAL", "adjacencies": ["ANK", "ARM", "CON", "SYR", "AEG", "EAS"]}, 
                "SYR": {"name": "Syria", "val": "SYR", "type": "COASTAL", "adjacencies": ["ARM", "SMY", "EAS"]}, 
                "ALB": {"name": "Albania", "val": "ALB", "type": "COASTAL", "adjacencies": ["TRI", "GRE", "SER", "ADR", "ION"]}, 
                "BEL": {"name": "Belgium", "val": "BEL", "type": "COASTAL", "adjacencies": ["BUR", "PIC", "RUH", "HOL", "ENG", "NTH"]}, 
                "BUL": {"name": "Bulgaria", "val": "BUL", "type": "COASTAL", "adjacencies": ["CON", "GRE", "RUM", "SER", "AEG", "BLA"], 
                    "southCoast": ["GRE", "AEG", "CON"], 
                    "eastCoast": ["CON", "BLA", "RUM"]}, 
                "DEN": {"name": "Denmark", "val": "DEN", "type": "COASTAL", "adjacencies": ["KIE", "SWE", "BAL", "HEL", "NTH", "SKA"]}, 
                "FIN": {"name": "Finland", "val": "FIN", "type": "COASTAL", "adjacencies": ["STP", "NWY", "SWE", "BOT"]}, 
                "GRE": {"name": "Greece", "val": "GRE", "type": "COASTAL", "adjacencies": ["ALB", "BUL", "SER", "AEG", "ION"]}, 
                "HOL": {"name": "Holland", "val": "HOL", "type": "COASTAL", "adjacencies": ["KIE", "RUH", "BEL", "HEL", "NTH"]}, 
                "NWY": {"name": "Norway", "val": "NWY", "type": "COASTAL", "adjacencies": ["STP", "FIN", "SWE", "BAR", "NTH", "NRG", "SKA"]}, 
                "NAF": {"name": "North Africa", "val": "NAF", "type": "COASTAL", "adjacencies": ["TUN", "MID", "WES"]}, 
                "POR": {"name": "Portugal", "val": "POR", "type": "COASTAL", "adjacencies": ["SPA", "MID"]}, 
                "RUM": {"name": "Romania", "val": "RUM", "type": "COASTAL", "adjacencies": ["BUD", "GAL", "SEV", "UKR", "BUL", "SER", "BLA"]}, 
                "SER": {"name": "Serbia", "val": "SER", "type": "INLAND", "adjacencies": ["BUD", "TRI", "ALB", "BUL", "GRE", "RUM"]}, 
                "SPA": {"name": "Spain", "val": "SPA", "type": "COASTAL", "adjacencies": ["GAS", "MAR", "POR", "GOL", "MID", "WES"], 
                    "southCoast": ["MID", "POR", "WES", "GOL", "MAR"], "northCoast": ["GAS", "MID", "POR"]}, 
                "SWE": {"name": "Sweden", "val": "SWE", "type": "COASTAL", "adjacencies": ["DEN", "FIN", "NWY", "BAL", "BOT", "SKA"]}, 
                "TUN": {"name": "Tunisia", "val": "TUN", "type": "COASTAL", "adjacencies": ["NAF", "ION", "TYN", "WES"]}, 
                "ADR": {"name": "Adriatic Sea", "val": "ADR", "type": "SEA", "adjacencies": ["TRI", "APU", "VEN", "ALB", "ION"]}, 
                "AEG": {"name": "Aegean Sea", "val": "AEG", "type": "SEA", "adjacencies": ["CON", "SMY", "BUL", "GRE", "EAS", "ION"]}, 
                "BAL": {"name": "Baltic Sea", "val": "BAL", "type": "SEA", "adjacencies": ["BER", "KIE", "PRU", "LVN", "DEN", "SWE", "BOT"]}, 
                "BAR": {"name": "Barents Sea", "val": "BAR", "type": "SEA", "adjacencies": ["STP", "NWY", "NRG"]}, 
                "BLA": {"name": "Black Sea", "val": "BLA", "type": "SEA", "adjacencies": ["SEV", "ANK", "ARM", "CON", "BUL", "RUM"]}, 
                "EAS": {"name": "Eastern Mediterranean", "val": "EAS", "type": "SEA", "adjacencies": ["SMY", "SYR", "AEG", "ION"]}, 
                "ENG": {"name": "English Channel", "val": "ENG", "type": "SEA", "adjacencies": ["LON", "WAL", "BRE", "PIC", "BEL", "IRI", "MID", "NTH"]}, 
                "BOT": {"name": "Gulf of Bothnia", "val": "BOT", "type": "SEA", "adjacencies": ["LVN", "STP", "FIN", "SWE", "BAL"]}, 
                "GOL": {"name": "Gulf of Lyon", "val": "GOL", "type": "SEA", "adjacencies": ["MAR", "PIE", "TUS", "SPA", "TYN", "WES"]}, 
                "HEL": {"name": "Helgoland Bight", "val": "HEL", "type": "SEA", "adjacencies": ["KIE", "DEN", "HOL", "NTH"]}, 
                "ION": {"name": "Ionian Sea", "val": "ION", "type": "SEA", "adjacencies": ["APU", "NAP", "ALB", "GRE", "TUN", "ADR", "AEG", "EAS", "TYN"]}, 
                "IRI": {"name": "Irish Sea", "val": "IRI", "type": "SEA", "adjacencies": ["LVP", "WAL", "ENG", "MID", "NAT"]}, 
                "MID": {"name": "Mid - Atlantic Ocean", "val": "MID", "type": "SEA", "adjacencies": ["BRE", "GAS", "NAF", "POR", "SPA", "ENG", "IRI", "NAT", "WES"]}, 
                "NAT": {"name": "North Atlantic Ocean", "val": "NAT", "type": "SEA", "adjacencies": ["CLY", "LVP", "IRI", "MID", "NRG"]}, 
                "NTH": {"name": "North Sea", "val": "NTH", "type": "SEA", "adjacencies": ["EDI", "LON", "YOR", "BEL", "DEN", "HOL", "NWY", "ENG", "HEL", "NRG", "SKA"]}, 
                "NRG": {"name": "Norwegian Sea", "val": "NRG", "type": "SEA", "adjacencies": ["CLY", "EDI", "NWY", "BAR", "NAT", "NTH"]}, 
                "SKA": {"name": "Skaggerak", "val": "SKA", "type": "SEA", "adjacencies": ["DEN", "NWY", "SWE", "NTH"]}, 
                "TYN": {"name": "Tyrrhenian Sea", "val": "TYN", "type": "SEA", "adjacencies": ["NAP", "ROM", "TUS", "TUN", "GOL", "ION", "WES"]}, 
                "WES": {"name": "Western Mediterranean", "val": "WES", "type": "SEA", "adjacencies": ["NAF", "SPA", "TUN", "GOL", "MID", "TYN"]}
            }

        //data to be pulled from firebase
        // //player clicks on their army to get possible action: Move, Convoy, Hold
        var army = ['LON'];
        // console.log(army.toString());
        //list of all convoys the player hold
        var selectedConvoy = ($('#selectedFleet').text()).split(" ");
        selectedConvoy.pop();
        console.log("Selected Convoy:" + selectedConvoy.toString());
        // var availableConvoy = ['NAT','NTH', 'MID', 'NRG'];
        var inUse = []; //todo
        //list of convoy that can be chained together, need better name.
        var zoneList = [];
        //list of area user can land on based on their convoy chain.
        var landingZone = [];

        console.log("Country Selected: " + selectedCountry);
        for(var ocean in selectedConvoy)
        {
            if(stuff[selectedCountry]["adjacencies"].includes(selectedConvoy[ocean].toString()))
            {
                zoneList.push(selectedConvoy[ocean]);
            }
        }

        //Loop through conv list and connect all adj ocean.
        for(var i = 0; i <= selectedConvoy.length; i++)
        {
            for(var ocean in selectedConvoy)
            {
                for( var zone in zoneList)
                {
                    if(selectedConvoy[ocean] != zoneList[zone]){
                        if(stuff[selectedConvoy[ocean]]["adjacencies"].includes(zoneList[zone].toString())){
                            if(!zoneList.includes(selectedConvoy[ocean])){
                                zoneList.push(selectedConvoy[ocean])
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
                    if(!landingZone.includes(stuff[element]["val"])){
                        landingZone.push(stuff[element]["val"]);
                    }
                }
            });
        }
        //To be placed in dropdown menu for possible move
        console.log("Landing Zones:");
        console.log(landingZone.toString());

        var theDiv = document.getElementById('convoyDropDown');
        theDiv.innerHTML = "";
        theDiv.innerHTML += '<select id="landingZone"><option>Choose Landing Zone</option></select>';

        var optionbox = document.getElementById("landingZone");
        for(var zone in landingZone){
            var opt = landingZone[zone];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            optionbox.appendChild(el);
        }
        $("#issueOrderButton").html('<button type="test" id="issueOrderButton" onclick="issueOrder(' + " 'CONVOY', document.getElementById('armySelected').innerHTML)" + '">Submit Order</button>')
    });// jQuery ends
}

function issueOrder(moveType, location)
{
    var selector = document.getElementById('landingZone');
    var value = selector[selector.selectedIndex].value;
    console.log(moveType + " ARMY " + location + " MOV " + value);
}