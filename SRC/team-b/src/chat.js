$ = require("jquery");

var tabs = []

function openTab(evt, tabName)
{
    // Get all elements with class="tabcontent" and hide them
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++)
    {
        tabcontent[i].hidden = true;
    }

    // Get all elements with class="tablinks" and remove the class "active"
    var tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++)
    {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    document.getElementById(tabName).hidden = false;

    tabs.push(tabName);
}

function createUserMessage(color)
{
    var node = document.createElement("LI");
    var textnode = document.createTextNode(document.getElementById("messageinput").value);
    node.appendChild(textnode);
    node.style.textAlign = "right";
    node.style.margin = 0;
    node.style.padding = 3;
    node.style.cssFloat = "right";
    node.style.display = "inline-block";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#E9E7EB";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";

    return node;
}

function createIncomingMessage(color)
{
    var node = document.createElement("LI");
    var textnode = document.createTextNode(document.getElementById("messageinput").value);
    node.appendChild(textnode);
    node.style.margin = 0;
    node.style.padding = 3;
    node.style.cssFloat = "left";
    node.style.display = "inline-block";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#E9E7EB";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";

    return node;
}

function sendMessage()
{
    node1 = createUserMessage("black");

    if (tabs[tabs.length - 1] === "France")
    {
        node2 = createIncomingMessage("cyan");
        document.getElementById("France").appendChild(node1);
        setTimeout(function (){document.getElementById("France").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "Russia")
    {
        node2 = createIncomingMessage("white");
        document.getElementById("Russia").appendChild(node1);
        setTimeout(function (){document.getElementById("Russia").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "Austria-Hungary")
    {
        node2 = createIncomingMessage("red");
        document.getElementById("Austria-Hungary").appendChild(node1);
        setTimeout(function (){document.getElementById("Austria-Hungary").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "England")
    {
        node2 = createIncomingMessage("blue");
        document.getElementById("England").appendChild(node1);
        setTimeout(function (){document.getElementById("England").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "Turkey")
    {
        node2 = createIncomingMessage("yellow");
        document.getElementById("Turkey").appendChild(node1);
        setTimeout(function (){document.getElementById("Turkey").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "Germany")
    {
        node2 = createIncomingMessage("#797280");
        document.getElementById("Germany").appendChild(node1);
        setTimeout(function (){document.getElementById("Germany").appendChild(node2)}, 5000);
    }
    else if (tabs[tabs.length - 1] === "Italy")
    {
        node2 = createIncomingMessage("green");
        document.getElementById("Italy").appendChild(node1);
        setTimeout(function (){document.getElementById("Italy").appendChild(node2)}, 5000);
    }
    else
    {
        node2 = createIncomingMessage("orange");
        document.getElementById("Main").appendChild(node1);
        setTimeout(function (){document.getElementById("Main").appendChild(node2)}, 5000);
    }
    $('#messageinput').val("")
}