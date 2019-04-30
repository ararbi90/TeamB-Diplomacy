var express = require('express');
//const admin = require('./firebaseAdmin');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var router = express.Router();

/* GET users listing. */


let moveKeys = ["UnitType", "CurrentZone", "MoveType", "MoveZone"];
let supportKeys = ["UnitType", "CurrentZone", "MoveType", "InitialSupportZone", "FinalSupportZone"];
let convoryKeys = ["UnitType", "CurrentZone", "MoveType", "InitalConvoyZone", "FinalConvoyZone"];



router.post('/Info', function (req, res, next) {
    let gameId = req.body.gameId;
    //console.log(gameId);
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
                        resolveGame(updated, gameId);
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

function resolveGame(game, gameId) {
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
    let passFails = getPassFails(allOrder);

    let pass = {}
    let retreat = {}
    let fail = {}


    Object.keys(passFails).forEach(locationKey => {
        // Test retreat

        let currentLocation = passFails[locationKey];
        currentLocation.forEach(current => {
            if (current.MoveType === 'H' && current.outcome === 'failed') {
                retreat[current.CurrentZone] = current;
                fail[current.CurrentZone] = current;
            } else if ((current.MoveType === 'M' || current.MoveType === 'S') && current.outcome === 'failed') {
                fail[current.CurrentZone] = current;
                currentLocation.forEach(winner => {

                    if (winner.outcome === "success" && winner.MoveZone === current.CurrentZone) {
                        retreat[current.CurrentZone] = current;

                    }
                })

            }

            if (current.outcome === 'success') {
                pass[current.CurrentZone] = current;
            }

            if (current.MoveType === 'S' && current.outcome === 'na') {
                pass[current.CurrentZone] = current;
            }
        })

    })

    passUsers = {}
    failUsers = {}
    retreatUsers = {}

    // Create for db
    Object.keys(pass).forEach(location =>{
        passUsers[pass[location].playerId] = pass[location]
    })
    Object.keys(fail).forEach(location =>{
        failUsers[fail[location].playerId] = fail[location]
    })

    Object.keys(retreat).forEach(location =>{       
        retreatUsers[retreat[location].playerId] = retreat[location]
    })

    roundResult = {}
    roundResultKey = game.turn_status.current_season + game.turn_status.current_year;
    roundResult = {pass : passUsers, fail: failUsers, retreat: retreatUsers};
    
    console.log(JSON.stringify(roundResult, undefined, 2));
    
    phaseChage(game, roundResult, roundResultKey, gameId);
    




}



function phaseChage(game, roundResult, roundResultKey, gameId){

    console.log(Object.keys(roundResult['retreat']).length);
    if(Object.keys(roundResult['retreat']).length === 0){
        // No retreats all go to orders or build for the next round
        console.log("IN order spring ----------------------------------------------")
        console.log(game.turn_status.current_phase);
        if(game.turn_status.current_phase === "order"){
            // In order move to build or change season
            if(game.turn_status.current_season === "spring"){
                // No build go to fall
                // update players for all the success moves
                console.log("IN order spring ----------------------------------------------")
                updatePlayers(game, gameId, roundResult, roundResultKey);

            }else{
                // Build
            }
        }
    }
    else{
        //There are are retreats go to retreats
        admin.database().ref('/games').child(gameId).child('resolution').child(roundResultKey).set(roundResult,
            function(err){
                admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set('retreat')
            });
    }

}


function updatePlayers(game, gameId, roundResult, roundResultKey){
    
    let allPlayers = game.players;
    let passedPlayers = Object.keys(roundResult['pass']);
    let passMoves = roundResult['pass'];

    for(var i = 0; i < passedPlayers.length; i++){
        let currentPlayerTerritories = allPlayers[passedPlayers[i]].territories;
        Object.keys(passMoves).forEach(index =>{
            let temp = currentPlayerTerritories[passMoves[index].CurrentZone];
            delete currentPlayerTerritories[passMoves[index].CurrentZone];
            allPlayers[passedPlayers[i]].territories[passMoves[index].CurrentZone] = temp;
        })

    }
    console.log(gameId);
    console.log('players')
    console.log(allPlayers);
    admin.database().ref('/games').child(gameId).child('players').set(allPlayers, function(err){
        console.log("Works!!")
    });

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
function getPassFails(allOrder) {

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
                    // Find all supporters for this attacker
                    // Find all supporters for the attacker (nextOrder) and make a list called attackSupportPowerList
                    allOrder.forEach(function (supporter) {

                        if (supporter.InitialSupportZone === nextOrder.CurrentZone && supporter.FinalSupportZone === nextOrder.MoveZone) {
                            if (currentOrder.attackSupportPowerList === undefined) {
                                currentOrder.attackSupportPowerList = {};
                                currentOrder.attackSupportPowerList[supporter.CurrentZone] = { power: -1, supportLocation: nextOrder.CurrentZone };
                            } else {
                                currentOrder.attackSupportPowerList[supporter.CurrentZone] = { power: -1, supportLocation: nextOrder.CurrentZone }
                            }
                        }
                    });
                }

            }

            // Find all supporters for the currentOrder and make a list supportPowerList
            if (nextOrder.MoveType === "S") {


                if (nextOrder.InitialSupportZone === currentOrder.CurrentZone && nextOrder.FinalSupportZone === currentOrder.MoveZone
                    || nextOrder.InitialSupportZone === currentOrder.CurrentZone && nextOrder.FinalSupportZone === currentOrder.CurrentZone) {
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
        if (currentOrder.attackSupportPowerList !== undefined) {
            Object.keys(currentOrder.attackSupportPowerList).forEach(function (currentAttackSupport) {
                allOrder.forEach(function (potentialAttackerSupporter) {
                    // Find the support of the attacker
                    if (currentAttackSupport === potentialAttackerSupporter.CurrentZone) {
                        // Check if the support is cut
                        if (potentialAttackerSupporter.attackPowerList !== undefined) {
                            // The support is cut so we delete it from the support list
                            delete currentOrder.attackSupportPowerList[potentialAttackerSupporter.CurrentZone];
                        }
                    }
                })
            });
        }


        // Find all supporters for the current order
        if (currentOrder.supportPowerList !== undefined) {

            // Get all the locations where support is comming from
            Object.keys(currentOrder.supportPowerList).forEach(function (currentSupport) {

                // Loop over all the orders again
                allOrder.forEach(function (potentialSupporter) {

                    // If the order found is a supporter to the currentOrder then check if it is cut off
                    if (currentSupport === potentialSupporter.CurrentZone) {
                        if (potentialSupporter.attackPowerList !== undefined) {
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

            regionHashTable[currentOrder.MoveZone].push(currentOrder);
        }
    })

    //supportLocation
    let successfulMoves = [];
    let failedMoves = [];

    /// This mess
    for (let i = 0; i < regions.length; i++) {
        let currentLocation = regionHashTable[regions[i]];
        let currentLocationAttackers = [];
        let attackersFailed = false;
        let locationStrength = {};
        let locationApposition = {};
        let strongHold = undefined;
        currentLocation.forEach(filter => {
            filter.visited = true;

            if (filter.CurrentZone === regions[i]) {
                strongHold = filter;
                if (filter.MoveType === 'H') {
                    // Testing disbanding
                    if (filter.attackSupportPowerList !== undefined) {
                        Object.keys(filter.attackSupportPowerList).forEach(supportSource => {


                            if (locationApposition[supportSource.supportLocation] === undefined) {
                                locationApposition[supportSource.supportLocation] = 2;
                            }
                            else {
                                locationApposition[supportSource.supportLocation] += 1;
                            }
                        })
                    }

                } else if (filter.MoveType === 'S') {
                    // Testing Disbanding
                    if (filter.attackSupportPowerList !== undefined) {
                        Object.keys(filter.attackSupportPowerList).forEach(supportSource => {

                            if (locationApposition[supportSource.supportLocation] === undefined) {
                                locationApposition[supportSource.supportLocation] = 2;
                            }
                            else {
                                locationApposition[supportSource.supportLocation] += 1;
                            }
                        })
                    }

                } else if (filter.MoveType === 'M') {
                    // Move
                }

            } else {
                currentLocationAttackers.push(filter);

            }

        })


        // Conditions when no one is present on the location
        if (strongHold === undefined) {
            // No one is there only attackers
            // Repeated code can be moved to a method
            if (currentLocationAttackers.length === 1) {
                let winner = currentLocationAttackers[0];
                currentLocation.forEach(finder => {
                    if (winner.gameId === finder.gameId) {
                        finder.resolved = true;
                        finder.outcome = 'success';
                    }
                })

            } else {
                let highestAttackStrength = 0;
                let highestAttacker = undefined;
                let standOff = false;
                currentLocationAttackers.forEach(att => {

                    if (att.supportPowerList !== undefined) {
                        if (Object.keys(att.supportPowerList).length === highestAttackStrength) {

                            standOff = true;
                        }
                        else if (Object.keys(att.supportPowerList).length > highestAttackStrength) {

                            highestAttackStrength = Object.keys(att.supportPowerList).length;
                            highestAttacker = att;
                            standOff = false;
                        }
                    }
                })
                if (standOff || highestAttacker === undefined) {
                    currentLocation.forEach(finder => {

                        finder.resolved = true;
                        finder.outcome = 'failed';

                    })
                } else {
                    currentLocation.forEach(finder => {
                        if (highestAttacker.CurrentZone === finder.CurrentZone) {
                            finder.resolved = true;
                            finder.outcome = 'success';
                        } else {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }

                    })
                }

            }
        } else {
            // Someone is on that location
            if (currentLocationAttackers.length === 0) {
                // There is only one person on that location
                if (strongHold.MoveType === 'H') {
                    currentLocation.forEach(finder => {
                        finder.resolved = true;
                        finder.outcome = 'success';

                    })
                }

            } else {
                // More than one person is on that location
                // Repeated code can be moved to a method
                // find all the attackers streangth
                let highestAttackStrength = 0;
                let highestAttacker = undefined;
                let standOff = false;
                // Find strongest attacker or test standoff
                currentLocationAttackers.forEach(att => {

                    if (att.supportPowerList !== undefined) {
                        if (Object.keys(att.supportPowerList).length === highestAttackStrength) {

                            standOff = true;
                        }
                        else if (Object.keys(att.supportPowerList).length > highestAttackStrength) {

                            highestAttackStrength = Object.keys(att.supportPowerList).length;
                            highestAttacker = att;
                            standOff = false;
                        }
                    }
                })
                if (standOff || highestAttacker === undefined) {
                    currentLocation.forEach(finder => {

                        if (finder.CurrentZone !== strongHold.CurrentZone) {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }
                        if (finder.CurrentZone === strongHold.CurrentZone && strongHold.MoveType === 'H') {
                            finder.resolved = true;
                            finder.outcome = 'success';
                        }

                    })
                } else {
                    currentLocation.forEach(finder => {
                        if (highestAttacker.CurrentZone === finder.CurrentZone) {
                            finder.resolved = true;
                            finder.outcome = 'success';
                        } else {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }

                    })
                }

                if (standOff) {
                    // There is a standoff between people moving in
                    currentLocation.forEach(finder => {
                        if (finder.CurrentZone !== strongHold.CurrentZone) {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }
                        if (finder.CurrentZone === strongHold.CurrentZone && strongHold.MoveType === 'H') {
                            finder.resolved = true;
                            finder.outcome = 'success';
                        }
                    })
                } else {

                    // No stand off have to check who can move in or if the holder can stay there

                    if (strongHold.supportPowerList !== undefined) {

                        if (highestAttackStrength > Object.keys(strongHold.supportPowerList).length + 1) {
                            // Attack worked and disband location
                            currentLocation.forEach(finder => {
                                if (highestAttacker.CurrentZone === finder.CurrentZone) {
                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    finder.resolved = true;
                                    finder.outcome = 'failed';
                                }
                            })

                        } else {
                            // Attack did not work
                            currentLocation.forEach(finder => {

                                if (strongHold.CurrentZone === finder.CurrentZone && strongHold.MoveType === 'H') {

                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    finder.resolved = true;
                                    finder.outcome = 'failed';
                                }
                            })

                        }
                    }
                }
            }

        }

    }


    //console.log(JSON.stringify(regionHashTable, undefined, 2));
    return regionHashTable;


    // Loop over all orders: add all powers for each location in the regions hash table


    // Loop over all regions: each order that has the highest power per location wins



    //console.log(allOrder);
}

function findLocationWinnner() {

}


module.exports = router;