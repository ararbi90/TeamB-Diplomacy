
const fs = require('fs');
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);


let file = "../ruleDiagramOrders.json";
let raw = fs.readFileSync(file);

let rule_diagram_orders = JSON.parse(raw);

// //console.log("full order object" + JSON.stringify(rule_diagram_orders,null,1));
// // do a for each over rule_diagram_orders to test all diagrams
let diagram_1 = rule_diagram_orders[0];
// console.log("diagram 1 object" + JSON.stringify(diagram_1,null,1));
// //keys [ 'submissions', 'actual', 'predicted', 'diagram' ]
// console.log(diagram_1.diagram)
// console.log(diagram_1.actual)
// console.log(diagram_1.predicted)
// console.log(diagram_1.submissions)


/* Cases we need to do:
1) No one moves just a hold
2) No one is in a terriotry and a players wants to move there
3) Two or more Players are trying to move into a territory and it is vacant
4) Two or more players are are moving to a location without someone present and one has greater support than the rest
5) Two or more Players are trying to move to a location without support and an other player is there
6) Two or more Players are trying to move to a location with one player having greatest support and an other player is there

*/

// {
//     UnitType: 'A',
//     CurrentZone: 'LON',
//     MoveType: 'H',
// }, {

    // {
    //     UnitType: 'A',
    //     CurrentZone: 'MOS',
    //     MoveType: 'S',
    //     InitalSupportZone: 'LVP',
    //     FinalSupportZone: 'LON'
    // }

let submissions = [{
    username: "a",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'S',
        InitalSupportZone: 'RUM',
        FinalSupportZone: 'MOS'

    }, {
        UnitType: 'A',
        CurrentZone: 'RUM',
        MoveType: 'M',
        MoveZone: 'MOS'
    }
    ]
},
{
    username: "b",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LVP',
        MoveType: 'M',
        MoveZone: 'MOS'
    }
    ]
},
{
    username: "c",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'SYR',
            MoveType: 'H'
        }]
}]
console.log(submissions);

function gamePoster(submission) {

    $.post("http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder", { submission }, function (res) {
        console.log(res);
    }).fail(function (err) {
        console.log(err);
    })
}
// $.post("http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder", { submission:submissions[2] }, function (res) {
//         console.log(res);
//     }).fail(function (err) {
//         console.log(err);
//     })
var counter = 100;
submissions.forEach(function (submission) {
    setTimeout(gamePoster, counter, submission);
    counter += counter;
})



