$ = require("jquery");

console.log("refresh");

var urlParams = new URLSearchParams(location.search);
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

// LOGIC NOTES:
//     - Denmark is adjacent to Kiel.
//     - Sweden adjacent to Denmark not Helgoland Bight.
//     - Baltic Sea not adjacent to Helgoland Bight.
//     - Skaggerak not adjacent to Helgoland Bight.
//     - Aegean Sea is not adjacent to Black Sea.

// grab data from firebase about the game/game state
// var urlParams = new URLSearchParams(location.search);
// let gameID =urlParams.get("gameID");
// let username = urlParams.get("username");
function mapsLogic(res) {
    // This is benson's code from game.html
    fullGame = res;
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

// Add moves
gameRef.child(gameID).child("players").child(username).child("orders_temp").on("value", function (snapshot) {
    $("#orders").empty();
    let orders = new Array();
    snapshot.forEach(element => {
        orders.push(element.val().order);
    });

    if (orders.length > 0) {
        document.getElementById("no_orders").hidden = true;
        document.getElementById("orders").hidden = false;
    }

    for (var i = 0; i < orders.length; i++) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(orders[i]);
        node.appendChild(textnode);
        document.getElementById("orders").appendChild(node);
    }
})

function submitOrders(res)
{
    var submission = {};

    // Get all orders in orders_temp
    let orders = new Array();
    if (res.players[username].orders_temp != undefined)
    {
        var keys = Object.keys(res.players[username].orders_temp);
        for (var i = 0; i < keys.length; i++)
        {
            var order = res.players[username].orders_temp[keys[i]].order;
            orders.push(order);
        }
    }

    userTerrs = res.players[username].territories;

    let terrs = new Array();
    for (var t in userTerrs)
    {
        terrs.push([res.players[username].territories[t].forceType, t]);
    }

    for (var i = 0; i < terrs.length; i++)
    {
        var key = terrs[i][0] + '_' + terrs[i][1];
        var data = terrs[i][0] + ' ' + terrs[i][1];

        var inOrders = false

        for (var j = 0; j < orders.length; j++)
        {
            if (orders[j].slice(0, 5) === data)
            {
                inOrders = true;
            }
        }

        if (!inOrders)
        {
            // Submit hold order
            var order = data + "-HOLDS";

            orders.push(order);

            var ref = gameRef.child(gameID).child("players").child(username).child("orders_temp");

            ref.child(key).set({
                order: order
            });
        }
    }

    // Build submission
    submission.username = username;
    submission.gameId = gameID;
    submission.orders = [];

    for (var i = 0; i < orders.length; i++)
    {
        var o = orders[i];
        var data = o.split(" ");

        var order = {};

        if (data.length === 2)
        {
            order.UnitType = data[0];

            data2 = data[1].split("-");

            order.CurrentZone = data2[0];

            if (data2[1].length === 3)
            {
                order.MoveType = "M";
                order.MoveZone = data2[1];
            }
            else
            {
                order.MoveType = "H";
            }
        }
        else
        {
            order.UnitType = data[0];
            order.CurrentZone = data[1];
            order.MoveType = data[2];

            data2 = data[4].split("-");

            if (data2[1].length === 3)
            {
                if (data[2] === "C")
                {
                    order.InitialConvoyZone = data2[0];
                    order.FinalConvoyZone = data2[1];
                }
                else
                {
                    order.InitialSupportZone = data2[0];
                    order.FinalSupportZone = data2[1];
                }
            }
            else
            {
                order.InitialSupportZone = data2[0];
                order.FinalSupportZone = data2[0];
            }
        }

        submission.orders.push(order);
    }

    return submission;
}
var fullGame = null;
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