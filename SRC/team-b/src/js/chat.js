$ = require("jquery");

// Create chats if not already

var urlParams = new URLSearchParams(location.search);
let gameID = urlParams.get("gameID");

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

// Handles message overflow
function createValidMessage(input)
{
    var result = "";
    count = 0;

    for (var i = 0; i < input.length; i++)
    {
        var character = input.charAt(i);

        if (count > 30)
        {
            count = 0;
            result += "\n";
            result += character;
        }

        if (character === " " || character === "\n"|| character === "\t")
        {
            count = 0;
            result += character;
        }
        else
        {
            count++;
            result += character;
        }
    }

    return result;
}

function createUserMessage(node, color) {
    node.style.textAlign = "left";
    node.style.padding = "3px";
    node.style.margin = "0 0 5px 0";
    node.style.cssFloat = "right";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#EAEAEA";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";
    chatCount++;
}

function createIncomingMessage(node, color) {
    node.style.textAlign = "left";
    node.style.padding = "3px";
    node.style.margin = "0 0 5px 0";
    node.style.cssFloat = "left";
    node.style.borderBottom = "8px solid " + color
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#EAEAEA";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";
}

function sendMessage() {
    // Don't send empty message
    if (!document.getElementById("messageinput").value.trim())
    {
        return;
    }

    message = createValidMessage(document.getElementById("messageinput").value);

    publicChatRef.child(gameID).push({
        message: message,
        username : username
    });

    $('#messageinput').val("");
}

$("#messageinput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#subitMSG").click();
    }
});

var messageColors = new Map([
    ["France", "#8FD8D8"], ["Russia", "white"], ["Austria-Hungary", "#F48182"],
    ["England", "#4888C8"], ["Turkey", "#D9D739"], ["Germany", "#7A7A7A"], ["Italy", "#76B47C"]
])

gameRef.child(gameID).child("players").on("child_added", function (snapshot)
{
    console.log(snapshot.val());
})

publicChatRef.child(gameID).on("child_added", function (snapshot) {
    //console.log(snapshot.val().message);

    let messageContent = snapshot.val().message;
    let messageSender = snapshot.val().username;

    gameRef.child(gameID).child("players").on("child_added", function (snapshot)
    {
        if (snapshot.val().username === messageSender)
        {
            if (messageSender === username)
            {
                var node = document.createElement("LI");
                node.id = "chat-" + chatCount;
                var textnode = document.createTextNode(messageContent);
                node.appendChild(textnode);
                createUserMessage(node, messageColors.get(snapshot.val().country));
                document.getElementById("Main").appendChild(node);
        
                // Auto scroll
                var objDiv = document.getElementById("Main");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
            else
            {
                var node = document.createElement("LI");
                node.id = "chat-" + chatCount;
                var textnode = document.createTextNode(messageContent);
                node.appendChild(textnode);
                createIncomingMessage(node, messageColors.get(snapshot.val().country));
                document.getElementById("Main").appendChild(node);
        
                // Auto scroll
                var objDiv = document.getElementById("Main");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        }
    })
});