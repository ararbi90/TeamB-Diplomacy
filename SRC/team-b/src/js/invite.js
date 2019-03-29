$ = require('jquery');

// Get username from URL
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
document.getElementById("navbarDropdownMenuLink").innerHTML = username;
document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "../html/dashboard.html?username=" + username;
    window.location.href = link;
});
document.getElementById("logOut").addEventListener("click", function () {
    let link = "../html/index.html";
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

    return {
        userNames: usersList,
        repeat: repeatList
    };
}


$(document).ready(function () {
    $("#allUsers").submit(function (event) {
        var users = $(this).serializeArray();
        var game = $("#gameInfo").serializeArray();
        // Add attribites to the objects
        game.days = $("#days").val();
        game.hours = $("#hours").val();
        

        // Creates a hashtable for users
        let userList = getUserLists(users);
        let repeat = userList.repeat;
        userList = userList.userNames;


        // If there are repeated values the submit dies her
        if (repeat) {
            return false;
        }

        //This section verifies players and creates the game
        // This is promise
        PlayerFireBase.getPlayers().once("value").then(function (snapshot) {
            // Get all usernames
            let allPlayers = {};
            snapshot.forEach(function (data) {
                allPlayers[data.key] = data;
            });

            // Verifies all usernames exist
            let notFound = false;
            let names = Object.keys(userList);
            for (let i = 0; i < names.length; i++) {

                if (allPlayers[names[i]] == undefined) {
                    // This is where the red 'x' go.
                    notFound = true;
                    let messageID = "#user" + (userList[names[i]] + 1) + "-Message";
                    let messageVar = $(messageID);
                    console.log(messageID);
                    messageVar.html("Not Found");
                    messageVar.css("display", "block");
                } else {
                    // This is where check marks are placed
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
            // Create Gamea
            // Create all game params
            let gameOwner = username;
            let intvite = {};
            for(let i = 0; i < names.length; i++){
                intvite[names[i]] = names[i];
            }
            console.log(intvite);
            let gameID = gameRef.push().key // This key is the most important part of creating the game
            console.log(gameID)
            gameRef.child(gameID).set({
                name: game[0]["value"],
                owner: gameOwner,
                invites: intvite,
                TimeLimitDays: game.days,
                TimeLimitHours: game.hours
            }, function (error) {
                if (error) {

                } else {
                    // This section of the code sends all the invites to the a game and creates the owner of the game
                    console.log("Updating users");
                    playersRef.child(username).child("game").child(gameID).set({
                        name: game[0]["value"],
                        days: game.days,
                        hours: game.hours,
                        dateCreated: new Date().toJSON().slice(0,10).replace(/-/g,'/')
                    })
                    for (let i = 0; i < names.length; i++) {
                        playersRef.child(names[i]).child("gameInvite").child(gameID).set({
                            name: game[0]["value"],
                            owner: username,
                            dateCreated: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
                            days: game.days,
                            hours: game.hours,

                        })

                    }

                }
            });




        })


        return false;
    })


});