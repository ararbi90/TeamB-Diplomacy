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

let testGameId = "-LdptNNGiYdaQIgFRY3t";


// Retreat fails for a because nwy is occupied     correct
let retreatOrder_test_0 = [
    {
        username: "a",
        gameId: testGameId,
        orders: [
            {
                UnitType: 'A',
                CurrentZone: 'BER',
                MoveType: 'M',
                MoveZone: 'NWY',
                Retreat:'true'
            }]
        },
        {
            username: "b",
            gameId: testGameId,
            orders: [
                {
                    UnitType: 'A',
                    CurrentZone: 'BER',
                    MoveType: 'H',
                    Retreat: 'false'
                },
                {
                    UnitType: 'A',
                    CurrentZone: 'ROM',
                    MoveType: 'H',
                    Retreat:'false'
                }]
            },
    {
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'NWY',
            MoveType: 'H',
            Retreat: 'false'
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


// Retreat passes for a because nth is not occupied     correct
let retreatOrder_test_0 = [
    {
        username: "a",
        gameId: testGameId,
        orders: [
            {
                UnitType: 'A',
                CurrentZone: 'BER',
                MoveType: 'M',
                MoveZone: 'NTH',
                Retreat:'true'
            }]
        },
        {
            username: "b",
            gameId: testGameId,
            orders: [
                {
                    UnitType: 'A',
                    CurrentZone: 'BER',
                    MoveType: 'H',
                    Retreat: 'false'
                },
                {
                    UnitType: 'A',
                    CurrentZone: 'ROM',
                    MoveType: 'H',
                    Retreat:'false'
                }]
            },
    {
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'NWY',
            MoveType: 'H',
            Retreat: 'false'
        }]
    }
]



function retreatSubmit(submission) {

    let url = "http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitretreatorder";
    //http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder
    $.post(url, { submission }, function (res) {
        console.log(res);
    }).fail(function (err) {
        console.log(err);
    })
}


var counter  = 100;
retreatOrder_test_0.forEach(function (submission) {
    setTimeout(retreatSubmit, counter, submission);
    counter += counter;
})