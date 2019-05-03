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
        });
    });

    var terrs = Object.keys(res.players[username].territories);
    var supps = Object.keys(res.players[username].supplyCenters);

    var terrLength = terrs.length;
    var suppLength = supps.length;

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

    if (unitsToAdd > 0)
    {
        var unitsAdded = 0;
        var supplyCountries = ["ANK", "BEL", "BER", "BRE", "BUD", "BUL", "CON", "DEN", "EDI", "GRE", "HOL", "KIE", "LVP", "LON", "MAR", "MOS", "MUN", "NAP", "NOR", "PAR", "POR", "ROM", "RUM", "SER", "SEV", "SMY", "SPA", "STP", "SWE", "TRI", "TUN", "VEN", "VIE", "WAR"];

        for (var i = 0; i < supplyCountries.length; i++)
        {
            var supplyCountry = supplyCountries[i];

            var inSupps = false;

            for (var j = 0; j < supps.length; j++)
            {
                var supp = supps[j];

                if (supp === supplyCountry)
                {
                    inSupps = true;
                }
            }

            var inTerrs = false;

            for (var j = 0; j < terrs.length; j++)
            {
                var terr = terrs[j];

                if (terr === supplyCountry)
                {
                    inTerrs = true;
                }
            }

            if (inSupps && !inTerrs && (unitsAdded < unitsToAdd))
            {
                clickableRegions.push(supplyCountry);
                unitsAdded += 1;
            }
        }
    }
    else if (unitsToRemove > 0)
    {
        var unitsRemoved = 0;
        for (var i = 0; i < terrs.length; i++)
        {
            if (unitsRemoved < unitsToRemove)
            {
                clickableRegions.push(terrs[i]);
                unitsRemoved += 1;
            }
        }
    }

    for (var i = 0; i < clickableRegions.length; i++)
    {
        var region = clickableRegions[i];
        var node = document.createElement("LI");
        var textnode = document.createTextNode(region);
        node.appendChild(textnode);
        document.getElementById("clickable_areas").appendChild(node);
    }

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

function addTitle(res)
{
    var title = "Gaining And Losing Units Phase - ";
    if (res.turn_status.current_season === "spring")
    {
        title += "Spring";
    }
    else
    {
        title += "Fall";
    }
    title += " ";
    title += res.turn_status.current_year;
    document.getElementById("seasonTitle").innerHTML = title;
}

// Add orders
gameRef.child(gameID).child("players").child(username).child("build_orders_temp").on("value", function (snapshot)
{
    let orders = new Array();
    snapshot.forEach(element =>{
        var order = "";

        if (element.val().command === "BUILD")
        {
            order += "BUILD ";
            order += element.val().buildType;
            order += " IN ";
            order += element.val().territory;
        }
        else
        {
            order += "REMOVE UNIT IN ";
            order += element.val().territory;
        }

        orders.push(order);
    });

    $("#orders").empty();

    if (orders.length > 0)
    {
        document.getElementById("no_orders").hidden = true;
        document.getElementById("orders").hidden = false;
    }
    else
    {
        document.getElementById("no_orders").hidden = false;
        document.getElementById("orders").hidden = true;
    }

    for (var i = 0; i < orders.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(orders[i]);
        node.appendChild(textnode);
        document.getElementById("orders").appendChild(node);
    }
})

// Edit status
gameRef.child(gameID).child("players").child(username).child("territories").on("value", function (snapshot)
{
    let terrs = new Array();
    snapshot.forEach(element => {
        terrs.push(element.val().forceType);
    });

    gameRef.child(gameID).child("players").child(username).child("supplyCenters").on("value", function (snapshot)
    {
        $("#num_units").empty();
        let supps = new Array();
        snapshot.forEach(element => {
            supps.push(element.val().forceType);
        });

        var terrLength = terrs.length;
        var suppLength = supps.length;

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
        var textnode = document.createTextNode("Num. Units To Add: " + unitsToAdd);
        node.appendChild(textnode);
        document.getElementById("num_units").appendChild(node);

        var node = document.createElement("LI");
        var textnode = document.createTextNode("Num. Units To Remove: " + unitsToRemove);
        node.appendChild(textnode);
        document.getElementById("num_units").appendChild(node);
    })
})

// Change phase
gameRef.child(gameID).child("turn_status").on("child_changed", function (snapshot) {
    var data = snapshot.val();

    gameRef.child(gameID).child("players").on("value", function (snapshot) {
        let players = new Array();
        snapshot.forEach(element => {
            players.push(element.key);
        });

        for (var i = 0; i < players.length; i++)
        {
            if (gameRef.child(gameID).child("players").child(players[i]).child("build_orders_temp") != undefined)
            {
                gameRef.child(gameID).child("players").child(players[i]).child("build_orders_temp").remove();
            }
        }

        if (data === "order")
        {
            let link = "game.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
    })

})

function remove(res)
{
    var terrs = Object.keys(res.players[username].territories);
    var supps = Object.keys(res.players[username].supplyCenters);

    var terrLength = terrs.length;
    var suppLength = supps.length;

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

    var builds = new Array();
    if (res.players[username].build_orders_temp !== undefined)
    {
        builds = Object.keys(res.players[username].build_orders_temp);
    }

    // Remove for them
    if (builds.length < unitsToRemove)
    {
        var unitsStillToRemove = unitsToRemove - builds.length;

        var index = 0;
        
        while (unitsStillToRemove > 0)
        {
            var ref = gameRef.child(gameID).child("players").child(username);

            ref.child("build_orders_temp").child(terrs[index]).set({
                territory: terrs[index],
                command: "REMOVE"
            });

            index += 1;
            unitsStillToRemove -= 1;
        }
    }
}

function submitOrders(res)
{
    var keys = new Array();
    var buildOrders = res.players[username].build_orders_temp;
    if (buildOrders !== undefined)
    {
        keys = Object.keys(buildOrders);
    }

    var submission = {};

    // Build submission for non retreats
    submission.username = username;
    submission.gameId = gameID;
    submission.orders = [];

    for (var i = 0; i < keys.length; i++)
    {
        var order = {};

        order.territory = buildOrders[keys[i]].territory;
        order.command = buildOrders[keys[i]].command;

        if (order.command === "BUILD")
        {
            order.buildType = buildOrders[keys[i]].buildType;
        }

        submission.orders.push(order);
    }

    if (submission.orders.length === 0)
    {
        var order = {};

        order.command = "NONE";

        submission.orders.push(order);
    }

    return submission;
}


$("document").ready(function () {
    let timerController = setInterval(controllerTimer, 1000);

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res) {
        mapsLogic(res);
        addTitle(res);

        $("#roundSubmissionForm").submit(function () {

            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2) {
                remove(res2);
                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res3) {

                    var submission = submitOrders(res3);
                    console.log(submission);
                    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitbuildorder", { submission }, function (res4) {
                        console.log(res4);
                    }).fail(function (err) {
                        console.log(err);
                    })
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