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
        game.expirationHours = $("#expiration_hours").val();
        game.expirationMinutes = $("#expiration_minutes").val();

        // Set defaults if the user hasn't selected turn or expiration duration
        // turn default:        1 day 
        // expiration default:  6 hours
        if(game.days == "Choose..."){
            game.days = 1;
        }
        if(game.hours == "Choose..."){
            game.hours = 0;
        }

        if(game.expirationHours == "Choose..."){
            game.expirationHours = 6;
        }else{
            game.expirationHours = parseInt(game.expirationHours);
        }
        if(game.expirationMinutes == "Choose..."){
            game.expirationMinutes = 0;
        }else{
            game.expirationMinutes = parseInt(game.expirationMinutes);
        }


       

        // Creates a hashtable for users
        let userList = getUserLists(users);
        let repeat = userList.repeat;
        userList = userList.userNames;


        // If there are repeated values the submit dies her
        if (repeat) {
            return false;
        }
        // Cannot invite self to the game
        if (userList[username] != null) {

            var x = document.getElementById("selfInvite");

            x.className = "show";
            x.innerHTML = "Cannot Invite yourself to the game";

            // After 1.5 seconds, remove the show class
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 1500);
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

            // Set the expiration timestamp for the invites using UTC (milliseconds)
            // Convert the expiration minutes and hours to milliseconds
            let expirationDuration = (game.expirationHours*60 + game.expirationMinutes) * 60 * 1000;
            let expirationDate = Date.now() + expirationDuration;
            console.log("expirationDate: "+ expirationDate);

            console.log("Found All Create Game!!!");
            // Create Game
            // Create all game params
            
            
            let gameOwner = username;
            //names.push(gameOwner);
            let invite = {};

            names.forEach(function(name, index){
                invite[name] = {username: name};
            })
                
            console.log(invite);

            // Add owner into the game
            let gameID = gameRef.push().key // This key is the most important part of creating the game
            console.log(gameID)
            gameRef.child(gameID).set({
                name: game[0]["value"],
                owner: gameOwner,
                invites: invite,
                expirationDate:expirationDate, 
                TimeLimitDays: game.days,
                TimeLimitHours: game.hours
            }, function (error) {
                if (error) {

                } else {
                    gameRef.child(gameID).child("players").child(gameOwner).set(gameOwner);
                    // This section of the code sends all the invites to the a game and creates the owner of the game
                    console.log("Updating users");
                    playersRef.child(username).child("game").child(gameID).set({
                        name: game[0]["value"],
                        days: game.days,
                        hours: game.hours,
                        dateCreated: new Date().toJSON().slice(0, 10).replace(/-/g, '/')
                    })
                    let count = 0;
                    for (let i = 0; i < names.length; i++) {

                        playersRef.child(names[i]).child("gameInvite").child(gameID).set({
                            name: game[0]["value"],
                            owner: username,
                            dateCreated: new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
                            expirationDate:expirationDate,
                            days: game.days,
                            hours: game.hours

                        }, function (err) {
                            count++;
                            console.log(count);
                            if (count >= names.length - 1) {
                                setTimeout(function () {
                                    var link = "dashboard.html?username=" + username;
                                    window.location.href = link;
                                }, 1500);
                                $("#invitePage").hide();
                                $("#gameCreated").show();

                            }
                        });


                    }

                }
            });




        })


        return false;
    })


});