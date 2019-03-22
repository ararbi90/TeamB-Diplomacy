$ = require("jquery");

var tabs = []
let chatCount = 0;

function openTab(evt, tabName) {
    // Get all elements with class="tabcontent" and hide them
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].hidden = true;
    }

    // Get all elements with class="tablinks" and remove the class "active"
    var tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    document.getElementById(tabName).hidden = false;

    tabs.push(tabName);
}

function createUserMessage(color) {
    var node = document.createElement("LI");
    node.id = "chat-" + chatCount;
    var textnode = document.createTextNode(document.getElementById("messageinput").value);
    node.appendChild(textnode);
    node.style.textAlign = "left";
    node.style.padding = "3px";
    node.style.margin = "0 0 5px 0";
    node.style.cssFloat = "right";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#F3F3F3";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";
    chatCount++;

    return node;
}

function createIncomingMessage(color) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(document.getElementById("messageinput").value);
    node.appendChild(textnode);
    node.style.textAlign = "left";
    node.style.padding = "3px";
    node.style.margin = "0 0 5px 0";
    node.style.cssFloat = "left";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#F3F3F3";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";

    return node;
}

function sendMessage() {
    if (document.getElementById("messageinput").value === "")
    {
        return;
    }

    node1 = createUserMessage("black");

    if (tabs[tabs.length - 1] === "France") {
        node2 = createIncomingMessage("#8FD8D8");
        document.getElementById("France").appendChild(node1);
        setTimeout(function () {
            document.getElementById("France").appendChild(node2);
            var objDiv = document.getElementById("France");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("France");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "Russia") {
        node2 = createIncomingMessage("white");
        document.getElementById("Russia").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Russia").appendChild(node2);
            var objDiv = document.getElementById("Russia");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Russia");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "Austria-Hungary") {
        node2 = createIncomingMessage("#F48182");
        document.getElementById("Austria-Hungary").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Austria-Hungary").appendChild(node2)
            var objDiv = document.getElementById("Austria-Hungary");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Austria-Hungary");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "England") {
        node2 = createIncomingMessage("#4888C8");
        document.getElementById("England").appendChild(node1);
        setTimeout(function () {
            document.getElementById("England").appendChild(node2);
            var objDiv = document.getElementById("England");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("England");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "Turkey") {
        node2 = createIncomingMessage("#D9D739");
        document.getElementById("Turkey").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Turkey").appendChild(node2);
            var objDiv = document.getElementById("Turkey");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Turkey");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "Germany") {
        node2 = createIncomingMessage("#989898");
        document.getElementById("Germany").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Germany").appendChild(node2);
            var objDiv = document.getElementById("Germany");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Germany");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else if (tabs[tabs.length - 1] === "Italy") {
        node2 = createIncomingMessage("#76B47C");
        document.getElementById("Italy").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Italy").appendChild(node2);
            var objDiv = document.getElementById("Italy");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Italy");
        objDiv.scrollTop = objDiv.scrollHeight;
    } 
    else {
        node2 = createIncomingMessage("darkred");
        document.getElementById("Main").appendChild(node1);
        setTimeout(function () {
            document.getElementById("Main").appendChild(node2);
            var objDiv = document.getElementById("Main");
            objDiv.scrollTop = objDiv.scrollHeight;
        }, 2000);
        var objDiv = document.getElementById("Main");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
    $('#messageinput').val("");
}

$("#messageinput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#subitMSG").click();
    }
});