// Initialize Firebase
var $ = require("jquery");
var config = {
    apiKey: "AIzaSyBmzv9WLDoGI533rDWZXVATzA8ea9xbteo",
    authDomain: "cecs-475-team-b.firebaseapp.com",
    databaseURL: "https://cecs-475-team-b.firebaseio.com",
    projectId: "cecs-475-team-b",
    storageBucket: "cecs-475-team-b.appspot.com",
    messagingSenderId: "25953904090"
};
firebase.initializeApp(config);

var db = firebase.database();


var playersRef = db.ref("player");

console.log(firebase)

var remote = require('electron').remote;

// show initial value from main process (in dev console)
console.log(remote.getGlobal('sharedObj').prop1);

// change value of global prop1
remote.getGlobal('sharedObj').prop1 = 1;

// show changed value in main process (in stdout, as a proof it was changed)
var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.send('show-prop1');

// show changed value in renderer process (in dev console)
console.log(remote.getGlobal('sharedObj').prop1);

// This is to change between login and create user
document.getElementById("createNew").addEventListener("click", function () {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

document.getElementById("backSign").addEventListener("click", function () {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
});

// This is the submit option for creating an account
$("#register-form").submit(function (event) {
    var data = $(this).serializeArray();
    var password = data[1]["value"];
    var passwordRe = data[2]["value"];
    if (password != passwordRe) {
        document.getElementById("passwordDo").innerHTML = "Passwords dont match";
    } else {
        // Test to see if user name exits
        let ref = firebase.database().ref("player"); // Firebase referece 
        var usernameIn = data[0]["value"];
        var passwordIn = data[1]["value"];
        var gameIn = "";
        var invitationIn = "";
        ref.once("value").then(function (data) {

            if (data.child(usernameIn).val() == null) { // This if statement verifies if username does not exist
                console.log("Created");
                document.getElementById("passwordDo").innerHTML = "Created";
                ref.child(usernameIn).set({
                    username: usernameIn,
                    password: passwordIn,
                    game: gameIn,
                    invitation: invitationIn
                });
                // Return to login
                document.getElementById("login-form").style.display = "block";
                document.getElementById("register-form").style.display = "none";
            } else {
                document.getElementById("passwordDo").innerHTML = "User name already exists";
                console.log("Not created");
            }
        })
    }

    return false;
});


$("#login-form").submit(function (event) {
    // Login fucntionality
    var data = $(this).serializeArray();
    console.log(data);
    var usernameIn = data[0]["value"];
    var passwordIn = data[1]["value"];

    let ref = firebase.database().ref("player"); // Referece for firebase
    let found = false;
    ref.once("value").then(function (data) {

        if (data.child(usernameIn).val() != null) { // Cheaks if user exists
            if (data.child(usernameIn).val().password == passwordIn) { // Test Password
                document.getElementById("found").innerHTML = "Found";
                var link = "dashboard.html?username=" + usernameIn + "&userID=" + data.child(usernameIn).key;
                window.location.href = link;
            } else {
                document.getElementById("found").innerHTML = "Invalid username or password";
            }

        } else {
            document.getElementById("found").innerHTML = "Username does not exist";
        }

    });

    return false;
});

