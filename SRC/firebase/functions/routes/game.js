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


module.exports = router;