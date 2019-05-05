// SOURCE CODE CORRESPONDING TO: rules.html 

$ = require('jquery');

// Username information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

// Navbar redirections
document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "../html/dashboard.html?username=" + username;
    window.location.href = link;
});
document.getElementById("logOut").addEventListener("click", function () {
    let link = "../html/index.html";
    window.location.href = link;
});

