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


//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
router.post('/Info', function (req, res, next) {
    let gameId = req.body.gameId;
    admin.database().ref('/games').child(gameId).once('value').then(snapshot => {
        data = {};
        res.send(snapshot.val());
        return true;
    }).catch(error => { console.log(error) });
});

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
router.post('/submitOrder', function (req, res, next) {
    // This post handles all the 
    let data = req.body.submission;
    let gameId = data.gameId;
    let username = data.username;
    let order = data.orders;
    // Get gameinfo
    admin.database().ref('/games').child(gameId).once('value').then(game => {
        let gameInfo = game.val();
        let roundName = gameInfo.turn_status.current_season + gameInfo.turn_status.current_year;
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
                        resolveGame(updated, gameId);
                        res.send("Resolve");
                    } else {
                        res.send("Submitted");
                    }
                    return true;
                }).catch(error => { console.log(error) });

            }

        ).catch(error => { console.log(error) });
        return true;
    }).catch(error => { console.log(error) });



    return true;
});

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
router.post('/submitretreatorder', function (req, res, next) {

    let data = req.body.submission;
    let gameId = data.gameId;
    let username = data.username;
    let order = data.orders;
    // Get gameinfo
    admin.database().ref('/games').child(gameId).once('value').then(game => {
        let gameInfo = game.val();
        let roundName = gameInfo.turn_status.current_season + gameInfo.turn_status.current_year;
        // Submit game
        admin.database().ref('/games').child(gameId).child('retreatOrder').child(roundName).child(username).set(
            order,
            function (err) {
                if (err) {
                    console.log("Error");
                }
                admin.database().ref('/games').child(gameId).once('value').then(updatedGame => {
                    let updated = updatedGame.val();
                    let numberOfPlayers = Object.keys(updated.players).length;
                    let numberOfSubmits = Object.keys(updated.retreatOrder[roundName]).length;
                    if (numberOfPlayers === numberOfSubmits) {
                        //Call resolve function
                        resolveGame(updated, gameId);
                        res.send("Resolve");
                    } else {
                        res.send("Submitted");
                    }
                    return true;
                }).catch(error => { console.log(error) });

            }

        ).catch(error => { console.log(error) });
        return true;
    }).catch(error => { console.log(error) });



    return true;
});

function resolveGame(game, gameId) {
    let orders = game.order;

    if (game.turn_status.current_phase === 'retreat') {
        orders = game.retreatOrder;
    }
    let roundName = game.turn_status.current_season + game.turn_status.current_year;
    // console.log(JSON.stringify(orders[roundName], undefined, 2));
    let allOrder = [];

    Object.keys(orders[roundName]).forEach(function (playerId, index) {
        Object.keys(orders[roundName][playerId]).forEach(function (eachOrder) {
            let temp = orders[roundName][playerId][eachOrder];
            temp.playerId = playerId;
            temp.resolved = false;
            temp.visited = false;
            temp.outcome = 'na';
            allOrder.push(temp);
        })
    })

    // got to logic of game
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
    Object.keys(pass).forEach(location => {
        if (passUsers[pass[location].playerId] === undefined) {
            passUsers[pass[location].playerId] = [];
        }
        passUsers[pass[location].playerId].push(pass[location]);
    })
    Object.keys(fail).forEach(location => {
        if (failUsers[fail[location].playerId] === undefined) {
            failUsers[fail[location].playerId] = [];
        }
        failUsers[fail[location].playerId].push(fail[location]);
    })

    Object.keys(retreat).forEach(location => {
        if (retreatUsers[retreat[location].playerId] === undefined) {
            retreatUsers[retreat[location].playerId] = [];
        }
        retreatUsers[retreat[location].playerId].push(retreat[location]);
    })

    roundResult = {}
    roundResultKey = game.turn_status.current_season + game.turn_status.current_year;
    roundResult = { pass: passUsers, fail: failUsers, retreat: retreatUsers };

    // console.log(JSON.stringify(passFails, undefined, 2));

    if (game.turn_status.current_phase === 'order') {
        phaseChageOrders(game, roundResult, roundResultKey, gameId);
    } else if (game.turn_status.current_phase === 'retreat') {
        phaseChageRetreat(game, roundResult, roundResultKey, gameId, passFails);
    }





}


