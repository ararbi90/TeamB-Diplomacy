var express = require('express');
//const admin = require('./firebaseAdmin');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

var router = express.Router();

/* GET users listing. */


  let moveKeys = ["UnitType", "CurrentZone", "MoveType","MoveZone"]; 
  let supportKeys = ["UnitType", "CurrentZone", "MoveType","InitalSupportZone", "FinalSupportZone"];
  let convoryKeys = ["UnitType", "CurrentZone", "MoveType","InitalConvoyZone", "FinalConvoyZone"]; 
    

  
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
  var data = req.body;
  console.log(data);
  res.send(data);
  return true;
});

/* Resolution logic
    i) Loop all players orders of current season and put them in one list
    ii) Begin resolving moves recursively
        1) Loop all orders in the list if order is a support. Find the support location and add one to variable power and append force/supporting_player to support list
        2) Repeat above for move but subtrat from vairable power and append force/supporting_player to attack list
        3) All attacker and supported power is in each location. Recursively itterate through all the support and attacker list to update power.
        4) If power > 0 then valid move, else invalid move.
 
*/

module.exports = router;