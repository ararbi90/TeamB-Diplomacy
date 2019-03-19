$ = require('jquery');
var urlParams = new URLSearchParams(location.search);
//console.log(urlParams.get("username"));
let username = urlParams.get("username");
document.getElementById("welcome").innerHTML = username;
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

document.getElementById("newGame").addEventListener("click", function () {
    let link = "invite.html?username=" + username;
    window.location.href = link;
});

// for (var i = 1; i <= 4; i++) {
//     var join = "join" + i;
//     document.getElementById(join).addEventListener("click", function () {
//         let link = "game.html?username=" + username;
//         window.location.href = link;
//     });

// }

document.getElementById("logOut").addEventListener("click", function () {
    let link = "index.html";
    window.location.href = link;
});

function joinGame(event) {
    // Need to make updates here
    let link = "game.html?gameID=" + this.id + "&username=" + username;
    console.log(link);
    window.location.href = link;
}

function reJoinGame(event) {
    // Need to make updates here
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

        tableInvite.append("<tr>" +
            "<td>" + data.val().name + "</td>" +
            "<td>" + data.val().days + " </td>" +
            "<td>" + data.val().dateCreated + "</td>" +
            "<td><button type='button' class='btn btn-primary' id=" + data.key + ">Join</button></td></tr>");
        $("#" + data.key + "").click(joinGame);

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