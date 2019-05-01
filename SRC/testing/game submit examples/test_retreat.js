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

let testGameId = "-LdjyWdw3whWtnBFrZul";

let retreatOrder_test_0 = [
    {
        username: "a",
        gameId: testGameId,
        orders: [
            {
                UnitType: 'A',
                CurrentZone: 'MOS',
                MoveType: 'H',
                Retreat: 'false'
            },
            {
                UnitType: 'A',
                CurrentZone: 'MOS',
                MoveType: 'M',
                MoveZone: 'BLA',
                Retreat:'true'
            }]
        },
        {
            username: "b",
            gameId: testGameId,
            orders: [
                {
                    UnitType: 'A',
                    CurrentZone: 'MOS',
                    MoveType: 'H',
                    Retreat: 'false'
                },
                {
                    UnitType: 'A',
                    CurrentZone: 'MOS',
                    MoveType: 'M',
                    MoveZone: 'BLA',
                    Retreat:'true'
                }]
            },
    {
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'MOS',
            MoveType: 'H',
            Retreat: 'false'
        },
        {
            UnitType: 'A',
            CurrentZone: 'MOS',
            MoveType: 'M',
            MoveZone: 'BLA',
            Retreat:'true'
        }]
    }
]


// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************
//
//                                           PHASE INTEGRATION TESTING                 
//                 Below are the test cases that will be used for testing all the phases working together
//
// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************

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