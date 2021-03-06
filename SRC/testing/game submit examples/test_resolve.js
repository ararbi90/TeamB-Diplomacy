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
7) Two players are moving into a location that is holding and has support for the hold----------done
*/


let testGameId = "-LdptNNGiYdaQIgFRY3t";

// everything is a hold     - works
// All orders in pass list 
let holds = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'BER',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'BUL',
        MoveType: 'H'
    }
    ]
},
{
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'TRI',
            MoveType: 'H'
        }]
}]



//  one or more players are attepting to a vacat location --------------------works 
// a moves to mos  fail    correct  
// b moves to mos  fail    correct
// c holds in syr  pass    correct
let submissions1 = [{
    username: "a",
    gameId: testGameId,
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
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'SYR',
            MoveType: 'H'
        }]
}]

// CASE 2
// a hold lon             pass          correct
// a mov syr to eas       pass          correct
// b mov lvp to mos       pass          correct
// c hold adr             pass          correct
let submissions2 = [{
    username: "a",
    gameId: testGameId,
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
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'H'
        }]
}]

// CASE 4 WORKS 
// a: hold lon                     fail/retreat      correct           
// b: move lvp - lon               pass              correct
// b: sup  lvp - lon   from ion    pass              correct
// c: mov  adr - lon               fail              correct
let submissions4 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]


// CASE 5
// a: hold lon           pass          correct          
// b: move lvp to lon    fail          correct
// c: move adr to lon    fail          correct
let submissions5 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]



// CASE 6
// a: hold lon                       fail/retreat        correct
// b: move lvp lon                   pass                correct
// b: support lvp to lon from bot    pass                correct
// c: move adr to lon                fail                correct
let submissions6 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    }
    ]
},
{
    username: "b",
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]



// CASE 7
// a: hold lon                        pass              correct                        
// a: IRI support lon                 pass              correct
// a: MID support lon                 pass              correct
// b: move lvp lon                    fail              correct
// b: support lvp to lon from bot     fail              in pass list 
// c: move adr to lon                 fail              correct
let submissions7 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'H'

    },
    {
        UnitType: 'A',
        CurrentZone: 'IRI',
        MoveType: 'S',
        InitialSupportZone:"LON",
        FinalSupportZone:"LON"
    },
    {
        UnitType: 'A',
        CurrentZone: 'MID',
        MoveType: 'S',
        InitialSupportZone:"LON",
        FinalSupportZone:"LON"
    }
    ]
},
{
    username: "b",
    gameId: testGameId,
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
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'LON'
        }]
}]


// CASE 8
// a: move lon nwy                 pass                                      
// a: iri convoy lon nwy              pass                      
// b: move lvp lon                 pass                            
// c: hold adr                     fail              
let submissions8 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'M',
        MoveZone: 'NWY'

    },
    {
        UnitType: 'F',
        CurrentZone: 'IRI',
        MoveType: 'C',
        InitialConvoyZone:"LON",
        FinalConvoyZone:"NWY"
    }
    ]
},
{
    username: "b",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'BOT',
        MoveType: 'S',
        InitialSupportZone:"LON",
        FinalSupportZone:"NWY"
    }
    ]
},
{
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'ADR',
            MoveType: 'M',
            MoveZone: 'NWY'
        }]
}]






// -LdptNNGiYdaQIgFRY3t
/* Player a:
      "territories" : {
        "BER" : {
          "forceType" : "A"
        },
        "BUD" : {
          "forceType" : "A"
        },
        "EDI" : {
          "forceType" : "F"
        },
        "KIE" : {
          "forceType" : "F"
        },
        "LON" : {
          "forceType" : "F"
        },
        "LVP" : {
          "forceType" : "A"
        },
        "MUN" : {
          "forceType" : "A"
        },
        "TRI" : {
          "forceType" : "F"
        },
        "VIE" : {
          "forceType" : "A"
        }
      }
    },

    BER  
    LVP
    MUN
*/


/* Player b:
"territories" : {
        "MOS" : {
          "forceType" : "A"
        },
        "NAP" : {
          "forceType" : "F"
        },
        "ROM" : {
          "forceType" : "A"
        },
        "SEV" : {
          "forceType" : "F"
        },
        "STP" : {
          "forceType" : "F"
        },
        "VEN" : {
          "forceType" : "A"
        },
        "WAR" : {
          "forceType" : "A"
        }

        MOS
        ROM
        VEN
*/

/* Player c:
   "territories" : {
        "ANK" : {
          "forceType" : "F"
        },
        "BRE" : {
          "forceType" : "F"
        },
        "CON" : {
          "forceType" : "A"
        },
        "MAR" : {
          "forceType" : "A"
        },
        "PAR" : {
          "forceType" : "A"
        },
        "SMY" : {
          "forceType" : "A"
        }

        CON
        MAR
        SMY

*/


// a:   BER  LVP  MUN
// b:   MOS  ROM  VEN
// c:   CON  MAR  SMY
//                                    
// a: is holding in BER                --fail/retreat retreat fails 
// b: attacks a in BER with support    --pass         
// c: con move nwy                     --pass
let moveOrder_test_1 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'BER',
        MoveType: 'H',

    }
    ]
},
{
    username: "b",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'MOS',
        MoveType: 'M',
        MoveZone:"BER",
    },
    {
        UnitType: 'A',
        CurrentZone: 'ROM',
        MoveType: 'S',
        InitialSupportZone:"MOS",
        FinalSupportZone:"BER",
    }
    ]
},
{
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'CON',
            MoveType: 'M',
            MoveZone: 'NWY'
        }]
}]



// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************
//
//                                           PHASE INTEGRATION TESTING                 
//                 Below are the test cases that will be used for testing all the phases working together
//
//          All tests use 3 players: a,b,c with territories shown above. -LdptNNGiYdaQIgFRY3t
// ******************************************************************************************************************
// ******************************************************************************************************************
// ******************************************************************************************************************


// a:   BER  LVP  MUN
// b:   MOS  ROM  VEN
// c:   CON  MAR  SMY
//                                    
// a: BER move NWY                   --fail/retreat
// b: MOS move NWY                   --fail         
// c: CON move BER with support      --pass
let moveOrder_test_2 = [{
    username: "a",
    gameId: testGameId,
    orders: [{
        UnitType: 'A',
        CurrentZone: 'BER',
        MoveType: 'M',
        MoveZone:'NWY'
    }
    ]
},
{
    username: "b",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'MOS',
            MoveType: 'M',
            MoveZone:'NWY'
        }
    ]
},
{
    username: "c",
    gameId: testGameId,
    orders: [
        {
            UnitType: 'A',
            CurrentZone: 'CON',
            MoveType: 'M',
            MoveZone:"BER",
        },
        {
            UnitType: 'A',
            CurrentZone: 'MAR',
            MoveType: 'S',
            InitialSupportZone:"CON",
            FinalSupportZone:"BER",
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

moveOrder_test_2.forEach(function (submission) {
    setTimeout(gamePoster, counter, submission);
    counter += counter;
})


