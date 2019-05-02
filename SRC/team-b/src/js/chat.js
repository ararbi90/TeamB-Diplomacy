$ = require("jquery");

// Create chats if not already

var urlParams = new URLSearchParams(location.search);
let gameID = urlParams.get("gameID");

var tabs = [];
let chatCount = 0;

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

    // Auto scroll
    var objDiv = document.getElementById(tabName);
    objDiv.scrollTop = objDiv.scrollHeight;

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

        if (character === " " || character === "\n" || character === "\t")
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

// Countries mapped to their corresponding message colors
var messageColors = new Map([
    ["France", "#82cacf"], ["Austria-Hungary", "#6c74d5"], ["Russia", "#db878b"],
    ["England", "#327AB5"], ["Turkey", "#d5cd6c"], ["Germany", "#969696"], ["Italy", "#71b188"]
])

// Style the message
function styleMessage(node, country)
{
    var countries = country.split("_");

    node.style.textAlign = "left";
    node.style.padding = "3px";
    node.style.margin = "0 0 5px 0";
    node.style.borderRadius = "5px";
    node.style.listStyleType = "none";
    node.style.backgroundColor = "#EAEAEA";
    node.style.color = "black";
    node.style.clear = "both";
    node.style.wordWrap = "break-word";
    node.style.maxWidth = "66%";

    // Color
    if (countries.length == 1)
    {
        node.style.borderBottom = "6px solid " + messageColors.get(countries[0]);
    }
    else if (countries.length == 2)
    {
        node.style.borderTop = "6px solid " + messageColors.get(countries[0]);
        node.style.borderBottom = "6px solid " + messageColors.get(countries[1]);
    }
    else if (countries.length == 3)
    {
        node.style.borderTop = "6px solid " + messageColors.get(countries[0]);
        node.style.borderBottom = "6px solid " + messageColors.get(countries[1]);
        node.style.borderLeft = "6px solid " + messageColors.get(countries[2]);
        node.style.borderRight = "6px solid " + messageColors.get(countries[2]);
    }

    chatCount++;
}

// Tab content IDs mapped to their corresponding tablink IDs
var tablinkIDs = new Map([
    ["France", "2"], ["Austria-Hungary", "3"], ["Russia", "4"],
    ["England", "5"], ["Turkey", "6"], ["Germany", "7"], ["Italy", "8"],
    ["Austria-Hungary_France", "9"], ["Turkey_Germany", "10"],
    ["Russia_Italy", "11"], ["Austria-Hungary_England_Germany", "12"],
    ["Turkey_France", "13"], ["Austria-Hungary_Turkey_Germany", "14"],
    ["England_France_Russia", "15"]
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
        ["Italy", "ENG_ITA"],
        ["Austria-Hungary_France", "AHF_ENG"],
        ["Turkey_Germany", "TGE_ENG"],
        ["Russia_Italy", "RUI_ENG"]]
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
    ],
    ["Austria-Hungary_France", [
        ["England", "AHF_ENG"],
        ["Turkey_Germany", "AHF_TGE"],
        ["Russia_Italy", "AHF_RUI"]]
    ],
    ["Turkey_Germany", [
        ["Austria-Hungary_France", "AHF_TGE"],
        ["England", "TGE_ENG"],
        ["Russia_Italy", "TGE_RUI"]]
    ],
    ["Russia_Italy", [
        ["Austria-Hungary_France", "AHF_RUI"],
        ["England", "RUI_ENG"],
        ["Turkey_Germany", "TGE_RUI"],
        ["Austria-Hungary_England_Germany", "AEG_RUI"],
        ["Turkey_France", "TUF_RUI"]]
    ],
    ["Austria-Hungary_England_Germany", [
        ["Turkey_France", "AEG_TUF"],
        ["Russia_Italy", "AEG_RUI"]]
    ],
    ["Turkey_France", [
        ["Austria-Hungary_England_Germany", "AEG_TUF"],
        ["Russia_Italy", "TUF_RUI"]]
    ],
    ["Austria-Hungary_Turkey_Germany", [
        ["England_France_Russia", "ATG_EFR"]]
    ],
    ["England_France_Russia", [
        ["Austria-Hungary_Turkey_Germany", "ATG_EFR"]]
    ]
])

