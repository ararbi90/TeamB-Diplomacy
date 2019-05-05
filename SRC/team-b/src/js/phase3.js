// SOURCE CODE CORRESPONDING TO: phase3.html 

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

    // Determine the amount of unitsToAdd and unitsToRemove
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
        // Can only click on supply centers that are unoccupied
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
        // Can only click on unitsToRemove amount of units (to remove them)
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

    // Show the user their clickable areas
    for (var i = 0; i < clickableRegions.length; i++)
    {
        var region = clickableRegions[i];
        var node = document.createElement("LI");
        var textnode = document.createTextNode(region);
        node.appendChild(textnode);
        document.getElementById("clickable_areas").appendChild(node);
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

// Update the build orders the user has submitted for this phase
gameRef.child(gameID).child("players").child(username).child("build_orders_temp").on("value", function (snapshot)
{
    let orders = new Array();
    snapshot.forEach(element =>{
        var order = "";

        // Make the orders English readable.
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

    $("#orders").empty(); // Empty the divs

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

    // Add all orders to the "orders" div.
    for (var i = 0; i < orders.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(orders[i]);
        node.appendChild(textnode);
        document.getElementById("orders").appendChild(node);
    }
})

// Update the "Unit Status" (units to add/remove) for showing the user how they must take action during this phase.
gameRef.child(gameID).child("players").child(username).child("territories").on("value", function (snapshot)
{
    // All user's territories.
    let terrs = new Array();
    snapshot.forEach(element => {
        terrs.push(element.val().forceType);
    });

    gameRef.child(gameID).child("players").child(username).child("supplyCenters").on("value", function (snapshot)
    {
        $("#num_units").empty(); // Empty the div.

        // All user's supply centers.
        let supps = new Array();
        snapshot.forEach(element => {
            supps.push(element.val().forceType);
        });

        // Determine the amount of unitsToAdd and unitsToRemove
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

        // Update the "Unit Status" div.
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

        // We must delete "build_orders_temp" for every player if they are not undefined.
        for (var i = 0; i < players.length; i++)
        {
            if (gameRef.child(gameID).child("players").child(players[i]).child("build_orders_temp") != undefined)
            {
                gameRef.child(gameID).child("players").child(players[i]).child("build_orders_temp").remove();
            }
        }

        if (data === "order")
        {
            // Go to order phase.
            let link = "game.html?gameID=" + gameID + "&username=" + username;
            window.location.href = link;
        }
    })

})

// Function for removing units if no remove commands were given.
// -- uses the DB info, "res", to retrieve the current commands.
function remove(res)
{
    // Determine the amount of unitsToAdd and unitsToRemove
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

    // Get the build orders
    var builds = new Array();
    if (res.players[username].build_orders_temp !== undefined)
    {
        builds = Object.keys(res.players[username].build_orders_temp);
    }

    if (builds.length < unitsToRemove)
    {
        // Remove for them
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

// Function for creating a submission JSON.
// -- takes all orders in the DB and creates a JSON for sending to the backend as a POST.
function submitOrders(res)
{
    var keys = new Array();

    // Get orders from "build_orders_temp"
    var buildOrders = res.players[username].build_orders_temp;
    if (buildOrders !== undefined)
    {
        keys = Object.keys(buildOrders);
    }

    // Build the submission.
    var submission = {};

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

    // submission.orders must contain something: command == "NONE"
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

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        // Get game data and initialize necessary components.
        mapsLogic(res);
        addTitle(res);
        $("#roundSubmissionForm").submit(function ()
        {
            // Executed when the user clicks submit in the round submission form.
            $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res2)
            {
                // Get a current snapshot of the game and remove the necessary units.
                remove(res2);
                $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res3)
                {
                    // Get another current snapshot of the game and create the submission.
                    var submission = submitOrders(res3);
                    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/submitbuildorder", { submission }, function (res4)
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