var supplyCountries = ["ANK", "BEL", "BER", "BRE", "BUD", "BUL", "CON", "DEN", "EDI", "GRE", "HOL", "KIE", "LVP",
    "LON", "MAR", "MOS", "MUN", "NAP", "NOR", "PAR", "POR", "ROM",
    "RUM", "SER", "SEV", "SMY", "SPA", "STP", "SWE", "TRI", "TUN", "VEN",
    "VIE", "WAR"];

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
function phaseChageOrders(game, roundResult, roundResultKey, gameId) {
    // Only order phase will go here

    if (Object.keys(roundResult['retreat']).length === 0) {
        // No retreats all go to orders or build for the next round
        // In order move to build or change season
        // Update resolution
        admin.database().ref('/games').child(gameId).child('resolution').child(roundResultKey).set(
            roundResult,
            function (err) {
                if (err) {
                    console.log("Error");
                }
            }).catch(error => { console.log(error) });

        let updatedList = updatePlayers(game, gameId, roundResult, roundResultKey);
        if (game.turn_status.current_season === "spring") {
            // No build go to fall
            // update players for all the success moves
            admin.database().ref('/games').child(gameId).child('turn_status').child('current_season').set(
                'fall', function (err) {
                    if (err) {
                        console.log("Error");
                    }

                }).catch(error => { console.log(error) });

        } else {
            // Cases for build and no build
            // Case 1 add supply centers and if supply center > territories go to buid
            // Case 2 add supply centers and if supply centers are added commit 
            // fall check for builds

            supplyCountriesHash = {};
            supplyCountries.forEach(location => {
                supplyCountriesHash[location] = 0;
            })

            // Adding supple centers
            let build = false;
            let addedCenter = false;
            let addedSupplyCenter = {};
            // Update supply center is a function
            Object.keys(updatedList).forEach(player => {
                Object.keys(updatedList[player].territories).forEach(sc => {
                    if (supplyCountriesHash[sc] !== undefined) {
                        if (updatedList[player].supplyCenters[sc] === undefined) {
                            addedCenter = true;
                            // Delete if any one else is controlling the
                            Object.keys(updatedList).forEach(findLooser => {

                                if (updatedList[findLooser].supplyCenters[sc] !== undefined) {
                                    console.log("Found " + findLooser);
                                    delete updatedList[findLooser].supplyCenters[sc];
                                }
                            });
                            updatedList[player].supplyCenters[sc] = updatedList[player].territories[sc];
                            if (addedSupplyCenter[player] === undefined) {
                                addedSupplyCenter[player] = [];
                                addedSupplyCenter[player].push(sc);
                            }
                            else {
                                addedSupplyCenter[player].push(sc);
                            }
                        }
                    }
                })

            })

            // Check all updated list

            Object.keys(updatedList).forEach(player => {
                let territoryCount = Object.keys(updatedList[player].territories).length;
                let supplyCenterCount = Object.keys(updatedList[player].supplyCenters).length;
                // Add functionality to to to build if supplyCenters < territories
                if (supplyCenterCount !== territoryCount) {

                    if (addedSupplyCenter[player] === undefined) {
                        addedSupplyCenter[player] = [];
                        addedSupplyCenter[player].push(player);
                    }
                    else {
                        addedSupplyCenter[player].push(player);
                    }
                    build = true;
                }

            })


            if (build === true) {
                // Switch to build
                admin.database().ref('/games').child(gameId).child('players').set(
                    updatedList,
                    function (err) {
                        if (err) {
                            console.log("Error");
                        }
                        admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set(
                            'build', function (err) {
                                if (err) {
                                    console.log("Error");
                                }
                                admin.database().ref('/games').child(gameId).child('roundBuilds').child(roundResultKey).set(
                                    addedSupplyCenter, function (err) {
                                        if (err) {
                                            console.log("Error");
                                        }

                                    }).catch(error => { console.log(error) });

                            }).catch(error => { console.log(error) });

                    }).catch(error => { console.log(error) });
            } else {
                // No build just change to order spring and increment year stay in order
                let newYeay = parseInt(game.turn_status.current_year, 10) + 1;
                admin.database().ref('/games').child(gameId).child('turn_status').child('current_season').set(
                    'spring', function (err) {
                        if (err) {
                            console.log("Error");
                        }
                        admin.database().ref('/games').child(gameId).child('turn_status').child('current_year').set(
                            newYeay, function (err) {
                                if (err) {
                                    console.log("Error");
                                }

                            }).catch(error => { console.log(error) });


                    }).catch(error => { console.log(error) });

                if (addedCenter === true) {
                    admin.database().ref('/games').child(gameId).child('players').set(
                        updatedList,
                        function (err) {
                            if (err) {
                                console.log("Error");
                            }
                        }).catch(error => { console.log(error) });
                }


            }


        }

    }
    else {

        //There are are retreats go to retreats
        admin.database().ref('/games').child(gameId).child('resolution').child(roundResultKey).set(
            roundResult,
            function (err) {
                if (err) {
                    console.log("Error");
                }
                admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set(
                    'retreat', function (err) {
                        if (err) {
                            console.log("Error");
                        }

                    }).catch(error => { console.log(error) });

            }).catch(error => { console.log(error) });

    }

}

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
function phaseChageRetreat(game, roundResult, roundResultKey, gameId, passFails) {
    // I get pass fail for the retreat phase. Okay
    // I need previous pass and fails and retreats
    // I have all the pass and fails from the order

    let roundsResolution = game.resolution;
    let disband = [];
    let canMove = [];
    Object.keys(passFails).forEach(loc => {
        passFails[loc].forEach(PForder => {
            if (PForder.Retreat === 'true') {
                //console.log("FOUND A retre")
                if (PForder.outcome === 'failed') {
                    disband.push(PForder);
                } else if (PForder.outcome === 'success') {
                    canMove.push(PForder);
                }
            }

        })

    })

    // console.log(JSON.stringify(passFails, undefined, 2))

    // Update players
    let fails = game.resolution[roundResultKey].fail;
    let pass = game.resolution[roundResultKey].pass;
    let retreat = game.resolution[roundResultKey].retreat;

    disband.forEach(dis => {
        delete game.players[dis.playerId]['territories'][dis.CurrentZone];
    })

    canMove.forEach(move => {

        if (pass[move.playerId] === undefined) {
            pass[move.playerId] = [];
        } else {
            pass[move.playerId].push(move);
        }
        fails[move.playerId].forEach((m, i) => {
            if (m.CurrentZone === move.CurrentZone) {
                delete fails[move.playerId][i];
            }
        })
        retreat[move.playerId].forEach((m, i) => {
            if (m.CurrentZone === move.CurrentZone) {
                delete retreat[move.playerId][i];
            }
        })
    })


    let updatedList = updateRetreatPlayers(game, gameId, game.resolution[roundResultKey], roundResultKey);

    //console.log(JSON.stringify(updatedList,undefined,2))
    if (game.turn_status.current_season === 'spring') {
        // got to fall and orders

        admin.database().ref('/games').child(gameId).child('turn_status').child('current_season').set(
            'fall', function (err) {
                if (err) {
                    console.log("Error");
                }


            }).catch(error => { console.log(error) });

        admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set(
            'order', function (err) {
                if (err) {
                    console.log("Error");
                }

            }).catch(error => { console.log(error) });

    } else {
        // check for builds or go to spring and next year
        // Cases for build and no build
        // Case 1 add supply centers and if supply center > territories go to buid
        // Case 2 add supply centers and if supply centers are added commit 
        // fall check for builds

        supplyCountriesHash = {};
        supplyCountries.forEach(location => {
            supplyCountriesHash[location] = 0;
        })

        // Adding supple centers
        let build = false;
        let addedCenter = false;
        let addedSupplyCenter = {};
        // Update supply center is a function
        Object.keys(updatedList).forEach(player => {
            Object.keys(updatedList[player].territories).forEach(sc => {
                if (supplyCountriesHash[sc] !== undefined) {
                    if (updatedList[player].supplyCenters[sc] === undefined) {
                        addedCenter = true;
                        // Delete if any one else is controlling the
                        Object.keys(updatedList).forEach(findLooser => {

                            if (updatedList[findLooser].supplyCenters[sc] !== undefined) {
                                delete updatedList[findLooser].supplyCenters[sc];
                            }
                        });
                        updatedList[player].supplyCenters[sc] = updatedList[player].territories[sc];
                        if (addedSupplyCenter[player] === undefined) {
                            addedSupplyCenter[player] = [];
                            addedSupplyCenter[player].push(sc);
                        }
                        else {
                            addedSupplyCenter[player].push(sc);
                        }
                    }
                }
            })


        })

        // Check all updated list

        Object.keys(updatedList).forEach(player => {
            let territoryCount = Object.keys(updatedList[player].territories).length;
            let supplyCenterCount = Object.keys(updatedList[player].supplyCenters).length;
            // Add functionality to to to build if supplyCenters < territories
            if (supplyCenterCount !== territoryCount) {

                if (addedSupplyCenter[player] === undefined) {
                    addedSupplyCenter[player] = [];
                    addedSupplyCenter[player].push(player);
                }
                else {
                    addedSupplyCenter[player].push(player);
                }
                build = true;
            }

        })


        if (build === true) {
            // Switch to build

            admin.database().ref('/games').child(gameId).child('players').set(
                updatedList,
                function (err) {
                    if (err) {
                        console.log("Error");
                    }

                }).catch(error => { console.log(error) });

            admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set(
                'build', function (err) {
                    if (err) {
                        console.log("Error");
                    }
                }).catch(error => { console.log(error) });

            admin.database().ref('/games').child(gameId).child('roundBuilds').child(roundResultKey).set(
                addedSupplyCenter, function (err) {
                    if (err) {
                        console.log("Error");
                    }

                }).catch(error => { console.log(error) });
        } else {
            // No build just change to order spring and increment year stay in order

            let newYeay = parseInt(game.turn_status.current_year, 10) + 1;
            admin.database().ref('/games').child(gameId).child('turn_status').child('current_season').set(
                'spring', function (err) {
                    if (err) {
                        console.log("Error");
                    }

                }).catch(error => { console.log(error) });

            admin.database().ref('/games').child(gameId).child('turn_status').child('current_phase').set(
                'order', function (err) {
                    if (err) {
                        console.log("Error");
                    }

                }).catch(error => { console.log(error) });

            admin.database().ref('/games').child(gameId).child('turn_status').child('current_year').set(
                newYeay, function (err) {
                    if (err) {
                        console.log("Error");
                    }


                }).catch(error => { console.log(error) });

            if (addedCenter === true) {
                admin.database().ref('/games').child(gameId).child('players').set(
                    updatedList,
                    function (err) {
                        if (err) {
                            console.log("Error");
                        }
                    }).catch(error => { console.log(error) });
            }


        }

    }


}

