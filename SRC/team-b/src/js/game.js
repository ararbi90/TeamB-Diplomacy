$ = require("jquery");

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


function controllerTimer(){
    let t = $("#timer").html();
    let hr = parseInt(t.substring(0, t.indexOf(":")));
    let min = parseInt(t.substring(t.indexOf(":") + 1));
    let newMin = min - 1;
    let newHr = hr;
    if(newMin < 0){
        newHr = hr - 1;
        newMin = 59;
    }
    if(newMin >= 10 && newHr >= 10){
        $("#timer").html(newHr + ":" + newMin);
    }
    else if(newMin >= 10){
        $("#timer").html("0" + newHr + ":" + newMin);
    }
    else if(newHr >= 10){
        $("#timer").html(newHr + ":0" + newMin);
    }
    else{
        $("#timer").html("0" + newHr + ":0" + newMin);
    }
}

function submitOrders()
{
    console.log("hi");
}

// Add moves
gameRef.child(gameID).child("players").child(username).child("orders").on("value", function (snapshot)
{
    $("#orders").empty();
    let orders = new Array();
    snapshot.forEach(element => {
        orders.push(element.val().order);
    });

    if (orders.length > 0)
    {
        document.getElementById("no_orders").hidden = true;
        document.getElementById("orders").hidden = false;
    }

    for (var i = 0; i < orders.length; i++)
    {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(orders[i]);
        node.appendChild(textnode);
        document.getElementById("orders").appendChild(node);
    }
})

function submitNecessaryHolds()
{
    gameRef.child(gameID).child("players").child(username).child("orders").on("value", function (snapshot)
    {
        // Get all orders
        let orders = new Array();
        snapshot.forEach(element => {
            orders.push(element.val().order);
        });

        gameRef.child(gameID).child("players").once("value").then(function (snap)
        {
            // Get all players
            let players = {};
            snap.forEach(element => {
                players[element.key] = element.val();
            });

            userTerrs = players[username].territories;
            //console.log(userTerrs);
    
            let terrs = new Array();
            for (var t in userTerrs)
            {
                terrs.push([players[username].territories[t].forceType, t]);
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

                    var ref = gameRef.child(gameID).child("players").child(username).child("orders");

                    ref.child(key).set({
                        order: order
                    });
                }
            }
        })
    })
}

function createOrdersJSON()
{
    gameRef.child(gameID).child("players").child(username).child("orders").on("value", function (snapshot)
    {
        // Get all orders
        let orders = new Array();
        snapshot.forEach(element => {
            orders.push(element.val().order);
        });

        let submission = {};
        submission.username = username;
        submission.gameID = gameID;
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

        console.log(submission);
    })
}

createOrdersJSON();

$("document").ready(function(){
    let timerController = setInterval(controllerTimer, 1000);
})