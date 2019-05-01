$ = require("jquery");

console.log("phase2");

var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
let gameID = urlParams.get("gameID");

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

// grab data from firebase about the game/game state
// var urlParams = new URLSearchParams(location.search);
// let gameID =urlParams.get("gameID");
// let username = urlParams.get("username");
function mapsLogic(res) {
    // This is benson's code from game.html
    players = res.players;
    var clickableRegions = [];
    $.each(players, function (index, player) {
        playerName = index;
        // loop through each supply center the player controls
        supplyCenters = player.supplyCenters;
        $.each(supplyCenters, function (index, supplyCenter) {
            defaultcolors[index] = player.color;
            hovercolors[index] = player.hoverColor;
        });
        // loop through each unit the player controls
        territories = player.territories;
        $.each(territories, function (index, territory) {
            defaultcolors[index] = player.color;
            hovercolors[index] = player.hoverColor;
            if (username == playerName) {
                clickableRegions.push(index);
            }
        });
    });

    var enabledRegions = ["ADR", "AEG", "BAL", "BAR", "BLA", "EAS", "ENG", "BOT", "GOL", "HEL", "ION", "IRI", "MID", "NAT", "NTH", "NRG", "SKA", "TYN", "WES", "CLY", "EDI", "LVP", "YOR", "WAL", "LON", "PIC", "BRE", "PAR", "BUR", "GAS", "MAR", "PIE", "VEN", "TUS", "ROM", "APU", "NAP", "TYR", "BOH", "VIE", "GAL", "BUD", "TRI", "CON", "ANK", "ARM", "SMY", "SYR", "FIN", "STP", "LVN", "MOS", "WAR", "UKR", "SEV", "RUH", "KIE", "BER", "PRU", "MUN", "SIL", "NWY", "SWE", "DEN", "HOL", "BEL", "POR", "SPA", "NAF", "TUN", "RUM", "SER", "BUL", "ALB", "GRE"];
    var currentRegion;
    // the initial parameters for the map. Change according to this link to change the look of the map, https://www.10bestdesign.com/jqvmap/documentation/
    jQuery('#vmap').vectorMap({
        map: 'diplomacy',
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderOpacity: .75,
        borderWidth: 2,
        enableZoom: true,
        showTooltip: true,
        color: "#C7B8A3",
        colors: defaultcolors,
        hoverColors: hovercolors,
        selectedColors: hovercolors,
        showLabels: true,
        pins: { "ADR": "\u003cimg src=\"..\\..\\images\\supply-center.png\" /\u003e" },
        pinMode: 'content',
        onRegionClick: function (event, code, region) {
            // Check if this is an Enabled Region
            if (clickableRegions.indexOf(code) === -1) {
                // Not an Enabled Region
                event.preventDefault();
            }
        },
        onRegionOver: function (event, code, region) {
            // Check if this is an Enabled Region
            if (enabledRegions.indexOf(code) === -1) {
                // Not an Enabled Region
                event.preventDefault();
            }
        },
        onLabelShow: function (event, label, code) {
            if (enabledRegions.indexOf(code) === -1) {
                event.preventDefault();
            }
        }
    });
    jQuery('#vmap').bind('resize.jqvmap',
        function (event, width, height) {
            // sizeMap();
            console.log("Width: " + width + " HEIGHT: " + height);
            console.log("event: " + event.type);
        }
    );

}

function controllerTimer() {
    let t = $("#timer").html();
    let hr = parseInt(t.substring(0, t.indexOf(":")));
    let min = parseInt(t.substring(t.indexOf(":") + 1));
    let newMin = min - 1;
    let newHr = hr;
    if (newMin < 0) {
        newHr = hr - 1;
        newMin = 59;
    }
    if (newMin >= 10 && newHr >= 10) {
        $("#timer").html(newHr + ":" + newMin);
    }
    else if (newMin >= 10) {
        $("#timer").html("0" + newHr + ":" + newMin);
    }
    else if (newHr >= 10) {
        $("#timer").html(newHr + ":0" + newMin);
    }
    else {
        $("#timer").html("0" + newHr + ":0" + newMin);
    }
}

function nextPhase()
{
    let link = "game.html?gameID=" + gameID + "&username=" + username;

    window.location.href = link;
}

// Edit status
gameRef.child(gameID).child("players").child(username).child("territories").on("value", function (snapshot)
{
    $("#num_units").empty();

    let terrs = new Array();
    snapshot.forEach(element => {
        terrs.push(element.val().forceType);
    });

    gameRef.child(gameID).child("players").child(username).child("supplyCenters").on("value", function (snapshot)
    {
        let supps = new Array();
        snapshot.forEach(element => {
            supps.push(element.val().forceType);
        });

        var terrLength = terrs.length;
        var suppLength = supps.length;

        console.log(terrLength);
        console.log(suppLength);

        var unitsToAdd = suppLength - terrLength;

        if (unitsToAdd < 0)
        {
            unitsToAdd = 0;
        }

        var unitsToRemove = terrLength - suppLength;

        if (unitsToRemove < 0)
        {
            unitsToRemove = 0;
        }

        var node = document.createElement("LI");
        var textnode = document.createTextNode("Number Of Units To Add: " + unitsToAdd);
        node.appendChild(textnode);
        document.getElementById("num_units").appendChild(node);

        var node = document.createElement("LI");
        var textnode = document.createTextNode("Number Of Units To Remove: " + unitsToRemove);
        node.appendChild(textnode);
        document.getElementById("num_units").appendChild(node);
    })
})

// // Change phase
gameRef.child(gameID).child("turn_status").child("current_phase").on("value", function (snapshot) {
    var phase = snapshot.val();

    if (phase === "order")
    {
        let link = "game.html?gameID=" + gameID + "&username=" + username;
        window.location.href = link;
    }
})


$("document").ready(function () {
    let timerController = setInterval(controllerTimer, 1000);

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res) {
        // loop through each player
        mapsLogic(res);
        //addOrders(res['players']['orders_temp'])
        $("#roundSubmissionForm").submit(function () {

            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2) {
                var submission = submitOrders(res2);
                //console.log(submission);
                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitorder", { submission }, function (res3) {
                    console.log(res3);
                }).fail(function (err) {
                    console.log(err);
                })
            }).fail(function (err) {
                console.log(err);
            })
        
            return false;
        })

    }).fail(function (err) {
        console.log(err);
    })
})