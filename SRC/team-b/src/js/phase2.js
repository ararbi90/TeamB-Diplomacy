$ = require("jquery");

//console.log("phase2");

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
            let link = "game.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
        else if (data === "build")
        {   
            let link = "phase3.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
    })
})

// Add orders
gameRef.child(gameID).child("players").child(username).child("retreat_orders_temp").on("value", function (snapshot)
{
    let orders = new Array();
    snapshot.forEach(element => {
        orders.push(element.val().order);
    });

    gameRef.child(gameID).child("players").child(username).child("orders_temp").on("value", function (snapshot) {
        let ordersTemp = new Array();
        snapshot.forEach(element => {
            ordersTemp.push(element.val().order);
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
            var order = "";

            for (var j = 0; j < ordersTemp.length; j++)
            {
                if (orders[i].slice(0, 5) === ordersTemp[j].slice(0, 5))
                {
                    if (ordersTemp[j] === orders[i])
                    {
                        order += orders[i].slice(0, 5);
                        order += " DISBANDS"
                    }
                    else
                    {
                        order += orders[i];
                        order += " (RETREAT)"
                    }
                }
            }

            var node = document.createElement("LI");
            var textnode = document.createTextNode(order);
            node.appendChild(textnode);
            document.getElementById("orders").appendChild(node);
        }
    })
})


// Add retreat/disband
function addRetreats(res)
{
    $("#retreats").empty();
    let retreats = new Array();

    var key = res.turn_status.current_season + res.turn_status.current_year;

    if (res.resolution[key].fail[username] !== undefined)
    {
        var keys = Object.keys(res.resolution[key].fail[username]);

        for (var i = 0; i < keys.length; i++)
        {
            var retreat = "";
            retreat += res.resolution[key].fail[username][keys[i]].UnitType;
            retreat += " ";
            retreat += res.resolution[key].fail[username][keys[i]].CurrentZone;
            retreats.push(retreat);
        }
    }

    if (retreats.length > 0)
    {
        document.getElementById("no_retreats").hidden = true;
        document.getElementById("retreats").hidden = false;
    }
    else
    {
        document.getElementById("no_retreats").hidden = false;
        document.getElementById("retreats").hidden = true;
    }

    for (var i = 0; i < retreats.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(retreats[i]);
        node.appendChild(textnode);
        document.getElementById("retreats").appendChild(node);
    }
}

// Add results
function addResults(res)
{
    var key = res.turn_status.current_season + res.turn_status.current_year;

    var fail = res.resolution[key].fail[username];
    var pass = res.resolution[key].pass[username];

    var ordersTemp = res.players[username].orders_temp;

    if (fail !== undefined)
    {
        for (var i = 0; i < fail.length; i++)
        {
            order = fail[i];

            var key = order.UnitType + "_" + order.CurrentZone;

            // Keep track of units still needing orders
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
            console.log(key);

            var output = ordersTemp[key].order;

            var node = document.createElement("LI");
            var textnode = document.createTextNode(output);
            node.appendChild(textnode);
            node.style.color = "green";
            document.getElementById("results").appendChild(node);
        }
    }
}

// Disband if no orders
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
    
    var failedOrders = new Array();

    if (fail !== undefined)
    {
        for (var i = 0; i < fail.length; i++)
        {
            var orderKey = fail[i].UnitType + "_" + fail[i].CurrentZone;
            failedOrders.push(orderKey);
        }
    }

    // Build submission for non retreats
    submission.username = username;
    submission.gameId = gameID;
    submission.orders = [];

    for (var i = 0; i < keys.length; i++)
    {
        var key = keys[i];
        var o = orders[key];
        var data = o.split(" ");

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

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res) {
        mapsLogic(res);
        addResults(res);
        addTitle(res);
        addRetreats(res);

        $("#roundSubmissionForm").submit(function () {

            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2) {
                disband(res2);

                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res3) {
                    var submission = submitOrders(res3);
                    console.log(submission);

                    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitretreatorder", { submission }, function (res4) {
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