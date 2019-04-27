var express = require('express');
//const admin = require('./firebaseAdmin');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var router = express.Router();

/* GET users listing. */


let moveKeys = ["UnitType", "CurrentZone", "MoveType", "MoveZone"];
let supportKeys = ["UnitType", "CurrentZone", "MoveType", "InitalSupportZone", "FinalSupportZone"];
let convoryKeys = ["UnitType", "CurrentZone", "MoveType", "InitalConvoyZone", "FinalConvoyZone"];



router.post('/Info', function (req, res, next) {
    let gameId = req.body.gameId;
    console.log(gameId);
    admin.database().ref('/games').child(gameId).once('value').then(snapshot => {
        data = {};
        console.log(snapshot.child("players").val());
        res.send(snapshot.val());
        return true;
    }).catch(error => { console.log(error) });
});

router.post('/submitOrder', function (req, res, next) {

    let data = req.body.submission;
    //console.log(data);
    let gameId = data.gameId;
    let username = data.username;
    let order = data.orders;
    //console.log(order);
    // Get gameinfo
    admin.database().ref('/games').child(gameId).once('value').then(game => {
        let gameInfo = game.val();
        console.log(gameInfo);
        let roundName = gameInfo.turn_status.current_season + gameInfo.turn_status.current_year;
        //console.log(roundName)
        // Submit game
        admin.database().ref('/games').child(gameId).child('order').child(roundName).child(username).set(
            order,
            function (err) {
                if (err) {
                    console.log("Error");
                }
                admin.database().ref('/games').child(gameId).once('value').then(updatedGame => {
                    let updated = updatedGame.val();
                    let numberOfPlayers = Object.keys(updated.players).length;
                    let numberOfSubmits = Object.keys(updated.order[roundName]).length;
                    if(numberOfPlayers === numberOfSubmits){
                        //console.log("Resolve");
                        //Call resolve function
                        resolveGame(updated);
                        res.send("Resolve");
                    }else{
                        console.log("Submitted");
                        res.send("Submitted");
                    }
                    //console.log("Done");
                    return true;
                }).catch(error => { console.log(error) });
                
            }
            
        ).catch(error => { console.log(error) });
        //res.send("Done");
        return true;
    }).catch(error => { console.log(error) });



    return true;
});

function resolveGame(game){
    //console.log(game);
    let orders = game.order;
    let allOrder = [];
    Object.keys(orders).forEach(function(seasonYear, index){
        console.log(seasonYear)
        Object.keys(orders[seasonYear]).forEach(function(playerId, index){
            Object.keys(orders[seasonYear][playerId]).forEach(function(eachOrder){
                let temp = orders[seasonYear][playerId][eachOrder];
                temp.playerId = playerId;
                allOrder.push(temp);
            })
        }) 
    })
    addPowers(allOrder);
}

/* Resolution logic
    i) Loop all players orders of current season and put them in one list
    ii) Begin resolving moves recursively
        1) Loop all orders in the list if order is a support. Find the support location and add one to variable power and append force/supporting_player to support list
        2) Repeat above for move but subtrat from vairable power and append force/supporting_player to attack list
        3) All attacker and supported power is in each location. Recursively itterate through all the support and attacker list to update power.
        4) If power > 0 then valid move, else invalid move.
 
*/

function addPowers(allOrder){
    allOrder.forEach(function(currentOrder){
        
        allOrder.forEach(function(attacker){
            //1. find all attacker for the current order
            // move type must be M
            if(attacker.MoveType === "M"){
                if(currentOrder.attackPowerList === undefined){
                    currentOrder.attackPowerList = {};
                    currentOrder.attackPowerList[attacker.CurrentZone] = -1;
                }else{
                    currentOrder.attackPowerList[attacker.CurrentZone] = -1;
                }

                //find all supporters for this attacker
                allOrder.forEach(function(supporter){
                    if(supporter.InitalSupportZone === attacker.CurrentZone && supporter.FinalSupportZone === attacker.MoveZone){
                        if(currentOrder.attackSupportPowerList === undefined){
                            currentOrder.attackSupportPowerList = {};
                            currentOrder.attackSupportPowerList[supporter.CurrentZone] = {power:-1, supportLocation:attacker.CurrentZone };
                        }else{
                            currentOrder.attackSupportPowerList[supporter.CurrentZone] = {power:-1, supportLocation:attacker.CurrentZone }
                        }
                    }
                });
            }

            //This is not an attacker....it's a supporter
            if(attacker.MoveType === "S"){
                if(currentOrder.support === undefined){
                    currentOrder.support = {};
                    currentOrder.support[attacker.CurrentZone] = -1;
                }
            }

        });






    });
    console.log(allOrder);
}


module.exports = router;