function updateRetreatPlayers(game, gameId, roundResult, roundResultKey) {
    let allPlayers = game.players;
    let passedPlayers = Object.keys(roundResult['pass']); // keys of players in the pass
    let passMoves = roundResult['pass'];

    for (var i = 0; i < passedPlayers.length; i++) {
        let temp = passMoves[passedPlayers[i]]
        temp.forEach(location => {
            if (location.MoveType === 'M') {

                if (allPlayers[passedPlayers[i]].territories[location.CurrentZone] !== undefined) {
                    allPlayers[passedPlayers[i]].territories[location.MoveZone] = allPlayers[passedPlayers[i]].territories[location.CurrentZone]
                    delete allPlayers[passedPlayers[i]].territories[location.CurrentZone]
                }

            }
        })
    }


    // console.log(JSON.stringify(allPlayers, undefined, 2))
    admin.database().ref('/games').child(gameId).child('players').set(
        allPlayers,
        function (err) {
            if (err) {
                console.log("Error");
            }

        }).catch(error => { console.log(error) });
    console.log("Upfated?")

    return allPlayers;

}

//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
function updatePlayers(game, gameId, roundResult, roundResultKey) {

    let allPlayers = game.players;
    let passedPlayers = Object.keys(roundResult['pass']); // keys of players in the pass
    let passMoves = roundResult['pass'];

    for (var i = 0; i < passedPlayers.length; i++) {
        let temp = passMoves[passedPlayers[i]]
        temp.forEach(location => {
            if (location.MoveType === 'M') {

                allPlayers[passedPlayers[i]].territories[location.MoveZone] = allPlayers[passedPlayers[i]].territories[location.CurrentZone]
                delete allPlayers[passedPlayers[i]].territories[location.CurrentZone]

            }
        })
    }



    admin.database().ref('/games').child(gameId).child('players').set(
        allPlayers,
        function (err) {
            if (err) {
                console.log("Error");
            }

        }).catch(error => { console.log(error) });

    return allPlayers;


}



