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
                    // Find all supporters for this attacker
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

            }

            // Find all supporters for the currentOrder and make a list supportPowerList
            if (nextOrder.MoveType === "S") {


                if (nextOrder.InitalSupportZone === currentOrder.CurrentZone && nextOrder.FinalSupportZone === currentOrder.MoveZone
                    || nextOrder.InitalSupportZone === currentOrder.CurrentZone && nextOrder.FinalSupportZone === currentOrder.CurrentZone) {
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
            console.log(currentOrder);
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
                            console.log(supportSource)
                            console.log(supportSource.supportLocation)

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
                            console.log(supportSource)
                            console.log(supportSource.supportLocation)
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
                        if (att.supportPowerList.length > highestAttackStrength) {

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
                            finder.outcome = 'sucess';
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
                        if (att.supportPowerList.length > highestAttackStrength) {

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
                            finder.outcome = 'sucess';
                        } else {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }

                    })
                }

                if (standOff) {
                    // There is a standoff between people moving in
                    currentLocation.forEach(finder => {
                        if (filter.CurrentZone !== strongHold.CurrentZone) {
                            finder.resolved = true;
                            finder.outcome = 'failed';
                        }
                        if (filter.CurrentZone === strongHold.CurrentZone && strongHold.MoveType === 'H'){
                            finder.resolved = true;
                            finder.outcome = 'success';
                        }
                    })
                } else {
                    
                    // No stand off have to check who can move in or if the holder can stay there
                    console.log(strongHold)
                    if (strongHold.supportPowerList !== undefined) {
                        
                        if (highestAttackStrength > Object.keys(strongHold.supportPowerList).length + 1) {
                            // Attack worked and disband location
                            currentLocation.forEach(finder => {
                                if (highestAttacker.CurrentZone === finder.CurrentZone) {
                                    finder.resolved = true;
                                    finder.outcome = 'sucess';
                                } else {
                                    finder.resolved = true;
                                    finder.outcome = 'failed';
                                }
                            })

                        } else {
                            // Attack did not work
                            currentLocation.forEach(finder => {
                                
                                if (strongHold.CurrentZone === finder.CurrentZone && strongHold.MoveType === 'H') {
                                    console.log("Worked Standoff =========================================")
                                    finder.resolved = true;
                                    finder.outcome = 'sucess';
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

    console.log("region hash table");
    console.log(JSON.stringify(regionHashTable, undefined, 2));


    // Loop over all orders: add all powers for each location in the regions hash table


    // Loop over all regions: each order that has the highest power per location wins



    //console.log(allOrder);
}

function findLocationWinnner() {

}


module.exports = router;