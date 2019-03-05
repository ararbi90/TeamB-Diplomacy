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

global.db = db;

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


document.getElementById("createNew").addEventListener("click", function () {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
});

document.getElementById("backSign").addEventListener("click", function () {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
});

$("#register-form").submit(function (event) {
    var data = $(this).serializeArray();
    var password = data[1]["value"];
    var passwordRe = data[2]["value"];
    if (password != passwordRe) {
        document.getElementById("passwordDo").innerHTML = "Passwords dont match";
    } else {
        let ref = firebase.database().ref("player");
        var name;
        var usernameIn = data[0]["value"];
        var passwordIn = data[1]["value"];
        var gameIn = "";
        var invitationIn = "";
        ref.once("value").then(function (data) {
            if (data.child(usernameIn).val() == null) {
                console.log("Created");
                document.getElementById("passwordDo").innerHTML = "Created";
                ref.child(usernameIn).set({
                    username: usernameIn,
                    password: passwordIn,
                    game: gameIn,
                    invitation: invitationIn
                });
            } else {
                document.getElementById("passwordDo").innerHTML = "User name already exists";
                console.log("Not created");
            }
        })
    }

    return false;
});


$("#login-form").submit(function (event) {
    var data = $(this).serializeArray();
    console.log(data);
    var usernameIn = data[0]["value"];
    var passwordIn = data[1]["value"];
    var userID;

    let ref = firebase.database().ref("player");
    let found = false;
    ref.once("value").then(function (data) {

        if (data.child(usernameIn).val() != null) {
            if (data.child(usernameIn).val().password == passwordIn) {
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

function setCookie(cookieName, cookieValue, maxDays) {
    var date = new Date();
    date.setTime(date.getTime() + (maxDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + "; " + expires + ";domain=;path=/";
}


function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split('; ');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == '  ')
            c = c.substring(1);
        console.log("here");
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }

    return "";
}

function deleteCookies() {
    // create a list of all the cookies
    var cookies = document.cookie.split("; ");

    // loop through each cookie
    for (var c = 0; c < cookies.length; c++) {
        var d = window.location.hostname.split(".");
        while (d.length > 0) {
            var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" + d.join(".") + " ;path";
            var p = location.pathname.split("/");
            document.cookie = cookieBase + "/";
            while (p.length > 0) {
                document.cookie = cookieBase + p.join("/");
                p.pop()
            };
            d.shift();
        }
    }
}