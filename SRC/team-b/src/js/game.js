// SOURCE CODE CORRESPONDING TO: game.html 

$ = require("jquery");

// Username information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
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
            if (username == playerName) {
                clickableRegions.push(index);
            }
        });
    });

    var enabledRegions = ["ADR", "AEG", "BAL", "BAR", "BLA", "EAS", "ENG", "BOT", "GOL", "HEL", "ION", "IRI", "MID", "NAT", "NTH", "NRG", "SKA", "TYN", "WES", "CLY", "EDI", "LVP", "YOR", "WAL", "LON", "PIC", "BRE", "PAR", "BUR", "GAS", "MAR", "PIE", "VEN", "TUS", "ROM", "APU", "NAP", "TYR", "BOH", "VIE", "GAL", "BUD", "TRI", "CON", "ANK", "ARM", "SMY", "SYR", "FIN", "STP", "LVN", "MOS", "WAR", "UKR", "SEV", "RUH", "KIE", "BER", "PRU", "MUN", "SIL", "NWY", "SWE", "DEN", "HOL", "BEL", "POR", "SPA", "NAF", "TUN", "RUM", "SER", "BUL", "ALB", "GRE"];

    // the initial parameters for the map. Change according to this link to change the look of the map, https://www.10bestdesign.com/jqvmap/documentation/
    jQuery('#vmap').vectorMap({
        map: 'diplomacy',
        backgroundColor: '#000000',
        clickableRegions: allTerritoriesWithUnits, // used to see what territories the player owns
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
    var title = "Order Placing Phase - ";
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

// Function for showing the user their color on the map
// -- uses the DB info, "res", to retrieve the color
function setColor(res)
{
    var color = res.players[username].color;
    $("#currentColor").append('<h3 style="text-align: center; font-family:Playball;">Your Color <span style = "color:'+ color + '">\u2588</span></h3>')
}

// Add orders to the "Current Orders" section, real-time.
gameRef.child(gameID).child("players").child(username).child("orders_temp").on("value", function (snapshot)
{
    $("#orders").empty(); // Empty the div

    // Get all the orders
    let orders = new Array();
    snapshot.forEach(element => {
        orders.push(element.val().order);
    });

    if (orders.length > 0)
    {
        // Hide the "no_orders" div, unhide the "orders" div.
        document.getElementById("no_orders").hidden = true;
        document.getElementById("orders").hidden = false;
    }

    // Add all the orders to the "orders" div
    for (var i = 0; i < orders.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(orders[i]);
        node.appendChild(textnode);
        document.getElementById("orders").appendChild(node);
    }
})

// Change phase. Will get executed when a child of the game's "turn_status" is updated.
gameRef.child(gameID).child("turn_status").on("child_changed", function (snapshot)
{
    var data = snapshot.val();

    // We must delete the chats after every orders phase.
    if (privateChatRef.child(gameID) !== undefined)
    {
        privateChatRef.child(gameID).remove();
    }
    if (publicChatRef.child(gameID) != undefined)
    {
        publicChatRef.child(gameID).remove();
    }

    if (data === "retreat")
    {
        // Go to phase 2.
        let link = "phase2.html?gameID=" + gameID + "&username=" + username;
        window.location.href = link;
    }
    else
    {
        gameRef.child(gameID).child("players").on("value", function (snapshot)
        {
            // All players.
            let players = new Array();
            snapshot.forEach(element => {
                players.push(element.key);
            });
            
            // Me must delete every players "orders_temp" if it is not undefined.
            for (var i = 0; i < players.length; i++)
            {
                if (gameRef.child(gameID).child("players").child(players[i]).child("orders_temp") !== undefined)
                {
                    gameRef.child(gameID).child("players").child(players[i]).child("orders_temp").remove();
                }
            }

            if (data === "build")
            {
                // Go to phase 3.
                let link = "phase3.html?gameID=" + gameID + "&username=" + username;
                window.location.href = link;
            }
            else
            {
                // Redirect here with updated DB.
                let link = "game.html?gameID=" + gameID + "&username=" + username;
                window.location.href = link;
            }
        })
    }
})

// Function for creating a submission JSON.
// -- takes all orders in the DB and creates a JSON for sending to the backend as a POST.
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

    userTerrs = res.players[username].territories; // All the user's territories

    let terrs = new Array(); // 2D array of all the user's unit force type and location
    for (var t in userTerrs)
    {
        terrs.push([res.players[username].territories[t].forceType, t]);
    }

    for (var i = 0; i < terrs.length; i++)
    {
        var key = terrs[i][0] + '_' + terrs[i][1];  // Ex: "A_BUR"
        var data = terrs[i][0] + ' ' + terrs[i][1]; // Ex: "A BUR"

        var inOrders = false

        // Find if the data matches the first 5 characters of any of the orders
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

        // Build a JSON for each order
        var order = {};

        if (data.length === 2)
        {
            // The order was either a move or a hold.
            order.UnitType = data[0];

            var data2 = data[1].split("-");

            order.CurrentZone = data2[0];

            // data2[1] contains a location, the order was a move
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
            // The order was a support or convoy
            order.UnitType = data[0];
            order.CurrentZone = data[1];
            order.MoveType = data[2];

            var data2 = data[4].split("-");

            if (data2[1].length === 3)
            {
                // Second move was a move.
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
                // Second move was a hold, only happens with support.
                order.InitialSupportZone = data2[0];
                order.FinalSupportZone = data2[0];
            }
        }

        submission.orders.push(order);
    }

    return submission;
}

$("document").ready(function () {
    let timerController = setInterval(controllerTimer, 1000);

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        // Get game data and initialize necessary components.
        mapsLogic(res);
        addTitle(res);
        setColor(res);
        $("#roundSubmissionForm").submit(function ()
        {
            // Executed when the user clicks submit in the round submission form.
            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2)
            {
                // Get a current snapshot of the game and create the submission.
                var submission = submitOrders(res2);
                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitorder", { submission }, function (res3)
                {
                    // POST the submission to the backend.
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