/* Resolution logic
    i) Loop all players orders of current season and put them in one list
    ii) Begin resolving moves recursively
        1) Loop all orders in the list if order is a support. Find the support location and add one to variable power and append force/supporting_player to support list
        2) Repeat above for move but subtrat from vairable power and append force/supporting_player to attack list
        3) All nextOrder and supported power is in each location. Recursively itterate through all the support and nextOrder list to update power.
        4) If power > 0 then valid move, else invalid move.
 
*/
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------
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
                console.log("Sinle move")
                let winner = currentLocationAttackers[0];
                currentLocation.forEach(finder => {

                    finder.resolved = true;
                    finder.outcome = 'success';

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

                            highestAttackStrength = Object.keys(att.supportPowerList).length + 1;
                            highestAttacker = att;
                            standOff = false;
                        }
                    }
                })

                // if (standOff || highestAttacker === undefined) {
                //     currentLocation.forEach(finder => {

                //         if (finder.CurrentZone !== strongHold.CurrentZone) {
                //             finder.resolved = true;
                //             finder.outcome = 'failed';
                //         }
                //         if (finder.CurrentZone === strongHold.CurrentZone && strongHold.MoveType === 'H') {
                //             finder.resolved = true;
                //             finder.outcome = 'success';
                //         }

                //     })
                // } else {
                //     currentLocation.forEach(finder => {
                //         if (highestAttacker.CurrentZone === finder.CurrentZone) {
                //             finder.resolved = true;
                //             finder.outcome = 'success';
                //         } else {
                //             finder.resolved = true;
                //             finder.outcome = 'failed';
                //         }

                //     })
                // }

                if (standOff || highestAttacker === undefined) {
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

                        if (highestAttackStrength > (Object.keys(strongHold.supportPowerList).length + 1)) {
                            // Attack worked and disband location
                            currentLocation.forEach(finder => {
                                console.log(finder)
                                if (highestAttacker.CurrentZone === finder.CurrentZone) {
                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    if (!(finder.CurrentZone === strongHold.CurrentZone && strongHold.outcome === 'success')) {
                                        finder.resolved = true;
                                        finder.outcome = 'failed';
                                    }
                                }
                            })

                        } else {
                            // Attack did not work
                            currentLocation.forEach(finder => {

                                if (strongHold.CurrentZone === finder.CurrentZone && strongHold.MoveType === 'H') {

                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    if ((strongHold.MoveType === 'M' && strongHold.outcome !== 'na' && finder.CurrentZone === highestAttacker.CurrentZone)) {
                                        finder.resolved = true;
                                        finder.outcome = 'success';
                                    } else {
                                        finder.resolved = true;
                                        finder.outcome = 'fail';
                                    }

                                }
                            })

                        }
                    } else {
                        //console.log("Stong hold does not have support");
                        //console.log(highestAttackStrength);
                        if (highestAttackStrength > 1) {
                            // Attack worked and disband location
                            currentLocation.forEach(finder => {
                                if (highestAttacker.CurrentZone === finder.CurrentZone) {
                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    if (!(finder.CurrentZone === strongHold.CurrentZone && strongHold.outcome === 'success')) {
                                        finder.resolved = true;
                                        finder.outcome = 'failed';
                                    }
                                }
                            })

                        } else {
                            // Attack did not work
                            currentLocation.forEach(finder => {

                                if (strongHold.CurrentZone === finder.CurrentZone && strongHold.MoveType === 'H') {

                                    finder.resolved = true;
                                    finder.outcome = 'success';
                                } else {
                                    if ((strongHold.MoveType === 'M' && strongHold.outcome === 'success' && finder.CurrentZone === highestAttacker.CurrentZone)) {
                                        console.log("Rsolving chained moves-----------------------------------------------")
                                        finder.resolved = true;
                                        finder.outcome = 'success';

                                    } else {
                                        finder.resolved = true;
                                        finder.outcome = 'failed';

                                    }
                                }
                            })

                        }
                    }
                }
            }

        }

    }



    return regionHashTable;


    // Loop over all orders: add all powers for each location in the regions hash table


    // Loop over all regions: each order that has the highest power per location wins



}

function findLocationWinnner() {

}


module.exports = router;