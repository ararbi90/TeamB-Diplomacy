//tue 5/7 2:20-2:40
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
1) No one moves just a hold ----------------------------------------------------------------------------------------------------Done
2) No one is in a terriotry and a players wants to move there ------------------------------------------------------------------Done
3) Two or more Players are trying to move into a territory and it is vacant ----------------------------------------------------Done
4) Two or more players are are moving to a location without someone present and one has greater support than the rest ----------Done
5) Two or more Players are trying to move to a location without support and an other player is there----------------------------Done
6) Two or more Players are trying to move to a location with one player having greatest support and an other player is there----Done

*/


// everything is a hold works
let holds = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }, {
        UnitType: 'A',
        CurrentZone: 'RUM',
        MoveType: 'H',
    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LVP',
        MoveType: 'H'
    }
    ]
},
{
    username: "c",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'MOS',
            MoveType: 'H'
        }]
}]



//  one or more players are attepting to a vacat location --------------------works 
// a moves to mos  fail    correct  
// b moves to mos  fail    correct
// c holds in syr  pass
let submissions1 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'RUM',
        MoveType: 'M',
        MoveZone: 'MOS'
    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
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
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'SYR',
            MoveType: 'H'
        }]
}]

// CASE 2
// a hold lon             pass          correct
// a mov syr to eas       pass          not in pass/fail/retreat lists
// b mov lvp to mos       pass          correct
// c hold adr             pass          correct
let submissions2 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }, {
        UnitType: 'A',
        CurrentZone: 'SYR',
        MoveType: 'M',
        MoveZone: 'EAS'
    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
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
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'H'
        }]
}]

// CASE 4 WORKS 
// a: hold lon                     fail/retreat          
// b: move lvp - lon               pass
// b: sup  lvp - lon   from ion     
// c: mov  adr - lon               fail 
let submissions3 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LVP',
        MoveType: 'M',
        MoveZone: 'LON'
    },{
        UnitType: 'A',
        CurrentZone: 'ION',
        MoveType: 'S',
        InitialSupportZone: 'LVP',
        FinalSupportZone: 'LON'
    }
    ]
},
{
    username: "c",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]


// CASE 5
// P1 is holding with no support
// P2 and P3 are moving into where P1 is holding
// P1's hold should be accepted,
// P2/P3 should fail
let submissions4 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
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
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]



// CASE 6
// a's hold fails
// c's move fails
// b's move and support is accepted
let submissions5 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LVP',
        MoveType: 'M',
        MoveZone: 'LON'
    },
    {
        UnitType: 'A',
        CurrentZone: 'BOT',
        MoveType: 'S',
        InitialSupportZone:"LVP",
        FinalSupportZone:"LON"
    }
    ]
},
{
    username: "c",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]



// CASE 6
// a's hold fails
// c's move fails
// b's move and support is accepted
let submissions6 = [{
    username: "a",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LVP',
        MoveType: 'M',
        MoveZone: 'LON'
    },
    {
        UnitType: 'A',
        CurrentZone: 'BOT',
        MoveType: 'S',
        InitialSupportZone:"LVP",
        FinalSupportZone:"LON"
    }
    ]
},
{
    username: "c",
    gameId: "-LdjyWdw3whWtnBFrZul",
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]



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

// holds.forEach(function (submission) {
//     setTimeout(gamePoster, counter, submission);
//     counter += counter;
// })

<<<<<<< HEAD
=======

// holds
// submissions1 to 6

>>>>>>> michael
submissions2.forEach(function (submission) {
    setTimeout(gamePoster, counter, submission);
    counter += counter;
})