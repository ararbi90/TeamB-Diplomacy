$ = require('jquery');



// Username information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
document.getElementById("welcome").innerHTML = username;
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

// Dashboard changes
document.getElementById("newGame").addEventListener("click", function () {
    let link = "../html/invite.html?username=" + username;
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

function accpetGame(event) {
    // Need to make updates here
    // Create on value promises
    let gameId = this.id.substring(0, this.id.search("-accept"));
    gameRef.child(gameId).child("invites").once("value").then(function (snapshot) {

        let userInformation = snapshot.child(username).val();
        gameRef.child(gameId).child("players").child(username).set(
            userInformation
            , function (error) {
                if (error) {

                }
                else {
                    playersRef.child(username).child("gameInvite").once("value").then(function (snapshot) {
                        snapshot.forEach(function (data) {
                            if (data.key == gameId) {
                                playersRef.child(username).child("game").child(gameId).set(data.val(), function (err) {
                                    gameRef.child(gameId).child("invites").child(username).remove();
                                    playersRef.child(username).child("gameInvite").child(gameId).remove();
                                });
                            }
                        })
                    });
                    $("#" + gameId + "-table").remove();
                }
            });

    });
    let link = "game.html?gameID=" + gameId + "&username=" + username;
    console.log(link);

}

function declineGame(event) {
    // Need to make updates here
    // Create on value promises
    // let link = "game.html?gameID=" + this.id + "&username=" + username;
    // console.log(link);
    // window.location.href = link;
    let gameId = this.id.substring(0, this.id.search("-decline"));
    playersRef.child(username).child("gameInvite").child(gameId).remove();
    gameRef.child(gameId).child("invites").child(username).remove();
    console.log("Deline" + gameId)
    $("#" + gameId + "-table").hide()
    // let link = "dashboard.html?gameID=" + gameId + "&username=" + username;
    // console.log(link);
    // window.location.href = link;
    return;
}

// Delete the invites and game that as expired
function autoDecline(gameId) {
    // query database
    gameRef.child(gameId).child("invites").once("value").then(function (data) {
        console.log("Auto decline is here");
        // Get all the invites from the game
        data.forEach(function (invites) {
            console.log("username from invite " + invites.val().username);
            console.log(username);
            // Set each player to decline the game
            playersRef.child(invites.key).child("gameInvite").child(gameId).remove();
        });
        // Remove invites section from db
        gameRef.child(gameId).child('invites').remove();
        // Check to see it there are more than one players in the game
        gameRef.child(gameId).once("value").then(function (snap) {
            let count = 0;
            let gamePlayers = snap.child("players");
            console.log(snap.val());
            gamePlayers.forEach(function (d) {
                count++;
            });
            if (count <= 1) {
                // If there are one or less players delete game and delete game from the owner
                console.log("Deleting game and game entry from owner");
                playersRef.child(snap.child('owner').val()).child('game').child(gameId).remove();
                gameRef.child(gameId).remove();

            }

        });
    });


    return;
}

function reJoinGame(event) {
    // Need to make updates here
    // Create on value promises
    let link = "game.html?gameID=" + this.id + "&username=" + username;
    console.log(link);
    window.location.href = link;

}


function getArrayOfRandomNumbers(n) {
    let numberArray = [];
    while (numberArray.length < n) {
        let temp = Math.floor(Math.random() * n);

        var found = numberArray.find(function (element) {
            return element == temp;
        });
        if (found == undefined) {
            numberArray.push(temp);
        }
    }
    return numberArray;
}




function gameButtonHandler(gameId, expirationDate) {
    //console.log(gameId);

    gameRef.child(gameId).once("value").then(function (data) {
        // Check if territories are created
        let gamePlayers = [];
        let allPlayers = data.child("players");
        let createTerretories = false;
        allPlayers.forEach(function (player) {
            if (player.val().territories == null) {
                createTerretories = true;
            }
            gamePlayers.push(player.key);
        });

        // If invites are null or time has expired and no teritories exit then create teritories
        if (createTerretories && (Date.now() >= data.child('expirationDate').val() || data.child("invites").val() == null)) {
            if (gamePlayers.length <= 1) {
                // Time has runout and no one has accpeted the game
                autoDecline(gameId);
            }
            else {
                console.log("Creating terretories");
                if (data.child("invites").val() != null) {
                    gameRef.child(gameId).child("invites").remove();
                }
                console.log(getArrayOfRandomNumbers(5));

            }
        }
        else if (!createTerretories) {
            $("#" + gameId + "").click(reJoinGame);
            console.log("No need to create territories");
        }
        else {
            console.log("Waiting to people to accpet the game");
            $("#" + gameId + "").attr("disabled", true);
            $("#" + gameId + "").html("Waiting for other players");
        }
    });
}

function setAllInvites() {
    // This fucntion creates all the invites tables
    var count = 0
    var tableInvite = $("#gameInviteAppend");
    playersRef.child(username).child("gameInvite").on("child_added", function (data) {
        console.log(data.val());
        console.log(++count);


        //Check how many secs unil expiration.
        let seconds = (data.val().expirationDate - Date.now()) / 1000;
        console.log("Seconds until expiration: " + seconds);
        console.log("Mins until expiration: " + seconds / 60);
        //console.log((data.val().expirationDate - Date.now())/1000);

        //Before adding the invites to the table we must check the invite expiration time.
        if (Date.now() <= data.val().expirationDate) {

            tableInvite.append("<tr id= " + data.key + "-table>" +
                "<td>" + data.val().name + "</td>" +
                "<td>" + data.val().days + " </td>" +
                "<td>" + data.val().dateCreated + "</td>" +
                "<td><button type='button' class='btn btn-primary' id=" + (data.key + "-accept") + ">Accpet</button></td>" +
                "<td><button type='button' class='btn btn-primary' id=" + (data.key + "-decline") + ">Decline</button></td></tr>");

            $("#" + (data.key + "-accept") + "").click(accpetGame);
            $("#" + (data.key + "-decline") + "").click(declineGame);

        } else {
            // Autodecline the invite has since it has expired.
            autoDecline(data.key);


        }

    });

}

function setAllGamesInProgress() {
    // This fucntion creates all the game tables
    var gameTable = $("#currentGames")
    playersRef.child(username).child("game").on("child_added", function (data) {
        let seconds = (data.val().expirationDate - Date.now()) / 1000;
        //console.log(data.val());
        gameTable.append("<tr>" +
            "<td>" + data.val().name + "</td>" +
            "<td>" + data.val().days + " </td>" +
            "<td>" + data.val().dateCreated + "</td>" +
            "<td><button type='button' class='btn btn-primary' id=" + data.key + ">Re-Join</button></td></tr>");

        gameButtonHandler(data.key, data.val().expirationDate);


    });

}

$(document).ready(function () {
    // Create the dashboard intvite are
    setAllInvites();
    setAllGamesInProgress();


});