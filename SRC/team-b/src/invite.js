$ = require('jquery');

var urlParams = new URLSearchParams(location.search);
console.log(urlParams.get("username"));
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



$(document).ready(function () {
    $("#allUsers").submit(function (event) {
        var users = $(this).serializeArray();
        var game = $("#gameInfo").serializeArray();
        game.days = $("#days").val();
        game.hours = $("#hours").val();


        console.log(playerData);




        return false;
    })
});

// test = class {
//     constructor(){
//         this.text = "here";
//     }

//     static getText(){
//         return "here";
//     }
// }