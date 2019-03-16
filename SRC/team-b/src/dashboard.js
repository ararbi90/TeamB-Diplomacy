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
    let link = "game.html?gameID=" + this.id + "&username=" + username;
    console.log(link);
    window.location.href = link;
}

function setAllInvites() {
    // This fucntion creates all the invites tabs
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

        // let username = urlParams.get("username");
        // let userInfo = data.child(username).val();
        // console.log(userInfo.gameInvite);
        // console.log(typeof (userInfo.gameInvite));
        // var tableInvite = $("#gameInviteAppend");

        // for (let game in userInfo.gameInvite) {
        //     console.log((game));
        //     tableInvite.append("<tr>" +
        //         "<td>" + userInfo.gameInvite[game].name + "</td>" +
        //         "<td>" + userInfo.gameInvite[game].days + " </td>" +
        //         "<td>" + userInfo.gameInvite[game].dateCreated + "</td>" +
        //         "<td><button type='button' class='btn btn-primary' id=" + game + ">Join</button></td></tr>");
        //     $("#" + game + "").click(function (event) {
        //         let link = "game.html?gameID=" + this.id + "&username=" + username;
        //         console.log(link);
        //         window.location.href = link;
        //     });
        // }




    });

}

function setAllGamesInProgress() {
    var gameTable = $("#currentGames")
    playersRef.child(username).child("gameInvite").on("child_added", function (data) {
        console.log(data.val());

        gameTable.append("<tr>" +
            "<td>" + data.val().name + "</td>" +
            "<td>" + data.val().days + " </td>" +
            "<td>" + data.val().dateCreated + "</td>" +
            "<td><button type='button' class='btn btn-primary' id=" + data.key + ">Re-Join</button></td></tr>");
        $("#" + data.key + "").click(joinGame);

    });

}

$(document).ready(function () {
    // Create the dashboard intvite are
    setAllInvites();
    setAllGamesInProgress();


});