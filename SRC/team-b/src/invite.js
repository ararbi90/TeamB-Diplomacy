$ = require('jquery');

var urlParams = new URLSearchParams(location.search);
// console.log(urlParams.get("username"));
let username = urlParams.get("username");

document.getElementById("navbarDropdownMenuLink").innerHTML = username;

document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "dashboard.html?username=" + username;
    window.location.href = link;
});

document.getElementById("logOut").addEventListener("click", function () {
    let link = "index.html";
    window.location.href = link;
});

function getUserLists(users) {
    // Generates and verifies if there are no repeates in the input
    // If there are repeats it termenates the submit
    let usersList = {};
    let repeatList = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].value != "") {
            if (usersList[users[i].value] == undefined) {
                let temp = users[i].value;
                usersList[users[i].value] = i;
                let messageID = "#user" + (i + 1) + "-Message";
                let messageVar = $(messageID);
                messageVar.css("display", "none");
                //console.log(usersList[users[i].value]);

            } else {
                let messageID = "#user" + (i + 1) + "-Message";
                let messageVar = $(messageID);
                messageVar.html("Repeat");
                messageVar.css("display", "block");

                repeatList = true;
            }
        } else {
            let messageID = "#user" + (i + 1) + "-Message";
            let messageVar = $(messageID);
            messageVar.css("display", "none");
        }
    }
    //console.log(repeatList);
    return {
        userNames: usersList,
        repeat: repeatList
    };
}


$(document).ready(function () {
    $("#allUsers").submit(function (event) {
        var users = $(this).serializeArray();
        var game = $("#gameInfo").serializeArray();

        let allPlayers = null;

        game.days = $("#days").val();
        game.hours = $("#hours").val();

        let userList = getUserLists(users);
        let repeat = userList.repeat;
        userList = userList.userNames;
        console.log(userList)

        // If there are repeated values the submit dies her
        if (repeat) {
            return false;
        }

        //This section verifies players and creates the game
        allPlayers = {};
        PlayerFireBase.getPlayers().once("value").then(function (snapshot) {
            // Get all usernames
            snapshot.forEach(function (data) {
                allPlayers[data.key] = data;
            });

            // Verifies all usernames exist
            let notFound = false;
            let names = Object.keys(userList);
            console.log(names)
            for (let i = 0; i < names.length; i++) {
                //console.log(n);
                if (allPlayers[names[i]] == undefined) {
                    notFound = true;
                    let messageID = "#user" + (userList[names[i]] + 1) + "-Message";
                    let messageVar = $(messageID);
                    console.log(messageID);
                    messageVar.html("Not Found");
                    messageVar.css("display", "block");
                } else {
                    let messageID = "#user" + (userList[names[i]] + 1) + "-Message";
                    let messageVar = $(messageID);
                    console.log(messageID);
                    messageVar.html("Found!!");
                    messageVar.css("display", "block");

                }
            }
            if (notFound) {
                console.log("Some Players Not found!!! Cannot Create Game!!!");
                return false;
            }

            console.log("Found All Create Game!!!");
            // Create Game
            // Create all game params
            let gameOwner = username;
            let invites = Object.assign({}, names);
            gameRef.push().set({
                    name: game[0]["value"],
                    owner: gameOwner,
                    invites: invites,
                    TimeLimitDays: game.days,
                    TimeLimitHours: game.hours
                }
            );

        })


        return false;
    })


});