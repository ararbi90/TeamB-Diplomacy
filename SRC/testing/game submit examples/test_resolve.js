
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






let submissions = [{
    username: "a",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H',
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
        MoveZone: 'LON'
    }
    ]
},
{
    username: "c",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'MOS',
            MoveType: 'S',
            InitalSupportZone: 'LVP',
            FinalSupportZone: 'LON'
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



