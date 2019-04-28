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
        //console.log(gameInfo);
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
                    if (numberOfPlayers === numberOfSubmits) {
                        //console.log("Resolve");
                        //Call resolve function
                        console.log("Going into resolve");
                        resolveGame(updated);
                        res.send("Resolve");
                    } else {
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

function resolveGame(game) {
    //console.log(game);
    let orders = game.order;
    let allOrder = [];
    Object.keys(orders).forEach(function (seasonYear, index) {
        console.log(seasonYear)
        Object.keys(orders[seasonYear]).forEach(function (playerId, index) {
            Object.keys(orders[seasonYear][playerId]).forEach(function (eachOrder) {
                let temp = orders[seasonYear][playerId][eachOrder];
                temp.playerId = playerId;
                temp.resolved = false;
                temp.visited = false;
                temp.outcome = 'na';
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
        3) All nextOrder and supported power is in each location. Recursively itterate through all the support and nextOrder list to update power.
        4) If power > 0 then valid move, else invalid move.
 
*/
var regions = ["ADR", "AEG", "BAL", "BAR", "BLA", "EAS", "ENG", "BOT", "GOL", "HEL", "ION", "IRI", "MID", "NAT", "NTH", "NRG", "SKA", "TYN", "WES", "CLY", "EDI", "LVP", "YOR", "WAL", "LON", "PIC", "BRE", "PAR", "BUR", "GAS", "MAR", "PIE", "VEN", "TUS", "ROM", "APU", "NAP", "TYR", "BOH", "VIE", "GAL", "BUD", "TRI", "CON", "ANK", "ARM", "SMY", "SYR", "FIN", "STP", "LVN", "MOS", "WAR", "UKR", "SEV", "RUH", "KIE", "BER", "PRU", "MUN", "SIL", "NWY", "SWE", "DEN", "HOL", "BEL", "POR", "SPA", "NAF", "TUN", "RUM", "SER", "BUL", "ALB", "GRE"];
function addPowers(allOrder) {

    // Loop over all the orders and assign a currentOrder
    allOrder.forEach(function (currentOrder) {

        // Loop over all the orders and assign a nextOrder
        allOrder.forEach(function (nextOrder) {


            // Find all attackers for the currentOrder and make a list called attackPowerList
            if (nextOrder.MoveType === "M") {
                if (nextOrder.MoveZone === currentOrder.CurrentZone) {
                    // Make the list to track all attackers that are trying to move into current location
                    if (currentOrder.attackPowerList === undefined) {
                        currentOrder.attackPowerList = {};
                        currentOrder.attackPowerList[nextOrder.CurrentZone] = -1;
                    } else {
                        currentOrder.attackPowerList[nextOrder.CurrentZone] = -1;
                    }
                }

                // Find all supporters for the attacker (nextOrder) and make a list called attackSupportPowerList
                allOrder.forEach(function (supporter) {
                    if (supporter.InitalSupportZone === nextOrder.CurrentZone && supporter.FinalSupportZone === nextOrder.MoveZone) {
                        if (currentOrder.attackSupportPowerList === undefined) {
                            currentOrder.attackSupportPowerList = {};
                            currentOrder.attackSupportPowerList[supporter.CurrentZone] = { power: -1, supportLocation: nextOrder.CurrentZone };
                        } else {
                            currentOrder.attackSupportPowerList[supporter.CurrentZone] = { power: -1, supportLocation: nextOrder.CurrentZone }
                        }
                    }
                });
            }

            // Find all supporters for the currentOrder and make a list supportPowerList
            if (nextOrder.MoveType === "S") {
                if (nextOrder.InitalSupportZone === currentOrder.CurrentZone && nextOrder.FinalSupportZone === currentOrder.MoveZone) {
                    if (currentOrder.support === undefined) {
                        currentOrder.supportPowerList = {};
                        currentOrder.supportPowerList[nextOrder.CurrentZone] = 1;
                    } else {
                        currentOrder.supportPowerList[nextOrder.CurrentZone] = 1;
                    }
                }
            }


            // Find all convoys for the currentOrder and make a list convoyPowerList
            if (nextOrder.MoveType === "C") {
                if (nextOrder.InitalConvoyZone === currentOrder.CurrentZone && nextOrder.FinalConvoyZone === currentOrder.MoveZone) {
                    if (currentOrder.convoy === undefined) {
                        currentOrder.convoyPowerList = {};
                        currentOrder.convoyPowerList[nextOrder.CurrentZone] = 1;
                    } else {
                        currentOrder.convoyPowerList[nextOrder.CurrentZone] = 1;
                    }
                }
            }

        });
    });


    // We now have lists of attackers, supporters, and convoys for each order location

    // Update powers for each location: by subtracting cutoff support and failed moves.
    allOrder.forEach(function (currentOrder) {
        // Find all attackers for a currentOrder
        if (currentOrder.attackSupportPowerList != null) {
            Object.keys(currentOrder.attackSupportPowerList).forEach(function (currentAttackSupport) {
                allOrder.forEach(function (potentialAttackerSupporter) {
                    // Find the support of the attacker
                    if (currentAttackSupport == potentialAttackerSupporter.CurrentZone) {
                        // Check if the support is cut
                        if (potentialAttackerSupporter.attackPowerList != null) {
                            // The support is cut so we delete it from the support list
                            delete currentOrder.attackSupportPowerList[potentialAttackerSupporter.CurrentZone];
                        }
                    }
                })
            });
        }


        // Find all supporters for the current order
        if (currentOrder.supportPowerList != null) {

            // Get all the locations where support is comming from
            Object.keys(currentOrder.supportPowerList).forEach(function (currentSupport) {

                // Loop over all the orders again
                allOrder.forEach(function (potentialSupporter) {

                    // If the order found is a supporter to the currentOrder then check if it is cut off
                    if (currentSupport == potentialSupporter.CurrentZone) {
                        if (potentialSupporter.attackPowerList != null) {
                            // If Cuttoff remove from list
                            delete currentOrder.supportPowerList[potentialSupporter.CurrentZone];
                        }
                    }
                })
            });
        }


    });




    // Build a hash table for regions, we will add all the moves/holds to that location
    // The move/hold with the highest power per location wins (meaning that order is accepted/all others fail)
    regionHashTable = {};
    regions.forEach(function (r) {
        regionHashTable[r] = [];
    });

    // Loop over all orders again....
    allOrder.forEach(function (currentOrder) {
        // Add each zone to the hash table
        regionHashTable[currentOrder.CurrentZone].push(currentOrder);

        // If the current type is a Move then we must add it to the list for that location
        if (currentOrder.MoveType === "M") {
            console.log(currentOrder);
            regionHashTable[currentOrder.MoveZone].push(currentOrder);
        }
    })


    for (let i = 0; i < regions.length; i++) {
        let currentLocation = regionHashTable[regions[i]];
        let currentLocationAttackers = [];
        let attackersFailed = false;
        currentLocation.forEach(filter => {
            filter.visited = true;
            if (filter.CurrentZone === regions[i] && filter.MoveType === 'H') {
                if (Object.keys(filter.attackSupportPowerList).length === 0 || Object.keys(filter.supportPowerList).length <= Object.keys(filter.attackSupportPowerList).length) {
                    // Atackers have no support location safe if its a hold. 
                    // If move then only one move might be safe
                    // Check the next moving locations status 

                    attackersFailed = true;
                }
            } else {
                currentLocationAttackers.push(filter);
            }
        })

    }

    console.log("region hash table");
    console.log(JSON.stringify(regionHashTable, null, 2));


    // Loop over all orders: add all powers for each location in the regions hash table


    // Loop over all regions: each order that has the highest power per location wins



    //console.log(allOrder);
}


module.exports = router;