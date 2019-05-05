// SOURCE CODE CORRESPONDING TO: phase2.html 

$ = require("jquery");

// Username/gameID information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
let gameID = urlParams.get("gameID");
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

// Navbar redirections
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
function mapsLogic(res) {
    // This is benson's code from game.html
    players = res.players;
    var clickableRegions = [];
    var allTerritoriesWithUnits = [];
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
            allTerritoriesWithUnits.push(index);
        });
    });

    var key = res.turn_status.current_season + res.turn_status.current_year;

    if (res.resolution[key].retreat[username] !== undefined)
    {
        // Can only click on territories that have to retreat or disband.
        var retreat = res.resolution[key].retreat[username];
        var keys = Object.keys(res.resolution[key].retreat[username]);

        for (var i = 0; i < keys.length; i++)
        {
            clickableRegions.push(retreat[keys[i]].CurrentZone);
        }
    }

    var enabledRegions = ["ADR", "AEG", "BAL", "BAR", "BLA", "EAS", "ENG", "BOT", "GOL", "HEL", "ION", "IRI", "MID", "NAT", "NTH", "NRG", "SKA", "TYN", "WES", "CLY", "EDI", "LVP", "YOR", "WAL", "LON", "PIC", "BRE", "PAR", "BUR", "GAS", "MAR", "PIE", "VEN", "TUS", "ROM", "APU", "NAP", "TYR", "BOH", "VIE", "GAL", "BUD", "TRI", "CON", "ANK", "ARM", "SMY", "SYR", "FIN", "STP", "LVN", "MOS", "WAR", "UKR", "SEV", "RUH", "KIE", "BER", "PRU", "MUN", "SIL", "NWY", "SWE", "DEN", "HOL", "BEL", "POR", "SPA", "NAF", "TUN", "RUM", "SER", "BUL", "ALB", "GRE"];

    // the initial parameters for the map. Change according to this link to change the look of the map, https://www.10bestdesign.com/jqvmap/documentation/
    jQuery('#vmap').vectorMap({
        map: 'diplomacy',
        backgroundColor: '#000000',
        clickableRegions: allTerritoriesWithUnits,
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

// Function for adding the title to the page
// -- uses the DB info, "res", to show the current season/year
function addTitle(res)
{
    var title = "Retreat And Disband Phase - ";
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

// Change phase. Will get executed when a child of the game's "turn_status" is updated.
gameRef.child(gameID).child("turn_status").on("child_changed", function (snapshot)
{
    var data = snapshot.val();

    gameRef.child(gameID).child("players").on("value", function (snapshot)
    {
        // All players.
        let players = new Array();
        snapshot.forEach(element => {
            players.push(element.key);
        });
        
        // We must delete "orders_temp", "retreat_units_temp", and "retreat_orders_temp" for every player if they
        // are not undefined.
        for (var i = 0; i < players.length; i++)
        {
            if (gameRef.child(gameID).child("players").child(players[i]).child("orders_temp") !== undefined)
            {
                gameRef.child(gameID).child("players").child(players[i]).child("orders_temp").remove();
            }
            if (gameRef.child(gameID).child("players").child(players[i]).child("retreat_units_temp") != undefined)
            {
                gameRef.child(gameID).child("players").child(players[i]).child("retreat_units_temp").remove();
            }
            if (gameRef.child(gameID).child("players").child(players[i]).child("retreat_orders_temp") != undefined)
            {
                gameRef.child(gameID).child("players").child(players[i]).child("retreat_orders_temp").remove();
            }
        }

        if (data === "order")
        {
            // Go to order phase.
            let link = "game.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
        else if (data === "build")
        {
            // Go to phase 3.
            let link = "phase3.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
    })
})

// Add retreat orders to the "Orders" display.
gameRef.child(gameID).child("players").child(username).child("retreat_orders_temp").on("value", function (snapshot)
{
    // All retreat orders.
    let orders = new Array();
    snapshot.forEach(element => {
        orders.push(element.val().order);
    });

    gameRef.child(gameID).child("players").child(username).child("orders_temp").on("value", function (snapshot)
    {
        // All temp orders.
        let ordersTemp = new Array();
        snapshot.forEach(element => {
            ordersTemp.push(element.val().order);
        });

        $("#orders").empty(); // Empty the div.

        if (orders.length > 0)
        {
            // Hide the "no_orders" div, unhide the "orders" div.
            document.getElementById("no_orders").hidden = true;
            document.getElementById("orders").hidden = false;
        }
        else
        {
            // Hide the "orders" div, unhide the "no_orders" div.
            document.getElementById("no_orders").hidden = false;
            document.getElementById("orders").hidden = true;
        }
    
        for (var i = 0; i < orders.length; i++)
        {
            var order = "";

            for (var j = 0; j < ordersTemp.length; j++)
            {
                if (orders[i].slice(0, 5) === ordersTemp[j].slice(0, 5))
                {
                    if (ordersTemp[j] === orders[i])
                    {
                        // If it is the same order as last time, the unit is disbanding.
                        order += orders[i].slice(0, 5);
                        order += " DISBANDS"
                    }
                    else
                    {
                        // Otherwise, the unit is attempting a retreat.
                        order += orders[i];
                        order += " (RETREAT)"
                    }
                }
            }

            // Add the order to the "orders" div.
            var node = document.createElement("LI");
            var textnode = document.createTextNode(order);
            node.appendChild(textnode);
            document.getElementById("orders").appendChild(node);
        }
    })
})

// Function for units that must retreat/disband to the proper div
// -- uses the DB info, "res", to retrieve the units
function addRetreats(res)
{
    $("#retreats").empty(); // empty the div

    let retreats = new Array();

    var key = res.turn_status.current_season + res.turn_status.current_year;

    // Get all units that must retreat/disband
    if (res.resolution[key].retreat[username] !== undefined)
    {
        var keys = Object.keys(res.resolution[key].retreat[username]);

        for (var i = 0; i < keys.length; i++)
        {
            var retreat = "";
            retreat += res.resolution[key].retreat[username][keys[i]].UnitType;
            retreat += " ";
            retreat += res.resolution[key].retreat[username][keys[i]].CurrentZone;
            retreats.push(retreat);
        }
    }

    if (retreats.length > 0)
    {
        // Hide the "no_retreats" div, unhide the "retreats" div.
        document.getElementById("no_retreats").hidden = true;
        document.getElementById("retreats").hidden = false;
    }
    else
    {
        // Hide the "retreats" div, unhide the "no_retreats" div.
        document.getElementById("no_retreats").hidden = false;
        document.getElementById("retreats").hidden = true;
    }

    // Add all the units to the "retreats" div.
    for (var i = 0; i < retreats.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(retreats[i]);
        node.appendChild(textnode);
        document.getElementById("retreats").appendChild(node);
    }
}

// Function for adding the results of the previous round, color coded.
// -- uses the DB info, "res", to retrieve the results
function addResults(res)
{
    var key = res.turn_status.current_season + res.turn_status.current_year;

    // Failed/Passed orders
    var fail = res.resolution[key].fail[username];
    var pass = res.resolution[key].pass[username];

    // User's orders_temp from the previous round.
    var ordersTemp = res.players[username].orders_temp;

    if (fail !== undefined)
    {
        for (var i = 0; i < fail.length; i++)
        {
            order = fail[i];

            var key = order.UnitType + "_" + order.CurrentZone;

            // Keep track of units needing retreat/disband orders
            var ref = gameRef.child(gameID).child("players").child(username).child("retreat_units_temp");

            if (res.players[username].retreat_orders_temp === undefined)
            {
                ref.child(key).set({
                    value: order.UnitType + " " + order.CurrentZone
                })
            }
            else if (res.players[username].retreat_orders_temp[key] === undefined)
            {
                ref.child(key).set({
                    value: order.UnitType + " " + order.CurrentZone
                })
            }

            var output = ordersTemp[key].order;

            // Failed orders shown in red.
            var node = document.createElement("LI");
            var textnode = document.createTextNode(output);
            node.appendChild(textnode);
            node.style.color = "red";
            document.getElementById("results").appendChild(node);
        }
    }
    if (pass !== undefined)
    {
        for (var i = 0; i < pass.length; i++)
        {
            order = pass[i];

            var key = order.UnitType + "_" + order.CurrentZone;

            var output = ordersTemp[key].order;

            // Successful orders shown in green.
            var node = document.createElement("LI");
            var textnode = document.createTextNode(output);
            node.appendChild(textnode);
            node.style.color = "green";
            document.getElementById("results").appendChild(node);
        }
    }
}

// Function for disbanding units if no retreat or disband commands were given.
// -- uses the DB info, "res", to retrieve the current commands.
function disband(res)
{
    // Get all orders in orders_temp
    let orders = {};
    var keys = Object.keys(res.players[username].orders_temp);

    for (var i = 0; i < keys.length; i++)
    {
        orders[keys[i]] = res.players[username].orders_temp[keys[i]].order;
    }
    
    var retreatUnits = res.players[username].retreat_units_temp;

    // IF retreat units is not undefined, we must submit the same order for them as last time to disband them/
    if (retreatUnits !== undefined)
    {
        var retreatKeys = Object.keys(retreatUnits);

        for (var i = 0; i < retreatKeys.length; i++)
        {
            var ref = gameRef.child(gameID).child("players").child(username);

            ref.child("retreat_orders_temp").child(retreatKeys[i]).set({
                order: orders[retreatKeys[i]]
            });
        
            ref.child("retreat_units_temp").child(retreatKeys[i]).remove();
        }
    }
}

// Function for creating a submission JSON.
// -- takes all orders in the DB and creates a JSON for sending to the backend as a POST.
function submitOrders(res)
{
    var submission = {};

    // Get all orders in orders_temp
    let orders = {};
    var keys = Object.keys(res.players[username].orders_temp);

    for (var i = 0; i < keys.length; i++)
    {
        orders[keys[i]] = res.players[username].orders_temp[keys[i]].order;
    }

    var key = res.turn_status.current_season + res.turn_status.current_year;
    var fail = res.resolution[key].fail[username];
    
    // Get failed orders: unit_terr
    var failedOrders = new Array();
    if (fail !== undefined)
    {
        for (var i = 0; i < fail.length; i++)
        {
            var orderKey = fail[i].UnitType + "_" + fail[i].CurrentZone;
            failedOrders.push(orderKey);
        }
    }

    submission.username = username;
    submission.gameId = gameID;
    submission.orders = [];

    for (var i = 0; i < keys.length; i++)
    {
        var key = keys[i];
        var o = orders[key];
        var data = o.split(" ");

        // Get the orderKey: unit_terr
        var orderKey = data[0] + "_";
        if (data.length == 2)
        {
            var data2 = data[1].split("-");
            orderKey += data2[0];
        }
        else
        {
            orderKey += data[1];
        }

        // Find out if it failed.
        var failed = false;
        for (var j = 0; j < failedOrders.length; j++)
        {
            if (failedOrders[j] === orderKey)
            {
                failed = true;
            }
        }

        if (!failed)
        {
            // If it didn't, submit it again (same as game.js) with order.Retreat == "false"
            var order = {};

            if (data.length === 2)
            {
                order.UnitType = data[0];

                var data2 = data[1].split("-");

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

                var data2 = data[4].split("-");

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

            order.Retreat = "false";

            submission.orders.push(order);
        }
        else
        {
            // Otherwise, submit it from "retreat_orders_temp" with order.Retreat == "true"
            var order = {};
            data = res.players[username].retreat_orders_temp[orderKey].order.split(" ");

            if (data.length === 2)
            {
                order.UnitType = data[0];

                var data2 = data[1].split("-");

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

                var data2 = data[4].split("-");

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

            order.Retreat = "true";

            submission.orders.push(order);
        }
    }

    return submission;
}

$("document").ready(function () {
    let timerController = setInterval(controllerTimer, 1000);

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        // Get game data and initialize necessary components.
        mapsLogic(res);
        addResults(res);
        addTitle(res);
        addRetreats(res);
        $("#roundSubmissionForm").submit(function ()
        {
            // Executed when the user clicks submit in the round submission form.
            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2)
            {
                // Get a current snapshot of the game and disband necessary units.
                disband(res2);
                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res3)
                {
                    // Get another current snapshot of the game and create the submission.
                    var submission = submitOrders(res3);
                    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitretreatorder", { submission }, function (res4)
                    {
                        // POST the submission to the backend.
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