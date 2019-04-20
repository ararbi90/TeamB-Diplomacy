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
        let userInformation = 0;
        snapshot.forEach(function (data) {
            if (data.key == username) {
                userInformation = data.val();

            }
        });
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

                    

                    $("#" + gameId + "-table").hide()
                    // Move to the game

                }


            });

    });
    let link = "game.html?gameID=" + gameId + "&username=" + username;
    console.log(link);
    //window.location.href = link;
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

function reJoinGame(event) {
    // Need to make updates here
    // Create on value promises
    let link = "game.html?gameID=" + this.id + "&username=" + username;
    console.log(link);
    window.location.href = link;

}

function setAllInvites() {
    // This fucntion creates all the invites tables
    var count = 0
    var tableInvite = $("#gameInviteAppend");
    playersRef.child(username).child("gameInvite").on("child_added", function (data) {
        console.log(data.val());
        console.log(++count);

        tableInvite.append("<tr id= " + data.key + "-table>" +
            "<td>" + data.val().name + "</td>" +
            "<td>" + data.val().days + " </td>" +
            "<td>" + data.val().dateCreated + "</td>" +
            "<td><button type='button' class='btn btn-primary' id=" + (data.key + "-accept") + ">Accpet</button></td>" +
            "<td><button type='button' class='btn btn-primary' id=" + (data.key + "-decline") + ">Decline</button></td></tr>");

        $("#" + (data.key + "-accept") + "").click(accpetGame);
        $("#" + (data.key + "-decline") + "").click(declineGame);


    });

}

function setAllGamesInProgress() {
    // This fucntion creates all the game tables
    var gameTable = $("#currentGames")
    playersRef.child(username).child("game").on("child_added", function (data) {
        console.log(data.val());
        gameTable.append("<tr>" +
            "<td>" + data.val().name + "</td>" +
            "<td>" + data.val().days + " </td>" +
            "<td>" + data.val().dateCreated + "</td>" +
            "<td><button type='button' class='btn btn-primary' id=" + data.key + ">Re-Join</button></td></tr>");
        $("#" + data.key + "").click(reJoinGame);

    });

}

$(document).ready(function () {
    // Create the dashboard intvite are
    setAllInvites();
    setAllGamesInProgress();


});