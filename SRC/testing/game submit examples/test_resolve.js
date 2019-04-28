
//const fs = require('fs');
$ = require('jquery');

//let dir = "/Users/mjscheid/Desktop/475/Diplomancy/CurrentWorkingVersion/TeamB-Diplomacy/SRC/testing/";
//let filename = "ruleDiagramOrders.json";
//let file = "../ruleDiagramOrders.json";
//let raw = fs.readFileSync(dir+filename);
//let raw = fs.readFileSync(file);

// let rule_diagram_orders = JSON.parse(raw);

// //console.log("full order object" + JSON.stringify(rule_diagram_orders,null,1));
// // do a for each over rule_diagram_orders to test all diagrams
// let diagram_1 = rule_diagram_orders[0];
// //console.log("diagram 1 object" + JSON.stringify(diagram_1,null,1));
// //keys [ 'submissions', 'actual', 'predicted', 'diagram' ]
// console.log(diagram_1.diagram)
// console.log(diagram_1.actual)
// console.log(diagram_1.predicted)
// console.log(diagram_1.submissions)







// $.post("http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/info", { gameId: "-Ld5A9cdoaRB74N1syYg" }, function (res) {
//     console.log(res);
// }).fail(function (err) {
//     console.log(err);
// })
let submissions = [{
    username: "a",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'M',
        MoveZone: 'STP'
    },
    {
        UnitType: 'A',
        CurrentZone: 'HOME',
        MoveType: 'S',
        InitalSupportZone: 'LON',
        FinalSupportZone: 'STP'
    }]
},
{
    username: "b",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'M',
        MoveZone: 'STP'
    },
    {
        UnitType: 'A',
        CurrentZone: 'HOME',
        MoveType: 'S',
        InitalSupportZone: 'LON',
        FinalSupportZone: 'STP'
    }]
},
{
    username: "c",
    gameId: "-LdW62ST8C_INLjZJ1gQ",
    orders: [{
        UnitType: 'A',
        CurrentZone: 'LON',
        MoveType: 'M',
        MoveZone: 'STP'
    },
    {
        UnitType: 'A',
        CurrentZone: 'HOME',
        MoveType: 'S',
        InitalSupportZone: 'LON',
        FinalSupportZone: 'STP'
    }]
}]
console.log(submissions);

submissions.forEach(function (submission) {
    $.post("http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder", { submission }, function (res) {
        console.log(res);
    }).fail(function (err) {
        console.log(err);
    })


})
        // $.post("http://localhost:5000/cecs-475-team-b/us-central1/teamBackend/game/submitorder", { submission }, function (res) {
        //     console.log(res);
        // }).fail(function (err) {
        //     console.log(err);
        // })




