$ = require("jquery");

// Create chats if not already

var urlParams = new URLSearchParams(location.search);
let gameID = urlParams.get("gameID");

var tabs = [];
let chatCount = 0;

function openTab(evt, id, tabName)
{
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

// Main diff: float right
function createUserMessage(node, color)
{
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

// Main diff: float left
function createIncomingMessage(node, color)
{
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

// Tab content IDs mapped to their corresponding tablink IDs
var tablinkIDs = new Map([
    ["France", "2"], ["Austria-Hungary", "3"], ["Russia", "4"],
    ["England", "5"], ["Turkey", "6"], ["Germany", "7"], ["Italy", "8"]
])

// Countries mapped to their corresponding message colors
var messageColors = new Map([
    ["France", "#8FD8D8"], ["Austria-Hungary", "#F48182"], ["Russia", "white"],
    ["England", "#4888C8"], ["Turkey", "#D9D739"], ["Germany", "#7A7A7A"], ["Italy", "#76B47C"]
])

// Countries mapped to every other country and the key that results from this pair
var countryKeys = new Map([
    ["France", [
        ["Austria-Hungary", "FRA_AUS"],
        ["Russia", "FRA_RUS"],
        ["England", "FRA_ENG"],
        ["Turkey", "FRA_TUR"],
        ["Germany", "FRA_GER"],
        ["Italy", "FRA_ITA"]]
    ],
    ["Austria-Hungary", [
        ["France", "FRA_AUS"],
        ["Russia", "AUS_RUS"],
        ["England", "AUS_ENG"],
        ["Turkey", "AUS_TUR"],
        ["Germany", "AUS_GER"],
        ["Italy", "AUS_ITA"]]
    ],
    ["Russia", [
        ["France", "FRA_RUS"],
        ["Austria-Hungary", "AUS_RUS"],
        ["England", "RUS_ENG"],
        ["Turkey", "RUS_TUR"],
        ["Germany", "RUS_GER"],
        ["Italy", "RUS_ITA"]]
    ],
    ["England", [
        ["France", "FRA_ENG"],
        ["Austria-Hungary", "AUS_ENG"],
        ["Russia", "RUS_ENG"],
        ["Turkey", "ENG_TUR"],
        ["Germany", "ENG_GER"],
        ["Italy", "ENG_ITA"]]
    ],
    ["Turkey", [
        ["France", "FRA_TUR"],
        ["Austria-Hungary", "AUS_TUR"],
        ["Russia", "RUS_TUR"],
        ["England", "ENG_TUR"],
        ["Germany", "TUR_GER"],
        ["Italy", "TUR_ITA"]]
    ],
    ["Germany", [
        ["France", "FRA_GER"],
        ["Austria-Hungary", "AUS_GER"],
        ["Russia", "RUS_GER"],
        ["England", "ENG_GER"],
        ["Turkey", "TUR_GER"],
        ["Italy", "GER_ITA"]]
    ],
    ["Italy", [
        ["France", "FRA_ITA"],
        ["Austria-Hungary", "AUS_ITA"],
        ["Russia", "RUS_ITA"],
        ["England", "ENG_ITA"],
        ["Turkey", "TUR_ITA"],
        ["Germany", "GER_ITA"]]
    ]
])

var uniqueCountryKeys = [
    "FRA_AUS", "FRA_RUS", "FRA_ENG", "FRA_TUR", "FRA_GER", "FRA_ITA",
    "AUS_RUS", "AUS_ENG", "AUS_TUR", "AUS_GER", "AUS_ITA",
    "RUS_ENG", "RUS_TUR", "RUS_GER", "RUS_ITA",
    "ENG_TUR", "ENG_GER", "ENG_ITA",
    "TUR_GER", "TUR_ITA",
    "GER_ITA"
]

function sendMessage() {
    // Don't send empty message
    if (!document.getElementById("messageinput").value.trim())
    {
        return;
    }

    message = createValidMessage(document.getElementById("messageinput").value);

    if (tabs[tabs.length - 1] === "Main")
    {
        // Log chat in DB
        publicChatRef.child(gameID).push({
            message: message,
            username : username
        });
    }
    else
    {
        var country1 = tabs[tabs.length - 1]; // Opposing player's country
        var country2 = "";

        gameRef.child(gameID).child("players").on("child_added", function (snapshot)
        {
            // Find the current user's country
            if (snapshot.val().username === username)
            {
                country2 = snapshot.val().country;

                // Get the chat key
                var privateChatKey = "";

                for (var i = 0; i < countryKeys.get(country1).length; ++i)
                {
                    if (countryKeys.get(country1)[i][0] === country2)
                    {
                        privateChatKey = countryKeys.get(country1)[i][1];
                    }
                }

                // Log chat in DB
                privateChatRef.child(gameID).child(privateChatKey).push({
                    message: message,
                    username: username,
                    country1: country1,
                    country2: country2
                })
            }
        })
        
    }

    // Empty message input box
    $('#messageinput').val("");
}

$("#messageinput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#subitMSG").click();
    }
});

