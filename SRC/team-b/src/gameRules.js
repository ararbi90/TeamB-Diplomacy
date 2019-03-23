$ = require('jquery');
// Username information from the link
var urlParams = new URLSearchParams(location.search);
let username = urlParams.get("username");
document.getElementById("navbarDropdownMenuLink").innerHTML = username;

// Dashboard changes
document.getElementById("Dashboard").addEventListener("click", function () {
    let link = "dashboard.html?username=" + username;
    window.location.href = link;
});
document.getElementById("logOut").addEventListener("click", function () {
    let link = "index.html";
    window.location.href = link;
});