var uniqueCountryKeys = [
    "FRA_AUS", "FRA_RUS", "FRA_ENG", "FRA_TUR", "FRA_GER", "FRA_ITA",
    "AUS_RUS", "AUS_ENG", "AUS_TUR", "AUS_GER", "AUS_ITA",
    "RUS_ENG", "RUS_TUR", "RUS_GER", "RUS_ITA",
    "ENG_TUR", "ENG_GER", "ENG_ITA",
    "TUR_GER", "TUR_ITA",
    "GER_ITA",
    "AHF_ENG", "AHF_TGE", "AHF_RUI", "TGE_ENG", "TGE_RUI", "RUI_ENG",
    "AEG_TUF", "AEG_RUI", "TUF_RUI",
    "ATG_EFR"
]

function sendMessage()
{
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
            username: username
        });
    }
    else
    {
        var country1 = tabs[tabs.length - 1]; // Opposing player's country
        var country2 = "";

        gameRef.child(gameID).child("players").on("child_added", function (snapshot)
        {
            // Find the current user's country
            if (snapshot.key === username)
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

$("#messageinput").keyup(function (event)
{
    if (event.keyCode === 13)
    {
        $("#subitMSG").click();
    }
});

// Public Chat
gameRef.child(gameID).child("players").once("value").then(function (snap)
{
    let players = {};
    snap.forEach(element => {
        players[element.key] = element.val();
    });

    publicChatRef.child(gameID).on("child_added", function (snapshot)
    {
        // Get every public message and its sender
        let messageContent = snapshot.val().message;
        let messageSender = snapshot.val().username;

        var node = document.createElement("LI");
        node.id = "chat-" + chatCount;
        var textnode = document.createTextNode(messageContent);
        node.appendChild(textnode);

        if (messageSender === username)
        {
            // If the sender is the user, float the message right.
            node.style.cssFloat = "right";
        }
        else
        {
            // If the sender is not the user, float the message left.
            node.style.cssFloat = "left";
        }

        // Style message and append
        styleMessage(node, players[messageSender].country);
        document.getElementById("Main").appendChild(node);

        // Auto scroll
        var objDiv = document.getElementById("Main");
        objDiv.scrollTop = objDiv.scrollHeight;
    })
})

// Private Chat tablinks
gameRef.child(gameID).child("players").on("child_added", function (snapshot)
{
    // Loop through players and countries
    // If the country is not the user we need a tablink
    if (snapshot.key != username)
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
gameRef.child(gameID).child("players").once("value").then(function (snap)
{
    let players = {};
    snap.forEach(element => {
        players[element.key] = element.val();
    });

    let usernames = [];
    for (var u in players)
    {
        usernames.push(u);
    }

    let userCountry = players[username].country;

    for (var i = 0; i < uniqueCountryKeys.length; ++i)
    {
        var key = uniqueCountryKeys[i];

        privateChatRef.child(gameID).child(key).on("child_added", function (snapshot)
        {
            // Get every private message, its sender, and the countries involved
            let messageContent = snapshot.val().message;
            let messageSender = snapshot.val().username;
            let country1 = snapshot.val().country1;
            let country2 = snapshot.val().country2;

            // Continue if user was involved in the message
            if (userCountry === country1 || userCountry === country2)
            {
                // Get every player in the game
                for (var j = 0; j < usernames.length; j++)
                {
                    let player = usernames[j];
                    let playerCountry = players[player].country;

                    // Continue if the player was the sender.
                    if (player === messageSender)
                    {
                        var node = document.createElement("LI");
                        node.id = "chat-" + chatCount;
                        var textnode = document.createTextNode(messageContent);
                        node.appendChild(textnode);

                        var tablink = ""; // Opposing player's country ... where we need to append

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
                            // If the sender is the user, float the message right.
                            node.style.cssFloat = "right";
                        }
                        else
                        {
                            // If the sender is not the user, float the message left.
                            node.style.cssFloat = "left";
                        }

                        // Style message and append
                        styleMessage(node, playerCountry);
                        document.getElementById(tablink).appendChild(node);

                        // Auto scroll
                        var objDiv = document.getElementById(tablink);
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }
                }
            }
        })
    }
})