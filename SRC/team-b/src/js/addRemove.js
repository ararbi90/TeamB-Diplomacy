$ = require('jquery');

const ipc = require('electron').ipcRenderer;

// Array of moves
let units = new Array("Choose...", "A", "F");

let gameID = "";
let username = "";
let code = "";

ipc.on('message', (event, message) => {
    var data = message.split(" ");
    code = data[0];
    username = data[1];
    gameID = data[2];

    $.post("https://us-central1-cecs-475-team-b.cloudfunctions.net/teamBackend/game/info", { gameId: gameID }, function (res)
    {
        var terrs = Object.keys(res.players[username].territories);

        var inTerrs = false;

        for (var i = 0; i < terrs.length; i++)
        {
            if (terrs[i] === code)
            {
                inTerrs = true;
            }
        }

        if (inTerrs)
        {
            document.getElementById("remove_unit").hidden = false;
            document.getElementById("add_unit").hidden = true;
        }
        else
        {
            document.getElementById("remove_unit").hidden = true;
            document.getElementById("add_unit").hidden = false;
        }

    }).fail(function (err)
    {
        console.log(err);
    })

    var unitsDropdown = document.getElementById("unitSelect");

    for (var i = 0; i < units.length; i++)
    {
        // Append the element to the end of Array list for the first move
        unitsDropdown[unitsDropdown.length] = new Option(units[i], units[i]);
    }
    unitsDropdown.options[0].hidden = "true";
})

function makeToast(data)
{
    var x = document.getElementById("snackbar");
  
    x.className = "show";
    x.innerHTML = data;

    // After 1.5 seconds, remove the show class
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1500);
}

function add()
{
    var unit = document.getElementById("unitSelect");

    var unitSelected = "";

    var validOrder = false;

    if (unit.value === "Choose...")
    {
        makeToast("Choose a unit")
    }
    else
    {
        unitSelected = unit.value;
        validOrder = true;
    }

    if (validOrder)
    {
        var ref = gameRef.child(gameID).child("players").child(username);

        ref.child("build_orders_temp").child(code).set({
            territory: code,
            command: "BUILD",
            buildType: unitSelected
        });

        window.close();
    }
}

function remove()
{
    var ref = gameRef.child(gameID).child("players").child(username);

    ref.child("build_orders_temp").child(code).set({
        territory: code,
        command: "REMOVE"
    });

    window.close();
}