// Public Chat
publicChatRef.child(gameID).on("child_added", function (snapshot)
{
    // Get every public message and its sender
    let messageContent = snapshot.val().message;
    let messageSender = snapshot.val().username;

    // Get every player in the game.
    gameRef.child(gameID).child("players").on("child_added", function (snapshot)
    {
        // Continue if the player was the sender.
        if (snapshot.val().username === messageSender)
        {
            if (messageSender === username)
            {
                // If the sender is the user, create a user message.
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
                // If the sender is not the user, create an incoming message.
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

// Private Chat tablinks
gameRef.child(gameID).child("players").on("child_added", function (snapshot)
{
    // Loop through players and countries
    // If the country is not the user we need a tablink
    if (snapshot.val().username != username)
    {
        var tablink = document.getElementById(tablinkIDs.get(snapshot.val().country));

        // Unhide if it is hidden
        if (tablink.hidden)
        {
            tablink.hidden = false;
        }
    }
})

// Private chat messages
for (var i = 0; i < uniqueCountryKeys.length; ++i)
{
    var key = uniqueCountryKeys[i];

    privateChatRef.child(gameID).child(key).on("child_added", function (snapshot)
    {
        // Get every public message and its sender
        let messageContent = snapshot.val().message;
        let messageSender = snapshot.val().username;
        let country1 = snapshot.val().country1;
        let country2 = snapshot.val().country2;
        // console.log(messageContent);
        // console.log(messageSender);
        // console.log(country1);
        // console.log(country2);
        // console.log("\n");

        // Get every player in the game (for user's country).
        gameRef.child(gameID).child("players").on("child_added", function (snapshot)
        {
            let p = snapshot.val().username;
            let pc = snapshot.val().country;

            if (p === username)
            {
                let userCountry = pc; // User's country

                // Continue if user was involved in the message
                if (userCountry === country1 || userCountry === country2)
                {
                    // Get every player in the game
                    gameRef.child(gameID).child("players").on("child_added", function (snapshot)
                    {
                        let player = snapshot.val().username;
                        let playerCountry = snapshot.val().country;

                        // Continue if the player was the sender.
                        if (player === messageSender)
                        {
                            var node = document.createElement("LI");
                            node.id = "chat-" + chatCount;
                            var textnode = document.createTextNode(messageContent);
                            node.appendChild(textnode);

                            var tablink = "";

                            if (country1 === userCountry)
                            {
                                tablink = country2;
                            }
                            else
                            {
                                tablink = country1;
                            }

                            if (messageSender === username)
                            {
                                // If the sender is the user, create a user message.
                                createUserMessage(node, messageColors.get(playerCountry));
                                document.getElementById(tablink).appendChild(node);
                        
                                // Auto scroll
                                var objDiv = document.getElementById(tablink);
                                objDiv.scrollTop = objDiv.scrollHeight;
                            }
                            else
                            {
                                // If the sender is not the user, create an incoming message.
                                createIncomingMessage(node, messageColors.get(snapshot.val().country));
                                document.getElementById(tablink).appendChild(node);
                        
                                // Auto scroll
                                var objDiv = document.getElementById(tablink);
                                objDiv.scrollTop = objDiv.scrollHeight;
                            }
                        }
                    })
                }  
            }
        })
    })
}
