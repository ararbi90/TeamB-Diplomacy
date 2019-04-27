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

$("document").ready(function(){
    let timerController = setInterval(controllerTimer, 1000);
})