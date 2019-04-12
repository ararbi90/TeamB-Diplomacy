$ = require('jquery');
//var msg = require('add.js');

//console.log(msg);
// Username information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

// Dashboard changes
document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "../html/dashboard.html?username=" + username;
    window.location.href = link;
});
document.getElementById("logOut").addEventListener("click", function () {
    let link = "../html/index.html";
    window.location.href = link;
});

