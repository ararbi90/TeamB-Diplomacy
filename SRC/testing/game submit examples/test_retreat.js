var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);




/* Cases we need to do:
1)  ---------------------------------------------------------------------------------------------
2) 
*/


// everything is a hold     - works
// All orders in pass list 
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




function retreatSubmit(submission) {

    let url = "";
    //http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder
    $.post(url, { submission }, function (res) {
        console.log(res);
    }).fail(function (err) {
        console.log(err);
    })
}



holds.forEach(function (submission) {
    setTimeout(retreatSubmit, counter, submission);
    counter += counter;
})